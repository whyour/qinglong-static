"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = exports.MetricsService = exports.MAX_METRIC_SAMPLES = void 0;
const perf_hooks_1 = require("perf_hooks");
const logger_1 = __importDefault(require("../loaders/logger"));
exports.MAX_METRIC_SAMPLES = 1000;
const METRIC_RETENTION_MS = 60 * 60 * 1000;
class MetricsService {
    constructor() {
        this.metrics = new Array(exports.MAX_METRIC_SAMPLES);
        this.metricCount = 0;
        this.nextMetricIndex = 0;
        // 定期清理旧数据
        const cleanupTimer = setInterval(() => this.removeExpiredMetrics(), 60000);
        cleanupTimer.unref();
    }
    static getInstance() {
        if (!MetricsService.instance) {
            MetricsService.instance = new MetricsService();
        }
        return MetricsService.instance;
    }
    record(name, value, tags) {
        this.metrics[this.nextMetricIndex] = {
            name,
            value,
            timestamp: Date.now(),
            tags,
        };
        this.nextMetricIndex = (this.nextMetricIndex + 1) % exports.MAX_METRIC_SAMPLES;
        this.metricCount = Math.min(this.metricCount + 1, exports.MAX_METRIC_SAMPLES);
    }
    measure(name, fn, tags) {
        const start = perf_hooks_1.performance.now();
        try {
            fn();
        }
        finally {
            const duration = perf_hooks_1.performance.now() - start;
            this.record(name, duration, tags);
        }
    }
    async measureAsync(name, fn, tags) {
        const start = perf_hooks_1.performance.now();
        try {
            await fn();
        }
        finally {
            const duration = perf_hooks_1.performance.now() - start;
            this.record(name, duration, tags);
        }
    }
    getMetrics(name, tags) {
        this.removeExpiredMetrics();
        let filtered = this.getMetricSnapshot();
        if (name) {
            filtered = filtered.filter((m) => m.name === name);
        }
        if (tags) {
            filtered = filtered.filter((m) => {
                if (!m.tags)
                    return false;
                return Object.entries(tags).every(([key, value]) => m.tags[key] === value);
            });
        }
        const values = filtered.map((metric) => metric.value);
        return {
            count: filtered.length,
            average: values.length
                ? values.reduce((acc, value) => acc + value, 0) / values.length
                : 0,
            min: values.length ? Math.min(...values) : 0,
            max: values.length ? Math.max(...values) : 0,
            metrics: filtered,
        };
    }
    getMetricSnapshot() {
        if (this.metricCount < exports.MAX_METRIC_SAMPLES) {
            return this.metrics.slice(0, this.metricCount);
        }
        return [
            ...this.metrics.slice(this.nextMetricIndex),
            ...this.metrics.slice(0, this.nextMetricIndex),
        ];
    }
    removeExpiredMetrics() {
        const oldestTimestamp = Date.now() - METRIC_RETENTION_MS;
        const retained = this.getMetricSnapshot().filter((metric) => metric.timestamp > oldestTimestamp);
        if (retained.length === this.metricCount)
            return;
        this.metrics = new Array(exports.MAX_METRIC_SAMPLES);
        this.metricCount = 0;
        this.nextMetricIndex = 0;
        for (const metric of retained) {
            this.metrics[this.nextMetricIndex] = metric;
            this.nextMetricIndex = (this.nextMetricIndex + 1) % exports.MAX_METRIC_SAMPLES;
            this.metricCount++;
        }
    }
    report() {
        const report = {
            timestamp: Date.now(),
            metrics: this.getMetrics(),
        };
        logger_1.default.info('性能指标报告:', report);
        return report;
    }
}
exports.MetricsService = MetricsService;
exports.metricsService = MetricsService.getInstance();
//# sourceMappingURL=metrics.js.map