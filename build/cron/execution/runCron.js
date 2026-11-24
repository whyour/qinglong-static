"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCron = exports.cancelWaitingTriggers = void 0;
const cronProcess_1 = require("./cronProcess");
const events_1 = require("events");
const p_queue_cjs_1 = __importDefault(require("p-queue-cjs"));
const history_1 = require("../history");
const i18n_1 = require("../../shared/i18n");
const cronCommandProcess_1 = require("./cronCommandProcess");
const cronLimit_1 = __importDefault(require("./cronLimit"));
const logger_1 = __importDefault(require("../../loaders/logger"));
const cron_1 = require("../../data/cron");
const runningInstance_1 = require("../../data/runningInstance");
const dayjs_1 = __importDefault(require("dayjs"));
const childProcess_1 = require("../../shared/childProcess");
const waiting = new Map();
// A backlog of missed timers can otherwise open hundreds of competing SQLite
// writer transactions on wake. Only serialize history writes, never commands.
const historyWrites = new p_queue_cjs_1.default({ concurrency: 1 });
function cancelWaitingTriggers(ids) {
    var _a;
    for (const id of ids)
        (_a = waiting.get(id)) === null || _a === void 0 ? void 0 : _a();
}
exports.cancelWaitingTriggers = cancelWaitingTriggers;
async function runCron(cmd, cron, isCurrent = () => true, trigger) {
    var _a;
    const history = trigger && (0, history_1.triggerHistory)();
    const queuedAt = (_a = trigger === null || trigger === void 0 ? void 0 : trigger.queuedAt) !== null && _a !== void 0 ? _a : Date.now();
    if (trigger && history) {
        const cronId = Number(cron.id);
        const admitted = await historyWrites.add(() => cron.skip_if_pending
            ? history.enqueueUnlessPending(trigger.id, cronId, trigger.source, trigger.time, queuedAt, cron.recovery_from)
            : history.enqueue(trigger.id, cronId, trigger.source, trigger.time, queuedAt));
        if (!admitted)
            return;
    }
    let reason = 'capacity';
    let state = 'skipped';
    let exitCode = null;
    let claimed = false;
    const deadline = cron.max_queue_wait
        ? queuedAt + cron.max_queue_wait * 1000
        : Infinity;
    let timer;
    const expiry = trigger ? new events_1.EventEmitter() : undefined;
    const alive = () => isCurrent() && Date.now() < deadline;
    if (trigger && expiry && Number.isFinite(deadline)) {
        timer = setTimeout(() => {
            reason = 'queue_timeout';
            cronLimit_1.default.removeQueuedCron(cron.id, execute);
            expiry.emit('expired');
        }, Math.max(0, deadline - Date.now()));
        timer.unref();
    }
    const execute = async () => {
        if (trigger)
            waiting.delete(trigger.id);
        reason = 'changed';
        try {
            if (!alive()) {
                reason = isCurrent() ? 'queue_timeout' : 'changed';
                return;
            }
            let multiple = false;
            // A single-instance trigger must not interrupt work already in progress.
            try {
                const existingCron = await cron_1.CrontabModel.findOne({
                    where: { id: Number(cron.id) },
                });
                // A mutation may commit while this queued run is reading the database.
                if (!isCurrent() || !existingCron || existingCron.isDisabled)
                    return;
                // Default to single instance mode (0) for backward compatibility
                multiple = existingCron.allow_multiple_instances === 1;
                if (!multiple) {
                    // A queued manual run is an active reservation, even if its stored PID
                    // belongs to a previous execution.
                    if (existingCron.status === cron_1.CrontabStatus.queued &&
                        existingCron.pid) {
                        logger_1.default.info('[schedule][Skip queued single-instance task] Task ID: %s, PID: %s', cron.id, existingCron.pid);
                        reason = 'overlap';
                        return;
                    }
                    if (existingCron.status === cron_1.CrontabStatus.running &&
                        existingCron.pid) {
                        if ((0, cronProcess_1.hasLiveCronProcess)(existingCron.status, existingCron.pid)) {
                            logger_1.default.info('[schedule][Skip active single-instance task] Task ID: %s, PID: %s', cron.id, existingCron.pid);
                            reason = 'overlap';
                            return;
                        }
                        // Capture old instance IDs before releasing the stale cron state so
                        // a concurrent replacement cannot have its instance marked stopped.
                        const staleInstances = await runningInstance_1.RunningInstanceModel.findAll({
                            attributes: ['id'],
                            where: {
                                cron_id: Number(cron.id),
                                pid: existingCron.pid,
                                status: runningInstance_1.InstanceStatus.running,
                            },
                        });
                        if (!isCurrent())
                            return;
                        const [recovered] = await cron_1.CrontabModel.update({
                            status: cron_1.CrontabStatus.idle,
                            pid: null,
                            queued_token: null,
                        }, {
                            where: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ id: Number(cron.id), pid: existingCron.pid, status: cron_1.CrontabStatus.running }, (existingCron.log_path !== undefined
                                ? { log_path: existingCron.log_path }
                                : {})), (existingCron.queued_token !== undefined
                                ? { queued_token: existingCron.queued_token }
                                : {})), (existingCron.last_execution_time !== undefined
                                ? { last_execution_time: existingCron.last_execution_time }
                                : {})), (existingCron.isDisabled !== undefined
                                ? { isDisabled: existingCron.isDisabled }
                                : {})), { allow_multiple_instances: 0 }),
                        });
                        if (recovered !== 1)
                            return;
                        const staleIds = staleInstances.map((instance) => instance.id);
                        if (staleIds.length) {
                            await runningInstance_1.RunningInstanceModel.update({ status: runningInstance_1.InstanceStatus.stopped, finished_at: (0, dayjs_1.default)().unix() }, { where: { id: staleIds, status: runningInstance_1.InstanceStatus.running } });
                        }
                        logger_1.default.info('[schedule][Recovered stale single-instance task] Task ID: %s, PID: %s', cron.id, existingCron.pid);
                    }
                }
            }
            catch (error) {
                logger_1.default.error((0, i18n_1.t)('[schedule][检查已运行任务失败] 任务ID: %s, 错误: %s'), cron.id, error);
                throw error;
            }
            // Invalidation can happen during the asynchronous database check.
            if (!isCurrent())
                return;
            logger_1.default.info((0, i18n_1.t)('[schedule][开始执行任务] 参数 %s'), JSON.stringify(Object.assign(Object.assign({}, cron), { command: cmd })));
            clearTimeout(timer);
            if (Date.now() >= deadline) {
                reason = 'queue_timeout';
                return;
            }
            if (trigger) {
                claimed = await history.start(trigger.id, Date.now(), multiple);
                if (!claimed) {
                    reason = 'overlap';
                    return;
                }
            }
            if (!isCurrent() || Date.now() >= deadline) {
                reason = isCurrent() ? 'queue_timeout' : 'changed';
                return;
            }
            let saveStart;
            const cp = (0, cronCommandProcess_1.spawnCronCommand)(cmd, trigger === null || trigger === void 0 ? void 0 : trigger.id, trigger && history
                ? (at) => {
                    saveStart = history
                        .recordCommandStart(trigger.id, at)
                        .catch((error) => {
                        logger_1.default.warn('[schedule] Could not record command start: %s', (0, childProcess_1.asError)(error).message);
                    });
                }
                : undefined);
            let denied;
            const { completed } = (0, childProcess_1.observeChildProcess)(cp, {
                onStart: async () => {
                    if (!trigger)
                        return;
                    try {
                        if ((await history.bindCommand(trigger.id, cp.pid)) &&
                            !(await history.shouldStop(trigger.id))) {
                            if (!alive())
                                denied = isCurrent() ? 'queue_timeout' : 'changed';
                            else
                                await (0, cronCommandProcess_1.releaseCronCommand)(cp);
                        }
                    }
                    finally {
                        cp.stdin.end();
                    }
                },
                onStderr: async (message) => {
                    logger_1.default.info((0, i18n_1.t)('[schedule][任务标准错误] 命令: %s, 信息: %s'), cmd, message);
                },
            });
            const result = await completed;
            await saveStart;
            if (denied) {
                reason = denied;
                return;
            }
            state = result.signal
                ? 'stopped'
                : result.error || result.code !== 0
                    ? 'failed'
                    : 'finished';
            reason = result.error ? 'spawn' : result.signal || '';
            exitCode = result.code;
            if (result.error) {
                logger_1.default.error((0, i18n_1.t)('[schedule][执行任务失败] 命令: %s, 错误: %s'), cmd, result.error.message);
            }
            logger_1.default.info((0, i18n_1.t)('[schedule][执行任务结束] 任务ID: %s, 退出码: %j'), cron.id, result.code);
            return Object.assign(Object.assign(Object.assign({}, cron), { command: cmd, pid: cp.pid }), result);
        }
        catch (error) {
            state = 'failed';
            reason = 'spawn';
            logger_1.default.error((0, i18n_1.t)('[schedule][创建任务失败] 命令: %s, 错误: %s'), cmd, (0, childProcess_1.asError)(error).message);
        }
        finally {
            cronLimit_1.default.removeQueuedCron(cron.id, execute);
        }
    };
    try {
        if (trigger && expiry)
            waiting.set(trigger.id, () => {
                cronLimit_1.default.removeQueuedCron(cron.id, execute);
                expiry.emit('expired');
            });
        return await cronLimit_1.default.runWithCronLimit(cron, execute, undefined, isCurrent, () => {
            reason = 'pending';
        }, expiry, trigger === null || trigger === void 0 ? void 0 : trigger.id, cron_1.CrontabModel.sequelize);
    }
    finally {
        clearTimeout(timer);
        if (trigger)
            waiting.delete(trigger.id);
        if (trigger && history) {
            const outcomeReason = state === 'skipped' && !isCurrent() ? 'changed' : reason;
            const finishedAt = Date.now();
            await historyWrites.add(() => state === 'skipped' && !claimed
                ? history.skipQueued(trigger.id, outcomeReason, finishedAt)
                : history.complete(trigger.id, state, outcomeReason || null, exitCode, finishedAt), { priority: 1 });
        }
    }
}
exports.runCron = runCron;
//# sourceMappingURL=runCron.js.map