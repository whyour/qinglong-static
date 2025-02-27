"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabModel = exports.CrontabStatus = exports.Crontab = void 0;
const _1 = require(".");
const sequelize_1 = require("sequelize");
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
    }
}
exports.Crontab = Crontab;
var CrontabStatus;
(function (CrontabStatus) {
    CrontabStatus[CrontabStatus["running"] = 0] = "running";
    CrontabStatus[CrontabStatus["queued"] = 0.5] = "queued";
    CrontabStatus[CrontabStatus["idle"] = 1] = "idle";
    CrontabStatus[CrontabStatus["disabled"] = 2] = "disabled";
})(CrontabStatus || (exports.CrontabStatus = CrontabStatus = {}));
exports.CrontabModel = _1.sequelize.define('Crontab', {
    name: {
        unique: 'compositeIndex',
        type: sequelize_1.DataTypes.STRING,
    },
    command: {
        unique: 'compositeIndex',
        type: sequelize_1.DataTypes.STRING,
    },
    schedule: {
        unique: 'compositeIndex',
        type: sequelize_1.DataTypes.STRING,
    },
    timestamp: sequelize_1.DataTypes.STRING,
    saved: sequelize_1.DataTypes.BOOLEAN,
    status: sequelize_1.DataTypes.NUMBER,
    isSystem: sequelize_1.DataTypes.NUMBER,
    pid: sequelize_1.DataTypes.NUMBER,
    isDisabled: sequelize_1.DataTypes.NUMBER,
    isPinned: sequelize_1.DataTypes.NUMBER,
    log_path: sequelize_1.DataTypes.STRING,
    labels: sequelize_1.DataTypes.JSON,
    last_running_time: sequelize_1.DataTypes.NUMBER,
    last_execution_time: sequelize_1.DataTypes.NUMBER,
    sub_id: { type: sequelize_1.DataTypes.NUMBER, allowNull: true },
    extra_schedules: sequelize_1.DataTypes.JSON,
    task_before: sequelize_1.DataTypes.STRING,
    task_after: sequelize_1.DataTypes.STRING,
});
//# sourceMappingURL=cron.js.map