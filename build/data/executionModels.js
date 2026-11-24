"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionAssociation = exports.executionModel = void 0;
const executionModelDefinitions_1 = require("./executionModelDefinitions");
const sequelize_1 = require("sequelize");
const definitions = {
    CronPlanCoverage: {
        id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
        since: sequelize_1.DataTypes.BIGINT,
    },
    CronTriggers: {
        id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        source: sequelize_1.DataTypes.TEXT,
        state: sequelize_1.DataTypes.TEXT,
        reason: sequelize_1.DataTypes.TEXT,
        log_path: sequelize_1.DataTypes.TEXT,
        owner: sequelize_1.DataTypes.TEXT,
        queue_context: sequelize_1.DataTypes.TEXT,
        queue_live_context: sequelize_1.DataTypes.TEXT,
        system_rule: sequelize_1.DataTypes.TEXT,
        process_identity: sequelize_1.DataTypes.TEXT,
        command_identity: sequelize_1.DataTypes.TEXT,
        cron_id: sequelize_1.DataTypes.BIGINT,
        scheduled_at: sequelize_1.DataTypes.BIGINT,
        queued_at: sequelize_1.DataTypes.BIGINT,
        started_at: sequelize_1.DataTypes.BIGINT,
        finished_at: sequelize_1.DataTypes.BIGINT,
        exit_code: sequelize_1.DataTypes.BIGINT,
        counted: sequelize_1.DataTypes.BIGINT,
        observed_at: sequelize_1.DataTypes.BIGINT,
        dequeued_at: sequelize_1.DataTypes.BIGINT,
        system_dispatch_at: sequelize_1.DataTypes.BIGINT,
        command_started_at: sequelize_1.DataTypes.BIGINT,
        instance_id: sequelize_1.DataTypes.BIGINT,
        script_started_at: sequelize_1.DataTypes.BIGINT,
        stop_requested: sequelize_1.DataTypes.BIGINT,
        resume_pending: sequelize_1.DataTypes.BIGINT,
        stop_exit_at: sequelize_1.DataTypes.BIGINT,
        stop_exit_verified: sequelize_1.DataTypes.BIGINT,
        exit_pending: sequelize_1.DataTypes.BIGINT,
    },
    CronConcurrencyLeases: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        token: sequelize_1.DataTypes.TEXT,
        owner: sequelize_1.DataTypes.TEXT,
        command_identity: sequelize_1.DataTypes.TEXT,
    },
    CronConcurrencyWaiters: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        token: sequelize_1.DataTypes.TEXT,
        owner: sequelize_1.DataTypes.TEXT,
    },
    CronStopRequests: {
        targets: sequelize_1.DataTypes.TEXT,
        root_identity: sequelize_1.DataTypes.TEXT,
        namespace_owner: sequelize_1.DataTypes.TEXT,
        instance_id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
        cron_id: sequelize_1.DataTypes.BIGINT,
        pid: sequelize_1.DataTypes.BIGINT,
        signalled: sequelize_1.DataTypes.BIGINT,
        signalled_at: sequelize_1.DataTypes.BIGINT,
    },
    CronStopBatches: {
        request_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        cron_ids: sequelize_1.DataTypes.TEXT,
        snapshot: sequelize_1.DataTypes.TEXT,
        status_code: sequelize_1.DataTypes.BIGINT,
    },
    CronManualSubmissions: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        token: sequelize_1.DataTypes.TEXT,
        snapshot: sequelize_1.DataTypes.TEXT,
    },
    CronShellBindings: {
        receipt: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        trigger_id: sequelize_1.DataTypes.TEXT,
    },
    CronExitObservations: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        outcome: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        finished_at: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
    },
    CronBoundExitConflicts: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        outcome: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        finished_at: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
    },
    CronUnmatchedBoundExits: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        outcome: sequelize_1.DataTypes.TEXT,
        finished_at: sequelize_1.DataTypes.BIGINT,
    },
    CronLegacyExitBookings: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        source: sequelize_1.DataTypes.TEXT,
        outcome: sequelize_1.DataTypes.TEXT,
        day: sequelize_1.DataTypes.TEXT,
        cron_id: sequelize_1.DataTypes.BIGINT,
        started_at: sequelize_1.DataTypes.BIGINT,
        finished_at: sequelize_1.DataTypes.BIGINT,
        stopped: sequelize_1.DataTypes.BIGINT,
        stat_id: sequelize_1.DataTypes.BIGINT,
        disputed: sequelize_1.DataTypes.BIGINT,
        bound: sequelize_1.DataTypes.BIGINT,
    },
    CronPrunedUnknownRuns: {
        trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        source: sequelize_1.DataTypes.TEXT,
        last_possible_day: sequelize_1.DataTypes.TEXT,
        cron_id: sequelize_1.DataTypes.BIGINT,
        started_at: sequelize_1.DataTypes.BIGINT,
    },
    CronHistoryRetention: {
        id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
        cutoff: sequelize_1.DataTypes.BIGINT,
    },
    CronPlanSwitches: {
        token: sequelize_1.DataTypes.TEXT,
        seq: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        staged_at: sequelize_1.DataTypes.BIGINT,
        first_at: sequelize_1.DataTypes.BIGINT,
        last_at: sequelize_1.DataTypes.BIGINT,
    },
    CronSystemPlans: {
        zone: sequelize_1.DataTypes.TEXT,
        rules: sequelize_1.DataTypes.TEXT,
        id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        staged: sequelize_1.DataTypes.BIGINT,
        confirmed: sequelize_1.DataTypes.BIGINT,
    },
    SchemaMigrations: {
        id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
        applied_at: sequelize_1.DataTypes.TEXT,
    },
};
const existingNames = {
    Crontabs: 'Crontab',
    RunningInstances: 'RunningInstance',
    CrontabStats: 'CrontabStat',
    Auths: 'Auth',
};
function executionModel(database, table) {
    const name = table in existingNames ? existingNames[table] : table;
    if (!database.isDefined(name)) {
        if (table === 'Crontabs')
            (0, executionModelDefinitions_1.defineCrontabModel)(database);
        else if (table === 'RunningInstances')
            (0, executionModelDefinitions_1.defineRunningInstanceModel)(database);
        else if (table === 'CrontabStats')
            (0, executionModelDefinitions_1.defineCrontabStatModel)(database);
        else if (table === 'Auths')
            (0, executionModelDefinitions_1.defineSystemModel)(database);
        else
            database.define(name, definitions[table], { tableName: table, timestamps: false, freezeTableName: true });
    }
    return database.model(name);
}
exports.executionModel = executionModel;
const relationships = {
    leaseTrigger: [
        'CronConcurrencyLeases',
        'CronTriggers',
        'trigger',
        'trigger_id',
        'id',
    ],
    waiterTrigger: [
        'CronConcurrencyWaiters',
        'CronTriggers',
        'trigger',
        'trigger_id',
        'id',
    ],
    submissionTrigger: [
        'CronManualSubmissions',
        'CronTriggers',
        'trigger',
        'trigger_id',
        'id',
    ],
    triggerStop: [
        'CronTriggers',
        'CronStopRequests',
        'stop',
        'instance_id',
        'instance_id',
    ],
    triggerTask: ['CronTriggers', 'Crontabs', 'task', 'cron_id', 'id'],
    instanceTrigger: [
        'RunningInstances',
        'CronTriggers',
        'trigger',
        'instance_id',
        'id',
    ],
};
// Associations describe existing joins only; migrations own foreign keys.
function executionAssociation(database, relation) {
    const [from, to, as, foreignKey, key] = relationships[relation];
    const source = executionModel(database, from);
    if (!source.associations[as]) {
        const target = executionModel(database, to);
        if (relation === 'instanceTrigger')
            source.hasOne(target, {
                as,
                foreignKey,
                sourceKey: key,
                constraints: false,
            });
        else
            source.belongsTo(target, {
                as,
                foreignKey,
                targetKey: key,
                constraints: false,
            });
    }
    return source.associations[as];
}
exports.executionAssociation = executionAssociation;
//# sourceMappingURL=executionModels.js.map