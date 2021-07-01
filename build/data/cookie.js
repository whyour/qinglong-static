"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCookiePosition = exports.CookieStatus = exports.Cookie = void 0;
class Cookie {
    constructor(options) {
        this.value = options.value;
        this._id = options._id;
        this.created = options.created || new Date().valueOf();
        this.status = options.status || CookieStatus.noacquired;
        this.timestamp = new Date().toString();
        this.position = options.position;
    }
}
exports.Cookie = Cookie;
var CookieStatus;
(function (CookieStatus) {
    CookieStatus[CookieStatus["noacquired"] = 0] = "noacquired";
    CookieStatus[CookieStatus["normal"] = 1] = "normal";
    CookieStatus[CookieStatus["disabled"] = 2] = "disabled";
    CookieStatus[CookieStatus["invalid"] = 3] = "invalid";
    CookieStatus[CookieStatus["abnormal"] = 4] = "abnormal";
})(CookieStatus = exports.CookieStatus || (exports.CookieStatus = {}));
exports.initCookiePosition = 9999999999;
//# sourceMappingURL=cookie.js.map