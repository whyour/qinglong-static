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
const cronRecovery_1 = require("../shared/cronRecovery");
const triggerHistory_1 = require("../shared/triggerHistory");
const runCron_1 = require("../shared/runCron");
const logger_1 = __importDefault(require("../loaders/logger"));
const i18n_1 = require("../shared/i18n");
// Validate the entire batch before replacing any existing jobs.
const isValidCronField = (cron) => {
    return (0, cronSchedule_1.isValidCronSchedule)(cron);
};
const definitions = new WeakMap();
const addCron = (call, callback, savePlan) => {
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
    const desired = new Map(call.request.crons.map((item) => [item.id, item]));
    const recoveries = [];
    try {
        for (const item of desired.values()) {
            const signature = JSON.stringify([item.schedule, item.command,
                (item.extra_schedules || []).map((s) => s.schedule), item.max_queue_wait || 0,
                !!item.skip_if_pending, item.catchup_seconds || 0, item.catchup_seconds || item.skip_if_pending ? item.recovery_from : 0]);
            const current = data_1.scheduleStacks.get(item.id);
            if (current && definitions.get(current) === signature)
                continue;
            const jobs = [];
            definitions.set(jobs, signature);
            prepared.set(item.id, jobs);
            for (const [ruleIndex, schedule] of [
                item.schedule,
                ...(item.extra_schedules || []).map((x) => x.schedule),
            ].entries()) {
                const fire = async (date, source = 'node') => {
                    const isCurrent = () => data_1.scheduleStacks.get(item.id) === jobs;
                    if (!isCurrent())
                        return;
                    await (0, runCron_1.runCron)(item.command, item, isCurrent, date && {
                        id: (0, triggerHistory_1.slotId)(item.id, ruleIndex, schedule, +date), time: +date, source,
                    });
                };
                if (call.request.replace && item.catchup_seconds && item.recovery_from) {
                    recoveries.push(async () => {
                        const now = Date.now();
                        const since = Math.max(item.recovery_from, now - item.catchup_seconds * 1000);
                        const time = (0, cronRecovery_1.latestMissedSlot)(schedule, since, now);
                        if (time !== null)
                            await fire(new Date(time), 'recovery');
                    });
                }
                jobs.push((0, cronScheduler_1.createCronJob)(schedule, fire, {
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
    const activate = () => {
        var _a;
        if (call.request.replace) {
            for (const [id, jobs] of data_1.scheduleStacks) {
                if (desired.has(id))
                    continue;
                jobs.forEach((job) => job === null || job === void 0 ? void 0 : job.cancel());
                data_1.scheduleStacks.delete(id);
            }
        }
        for (const [id, jobs] of prepared) {
            (_a = data_1.scheduleStacks.get(id)) === null || _a === void 0 ? void 0 : _a.forEach((job) => job.cancel());
            data_1.scheduleStacks.set(id, jobs);
            jobs.forEach((job) => job.start());
            logger_1.default.info((0, i18n_1.t)('[schedule][创建定时任务] 任务ID: %s, 规则数: %s'), id, jobs.length);
        }
        callback(null, null);
        for (const recover of recoveries)
            setImmediate(() => recover().catch((err) => logger_1.default.error(String(err))));
    };
    if (savePlan) {
        savePlan().then(activate).catch(error => {
            for (const jobs of prepared.values())
                jobs.forEach(job => job.cancel());
            callback(error);
        });
    }
    else
        activate();
};
exports.addCron = addCron;
//# sourceMappingURL=addCron.js.map