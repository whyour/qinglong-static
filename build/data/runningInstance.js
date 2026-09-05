"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningInstanceModel = exports.RunningInstance = exports.InstanceStatus = void 0;
const _1 = require(".");
const sequelize_1 = require("sequelize");
var InstanceStatus;
(function (InstanceStatus) {
    InstanceStatus[InstanceStatus["running"] = 0] = "running";
    InstanceStatus[InstanceStatus["finished"] = 1] = "finished";
    InstanceStatus[InstanceStatus["stopped"] = 2] = "stopped";
    InstanceStatus[InstanceStatus["error"] = 3] = "error";
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
exports.RunningInstanceModel = _1.sequelize.define('RunningInstance', {
    cron_id: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    pid: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: true,
    },
    log_path: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    started_at: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    finished_at: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
        defaultValue: InstanceStatus.running,
    },
    exit_code: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: true,
    },
});
//# sourceMappingURL=runningInstance.js.map