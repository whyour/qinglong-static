"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabStatus = exports.App = void 0;
class App {
    constructor(options) {
        this.name = options.name;
        this.scopes = options.scopes;
        this.client_id = options.client_id;
        this.client_secret = options.client_secret;
        this._id = options._id;
    }
}
exports.App = App;
var CrontabStatus;
(function (CrontabStatus) {
    CrontabStatus[CrontabStatus["running"] = 0] = "running";
    CrontabStatus[CrontabStatus["idle"] = 1] = "idle";
    CrontabStatus[CrontabStatus["disabled"] = 2] = "disabled";
    CrontabStatus[CrontabStatus["queued"] = 3] = "queued";
})(CrontabStatus = exports.CrontabStatus || (exports.CrontabStatus = {}));
//# sourceMappingURL=open.js.map