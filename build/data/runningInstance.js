"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningInstanceModel = exports.RunningInstance = exports.InstanceStatus = void 0;
const executionModelDefinitions_1 = require("./executionModelDefinitions");
const _1 = require(".");
var InstanceStatus;
(function (InstanceStatus) {
    InstanceStatus[InstanceStatus["running"] = 0] = "running";
    InstanceStatus[InstanceStatus["finished"] = 1] = "finished";
    InstanceStatus[InstanceStatus["stopped"] = 2] = "stopped";
    InstanceStatus[InstanceStatus["error"] = 3] = "error";
    InstanceStatus[InstanceStatus["unknown"] = 4] = "unknown";
})(InstanceStatus || (exports.InstanceStatus = InstanceStatus = {}));
class RunningInstance {
    constructor(options) {
        this.id = options.id;
        this.cron_id = options.cron_id;
        this.pid = options.pid;
        this.log_path = options.log_path;
        this.started_at = options.started_at;
        this.finished_at = options.finished_at;
        this.status = options.status;
        this.exit_code = options.exit_code;
    }
}
exports.RunningInstance = RunningInstance;
exports.RunningInstanceModel = (0, executionModelDefinitions_1.defineRunningInstanceModel)(_1.sequelize);
//# sourceMappingURL=runningInstance.js.map