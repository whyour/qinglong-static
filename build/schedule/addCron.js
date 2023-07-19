"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCron = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const data_1 = require("./data");
const runCron_1 = require("../shared/runCron");
const addCron = (call, callback) => {
    var _a;
    for (const item of call.request.crons) {
        const { id, schedule, command } = item;
        if (data_1.scheduleStacks.has(id)) {
            (_a = data_1.scheduleStacks.get(id)) === null || _a === void 0 ? void 0 : _a.cancel();
        }
        data_1.scheduleStacks.set(id, node_schedule_1.default.scheduleJob(id, schedule, async () => {
            (0, runCron_1.runCron)(`ID=${id} ${command}`);
        }));
    }
    callback(null, null);
};
exports.addCron = addCron;
//# sourceMappingURL=addCron.js.map