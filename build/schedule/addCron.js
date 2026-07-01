"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCron = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const node_schedule_1 = __importDefault(require("node-schedule"));
const data_1 = require("./data");
const runCron_1 = require("../shared/runCron");
const logger_1 = __importDefault(require("../loaders/logger"));
const i18n_1 = require("../shared/i18n");
/**
 * 预校验 cron 表达式，检测 node-schedule 会拒绝但 cron-parser 会接受的 pattern。
 * node-schedule 对 bare /N（字段以 / 开头，如前无星号/数字前缀的 /6）返回 null，
 * 提前拦截避免走 scheduleJob 后才发现无效。
 */
const isValidCronField = (cron) => {
    // 检测 bare /N 模式：字段以 / 开头如 "/6"，或空格后紧跟 "/6"
    // node-schedule 会对这种字段返回 null
    if (/\s\/\d/.test(cron) || /^\/\d/.test(cron)) {
        return false;
    }
    // 检测 ? 字符：Quartz cron 语法，node-schedule 在大多数位置返回 null
    // cron-parser 接受但 node-schedule 拒绝，提前拦截
    if (/\?/.test(cron)) {
        return false;
    }
    return true;
};
const addCron = (call, callback) => {
    var _a;
    // ===== 第一遍：预校验所有 cron 表达式 =====
    const validationErrors = [];
    for (const item of call.request.crons) {
        const { id, schedule, extra_schedules } = item;
        if (!isValidCronField(schedule)) {
            validationErrors.push((0, i18n_1.tf)('任务ID %s: 无效的 cron 表达式 "%s"（不支持裸 /N 步长和 ? 字符）', String(id), schedule));
        }
        if (extra_schedules === null || extra_schedules === void 0 ? void 0 : extra_schedules.length) {
            extra_schedules.forEach((x) => {
                if (!isValidCronField(x.schedule)) {
                    validationErrors.push((0, i18n_1.tf)('任务ID %s (extra_schedule): 无效的 cron 表达式 "%s"（不支持裸 /N 步长和 ? 字符）', String(id), x.schedule));
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
    // ===== 第二遍：注册所有任务 =====
    for (const item of call.request.crons) {
        const { id, schedule, command, extra_schedules, name } = item;
        // 取消该 id 已有的旧任务
        if (data_1.scheduleStacks.has(id)) {
            (_a = data_1.scheduleStacks.get(id)) === null || _a === void 0 ? void 0 : _a.forEach((x) => x.cancel());
        }
        logger_1.default.info('[schedule][创建定时任务] 任务ID: %s, 名称: %s, cron: %s, 执行命令: %s', id, name, schedule, command);
        if (extra_schedules === null || extra_schedules === void 0 ? void 0 : extra_schedules.length) {
            extra_schedules.forEach((x) => {
                logger_1.default.info('[schedule][创建定时任务] 任务ID: %s, 名称: %s, cron: %s, 执行命令: %s', id, name, x.schedule, command);
            });
        }
        const mainJob = node_schedule_1.default.scheduleJob(id, schedule, async () => {
            logger_1.default.info(`[schedule][准备运行任务] 命令: ${command}`);
            (0, runCron_1.runCron)(command, item);
        });
        if (!mainJob) {
            logger_1.default.warn('[schedule][创建定时任务] scheduleJob 返回 null（不符合预期，已通过预校验）: 任务ID: %s, cron: %s', id, schedule);
        }
        const extraJobs = (extra_schedules === null || extra_schedules === void 0 ? void 0 : extra_schedules.length)
            ? extra_schedules.map((x) => {
                const job = node_schedule_1.default.scheduleJob(id, x.schedule, async () => {
                    logger_1.default.info(`[schedule][准备运行任务] 命令: ${command}`);
                    (0, runCron_1.runCron)(command, item);
                });
                if (!job) {
                    logger_1.default.warn('[schedule][创建定时任务] scheduleJob 返回 null（不符合预期，已通过预校验）: 任务ID: %s, cron: %s', id, x.schedule);
                }
                return job;
            })
            : [];
        // 过滤 null（兜底保护，正常情况下预校验已拦截）
        const jobs = [mainJob, ...extraJobs].filter((x) => x != null);
        if (jobs.length > 0) {
            data_1.scheduleStacks.set(id, jobs);
        }
    }
    callback(null, null);
};
exports.addCron = addCron;
//# sourceMappingURL=addCron.js.map