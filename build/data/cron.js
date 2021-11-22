"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabStatus = exports.Crontab = void 0;
class Crontab {
    constructor(options) {
        this.name = options.name;
        this.command = options.command;
        this.schedule = options.schedule;
        this.saved = options.saved;
        this._id = options._id;
        this.created = options.created;
        this.status = CrontabStatus[options.status]
            ? options.status
            : CrontabStatus.idle;
        this.timestamp = new Date().toString();
        this.isSystem = options.isSystem || 0;
        this.pid = options.pid;
        this.isDisabled = options.isDisabled || 0;
        this.log_path = options.log_path || '';
        this.isPinned = options.isPinned || 0;
    }
}
exports.Crontab = Crontab;
var CrontabStatus;
(function (CrontabStatus) {
    CrontabStatus[CrontabStatus["running"] = 0] = "running";
    CrontabStatus[CrontabStatus["idle"] = 1] = "idle";
    CrontabStatus[CrontabStatus["disabled"] = 2] = "disabled";
    CrontabStatus[CrontabStatus["queued"] = 3] = "queued";
})(CrontabStatus = exports.CrontabStatus || (exports.CrontabStatus = {}));
//# sourceMappingURL=cron.js.map