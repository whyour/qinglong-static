"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delCron = void 0;
const data_1 = require("./data");
const logger_1 = __importDefault(require("../loaders/logger"));
const delCron = (call, callback) => {
    var _a;
    for (const id of call.request.ids) {
        if (data_1.scheduleStacks.has(id)) {
            logger_1.default.info('[schedule][取消定时任务] 任务ID: %s', id);
            // 过滤掉 nodeSchedule.scheduleJob() 对无效表达式返回的 null，
            // 否则对 null 调 cancel() 会让整个取消流程抛出 UNKNOWN 错误，
            // 进而导致 HTTP 端的 remove() 跳过 setCrontab()，造成 crontab.list 残留。
            (_a = data_1.scheduleStacks.get(id)) === null || _a === void 0 ? void 0 : _a.filter((x) => x != null).forEach((x) => {
                try {
                    x.cancel();
                }
                catch (error) {
                    logger_1.default.warn('[schedule][取消任务失败] 任务ID: %s, 错误: %s', id, (error === null || error === void 0 ? void 0 : error.message) || error);
                }
            });
            data_1.scheduleStacks.delete(id);
        }
    }
    callback(null, null);
};
exports.delCron = delCron;
//# sourceMappingURL=delCron.js.map