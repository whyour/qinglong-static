"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p_limit_1 = __importDefault(require("p-limit"));
const os_1 = __importDefault(require("os"));
const auth_1 = require("../data/auth");
const logger_1 = __importDefault(require("../loaders/logger"));
class TaskLimit {
    constructor() {
        this.oneLimit = (0, p_limit_1.default)(1);
        this.updateLogLimit = (0, p_limit_1.default)(1);
        this.cpuLimit = (0, p_limit_1.default)(Math.max(os_1.default.cpus().length, 4));
        this.setCustomLimit();
    }
    get cpuLimitActiveCount() {
        return this.cpuLimit.activeCount;
    }
    get cpuLimitPendingCount() {
        return this.cpuLimit.pendingCount;
    }
    async setCustomLimit(limit) {
        var _a, _b;
        if (limit) {
            this.cpuLimit = (0, p_limit_1.default)(limit);
            return;
        }
        await auth_1.AuthModel.sync();
        const doc = await auth_1.AuthModel.findOne({
            where: { type: auth_1.AuthDataType.systemConfig },
        });
        if ((_a = doc === null || doc === void 0 ? void 0 : doc.info) === null || _a === void 0 ? void 0 : _a.cronConcurrency) {
            this.cpuLimit = (0, p_limit_1.default)((_b = doc === null || doc === void 0 ? void 0 : doc.info) === null || _b === void 0 ? void 0 : _b.cronConcurrency);
        }
    }
    runWithCpuLimit(fn) {
        logger_1.default.info(`[schedule][任务加入队列] 运行中任务数: ${this.cpuLimitActiveCount}, 等待中任务数: ${this.cpuLimitPendingCount}`);
        return this.cpuLimit(fn);
    }
    runOneByOne(fn) {
        return this.oneLimit(fn);
    }
    updateDepLog(fn) {
        return this.updateLogLimit(fn);
    }
}
exports.default = new TaskLimit();
//# sourceMappingURL=pLimit.js.map