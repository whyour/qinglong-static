"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installTriggerHistory = void 0;
const sequelize_1 = require("sequelize");
async function installTriggerHistory(database, transaction) {
    const conflictTable = `CREATE TABLE IF NOT EXISTS CronBoundExitConflicts (
    trigger_id TEXT NOT NULL, outcome TEXT NOT NULL, finished_at INTEGER NOT NULL,
    PRIMARY KEY(trigger_id,outcome,finished_at)) WITHOUT ROWID`;
    const statements = [
        `CREATE TABLE IF NOT EXISTS CronConcurrencyLeases (
      trigger_id TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL,
      command_identity TEXT) WITHOUT ROWID`,
        `CREATE TABLE IF NOT EXISTS CronConcurrencyWaiters (
      trigger_id TEXT PRIMARY KEY REFERENCES CronTriggers(id) ON DELETE CASCADE,
      token TEXT NOT NULL, owner TEXT NOT NULL) WITHOUT ROWID`,
        {
            table: 'CronPlanSwitches',
            attributes: {
                seq: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
                token: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
                staged_at: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                first_at: { type: sequelize_1.DataTypes.INTEGER },
                last_at: { type: sequelize_1.DataTypes.INTEGER },
            },
        },
        'CREATE TABLE IF NOT EXISTS CronPlanCoverage (id INTEGER PRIMARY KEY CHECK(id=1), since INTEGER NOT NULL)',
        {
            table: 'CronPlanRules',
            attributes: {
                cron_id: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                rule_index: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                schedule: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                zone: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                since: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                until: { type: sequelize_1.DataTypes.INTEGER },
            },
        },
        'CREATE UNIQUE INDEX IF NOT EXISTS cron_plan_active ON CronPlanRules(cron_id,rule_index) WHERE until IS NULL',
        {
            table: 'CronTriggers',
            attributes: {
                id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
                cron_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                source: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                state: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                scheduled_at: { type: sequelize_1.DataTypes.INTEGER },
                queued_at: { type: sequelize_1.DataTypes.INTEGER },
                started_at: { type: sequelize_1.DataTypes.INTEGER },
                finished_at: { type: sequelize_1.DataTypes.INTEGER },
                reason: { type: sequelize_1.DataTypes.TEXT },
                exit_code: { type: sequelize_1.DataTypes.INTEGER },
                log_path: { type: sequelize_1.DataTypes.TEXT },
                counted: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                owner: { type: sequelize_1.DataTypes.TEXT },
                observed_at: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            },
        },
        `CREATE TABLE IF NOT EXISTS CronManualSubmissions (
      trigger_id TEXT PRIMARY KEY REFERENCES CronTriggers(id) ON DELETE CASCADE,
      token TEXT NOT NULL, snapshot TEXT NOT NULL) WITHOUT ROWID`,
        {
            table: 'CronShellBindings',
            attributes: {
                receipt: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
                trigger_id: {
                    type: sequelize_1.DataTypes.TEXT,
                    allowNull: false,
                    references: { model: 'CronTriggers', key: 'id' },
                    onDelete: 'CASCADE',
                },
            },
        },
        'CREATE INDEX IF NOT EXISTS cron_shell_binding_trigger ON CronShellBindings(trigger_id)',
        `CREATE TABLE IF NOT EXISTS CronExitObservations (
      trigger_id TEXT NOT NULL REFERENCES CronTriggers(id) ON DELETE CASCADE,
      outcome TEXT NOT NULL, finished_at INTEGER NOT NULL,
      PRIMARY KEY(trigger_id,outcome,finished_at)) WITHOUT ROWID`,
        {
            table: 'CronLegacyExitBookings',
            attributes: {
                trigger_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
                cron_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                source: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                started_at: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                finished_at: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                outcome: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                day: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                stopped: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                stat_id: {
                    type: sequelize_1.DataTypes.INTEGER,
                    references: { model: 'CrontabStats', key: 'id' },
                    onDelete: 'SET NULL',
                },
                disputed: {
                    type: sequelize_1.DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
            },
        },
        `CREATE TABLE IF NOT EXISTS CronPrunedUnknownRuns (
      trigger_id TEXT PRIMARY KEY, cron_id INTEGER NOT NULL REFERENCES Crontabs(id) ON DELETE CASCADE,
      source TEXT NOT NULL, started_at INTEGER NOT NULL, last_possible_day TEXT NOT NULL) WITHOUT ROWID`,
        'CREATE INDEX IF NOT EXISTS cron_pruned_unknown_day ON CronPrunedUnknownRuns(last_possible_day)',
        {
            table: 'CronSystemPlans',
            attributes: {
                id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
                staged: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                confirmed: { type: sequelize_1.DataTypes.INTEGER },
                zone: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                rules: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
            },
        },
        conflictTable,
        `CREATE TABLE IF NOT EXISTS CronUnmatchedBoundExits (
      trigger_id TEXT PRIMARY KEY, outcome TEXT NOT NULL, finished_at INTEGER NOT NULL) WITHOUT ROWID`,
        'CREATE INDEX IF NOT EXISTS cron_legacy_booking_stat ON CronLegacyExitBookings(stat_id) WHERE stat_id IS NOT NULL',
        'CREATE TABLE IF NOT EXISTS CronStatRetention (id INTEGER PRIMARY KEY CHECK(id=1), first_day TEXT NOT NULL)',
        'CREATE TABLE IF NOT EXISTS CronHistoryRetention (id INTEGER PRIMARY KEY CHECK(id=1), cutoff INTEGER NOT NULL)',
        {
            table: 'CronStopBatches',
            attributes: {
                request_id: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
                cron_ids: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
                snapshot: { type: sequelize_1.DataTypes.TEXT },
            },
        },
        'CREATE INDEX IF NOT EXISTS cron_stop_batch_pending ON CronStopBatches(request_id) WHERE snapshot IS NOT NULL',
        {
            table: 'CronStopRequests',
            attributes: {
                instance_id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true },
                cron_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                pid: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
                targets: { type: sequelize_1.DataTypes.TEXT },
                signalled: {
                    type: sequelize_1.DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
            },
        },
        'CREATE INDEX IF NOT EXISTS cron_trigger_recent ON CronTriggers(cron_id, observed_at DESC)',
        "CREATE INDEX IF NOT EXISTS cron_trigger_running_task ON CronTriggers(cron_id) WHERE state='running'",
        "CREATE INDEX IF NOT EXISTS cron_trigger_queued_task ON CronTriggers(cron_id) WHERE state='queued'",
        'CREATE INDEX IF NOT EXISTS cron_trigger_day ON CronTriggers(observed_at)',
        'CREATE INDEX IF NOT EXISTS cron_trigger_slot ON CronTriggers(scheduled_at) WHERE scheduled_at IS NOT NULL',
        'CREATE INDEX IF NOT EXISTS cron_trigger_active ON CronTriggers(source, state) WHERE finished_at IS NULL',
    ];
    for (const statement of statements) {
        if (typeof statement === 'string')
            await database.query(statement, { transaction });
        else
            await database
                .getQueryInterface()
                .createTable(statement.table, statement.attributes, { transaction });
    }
    // Sequelize 6 describeTable cannot inspect expression indexes (the indexed
    // column name is null). Keep PRAGMA introspection for upgrade compatibility.
    const planFields = await database.query('PRAGMA table_info(CronPlanRules)', { transaction, type: sequelize_1.QueryTypes.SELECT });
    for (const column of ['opened_by', 'closed_by']) {
        if (!planFields.some((field) => field.name === column))
            await database
                .getQueryInterface()
                .addColumn('CronPlanRules', column, { type: sequelize_1.DataTypes.TEXT }, { transaction });
    }
    const conflictFields = await database.query('PRAGMA table_info(CronBoundExitConflicts)', { transaction, type: sequelize_1.QueryTypes.SELECT });
    if (conflictFields.some((field) => field.name === 'other_outcome')) {
        await database
            .getQueryInterface()
            .renameTable('CronBoundExitConflicts', 'CronBoundExitConflictPairs', {
            transaction,
        });
        await database.query(conflictTable, { transaction });
        await database.query(`INSERT INTO CronBoundExitConflicts(trigger_id,outcome,finished_at)
      SELECT trigger_id,outcome,finished_at FROM CronBoundExitConflictPairs UNION
      SELECT trigger_id,other_outcome,other_finished_at FROM CronBoundExitConflictPairs`, { transaction });
        await database
            .getQueryInterface()
            .dropTable('CronBoundExitConflictPairs', { transaction });
    }
    const bookingFields = await database.query('PRAGMA table_info(CronLegacyExitBookings)', { transaction, type: sequelize_1.QueryTypes.SELECT });
    if (!bookingFields.some((field) => field.name === 'bound'))
        await database
            .getQueryInterface()
            .addColumn('CronLegacyExitBookings', 'bound', { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, { transaction });
    const batchFields = await database.query('PRAGMA table_info(CronStopBatches)', { transaction, type: sequelize_1.QueryTypes.SELECT });
    if (!batchFields.some((column) => column.name === 'status_code'))
        await database
            .getQueryInterface()
            .addColumn('CronStopBatches', 'status_code', { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 200 }, { transaction });
    const stopFields = await database.query('PRAGMA table_info(CronStopRequests)', { transaction, type: sequelize_1.QueryTypes.SELECT });
    if (!stopFields.some((column) => column.name === 'signalled_at'))
        await database
            .getQueryInterface()
            .addColumn('CronStopRequests', 'signalled_at', { type: sequelize_1.DataTypes.INTEGER }, { transaction });
    if (!stopFields.some((column) => column.name === 'root_identity'))
        await database
            .getQueryInterface()
            .addColumn('CronStopRequests', 'root_identity', { type: sequelize_1.DataTypes.TEXT }, { transaction });
    if (!stopFields.some((column) => column.name === 'namespace_owner'))
        await database
            .getQueryInterface()
            .addColumn('CronStopRequests', 'namespace_owner', { type: sequelize_1.DataTypes.TEXT }, { transaction });
    const fields = await database.query('PRAGMA table_info(CronTriggers)', { transaction, type: sequelize_1.QueryTypes.SELECT });
    for (const [column, type] of [
        ['queue_live_context', 'TEXT'],
        ['dequeued_at', 'INTEGER'],
        ['system_dispatch_at', 'INTEGER'],
        ['queue_context', 'TEXT'],
        ['system_rule', 'TEXT'],
        ['command_started_at', 'INTEGER'],
        ['instance_id', 'INTEGER'],
        ['script_started_at', 'INTEGER'],
        ['stop_requested', 'INTEGER'],
        ['resume_pending', 'INTEGER'],
        ['process_identity', 'TEXT'],
        ['command_identity', 'TEXT'],
        ['stop_exit_at', 'INTEGER'],
        ['stop_exit_verified', 'INTEGER'],
        ['exit_pending', 'INTEGER'],
    ]) {
        if (!fields.some((field) => field.name === column))
            await database
                .getQueryInterface()
                .addColumn('CronTriggers', column, { type: type === 'TEXT' ? sequelize_1.DataTypes.TEXT : sequelize_1.DataTypes.INTEGER }, { transaction });
    }
    await database.query(`CREATE TRIGGER IF NOT EXISTS cron_exit_observations_settled AFTER UPDATE OF counted ON CronTriggers
    WHEN OLD.exit_pending=1 AND OLD.counted=0 AND NEW.counted=1 BEGIN
      DELETE FROM CronExitObservations WHERE trigger_id=NEW.id;
    END`, { transaction });
    await database.query("CREATE INDEX IF NOT EXISTS cron_system_dispatch ON CronTriggers(COALESCE(system_dispatch_at,observed_at)) WHERE source='system'", { transaction });
    await database.query('CREATE INDEX IF NOT EXISTS cron_trigger_pending_exit ON CronTriggers(id) WHERE exit_pending=1', { transaction });
    await database.query('CREATE UNIQUE INDEX IF NOT EXISTS cron_trigger_instance ON CronTriggers(instance_id) WHERE instance_id IS NOT NULL', { transaction });
}
exports.installTriggerHistory = installTriggerHistory;
//# sourceMappingURL=schema.js.map