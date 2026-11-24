"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineSystemModel = exports.defineCrontabStatModel = exports.defineRunningInstanceModel = exports.defineCrontabModel = void 0;
const sequelize_1 = require("sequelize");
function defineCrontabModel(database) {
    return database.define('Crontab', {
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
        queued_token: sequelize_1.DataTypes.STRING,
        labels: sequelize_1.DataTypes.JSON,
        last_instance_id: sequelize_1.DataTypes.INTEGER,
        last_running_time: sequelize_1.DataTypes.NUMBER,
        last_execution_time: sequelize_1.DataTypes.NUMBER,
        sub_id: { type: sequelize_1.DataTypes.NUMBER, allowNull: true },
        extra_schedules: sequelize_1.DataTypes.JSON,
        task_before: sequelize_1.DataTypes.STRING,
        task_after: sequelize_1.DataTypes.STRING,
        log_name: sequelize_1.DataTypes.STRING,
        allow_multiple_instances: sequelize_1.DataTypes.NUMBER,
        skip_if_pending: sequelize_1.DataTypes.BOOLEAN,
        max_queue_wait: sequelize_1.DataTypes.INTEGER,
        catchup_seconds: sequelize_1.DataTypes.INTEGER,
        recovery_from: sequelize_1.DataTypes.BIGINT,
        work_dir: sequelize_1.DataTypes.STRING,
    });
}
exports.defineCrontabModel = defineCrontabModel;
function defineRunningInstanceModel(database) {
    return database.define('RunningInstance', {
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
            defaultValue: 0,
        },
        exit_code: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true,
        },
    }, {
        indexes: [
            { fields: ['cron_id', 'pid', 'started_at'] },
            { fields: ['cron_id', 'id'] },
            // Settlement looks for live siblings while holding the writer transaction.
            // Finished history must not make that lookup scan every past execution.
            {
                name: 'running_instances_active_cron_id',
                fields: ['cron_id', 'id'],
                where: { status: 0 },
            },
        ],
    });
}
exports.defineRunningInstanceModel = defineRunningInstanceModel;
function defineCrontabStatModel(database) {
    return database.define('CrontabStat', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ref_id: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: false,
        },
        date: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        run_count: {
            type: sequelize_1.DataTypes.NUMBER,
            defaultValue: 0,
        },
        success_count: {
            type: sequelize_1.DataTypes.NUMBER,
            defaultValue: 0,
        },
        fail_count: {
            type: sequelize_1.DataTypes.NUMBER,
            defaultValue: 0,
        },
        untimed_count: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        total_time: {
            type: sequelize_1.DataTypes.NUMBER,
            defaultValue: 0,
        },
        fixed_max_time: { type: sequelize_1.DataTypes.NUMBER, allowNull: true },
        max_time: {
            type: sequelize_1.DataTypes.NUMBER,
            defaultValue: 0,
        },
    }, {
        indexes: [
            { unique: true, fields: ['ref_id', 'date'] },
            { fields: ['date'] },
        ],
    });
}
exports.defineCrontabStatModel = defineCrontabStatModel;
function defineSystemModel(database) {
    return database.define('Auth', {
        ip: sequelize_1.DataTypes.STRING,
        type: sequelize_1.DataTypes.STRING,
        info: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        },
    });
}
exports.defineSystemModel = defineSystemModel;
//# sourceMappingURL=executionModelDefinitions.js.map