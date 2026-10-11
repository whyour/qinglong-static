"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCron = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const cronScheduler_1 = require("../shared/cronScheduler");
const cronSchedule_1 = require("../shared/cronSchedule");
const data_1 = require("./data");
const runCron_1 = require("../shared/runCron");
const logger_1 = __importDefault(require("../loaders/logger"));
const i18n_1 = require("../shared/i18n");
// Validate the entire batch before replacing any existing jobs.
const isValidCronField = (cron) => {
    return (0, cronSchedule_1.isValidCronSchedule)(cron);
};
const addCron = (call, callback) => {
    var _a, _b;
    // ===== 第一遍：预校验所有 cron 表达式 =====
    const validationErrors = [];
    for (const item of call.request.crons) {
        const { id, schedule, extra_schedules } = item;
        if (!isValidCronField(schedule)) {
            validationErrors.push((0, i18n_1.tf)('任务ID %s: 无效的 cron 表达式 "%s"', String(id), schedule));
        }
        if (extra_schedules === null || extra_schedules === void 0 ? void 0 : extra_schedules.length) {
            extra_schedules.forEach((x) => {
                if (!isValidCronField(x.schedule)) {
                    validationErrors.push((0, i18n_1.tf)('任务ID %s (extra_schedule): 无效的 cron 表达式 "%s"', String(id), x.schedule));
                }
            });
        }
    }
    if (validationErrors.length > 0) {
        const details = validationErrors.join('\n');
        const err = new Error(details);
        err.code = grpc_js_1.status.INVALID_ARGUMENT;
        err.details = details;
        callback(err, null);
        return;
    }
    // Prepare stopped jobs first: construction errors must preserve the old snapshot.
    const prepared = new Map();
    try {
        for (const item of call.request.crons) {
            const jobs = [];
            (_a = prepared.get(item.id)) === null || _a === void 0 ? void 0 : _a.forEach((job) => job.cancel());
            prepared.set(item.id, jobs);
            for (const schedule of [
                item.schedule,
                ...(item.extra_schedules || []).map((x) => x.schedule),
            ]) {
                jobs.push((0, cronScheduler_1.createCronJob)(schedule, async () => {
                    logger_1.default.info('[schedule][准备运行任务] 命令: %s', item.command);
                    await (0, runCron_1.runCron)(item.command, item, () => data_1.scheduleStacks.get(item.id) === jobs);
                }, {
                    name: `${item.id}: ${item.name || ''}`,
                    logger: logger_1.default,
                    start: false,
                }));
            }
        }
    }
    catch (error) {
        for (const jobs of prepared.values())
            jobs.forEach((job) => job.cancel());
        const err = new Error(error instanceof Error ? error.message : String(error));
        err.code = grpc_js_1.status.INVALID_ARGUMENT;
        err.details = err.message;
        callback(err, null);
        return;
    }
    if (call.request.replace) {
        for (const jobs of data_1.scheduleStacks.values())
            jobs.forEach((job) => job === null || job === void 0 ? void 0 : job.cancel());
        data_1.scheduleStacks.clear();
    }
    for (const [id, jobs] of prepared) {
        (_b = data_1.scheduleStacks.get(id)) === null || _b === void 0 ? void 0 : _b.forEach((job) => job.cancel());
        data_1.scheduleStacks.set(id, jobs);
        jobs.forEach((job) => job.start());
        logger_1.default.info('[schedule][创建定时任务] 任务ID: %s, 规则数: %s', id, jobs.length);
    }
    callback(null, null);
};
exports.addCron = addCron;
//# sourceMappingURL=addCron.js.map