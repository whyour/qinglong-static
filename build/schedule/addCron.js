"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCron = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const data_1 = require("./data");
const runCron_1 = require("../shared/runCron");
const logger_1 = __importDefault(require("../loaders/logger"));
const addCron = (call, callback) => {
    var _a;
    for (const item of call.request.crons) {
        const { id, schedule, command, extraSchedules, name } = item;
        if (data_1.scheduleStacks.has(id)) {
            (_a = data_1.scheduleStacks.get(id)) === null || _a === void 0 ? void 0 : _a.forEach((x) => x.cancel());
        }
        logger_1.default.info('[schedule][创建定时任务], 任务ID: %s, 名称: %s, cron: %s, 执行命令: %s', id, name, schedule, command);
        if (extraSchedules === null || extraSchedules === void 0 ? void 0 : extraSchedules.length) {
            extraSchedules.forEach(x => {
                logger_1.default.info('[schedule][创建定时任务], 任务ID: %s, 名称: %s, cron: %s, 执行命令: %s', id, name, x.schedule, command);
            });
        }
        data_1.scheduleStacks.set(id, [
            node_schedule_1.default.scheduleJob(id, schedule, async () => {
                logger_1.default.info(`[schedule][准备运行任务] 命令: ${command}`);
                (0, runCron_1.runCron)(command, { name, schedule, extraSchedules });
            }),
            ...((extraSchedules === null || extraSchedules === void 0 ? void 0 : extraSchedules.length)
                ? extraSchedules.map((x) => node_schedule_1.default.scheduleJob(id, x.schedule, async () => {
                    logger_1.default.info(`[schedule][准备运行任务] 命令: ${command}`);
                    (0, runCron_1.runCron)(command, { name, schedule, extraSchedules });
                }))
                : []),
        ]);
    }
    callback(null, null);
};
exports.addCron = addCron;
//# sourceMappingURL=addCron.js.map