"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringMiddleware = void 0;
const logger_1 = __importDefault(require("../loaders/logger"));
const perf_hooks_1 = require("perf_hooks");
const metrics_1 = require("../services/metrics");
const UNMONITORED_PATH_SUFFIXES = ['/api/health', '/open/health'];
const HTTP_METRIC_SAMPLE_INTERVAL = 10;
let requestSampleOffset = 0;
const monitoringMiddleware = (req, res, next) => {
    if (UNMONITORED_PATH_SUFFIXES.some((path) => req.path.endsWith(path))) {
        return next();
    }
    const start = perf_hooks_1.performance.now();
    const originalEnd = res.end;
    res.end = function (chunk, encoding, cb) {
        const duration = perf_hooks_1.performance.now() - start;
        const shouldSample = requestSampleOffset === 0;
        requestSampleOffset =
            (requestSampleOffset + 1) % HTTP_METRIC_SAMPLE_INTERVAL;
        if (shouldSample) {
            metrics_1.metricsService.record('http_request', duration, Object.assign({ method: req.method, path: req.path, statusCode: res.statusCode.toString() }, (req.platform && { platform: req.platform })));
        }
        if (duration > 1000) {
            logger_1.default.warn(`Slow request detected: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
        }
        return originalEnd.call(this, chunk, encoding, cb);
    };
    next();
};
exports.monitoringMiddleware = monitoringMiddleware;
//# sourceMappingURL=monitoring.js.map