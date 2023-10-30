"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p_queue_cjs_1 = __importDefault(require("p-queue-cjs"));
const os_1 = __importDefault(require("os"));
const auth_1 = require("../data/auth");
const logger_1 = __importDefault(require("../loaders/logger"));
class TaskLimit {
    get cronLimitActiveCount() {
        return this.cronLimit.pending;
    }
    get cronLimitPendingCount() {
        return this.cronLimit.size;
    }
    constructor() {
        this.oneLimit = new p_queue_cjs_1.default({ concurrency: 1 });
        this.updateLogLimit = new p_queue_cjs_1.default({ concurrency: 1 });
        this.cronLimit = new p_queue_cjs_1.default({ concurrency: Math.max(os_1.default.cpus().length, 4) });
        this.setCustomLimit();
        this.handleEvents();
    }
    handleEvents() {
        this.cronLimit.on('add', () => {
            logger_1.default.info(`[schedule][任务加入队列] 运行中任务数: ${this.cronLimitActiveCount}, 等待中任务数: ${this.cronLimitPendingCount}`);
        });
        this.cronLimit.on('active', () => {
            logger_1.default.info(`[schedule][开始处理任务] 运行中任务数: ${this.cronLimitActiveCount + 1}, 等待中任务数: ${this.cronLimitPendingCount}`);
        });
        this.cronLimit.on('completed', (param) => {
            logger_1.default.info(`[schedule][任务处理成功] 参数 ${JSON.stringify(param)}`);
        });
        this.cronLimit.on('error', error => {
            logger_1.default.error(`[schedule][任务处理错误] 参数 ${JSON.stringify(error)}`);
        });
        this.cronLimit.on('next', () => {
            logger_1.default.info(`[schedule][任务处理结束] 运行中任务数: ${this.cronLimitActiveCount}, 等待中任务数: ${this.cronLimitPendingCount}`);
        });
        this.cronLimit.on('idle', () => {
            logger_1.default.info(`[schedule][任务队列] 空闲中...`);
        });
    }
    async setCustomLimit(limit) {
        var _a;
        if (limit) {
            this.cronLimit.concurrency = limit;
            return;
        }
        await auth_1.AuthModel.sync();
        const doc = await auth_1.AuthModel.findOne({
            where: { type: auth_1.AuthDataType.systemConfig },
        });
        if ((_a = doc === null || doc === void 0 ? void 0 : doc.info) === null || _a === void 0 ? void 0 : _a.cronConcurrency) {
            this.cronLimit.concurrency = doc.info.cronConcurrency;
        }
    }
    async runWithCronLimit(fn, options) {
        return this.cronLimit.add(fn, options);
    }
    runOneByOne(fn, options) {
        return this.oneLimit.add(fn, options);
    }
    updateDepLog(fn, options) {
        return this.updateLogLimit.add(fn, options);
    }
}
exports.default = new TaskLimit();
//# sourceMappingURL=pLimit.js.map