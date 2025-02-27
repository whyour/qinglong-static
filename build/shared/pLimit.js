"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p_queue_cjs_1 = __importDefault(require("p-queue-cjs"));
const os_1 = __importDefault(require("os"));
const system_1 = require("../data/system");
const logger_1 = __importDefault(require("../loaders/logger"));
const notify_1 = __importDefault(require("../services/notify"));
const config_1 = __importDefault(require("../config"));
const grpc_js_1 = require("@grpc/grpc-js");
const api_1 = require("../protos/api");
class TaskLimit {
    get cronLimitActiveCount() {
        return this.cronLimit.pending;
    }
    get cronLimitPendingCount() {
        return this.cronLimit.size;
    }
    get firstDependencyId() {
        return [...this.queuedDependencyIds.values()][0];
    }
    constructor() {
        this.dependenyLimit = new p_queue_cjs_1.default({ concurrency: 1 });
        this.queuedDependencyIds = new Set([]);
        this.queuedCrons = new Map();
        this.repeatCronNotifyMap = new Map();
        this.updateLogLimit = new p_queue_cjs_1.default({ concurrency: 1 });
        this.cronLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
        this.manualCronoLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
        this.subscriptionLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
        this.scriptLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
        this.systemLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
        this.client = new api_1.ApiClient(`0.0.0.0:${config_1.default.cronPort}`, grpc_js_1.credentials.createInsecure(), { 'grpc.enable_http_proxy': 0 });
        this.notificationService = new notify_1.default();
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
        this.cronLimit.on('error', (error) => {
            logger_1.default.error(`[schedule][任务处理错误] 参数 ${JSON.stringify(error)}`);
        });
        this.cronLimit.on('next', () => {
            logger_1.default.info(`[schedule][任务处理结束] 运行中任务数: ${this.cronLimitActiveCount}, 等待中任务数: ${this.cronLimitPendingCount}`);
        });
        this.cronLimit.on('idle', () => {
            logger_1.default.info(`[schedule][任务队列] 空闲中...`);
        });
    }
    removeQueuedDependency(dependency) {
        if (this.queuedDependencyIds.has(dependency.id)) {
            this.queuedDependencyIds.delete(dependency.id);
        }
    }
    removeQueuedCron(id) {
        if (this.queuedCrons.has(id)) {
            const runs = this.queuedCrons.get(id);
            if (runs && runs.length > 0) {
                runs.pop();
                this.queuedCrons.set(id, runs);
            }
        }
    }
    async setCustomLimit(limit) {
        var _a;
        if (limit) {
            this.cronLimit.concurrency = limit;
            this.manualCronoLimit.concurrency = limit;
            return;
        }
        await system_1.SystemModel.sync();
        const doc = await system_1.SystemModel.findOne({
            where: { type: system_1.AuthDataType.systemConfig },
        });
        if ((_a = doc === null || doc === void 0 ? void 0 : doc.info) === null || _a === void 0 ? void 0 : _a.cronConcurrency) {
            this.cronLimit.concurrency = doc.info.cronConcurrency;
            this.manualCronoLimit.concurrency = doc.info.cronConcurrency;
        }
    }
    async runWithCronLimit(cron, fn, options) {
        fn.cron = cron;
        let runs = this.queuedCrons.get(cron.id);
        const result = (runs === null || runs === void 0 ? void 0 : runs.length) ? [...runs, fn] : [fn];
        const repeatTimes = this.repeatCronNotifyMap.get(cron.id) || 0;
        if ((result === null || result === void 0 ? void 0 : result.length) > 5) {
            if (repeatTimes < 3) {
                this.repeatCronNotifyMap.set(cron.id, repeatTimes + 1);
                this.client.systemNotify({
                    title: '任务重复运行',
                    content: `任务：${cron.name}，命令：${cron.command}，定时：${cron.schedule}，处于运行中的超过 5 个，请检查定时设置`,
                }, (err, res) => {
                    if (err) {
                        logger_1.default.error(`[schedule][任务重复运行] 通知失败 ${JSON.stringify(err)}`);
                    }
                });
            }
            logger_1.default.warn(`[schedule][任务重复运行] 参数 ${JSON.stringify(cron)}`);
            return;
        }
        this.queuedCrons.set(cron.id, result);
        return this.cronLimit.add(fn, options);
    }
    async manualRunWithCronLimit(fn, options) {
        return this.manualCronoLimit.add(fn, options);
    }
    async runWithSubscriptionLimit(schedule, fn, options) {
        fn.schedule = schedule;
        return this.subscriptionLimit.add(fn, options);
    }
    async runWithSystemLimit(schedule, fn, options) {
        fn.schedule = schedule;
        return this.systemLimit.add(fn, options);
    }
    async runWithScriptLimit(schedule, fn, options) {
        fn.schedule = schedule;
        return this.scriptLimit.add(fn, options);
    }
    runDependeny(dependency, fn, options) {
        this.queuedDependencyIds.add(dependency.id);
        fn.dependency = dependency;
        return this.dependenyLimit.add(fn, options);
    }
    updateDepLog(fn, options) {
        return this.updateLogLimit.add(fn, options);
    }
}
exports.default = new TaskLimit();
//# sourceMappingURL=pLimit.js.map