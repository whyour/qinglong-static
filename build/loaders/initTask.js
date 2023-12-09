"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const system_1 = __importDefault(require("../services/system"));
const schedule_1 = __importDefault(require("../services/schedule"));
const subscription_1 = __importDefault(require("../services/subscription"));
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
const path_1 = require("path");
exports.default = async () => {
    const systemService = typedi_1.Container.get(system_1.default);
    const scheduleService = typedi_1.Container.get(schedule_1.default);
    const subscriptionService = typedi_1.Container.get(subscription_1.default);
    // 生成内置token
    let tokenCommand = `tsx ${(0, path_1.join)(config_1.default.rootPath, 'back/token.ts')}`;
    const tokenFile = (0, path_1.join)(config_1.default.rootPath, 'static/build/token.js');
    if (await (0, util_1.fileExist)(tokenFile)) {
        tokenCommand = `node ${tokenFile}`;
    }
    const cron = {
        id: NaN,
        name: '生成token',
        command: tokenCommand,
    };
    await scheduleService.cancelIntervalTask(cron);
    scheduleService.createIntervalTask(cron, {
        days: 28,
    });
    // 运行删除日志任务
    const data = await systemService.getSystemConfig();
    if (data && data.info && data.info.logRemoveFrequency) {
        const rmlogCron = {
            id: data.id,
            name: '删除日志',
            command: `ql rmlog ${data.info.logRemoveFrequency}`,
        };
        await scheduleService.cancelIntervalTask(rmlogCron);
        scheduleService.createIntervalTask(rmlogCron, {
            days: data.info.logRemoveFrequency,
        });
    }
    // 运行所有订阅
    await subscriptionService.setSshConfig();
    const subs = await subscriptionService.list();
    for (const sub of subs) {
        subscriptionService.handleTask(sub, !sub.is_disabled, !sub.is_disabled);
    }
};
//# sourceMappingURL=initTask.js.map