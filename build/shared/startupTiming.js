"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startupStage = void 0;
const logger_1 = __importDefault(require("../loaders/logger"));
const perf_hooks_1 = require("perf_hooks");
async function startupStage(name, operation) {
    if (process.env.QL_STARTUP_TIMING !== '1')
        return operation();
    const started = perf_hooks_1.performance.now();
    try {
        return await operation();
    }
    finally {
        const role = process.env.SERVICE_TYPE || 'primary';
        logger_1.default.info(`[boot:timing] ${role}:${name} ${Math.round(perf_hooks_1.performance.now() - started)}ms (PID: ${process.pid})`);
    }
}
exports.startupStage = startupStage;
//# sourceMappingURL=startupTiming.js.map