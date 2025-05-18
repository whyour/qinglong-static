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
            logger_1.default.info('[schedule][取消定时任务], 任务ID: %s', id);
            (_a = data_1.scheduleStacks.get(id)) === null || _a === void 0 ? void 0 : _a.forEach(x => x.cancel());
            data_1.scheduleStacks.delete(id);
        }
    }
    callback(null, null);
};
exports.delCron = delCron;
//# sourceMappingURL=delCron.js.map