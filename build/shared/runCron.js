"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCron = void 0;
const i18n_1 = require("./i18n");
const cross_spawn_1 = require("cross-spawn");
const pLimit_1 = __importDefault(require("./pLimit"));
const logger_1 = __importDefault(require("../loaders/logger"));
const cron_1 = require("../data/cron");
const runningInstance_1 = require("../data/runningInstance");
const dayjs_1 = __importDefault(require("dayjs"));
const childProcess_1 = require("./childProcess");
function runCron(cmd, cron, isCurrent = () => true) {
    const execute = async () => {
        try {
            if (!isCurrent())
                return;
            // A single-instance trigger must not interrupt work already in progress.
            try {
                const existingCron = await cron_1.CrontabModel.findOne({
                    where: { id: Number(cron.id) },
                });
                // A mutation may commit while this queued run is reading the database.
                if (!isCurrent() || !existingCron || existingCron.isDisabled)
                    return;
                // Default to single instance mode (0) for backward compatibility
                const allowSingleInstances = (existingCron === null || existingCron === void 0 ? void 0 : existingCron.allow_multiple_instances) === 0;
                if (allowSingleInstances) {
                    // A queued manual run is an active reservation, even if its stored PID
                    // belongs to a previous execution.
                    if (existingCron.status === cron_1.CrontabStatus.queued &&
                        existingCron.pid) {
                        logger_1.default.info('[schedule][Skip queued single-instance task] Task ID: %s, PID: %s', cron.id, existingCron.pid);
                        return;
                    }
                    if (existingCron.status === cron_1.CrontabStatus.running &&
                        existingCron.pid) {
                        let missing = false;
                        try {
                            process.kill(existingCron.pid, 0);
                        }
                        catch (error) {
                            const code = error.code;
                            if (code === 'ESRCH')
                                missing = true;
                            else if (code !== 'EPERM')
                                throw error;
                        }
                        if (!missing) {
                            logger_1.default.info('[schedule][Skip active single-instance task] Task ID: %s, PID: %s', cron.id, existingCron.pid);
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
            const cp = (0, cross_spawn_1.spawn)(cmd, { shell: '/bin/bash' });
            const { completed } = (0, childProcess_1.observeChildProcess)(cp, {
                onStderr: async (message) => {
                    logger_1.default.info((0, i18n_1.t)('[schedule][任务标准错误] 命令: %s, 信息: %s'), cmd, message);
                },
            });
            const result = await completed;
            if (result.error) {
                logger_1.default.error((0, i18n_1.t)('[schedule][执行任务失败] 命令: %s, 错误: %s'), cmd, result.error.message);
            }
            logger_1.default.info((0, i18n_1.t)('[schedule][执行任务结束] 任务ID: %s, 退出码: %j'), cron.id, result.code);
            return Object.assign(Object.assign(Object.assign({}, cron), { command: cmd, pid: cp.pid }), result);
        }
        catch (error) {
            logger_1.default.error((0, i18n_1.t)('[schedule][创建任务失败] 命令: %s, 错误: %s'), cmd, (0, childProcess_1.asError)(error).message);
        }
        finally {
            pLimit_1.default.removeQueuedCron(cron.id, execute);
        }
    };
    return pLimit_1.default.runWithCronLimit(cron, execute, undefined, isCurrent);
}
exports.runCron = runCron;
//# sourceMappingURL=runCron.js.map