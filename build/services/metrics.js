"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = void 0;
const perf_hooks_1 = require("perf_hooks");
const logger_1 = __importDefault(require("../loaders/logger"));
class MetricsService {
    constructor() {
        this.metrics = [];
        // 定期清理旧数据
        setInterval(() => {
            const oneHourAgo = Date.now() - 3600000;
            this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
        }, 60000);
    }
    static getInstance() {
        if (!MetricsService.instance) {
            MetricsService.instance = new MetricsService();
        }
        return MetricsService.instance;
    }
    record(name, value, tags) {
        this.metrics.push({
            name,
            value,
            timestamp: Date.now(),
            tags,
        });
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
        let filtered = this.metrics;
        if (name) {
            filtered = filtered.filter(m => m.name === name);
        }
        if (tags) {
            filtered = filtered.filter(m => {
                if (!m.tags)
                    return false;
                return Object.entries(tags).every(([key, value]) => m.tags[key] === value);
            });
        }
        return {
            count: filtered.length,
            average: filtered.reduce((acc, curr) => acc + curr.value, 0) / filtered.length,
            min: Math.min(...filtered.map(m => m.value)),
            max: Math.max(...filtered.map(m => m.value)),
            metrics: filtered,
        };
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
exports.metricsService = MetricsService.getInstance();
//# sourceMappingURL=metrics.js.map