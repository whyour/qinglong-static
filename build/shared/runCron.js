"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCron = void 0;
const cross_spawn_1 = require("cross-spawn");
const pLimit_1 = __importDefault(require("./pLimit"));
const logger_1 = __importDefault(require("../loaders/logger"));
const cron_1 = require("../data/cron");
const util_1 = require("../config/util");
const runningInstance_1 = require("../data/runningInstance");
const dayjs_1 = __importDefault(require("dayjs"));
const childProcess_1 = require("./childProcess");
function runCron(cmd, cron) {
    return pLimit_1.default.runWithCronLimit(cron, async () => {
        try {
            // Check if the cron is already running and stop it (only if multiple instances are not allowed)
            try {
                const existingCron = await cron_1.CrontabModel.findOne({
                    where: { id: Number(cron.id) },
                });
                // Default to single instance mode (0) for backward compatibility
                const allowSingleInstances = (existingCron === null || existingCron === void 0 ? void 0 : existingCron.allow_multiple_instances) === 0;
                if (allowSingleInstances &&
                    existingCron &&
                    existingCron.pid &&
                    (existingCron.status === cron_1.CrontabStatus.running ||
                        existingCron.status === cron_1.CrontabStatus.queued)) {
                    logger_1.default.info(`[schedule][停止已运行任务] 任务ID: ${cron.id}, PID: ${existingCron.pid}`);
                    await (0, util_1.killTask)(existingCron.pid);
                    // Mark old running instances as stopped
                    const stoppedAt = (0, dayjs_1.default)().unix();
                    await runningInstance_1.RunningInstanceModel.update({ status: runningInstance_1.InstanceStatus.stopped, finished_at: stoppedAt }, {
                        where: {
                            cron_id: Number(cron.id),
                            status: runningInstance_1.InstanceStatus.running,
                        },
                    });
                    // Update the status to idle after killing
                    await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: undefined }, { where: { id: Number(cron.id) } });
                }
            }
            catch (error) {
                logger_1.default.error(`[schedule][检查已运行任务失败] 任务ID: ${cron.id}, 错误: ${error}`);
            }
            logger_1.default.info(`[schedule][开始执行任务] 参数 ${JSON.stringify(Object.assign(Object.assign({}, cron), { command: cmd }))}`);
            const cp = (0, cross_spawn_1.spawn)(cmd, { shell: '/bin/bash' });
            const { completed } = (0, childProcess_1.observeChildProcess)(cp, {
                onStderr: async (message) => {
                    logger_1.default.info('[schedule][任务标准错误] 命令: %s, 信息: %s', cmd, message);
                },
            });
            const result = await completed;
            if (result.error) {
                logger_1.default.error('[schedule][执行任务失败] 命令: %s, 错误: %s', cmd, result.error.message);
            }
            logger_1.default.info('[schedule][执行任务结束] 任务ID: %s, 退出码: %j', cron.id, result.code);
            return Object.assign(Object.assign(Object.assign({}, cron), { command: cmd, pid: cp.pid }), result);
        }
        catch (error) {
            logger_1.default.error('[schedule][创建任务失败] 命令: %s, 错误: %s', cmd, (0, childProcess_1.asError)(error).message);
        }
        finally {
            pLimit_1.default.removeQueuedCron(cron.id);
        }
    });
}
exports.runCron = runCron;
//# sourceMappingURL=runCron.js.map