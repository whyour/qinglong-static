"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerHistory = exports.TriggerHistory = exports.installTriggerHistory = exports.systemOwner = exports.slotId = void 0;
const legacyClient_1 = require("./compatibility/legacyClient");
var identity_1 = require("./identity");
Object.defineProperty(exports, "slotId", { enumerable: true, get: function () { return identity_1.slotId; } });
var cronProcess_1 = require("./execution/cronProcess");
Object.defineProperty(exports, "systemOwner", { enumerable: true, get: function () { return cronProcess_1.systemOwner; } });
const sequelize_1 = require("sequelize");
const triggerLifecycle_1 = require("./execution/triggerLifecycle");
const triggerSettlement_1 = require("./settlement/triggerSettlement");
const triggerQueries_1 = require("./queries/triggerQueries");
var schema_1 = require("./schema");
Object.defineProperty(exports, "installTriggerHistory", { enumerable: true, get: function () { return schema_1.installTriggerHistory; } });
class TriggerHistory {
    constructor(database) {
        this.database = database;
        // Compatibility callers share the same lifecycle and settlement transaction paths.
        this.settlement = new triggerSettlement_1.TriggerSettlement(this.database, {
            finish: (...args) => this.finish(...args),
            shouldStop: (id, transaction) => this.shouldStop(id, transaction),
        });
        this.lifecycle = new triggerLifecycle_1.TriggerLifecycle(this.database, {
            exitBeforeStop: (id) => this.exitBeforeStop(id),
            completeCommandExit: (...args) => this.completeCommandExit(...args),
            recoverScriptSample: (id, transaction) => this.recoverScriptSample(id, transaction),
            replayPublishedExits: (transaction) => this.replayPublishedExits(transaction),
        });
        this.clients = new legacyClient_1.LegacyClientAdapter(this.database, this.lifecycle, this.settlement);
    }
    // No command or instance exists before the scheduler claims the trigger.
    // A cancelled or already claimed row must keep the outcome recorded by its owner.
    async skipQueued(id, reason, finishedAt) {
        return this.lifecycle.skipQueued(id, reason, finishedAt);
    }
    async enqueue(id, cronId, source, scheduledAt, now = Date.now(), transaction) {
        return this.lifecycle.enqueue(id, cronId, source, scheduledAt, now, transaction);
    }
    // Serialize admission with the receipt so simultaneous timers and recovered
    // workers agree on which scheduled run owns the slot. Edits invalidate old waits.
    async enqueueUnlessPending(id, cronId, source, scheduledAt, now, revision = 0) {
        return this.lifecycle.enqueueUnlessPending(id, cronId, source, scheduledAt, now, revision);
    }
    async start(id, now = Date.now(), multiple = false, transaction) {
        return this.lifecycle.start(id, now, multiple, transaction);
    }
    async claimManual(id, snapshot, token, independent) {
        return this.lifecycle.claimManual(id, snapshot, token, independent);
    }
    async finish(id, state, reason = null, code = null, transaction, finishedAt) {
        return this.lifecycle.finish(id, state, reason, code, transaction, finishedAt);
    }
    // A child close is an independent receipt when either Shell callback is lost.
    async complete(id, state, reason, code, finishedAt, report) {
        return this.settlement.complete(id, state, reason, code, finishedAt, report);
    }
    async completeCommandExit(id, state, reason, code, transaction, receipt, finishedAt, report, recoveredCopies) {
        return this.settlement.completeCommandExit(id, state, reason, code, transaction, receipt, finishedAt, report, recoveredCopies);
    }
    async retryPendingExits() {
        return this.settlement.retryPendingExits();
    }
    async replayPublishedExits(transaction) {
        return this.settlement.replayPublishedExits(transaction);
    }
    // Old shell-only executions publish status and statistics independently.
    // Either final receipt can settle that execution if the other was lost.
    async recordShellResult(id, cronId, code, elapsedMs, now, finishedAt) {
        return this.clients.recordShellResult(id, cronId, code, elapsedMs, now, finishedAt);
    }
    async recoverScriptSample(id, transaction) {
        return this.settlement.recoverScriptSample(id, transaction);
    }
    async isRunning(cronId, transaction) {
        return this.lifecycle.isRunning(cronId, transaction);
    }
    async shellReport(id, cronId, system, running, log, seconds, exitCode, stopped = false, transaction, elapsedMs, finishedAt) {
        return this.clients.shellReport(id, cronId, system, running, log, seconds, exitCode, stopped, transaction, elapsedMs, finishedAt);
    }
    async reportLegacy(cronId, running, pid, log, seconds, elapsed, code) {
        return this.clients.reportLegacy(cronId, running, pid, log, seconds, elapsed, code);
    }
    // Link the Shell instance and its trigger in the same IMMEDIATE write transaction.
    async reportInstance(id, cronId, running, pid, log, seconds, elapsed, code, stopped = false, finishedAt) {
        return this.clients.reportInstance(id, cronId, running, pid, log, seconds, elapsed, code, stopped, finishedAt);
    }
    async cancelQueued(ids) {
        return this.lifecycle.cancelQueued(ids);
    }
    async cancelQueuedInTransaction(ids, transaction) {
        return this.lifecycle.cancelQueuedInTransaction(ids, transaction);
    }
    async queueInstanceStop(instanceId, cronId, pid, transaction, identity) {
        return this.lifecycle.queueInstanceStop(instanceId, cronId, pid, transaction, identity);
    }
    async pendingStop(instanceId, transaction) {
        return this.lifecycle.pendingStop(instanceId, transaction);
    }
    async pendingStopBatches() {
        return this.lifecycle.pendingStopBatches();
    }
    async pendingStops() {
        return this.lifecycle.pendingStops();
    }
    async forgetStop(instanceId, onEnded) {
        return this.lifecycle.forgetStop(instanceId, onEnded);
    }
    async shouldStop(id, transaction) {
        return this.lifecycle.shouldStop(id, transaction);
    }
    // The outer command can outlive any of its task wrappers.
    async recordCommandStart(id, at) {
        return this.lifecycle.recordCommandStart(id, at);
    }
    async bindCommand(id, pid, log) {
        return this.lifecycle.bindCommand(id, pid, log);
    }
    async activeCommands(ids, transaction) {
        return this.lifecycle.activeCommands(ids, transaction);
    }
    async instanceIdentity(instanceId) {
        return this.lifecycle.instanceIdentity(instanceId);
    }
    async requestInstanceStop(instanceId, pid, signalTree, targets) {
        return this.lifecycle.requestInstanceStop(instanceId, pid, signalTree, targets);
    }
    async exitBeforeStop(id) {
        return this.settlement.exitBeforeStop(id);
    }
    async instanceStopRequested(instanceId, transaction) {
        return this.lifecycle.instanceStopRequested(instanceId, transaction);
    }
    async stopVerifiedInstance(instanceId, settleLegacy) {
        return this.lifecycle.stopVerifiedInstance(instanceId, settleLegacy);
    }
    async queueCounts() {
        return this.lifecycle.queueCounts();
    }
    async startSystem(id, cronId, owner, commandIdentity = owner, wrapper) {
        return this.lifecycle.startSystem(id, cronId, owner, commandIdentity, wrapper);
    }
    async recoverSystemOwners(cronId, transaction, instanceId) {
        return this.lifecycle.recoverSystemOwners(cronId, transaction, instanceId);
    }
    async interrupt(owner) {
        return this.lifecycle.interrupt(owner);
    }
    async reconcileInstances() {
        return this.clients.reconcileInstances();
    }
    async countExpired(cutoff) {
        const [row] = await this.database.query(`SELECT COUNT(*) AS count FROM CronTriggers WHERE ${TriggerHistory.expired}`, { bind: { cutoff }, type: sequelize_1.QueryTypes.SELECT });
        return row.count;
    }
    async deleteExpired(cutoff, transaction) {
        // Once both histories have expired, old packets must not recreate their rows.
        await this.database.query(`INSERT INTO CronHistoryRetention(id,cutoff) VALUES (1,$cutoff)
      ON CONFLICT(id) DO UPDATE SET cutoff=MAX(cutoff,excluded.cutoff)`, { transaction, bind: { cutoff } });
        // The visible histories can expire before statistics. Keep just enough to
        // credit a verified receipt to its task without recreating either history.
        await this.database.query(`INSERT OR IGNORE INTO CronPrunedUnknownRuns(trigger_id,cron_id,source,started_at,last_possible_day)
      SELECT id,cron_id,source,started_at,date(finished_at/1000,'unixepoch','localtime') FROM CronTriggers
      WHERE ${TriggerHistory.expired} AND state='unknown' AND reason='restart' AND counted=0 AND owner IS NOT NULL
        AND started_at IS NOT NULL AND EXISTS (SELECT 1 FROM Crontabs WHERE id=CronTriggers.cron_id)
        AND NOT EXISTS (SELECT 1 FROM CronLegacyExitBookings WHERE trigger_id=CronTriggers.id)
        AND NOT EXISTS (SELECT 1 FROM CronStatRetention WHERE first_day>date(finished_at/1000,'unixepoch','localtime'))`, { bind: { cutoff }, transaction });
        return this.database.query(`DELETE FROM CronTriggers WHERE ${TriggerHistory.expired}`, { bind: { cutoff }, transaction, type: sequelize_1.QueryTypes.BULKDELETE });
    }
    // Compatibility entry points for existing scheduler, API and extension callers.
    async visibleTriggers(cronId, ids) {
        return new triggerQueries_1.TriggerQueries(this.database).visibleTriggers(cronId, ids);
    }
    async recent(cronId, offset, limit = 25, before) {
        return new triggerQueries_1.TriggerQueries(this.database).recent(cronId, offset, limit, before);
    }
    async metrics(since) {
        return new triggerQueries_1.TriggerQueries(this.database).metrics(since);
    }
}
exports.TriggerHistory = TriggerHistory;
TriggerHistory.expired = `state NOT IN ('queued','running') AND exit_pending IS NOT 1 AND finished_at IS NOT NULL AND observed_at < $cutoff AND finished_at < $cutoff
     AND NOT EXISTS (SELECT 1 FROM RunningInstances i WHERE i.id=CronTriggers.instance_id AND i.status=0)`;
function triggerHistory() {
    return new TriggerHistory(require('../data/index').sequelize);
}
exports.triggerHistory = triggerHistory;
//# sourceMappingURL=history.js.map