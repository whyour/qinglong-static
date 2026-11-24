"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemModel = exports.NotifyStatus = exports.AuthDataType = exports.LoginStatus = exports.SystemInfo = void 0;
const executionModelDefinitions_1 = require("./executionModelDefinitions");
const _1 = require(".");
class SystemInfo {
    constructor(options) {
        this.ip = options.ip;
        this.info = options.info;
        this.type = options.type;
        this.id = options.id;
    }
}
exports.SystemInfo = SystemInfo;
var LoginStatus;
(function (LoginStatus) {
    LoginStatus[LoginStatus["success"] = 0] = "success";
    LoginStatus[LoginStatus["fail"] = 1] = "fail";
})(LoginStatus || (exports.LoginStatus = LoginStatus = {}));
var AuthDataType;
(function (AuthDataType) {
    AuthDataType["loginLog"] = "loginLog";
    AuthDataType["authToken"] = "authToken";
    AuthDataType["notification"] = "notification";
    AuthDataType["removeLogFrequency"] = "removeLogFrequency";
    AuthDataType["systemConfig"] = "systemConfig";
    AuthDataType["authConfig"] = "authConfig";
    AuthDataType["notifyLog"] = "notifyLog";
})(AuthDataType || (exports.AuthDataType = AuthDataType = {}));
exports.NotifyStatus = LoginStatus;
exports.SystemModel = (0, executionModelDefinitions_1.defineSystemModel)(_1.sequelize);
//# sourceMappingURL=system.js.map