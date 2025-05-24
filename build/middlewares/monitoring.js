"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = exports.monitoringMiddleware = void 0;
const logger_1 = __importDefault(require("../loaders/logger"));
const perf_hooks_1 = require("perf_hooks");
const metrics_1 = require("../services/metrics");
const requestMetrics = [];
const monitoringMiddleware = (req, res, next) => {
    const start = perf_hooks_1.performance.now();
    const originalEnd = res.end;
    res.end = function (chunk, encoding, cb) {
        const duration = perf_hooks_1.performance.now() - start;
        const metric = {
            method: req.method,
            path: req.path,
            duration,
            statusCode: res.statusCode,
            timestamp: Date.now(),
            platform: req.platform,
        };
        requestMetrics.push(metric);
        metrics_1.metricsService.record('http_request', duration, Object.assign({ method: req.method, path: req.path, statusCode: res.statusCode.toString() }, (req.platform && { platform: req.platform })));
        if (requestMetrics.length > 1000) {
            requestMetrics.shift();
        }
        if (duration > 1000) {
            logger_1.default.warn(`Slow request detected: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
        }
        return originalEnd.call(this, chunk, encoding, cb);
    };
    next();
};
exports.monitoringMiddleware = monitoringMiddleware;
const getMetrics = () => {
    return {
        totalRequests: requestMetrics.length,
        averageDuration: requestMetrics.reduce((acc, curr) => acc + curr.duration, 0) /
            requestMetrics.length,
        requestsByMethod: requestMetrics.reduce((acc, curr) => {
            acc[curr.method] = (acc[curr.method] || 0) + 1;
            return acc;
        }, {}),
        requestsByPlatform: requestMetrics.reduce((acc, curr) => {
            if (curr.platform) {
                acc[curr.platform] = (acc[curr.platform] || 0) + 1;
            }
            return acc;
        }, {}),
        recentRequests: requestMetrics.slice(-10),
    };
};
exports.getMetrics = getMetrics;
//# sourceMappingURL=monitoring.js.map