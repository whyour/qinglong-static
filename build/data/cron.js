"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabModel = exports.CrontabStatus = exports.Crontab = void 0;
const executionModelDefinitions_1 = require("./executionModelDefinitions");
const _1 = require(".");
class Crontab {
    constructor(options) {
        this.name = options.name;
        this.command = options.command.trim();
        this.schedule = options.schedule;
        this.saved = options.saved;
        this.id = options.id;
        this.status =
            typeof options.status === 'number' && CrontabStatus[options.status]
                ? options.status
                : CrontabStatus.idle;
        this.timestamp = new Date().toString();
        this.isSystem = options.isSystem || 0;
        this.pid = options.pid;
        this.isDisabled = options.isDisabled || 0;
        this.log_path = options.log_path || '';
        this.isPinned = options.isPinned || 0;
        this.labels = options.labels || [];
        this.last_running_time = options.last_running_time || 0;
        this.last_execution_time = options.last_execution_time || 0;
        this.sub_id = options.sub_id;
        this.extra_schedules = options.extra_schedules;
        this.task_before = options.task_before;
        this.task_after = options.task_after;
        this.log_name = options.log_name;
        this.allow_multiple_instances = options.allow_multiple_instances || 0;
        this.skip_if_pending = Boolean(options.skip_if_pending);
        this.max_queue_wait = options.max_queue_wait || 0;
        this.catchup_seconds = options.catchup_seconds || 0;
        this.recovery_from = options.recovery_from;
        this.work_dir = options.work_dir;
    }
}
exports.Crontab = Crontab;
var CrontabStatus;
(function (CrontabStatus) {
    CrontabStatus[CrontabStatus["running"] = 0] = "running";
    CrontabStatus[CrontabStatus["idle"] = 1] = "idle";
    CrontabStatus[CrontabStatus["disabled"] = 2] = "disabled";
    CrontabStatus[CrontabStatus["queued"] = 3] = "queued";
})(CrontabStatus || (exports.CrontabStatus = CrontabStatus = {}));
exports.CrontabModel = (0, executionModelDefinitions_1.defineCrontabModel)(_1.sequelize);
//# sourceMappingURL=cron.js.map