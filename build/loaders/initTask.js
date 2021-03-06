"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const system_1 = __importDefault(require("../services/system"));
const schedule_1 = __importDefault(require("../services/schedule"));
const subscription_1 = __importDefault(require("../services/subscription"));
exports.default = async () => {
    const systemService = typedi_1.Container.get(system_1.default);
    const scheduleService = typedi_1.Container.get(schedule_1.default);
    const subscriptionService = typedi_1.Container.get(subscription_1.default);
    // 运行删除日志任务
    const data = await systemService.getLogRemoveFrequency();
    if (data && data.info && data.info.frequency) {
        const cron = {
            id: data.id,
            name: '删除日志',
            command: `ql rmlog ${data.info.frequency}`,
        };
        await scheduleService.createIntervalTask(cron, {
            days: data.info.frequency,
            runImmediately: true,
        });
    }
    // 运行所有订阅
    const subs = await subscriptionService.list();
    for (const sub of subs) {
        await subscriptionService.handleTask(sub, !sub.is_disabled, true, !sub.is_disabled);
    }
};
//# sourceMappingURL=initTask.js.map