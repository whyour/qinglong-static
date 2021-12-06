"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthDataType = exports.LoginStatus = exports.AuthInfo = void 0;
class AuthInfo {
    constructor(options) {
        this.ip = options.ip;
        this.info = options.info;
        this.type = options.type;
        this._id = options._id;
    }
}
exports.AuthInfo = AuthInfo;
var LoginStatus;
(function (LoginStatus) {
    LoginStatus[LoginStatus["success"] = 0] = "success";
    LoginStatus[LoginStatus["fail"] = 1] = "fail";
})(LoginStatus = exports.LoginStatus || (exports.LoginStatus = {}));
var AuthDataType;
(function (AuthDataType) {
    AuthDataType["loginLog"] = "loginLog";
    AuthDataType["authToken"] = "authToken";
    AuthDataType["notification"] = "notification";
    AuthDataType["removeLogFrequency"] = "removeLogFrequency";
})(AuthDataType = exports.AuthDataType || (exports.AuthDataType = {}));
//# sourceMappingURL=auth.js.map