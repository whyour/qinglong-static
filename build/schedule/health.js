"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
const check = async (call, callback) => {
    switch (call.request.service) {
        case 'cron':
            const res = await (0, util_1.promiseExec)(`curl -sf http://localhost:${config_1.default.port}/api/system`);
            if (res.includes('200')) {
                return callback(null, { status: 1 });
            }
            const errLog = await (0, util_1.promiseExec)(`tail -n 300 ~/.pm2/logs/panel-error.log`);
            return callback(new Error(errLog));
        default:
            return callback(null, { status: 1 });
    }
};
exports.check = check;
//# sourceMappingURL=health.js.map