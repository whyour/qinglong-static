"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerSettlement = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const fs_1 = require("fs");
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const executionModels_1 = require("../../data/executionModels");
const cronStatistics_1 = require("./cronStatistics");
const exitReceipt_cjs_1 = require("./exitReceipt.cjs");
function observationKey(id, exit) {
    var _a;
    return { id, outcome: (_a = exit.signal) !== null && _a !== void 0 ? _a : String(exit.code), time: exit.time };
}
function isBoundPublication(file) {
    return (/^\.(pending|published)\./.test((0, path_1.basename)(file)) && !(0, exitReceipt_cjs_1.isLegacyCapture)(file));
}
// High-frequency receipt/instance updates use bound SQL to avoid model query
// construction while the writer is held. Infrequent recovery reads stay ORM.
// Receipt verification, disputes and statistics are one transactional unit.
// Durable evidence is retired only after the committed outcome is checked again.
class TriggerSettlement {
    constructor(database, lifecycle) {
        this.database = database;
        this.lifecycle = lifecycle;
    }
    // A child close is an independent receipt when either Shell callback is lost.
    async complete(id, state, reason, code, finishedAt, report) {
        const sample = await this.readScriptSample(id);
        await this.database.transaction(async (transaction) => {
            await this.saveScriptSample(id, sample, transaction);
            await this.completeCommandExit(id, state, reason, code, transaction, undefined, finishedAt, report);
        });
        if (sample)
            await fs_1.promises.unlink(sample.marker).catch(() => { });
    }
    async completeCommandExit(id, state, reason, code, transaction, receipt, finishedAt, report, recoveredCopies) {
        var _a, _b;
        const file = (0, exitReceipt_cjs_1.receiptPath)(id);
        let pending = file ? await this.pendingExit(id, transaction) : undefined;
        const [saved] = file
            ? await this.database.query(`SELECT b.*,u.outcome AS unmatched_outcome,u.finished_at AS unmatched_time,EXISTS(SELECT 1 FROM CronBoundExitConflicts WHERE trigger_id=$id) AS conflicted
       FROM (SELECT 1) LEFT JOIN CronLegacyExitBookings b ON b.trigger_id=$id LEFT JOIN CronUnmatchedBoundExits u ON u.trigger_id=$id`, { bind: { id }, transaction, type: sequelize_1.QueryTypes.SELECT })
            : [];
        const booking = (saved === null || saved === void 0 ? void 0 : saved.trigger_id) ? saved : undefined;
        // Every version-1 publication has the same evidentiary weight, regardless of its path.
        const recovered = recoveredCopies !== null && recoveredCopies !== void 0 ? recoveredCopies : (file
            ? await Promise.all((await (0, exitReceipt_cjs_1.retiringExits)())
                .filter((copy) => copy.id === id)
                .map((copy) => (0, exitReceipt_cjs_1.readExit)(id, copy.file)))
            : []);
        const published = receipt === undefined && file ? await (0, exitReceipt_cjs_1.readExit)(id) : receipt;
        const files = [published, ...recovered];
        const candidates = [
            ...files,
            ...files.map((copy) => copy === null || copy === void 0 ? void 0 : copy.namedExit),
            report === 'legacy' ? undefined : report,
        ].filter((value) => (value === null || value === void 0 ? void 0 : value.version) === 1);
        const bound = file && candidates[0] ? Object.assign(Object.assign({}, candidates[0]), { file }) : undefined;
        const tuples = candidates.map((value) => observationKey(id, value));
        if (booking === null || booking === void 0 ? void 0 : booking.bound)
            tuples.push({ id, outcome: booking.outcome, time: booking.finished_at });
        if ((saved === null || saved === void 0 ? void 0 : saved.unmatched_time) != null && saved.unmatched_outcome != null) {
            tuples.push({
                id,
                outcome: saved.unmatched_outcome,
                time: saved.unmatched_time,
            });
        }
        const first = tuples[0];
        if ((saved === null || saved === void 0 ? void 0 : saved.conflicted) ||
            tuples.some((tuple) => tuple.time !== first.time || tuple.outcome !== first.outcome)) {
            await this.disputeBoundExit(id, tuples, transaction);
            if (saved.unmatched_time != null)
                await this.database.query('DELETE FROM CronUnmatchedBoundExits WHERE trigger_id=$id', { bind: { id }, transaction });
            this.retireDuplicatePublications(id, recovered, transaction);
            if (!(saved === null || saved === void 0 ? void 0 : saved.conflicted)) {
                if (booking) {
                    await this.withdrawBooking(booking, transaction);
                    await this.database.query('DELETE FROM CronLegacyExitBookings WHERE trigger_id=$id', { bind: { id }, transaction });
                }
                if (await this.invalidateBookedTrigger(id, transaction))
                    await this.deferExit(id, transaction);
            }
            else if ((pending === null || pending === void 0 ? void 0 : pending.state) === 'running')
                await this.deferExit(id, transaction);
            return;
        }
        for (const copy of recovered) {
            if ((copy === null || copy === void 0 ? void 0 : copy.version) === 1)
                this.retireReceiptAfterCommit(id, copy.file, transaction, 'bound-copy', copy);
        }
        if (bound && !pending && saved.unmatched_time == null) {
            // After history pruning the booking can disappear with its daily row.
            // Before releasing a verified replay, retain just its tuple so a later
            // conflicting file can still be recognized without recreating that day.
            await this.database.query(`INSERT OR IGNORE INTO CronUnmatchedBoundExits(trigger_id,outcome,finished_at)
        SELECT $id,$outcome,$time WHERE NOT EXISTS (SELECT 1 FROM CronTriggers WHERE id=$id)`, { bind: observationKey(id, bound), transaction });
        }
        const start = (_a = booking === null || booking === void 0 ? void 0 : booking.started_at) !== null && _a !== void 0 ? _a : ((pending === null || pending === void 0 ? void 0 : pending.owner) ? pending.started_at : null);
        const observation = start != null &&
            finishedAt !== undefined &&
            finishedAt >= start &&
            (0, exitReceipt_cjs_1.validExit)(code, reason, finishedAt) &&
            state === (code === 0 ? 'finished' : 'failed')
            ? { code, signal: reason, time: finishedAt }
            : undefined;
        if (booking &&
            !booking.bound &&
            (bound ||
                (observation &&
                    (booking.outcome !== observationKey(id, observation).outcome ||
                        booking.finished_at !== observation.time)))) {
            const retained = await this.reviseLegacyBooking(booking, bound, transaction);
            if (!retained || !bound) {
                if (retained)
                    await this.deferExit(id, transaction, observation);
                else if (file)
                    this.retireReceiptAfterCommit(id, file, transaction, 'exit', published);
                return;
            }
            pending = await this.pendingExit(id, transaction);
        }
        if (file && !pending) {
            if (bound && !booking) {
                const [pruned] = await this.database.query('SELECT trigger_id,cron_id,source,started_at FROM CronPrunedUnknownRuns WHERE trigger_id=$id', { bind: { id }, transaction, type: sequelize_1.QueryTypes.SELECT });
                if (pruned) {
                    await this.bookPrunedExit(pruned, false, bound, transaction);
                    await this.database.query('DELETE FROM CronPrunedUnknownRuns WHERE trigger_id=$id', { bind: { id }, transaction });
                }
            }
            await this.settleInstance(id, transaction);
            this.retireReceiptAfterCommit(id, file, transaction, 'exit', published);
            return;
        }
        if ((pending === null || pending === void 0 ? void 0 : pending.finished_at) != null &&
            ['finished', 'failed', 'stopped'].includes(pending.state)) {
            // An earlier panel may have committed the trigger before claiming its statistic.
            await this.completeInTransaction(id, pending.state, pending.reason, pending.exit_code, transaction, undefined, pending.finished_at);
            if (file)
                this.retireReceiptAfterCommit(id, file, transaction, 'exit', published);
            return;
        }
        if ((pending === null || pending === void 0 ? void 0 : pending.stop_exit_verified) && pending.stop_exit_at != null) {
            // The outcome was verified before the last worker finished checking the process tree.
            await this.completeInTransaction(id, 'stopped', 'cancelled', pending.exit_code, transaction, undefined, pending.stop_exit_at);
            this.retireReceiptAfterCommit(id, file, transaction, 'exit');
            return;
        }
        // A truncated publication is different from no publication. In particular
        // a killed supervisor cannot attest to the script's own exit status.
        const unreadable = recovered.some((copy) => copy === null ||
            (copy && copy.version !== 1 && isBoundPublication(copy.file)));
        const exit = (_b = bound !== null && bound !== void 0 ? bound : published) !== null && _b !== void 0 ? _b : (unreadable ? null : published);
        if (exit && exit.version !== 1 && !(booking === null || booking === void 0 ? void 0 : booking.bound)) {
            if (observation)
                await this.saveExitObservation(id, observation, transaction);
            if ((pending === null || pending === void 0 ? void 0 : pending.started_at) == null ||
                exit.time < pending.started_at ||
                !(await this.hasExitObservation(id, exit, transaction))) {
                await this.deferExit(id, transaction);
                return;
            }
        }
        if (exit && (pending === null || pending === void 0 ? void 0 : pending.started_at) != null && !(booking === null || booking === void 0 ? void 0 : booking.bound)) {
            // Track the exact contribution until its history and retained statistic expire.
            await this.database.query(`INSERT OR IGNORE INTO CronLegacyExitBookings(trigger_id,cron_id,source,started_at,finished_at,outcome,day,bound)
        SELECT id,cron_id,source,started_at,$time,$outcome,$day,$bound FROM CronTriggers WHERE id=$id`, {
                bind: Object.assign(Object.assign({}, observationKey(id, exit)), { bound: Number(exit.version === 1), day: (0, dayjs_1.default)(exit.time).format('YYYY-MM-DD') }),
                transaction,
            });
            await this.database.query('DELETE FROM CronExitObservations WHERE trigger_id=$id', { bind: { id }, transaction });
            if (bound && (saved === null || saved === void 0 ? void 0 : saved.unmatched_time) != null)
                await this.database.query('DELETE FROM CronUnmatchedBoundExits WHERE trigger_id=$id', { bind: { id }, transaction });
        }
        // A signal on the bound supervisor before its first write says nothing about
        // the command it was waiting for. A verified stop has its own durable claim.
        const supervisorKilled = (pending === null || pending === void 0 ? void 0 : pending.command_identity) &&
            !pending.stop_requested &&
            code === null &&
            state === 'stopped' &&
            (reason === null || reason === void 0 ? void 0 : reason.startsWith('SIG'));
        if (pending &&
            pending.owner &&
            pending.started_at !== null &&
            (exit === null ||
                (!exit &&
                    (pending.exit_pending || supervisorKilled || report === 'legacy')))) {
            await this.deferExit(id, transaction, observation);
            return;
        }
        if (exit) {
            await this.completeInTransaction(id, exit.signal || exit.code !== 0 ? 'failed' : 'finished', exit.signal, exit.code, transaction, undefined, exit.time, true);
            this.retireReceiptAfterCommit(id, exit.file, transaction, 'exit');
        }
        else if (state === 'skipped') {
            await this.lifecycle.finish(id, state, reason, code, transaction);
            await this.settleInstance(id, transaction);
        }
        else {
            await this.completeInTransaction(id, state, reason, code, transaction, undefined, finishedAt);
        }
    }
    async withdrawBooking(booking, transaction) {
        const { trigger_id: id, stat_id: stat } = booking;
        const elapsed = Math.max(0, booking.finished_at - booking.started_at);
        if (stat !== null) {
            // Only the row that received this exact contribution can be debited. A deleted day stays deleted.
            await this.database.query(`UPDATE CrontabStats SET run_count=run_count-1, success_count=success_count-$success,
        fail_count=fail_count-$failure,total_time=total_time-$elapsed,updatedAt=CURRENT_TIMESTAMP,
        max_time=MAX(COALESCE(fixed_max_time,0),COALESCE((SELECT MAX(MAX(0,finished_at-started_at))
          FROM CronLegacyExitBookings WHERE stat_id=$stat AND trigger_id<>$id),0)) WHERE id=$stat`, {
                bind: {
                    stat,
                    id,
                    elapsed,
                    success: Number(!booking.stopped && booking.outcome === '0'),
                    failure: Number(!booking.stopped && booking.outcome !== '0'),
                },
                transaction,
            });
            await (0, executionModels_1.executionModel)(this.database, 'CrontabStats').destroy({
                where: { id: stat, run_count: 0 },
                transaction,
                hooks: false,
            });
        }
    }
    async invalidateBookedTrigger(id, transaction) {
        const [trigger] = await (0, executionModels_1.executionModel)(this.database, 'CronTriggers').findAll({
            attributes: ['instance_id', 'state', 'cron_id'],
            where: { id, started_at: { [sequelize_1.Op.not]: null } },
            transaction,
            raw: true,
        });
        if (!trigger)
            return false;
        const ref = trigger.cron_id;
        await this.database.query(`UPDATE CronTriggers SET counted=0,exit_pending=1,stop_exit_verified=NULL,stop_exit_at=NULL,
      exit_code=NULL,reason=NULL,state=CASE WHEN state='running' THEN state ELSE 'unknown' END WHERE id=$id`, { bind: { id }, transaction });
        if (trigger.instance_id !== null && trigger.state !== 'running') {
            await (0, executionModels_1.executionModel)(this.database, 'RunningInstances').update({ status: 4, exit_code: null, updatedAt: (0, sequelize_1.literal)('CURRENT_TIMESTAMP') }, {
                where: { id: trigger.instance_id, cron_id: ref },
                transaction,
                silent: true,
                hooks: false,
                validate: false,
            });
            await (0, executionModels_1.executionModel)(this.database, 'Crontabs').update({ last_running_time: null }, {
                where: { id: ref, last_instance_id: trigger.instance_id },
                transaction,
                silent: true,
                hooks: false,
                validate: false,
            });
        }
        return true;
    }
    async disputeBoundExit(id, tuples, transaction) {
        if (!tuples.length)
            return;
        await (0, executionModels_1.executionModel)(this.database, 'CronBoundExitConflicts').bulkCreate(tuples.map((tuple) => ({
            trigger_id: id,
            outcome: tuple.outcome,
            finished_at: tuple.time,
        })), { transaction, ignoreDuplicates: true, hooks: false });
    }
    async bookPrunedExit(run, stopped, exit, transaction) {
        const day = (0, dayjs_1.default)(exit.time).format('YYYY-MM-DD');
        const state = stopped ? 'stopped' : exit.code === 0 ? 'finished' : 'failed';
        await (0, cronStatistics_1.addDailyExit)(this.database, run.cron_id, day, state, Math.max(0, exit.time - run.started_at), true, transaction);
        await this.database.query(`INSERT INTO CronLegacyExitBookings(trigger_id,cron_id,source,started_at,finished_at,outcome,day,stopped,bound,stat_id)
      VALUES($id,$ref,$source,$start,$time,$outcome,$day,$stopped,1,
        (SELECT id FROM CrontabStats WHERE ref_id=$ref AND date=$day
         AND NOT EXISTS (SELECT 1 FROM CronStatRetention WHERE id=1 AND first_day>$day)))
      ON CONFLICT(trigger_id) DO UPDATE SET bound=1,disputed=0,outcome=excluded.outcome,finished_at=excluded.finished_at,
        day=excluded.day,stat_id=excluded.stat_id`, {
            bind: Object.assign(Object.assign({}, observationKey(run.trigger_id, exit)), { ref: run.cron_id, source: run.source, start: run.started_at, day, stopped: Number(stopped) }),
            transaction,
        });
    }
    async reviseLegacyBooking(booking, bound, transaction) {
        const id = booking.trigger_id;
        await this.withdrawBooking(booking, transaction);
        const retained = await this.invalidateBookedTrigger(id, transaction);
        if (!retained) {
            if (!bound) {
                await (0, executionModels_1.executionModel)(this.database, 'CronLegacyExitBookings').update({ disputed: 1, stat_id: null }, {
                    where: { trigger_id: id },
                    transaction,
                    silent: true,
                    hooks: false,
                    validate: false,
                });
            }
            else {
                await this.bookPrunedExit(booking, Boolean(booking.stopped), bound, transaction);
            }
            return false;
        }
        await (0, executionModels_1.executionModel)(this.database, 'CronLegacyExitBookings').destroy({
            where: { trigger_id: id },
            transaction,
            hooks: false,
        });
        if (!bound)
            await (0, executionModels_1.executionModel)(this.database, 'CronExitObservations').bulkCreate([
                {
                    trigger_id: id,
                    outcome: booking.outcome,
                    finished_at: booking.finished_at,
                },
            ], { transaction, ignoreDuplicates: true, hooks: false });
        return true;
    }
    retireDuplicatePublications(id, copies, transaction) {
        // Independent scans must agree about which file to keep even if they see
        // different subsets. Only newer per-writer publications can be discarded.
        const witnesses = new Map();
        const redundant = [];
        // Prefer a JSON copy readable by older panels. Compare full paths within
        // each format so concurrent collectors always choose the same survivor.
        const rank = (file) => ((0, exitReceipt_cjs_1.isMetadataReceipt)(file) ? '1' : '0') + file;
        for (const copy of copies) {
            if ((copy === null || copy === void 0 ? void 0 : copy.version) !== 1 ||
                copy.namedExit ||
                !(0, path_1.basename)(copy.file).startsWith('.pending.'))
                continue;
            const { outcome, time } = observationKey(id, copy);
            const key = JSON.stringify([outcome, time]);
            const previous = witnesses.get(key);
            if (previous && previous !== copy.file) {
                redundant.push({
                    file: rank(previous) < rank(copy.file) ? copy.file : previous,
                    key,
                    outcome,
                    time,
                });
            }
            if (!previous || rank(copy.file) < rank(previous))
                witnesses.set(key, copy.file);
        }
        if (!redundant.length)
            return;
        transaction.afterCommit(async () => {
            // Sequelize also invokes this hook after a failed COMMIT. Verify the
            // specific tuple in a separate snapshot, including on an existing dispute.
            try {
                const rows = await (0, executionModels_1.executionModel)(this.database, 'CronBoundExitConflicts').findAll({
                    attributes: ['outcome', 'finished_at'],
                    where: { trigger_id: id },
                    transaction: null,
                    raw: true,
                });
                const committed = new Set(rows.map((row) => JSON.stringify([row.outcome, row.finished_at])));
                for (const copy of redundant) {
                    if (!committed.has(copy.key))
                        continue;
                    const keeper = await (0, exitReceipt_cjs_1.readExit)(id, witnesses.get(copy.key));
                    if ((keeper === null || keeper === void 0 ? void 0 : keeper.version) === 1 &&
                        keeper.time === copy.time &&
                        observationKey(id, keeper).outcome === copy.outcome) {
                        await (0, exitReceipt_cjs_1.retireLegacyFile)(id, copy.file, copy).catch(() => { });
                    }
                }
            }
            catch (_a) {
                /* Retry on the next recovery pass. */
            }
        });
    }
    retireReceiptAfterCommit(id, file, transaction, kind, observed) {
        // Sequelize 6 runs afterCommit even when COMMIT itself failed. Check a
        // separate committed snapshot before deleting the only durable outcome.
        transaction.afterCommit(async () => {
            try {
                const pendingCondition = kind === 'start' ? 'script_started_at IS NULL' : 'counted=0';
                const [saved] = await this.database.query(`SELECT EXISTS(SELECT 1 FROM CronTriggers WHERE id=$id AND ${pendingCondition}) AS pending,
             EXISTS(SELECT 1 FROM CronBoundExitConflicts WHERE trigger_id=$id) AS conflicted,
             (b.trigger_id IS NULL AND u.trigger_id IS NOT NULL) AS unmatched,
             COALESCE(b.outcome,u.outcome) AS outcome,COALESCE(b.finished_at,u.finished_at) AS finished_at,
             COALESCE(b.bound,u.trigger_id IS NOT NULL) AS bound FROM (SELECT 1)
             LEFT JOIN CronLegacyExitBookings b ON b.trigger_id=$id LEFT JOIN CronUnmatchedBoundExits u ON u.trigger_id=$id`, { bind: { id }, transaction: null, type: sequelize_1.QueryTypes.SELECT });
                if (saved.pending || (kind !== 'start' && saved.conflicted))
                    return;
                if (saved.outcome !== null &&
                    saved.finished_at !== null &&
                    kind !== 'start') {
                    if (saved.unmatched) {
                        // A legacy public name may be unreadable until claimed. Verify the
                        // moved bytes directly against the durable unmatched observation.
                        await (0, exitReceipt_cjs_1.retireLegacyFile)(id, file, {
                            outcome: saved.outcome,
                            time: saved.finished_at,
                        });
                        return;
                    }
                    // After a failed correction the old booking is still visible.
                    if (kind === 'bound-copy' && !saved.bound)
                        return;
                    const current = await (0, exitReceipt_cjs_1.readExit)(id, file);
                    if (current &&
                        ((saved.bound && current.version !== 1) ||
                            (current.time === saved.finished_at &&
                                observationKey(id, current).outcome === saved.outcome &&
                                (saved.bound || current.version !== 1)))) {
                        await (0, exitReceipt_cjs_1.retireLegacyFile)(id, file, saved.bound
                            ? { outcome: saved.outcome, time: saved.finished_at }
                            : undefined);
                    }
                    return;
                }
                if (kind === 'start')
                    await fs_1.promises.rm(file, { force: true });
                else if ((observed === null || observed === void 0 ? void 0 : observed.version) !== 1)
                    await (0, exitReceipt_cjs_1.retireLegacyFile)(id, file);
            }
            catch (_a) {
                /* Keep the receipt for the next recovery pass. */
            }
        });
    }
    async replayRetiringExits(transaction) {
        var _a;
        const byId = new Map();
        const unreadable = new Set();
        for (const { id, file } of await (0, exitReceipt_cjs_1.retiringExits)()) {
            const exit = await (0, exitReceipt_cjs_1.readExit)(id, file);
            if (exit === undefined)
                continue;
            if (exit === null || (exit.version !== 1 && isBoundPublication(file))) {
                unreadable.add(id);
                continue;
            }
            if (exit.version !== 1) {
                // Inspect the atomically moved bytes even when a stale temporary file is being replaced.
                await (0, exitReceipt_cjs_1.retireLegacyFile)(id, file).catch(() => { });
                continue;
            }
            const copies = (_a = byId.get(id)) !== null && _a !== void 0 ? _a : [];
            copies.push(exit);
            byId.set(id, copies);
        }
        if (unreadable.size) {
            // Retention runs this scan before deletion. Keep unresolved history for
            // later repair without ending a live process solely on damaged bytes.
            await (0, executionModels_1.executionModel)(this.database, 'CronTriggers').update({ exit_pending: 1 }, {
                where: {
                    counted: 0,
                    state: 'unknown',
                    owner: { [sequelize_1.Op.not]: null },
                    started_at: { [sequelize_1.Op.not]: null },
                    id: { [sequelize_1.Op.in]: [...unreadable] },
                    [sequelize_1.Op.or]: [{ exit_pending: null }, { exit_pending: { [sequelize_1.Op.ne]: 1 } }],
                },
                transaction,
                hooks: false,
                validate: false,
            });
        }
        for (const [id, copies] of byId) {
            const settle = async (tx) => {
                await this.recoverScriptSample(id, tx);
                await this.completeCommandExit(id, 'unknown', null, null, tx, undefined, undefined, undefined, copies);
            };
            if (transaction)
                await settle(transaction);
            else
                await this.database.transaction(settle);
        }
        return byId;
    }
    async pendingExit(id, transaction) {
        const [row] = await this.database.query(`SELECT state,reason,exit_code,started_at,finished_at,owner,command_identity,stop_requested,stop_exit_verified,stop_exit_at,exit_pending
       FROM CronTriggers WHERE id=$id AND counted=0`, { bind: { id }, transaction, type: sequelize_1.QueryTypes.SELECT });
        return row;
    }
    async hasExitObservation(id, exit, transaction) {
        const [match] = await (0, executionModels_1.executionModel)(this.database, 'CronExitObservations').findAll({
            attributes: ['trigger_id'],
            where: { trigger_id: id },
            group: ['trigger_id'],
            having: {
                [sequelize_1.Op.and]: [
                    (0, sequelize_1.where)((0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('trigger_id')), 1),
                    (0, sequelize_1.where)((0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('outcome')), observationKey(id, exit).outcome),
                    (0, sequelize_1.where)((0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('finished_at')), observationKey(id, exit).time),
                ],
            },
            transaction,
            raw: true,
        });
        return Boolean(match);
    }
    async saveExitObservation(id, observation, transaction) {
        await this.database.query(`INSERT INTO CronExitObservations(trigger_id,outcome,finished_at)
      SELECT $id,$outcome,$time WHERE NOT EXISTS
        (SELECT 1 FROM CronExitObservations WHERE trigger_id=$id LIMIT 1 OFFSET 1)
      ON CONFLICT(trigger_id,outcome,finished_at) DO NOTHING`, { bind: observationKey(id, observation), transaction });
    }
    async deferExit(id, transaction, observation) {
        if (observation)
            await this.saveExitObservation(id, observation, transaction);
        await (0, executionModels_1.executionModel)(this.database, 'CronTriggers').update({ exit_pending: 1 }, {
            where: {
                id,
                [sequelize_1.Op.or]: [{ exit_pending: { [sequelize_1.Op.ne]: 1 } }, { exit_pending: null }],
            },
            transaction,
            silent: true,
            hooks: false,
            validate: false,
        });
        // A signalled stop remains running until all of its descendants are gone.
        await this.database.query(`UPDATE CronTriggers SET state='unknown',reason=NULL,exit_code=NULL,
      finished_at=COALESCE(finished_at,$now) WHERE id=$id AND state='running'
      AND NOT EXISTS (SELECT 1 FROM CronStopRequests s WHERE s.instance_id=CronTriggers.instance_id
        AND s.targets IS NOT NULL AND s.signalled=1)`, { bind: { id, now: Date.now() }, transaction });
        await this.settleInstance(id, transaction);
    }
    async retryPendingExits() {
        const rows = await this.database.query(`SELECT id FROM CronTriggers WHERE exit_pending=1 AND
        NOT EXISTS (SELECT 1 FROM CronBoundExitConflicts WHERE trigger_id=CronTriggers.id)`, { type: sequelize_1.QueryTypes.SELECT });
        for (const { id } of rows) {
            const exit = await (0, exitReceipt_cjs_1.readExit)(id);
            if (exit &&
                (exit.version === 1 || (await this.hasExitObservation(id, exit)))) {
                // Carry a verified bound receipt across a concurrent file replacement.
                // Unbound evidence must still match inside the writer transaction.
                await this.complete(id, 'unknown', null, null, undefined, exit.version === 1 ? exit : undefined);
            }
        }
        // A canonical-only file can reappear after startup already marked its owner
        // unknown. Probe IDs found on disk so missing receipts cost no per-run work.
        const recovered = await this.replayRetiringExits();
        const files = (await (0, exitReceipt_cjs_1.publishedExits)()).filter((id) => !recovered.has(id));
        if (files.length) {
            const candidates = await this.database.query(`SELECT value AS id FROM json_each($files) WHERE
          EXISTS (SELECT 1 FROM CronTriggers WHERE id=value AND state='unknown' AND reason='restart'
            AND counted=0 AND owner IS NOT NULL AND started_at IS NOT NULL) OR
          EXISTS (SELECT 1 FROM CronPrunedUnknownRuns WHERE trigger_id=value) OR
          EXISTS (SELECT 1 FROM CronLegacyExitBookings WHERE trigger_id=value) OR
          EXISTS (SELECT 1 FROM CronBoundExitConflicts WHERE trigger_id=value) OR
          EXISTS (SELECT 1 FROM CronUnmatchedBoundExits WHERE trigger_id=value)`, { bind: { files: JSON.stringify(files) }, type: sequelize_1.QueryTypes.SELECT });
            for (const { id } of candidates) {
                const exit = await (0, exitReceipt_cjs_1.readExit)(id);
                if ((exit === null || exit === void 0 ? void 0 : exit.version) === 1)
                    await this.complete(id, 'unknown', null, null, undefined, exit);
            }
        }
        await this.collectPublishedScriptStarts();
    }
    async collectPublishedScriptStarts() {
        const files = await (0, exitReceipt_cjs_1.publishedScriptStarts)();
        if (!files.length)
            return;
        // Only probe existing executions. Keep live markers in place so another
        // instrumented command in the same execution cannot replace the first sample.
        const rows = await (0, executionModels_1.executionModel)(this.database, 'CronTriggers').findAll({
            attributes: ['id', 'counted', 'script_started_at'],
            where: {
                id: { [sequelize_1.Op.in]: files.map(({ id }) => id) },
                started_at: { [sequelize_1.Op.not]: null },
                [sequelize_1.Op.or]: [{ script_started_at: null }, { counted: 1 }],
            },
            raw: true,
        });
        for (const row of rows) {
            const sample = await this.readScriptSample(row.id);
            if (!sample)
                continue;
            await this.database.transaction(async (transaction) => {
                if (row.script_started_at === null)
                    await this.saveScriptSample(row.id, sample, transaction);
                if (row.counted)
                    this.retireReceiptAfterCommit(row.id, sample.marker, transaction, 'start');
            });
        }
    }
    async replayPublishedExits(transaction) {
        const recovered = await this.replayRetiringExits(transaction);
        // Entry instrumentation can outlive its committed transaction even if the
        // exit file was already deleted. An unregistered entry may still be live.
        const exits = new Set(await (0, exitReceipt_cjs_1.publishedExits)());
        for (const { id, file } of await (0, exitReceipt_cjs_1.publishedScriptStarts)()) {
            const [row] = await (0, executionModels_1.executionModel)(this.database, 'CronTriggers').findAll({
                attributes: ['counted', 'script_started_at'],
                where: { id },
                transaction,
                raw: true,
            });
            // After pruning the trigger, a matching supervisor exit still identifies
            // this panel's retired run. A start file alone cannot establish that.
            if (row ? row.counted && row.script_started_at !== null : exits.has(id)) {
                this.retireReceiptAfterCommit(id, file, transaction, 'start');
            }
        }
        for (const id of exits) {
            if (recovered.has(id))
                continue;
            const pending = await this.pendingExit(id, transaction);
            if (!pending) {
                await this.completeCommandExit(id, 'unknown', 'restart', null, transaction, undefined, undefined, undefined, []);
            }
            else if (pending.owner && pending.started_at !== null) {
                const exit = await (0, exitReceipt_cjs_1.readExit)(id);
                if (exit === undefined)
                    continue;
                await this.recoverScriptSample(id, transaction);
                await this.completeCommandExit(id, 'unknown', 'restart', null, transaction, exit, undefined, undefined, []);
            }
        }
    }
    async completeInTransaction(id, state, reason, code, transaction, elapsedMs, finishedAt, verifiedExit = false) {
        var _a;
        if (await this.lifecycle.shouldStop(id, transaction)) {
            state = 'stopped';
            reason = 'cancelled';
            // The command can exit before its TERM-resistant descendants. Keep the
            // receipt running until the stop operation has verified the whole tree.
            const waiting = await this.database.query(`UPDATE CronTriggers SET
        exit_code=CASE WHEN stop_exit_at IS NULL OR ($verified AND stop_exit_verified IS NOT 1) THEN $code ELSE exit_code END,
        stop_exit_at=CASE WHEN stop_exit_at IS NULL OR ($verified AND stop_exit_verified IS NOT 1) THEN $now ELSE stop_exit_at END,
        stop_exit_verified=CASE WHEN $verified THEN 1 ELSE stop_exit_verified END
        WHERE id=$id AND state='running' AND stop_requested=1 AND instance_id IN
        (SELECT instance_id FROM CronStopRequests WHERE targets IS NOT NULL AND signalled=1)`, {
                transaction,
                bind: {
                    id,
                    code,
                    now: finishedAt !== null && finishedAt !== void 0 ? finishedAt : Date.now(),
                    verified: Number(verifiedExit),
                },
                type: sequelize_1.QueryTypes.BULKUPDATE,
            });
            if (waiting)
                return;
        }
        else if (state === 'stopped' && (reason === null || reason === void 0 ? void 0 : reason.startsWith('SIG'))) {
            state = 'failed';
        }
        const changed = await this.lifecycle.finish(id, state, reason, code, transaction, finishedAt);
        const [row] = await this.database.query(`SELECT cron_id, instance_id, log_path, started_at, finished_at, exit_code FROM CronTriggers WHERE id=$id
       AND state IN ('finished','failed','stopped') AND started_at IS NOT NULL AND counted=0`, { transaction, bind: { id }, type: sequelize_1.QueryTypes.SELECT });
        await this.settleInstance(id, transaction);
        if (!row)
            return;
        const duration = elapsedMs !== null && elapsedMs !== void 0 ? elapsedMs : Math.max(0, row.finished_at - row.started_at);
        if (changed && row.instance_id !== null) {
            await this.database.query(`UPDATE Crontabs SET last_running_time=$duration
        WHERE id=$cronId AND last_execution_time=$start AND (last_instance_id=$instance OR
          (last_instance_id IS NULL AND $instance=(SELECT id FROM RunningInstances WHERE cron_id=$cronId
            ORDER BY started_at DESC,id DESC LIMIT 1)))`, {
                transaction,
                bind: {
                    cronId: row.cron_id,
                    start: Math.floor(row.started_at / 1000),
                    instance: row.instance_id,
                    duration: Math.floor(duration / 1000),
                },
            });
        }
        await (0, cronStatistics_1.recordCronResult)(this.database, row.cron_id, (_a = row.exit_code) !== null && _a !== void 0 ? _a : 1, duration, row.finished_at, id, transaction);
    }
    async hasBoundConflict(id, transaction) {
        const [conflict] = await (0, executionModels_1.executionModel)(this.database, 'CronBoundExitConflicts').findAll({
            attributes: ['trigger_id'],
            where: { trigger_id: id },
            transaction,
            raw: true,
        });
        return Boolean(conflict);
    }
    // Old shell-only executions publish status and statistics independently.
    // Either final receipt can settle that execution if the other was lost.
    async recordShellResult(id, cronId, code, elapsedMs, now, finishedAt) {
        return this.database.transaction(async (transaction) => {
            if (await this.hasBoundConflict(id, transaction))
                return;
            const [row] = await (0, executionModels_1.executionModel)(this.database, 'CronTriggers').findAll({
                attributes: ['owner', 'state'],
                where: { id, cron_id: cronId },
                transaction,
                raw: true,
            });
            if (!row) {
                if (finishedAt && finishedAt <= now) {
                    const [pruned] = await (0, executionModels_1.executionModel)(this.database, 'CronHistoryRetention').findAll({
                        attributes: ['id'],
                        where: { id: 1, cutoff: { [sequelize_1.Op.gt]: finishedAt } },
                        transaction,
                        raw: true,
                    });
                    if (pruned)
                        return;
                }
                throw new Error('Unknown trigger');
            }
            if (row.owner === null &&
                (row.state === 'running' || row.state === 'unknown')) {
                await this.completeInTransaction(id, code === 0 ? 'finished' : 'failed', null, code, transaction, elapsedMs, finishedAt);
            }
            else {
                await (0, cronStatistics_1.recordCronResult)(this.database, cronId, code, elapsedMs, now, id, transaction);
            }
        });
    }
    async readScriptSample(id) {
        if (!process.env.QL_DIR || !/^[a-z0-9-]{1,120}$/.test(id))
            return;
        const marker = (0, path_1.join)(process.env.QL_DIR, '.tmp', 'cron-start-' + id);
        try {
            const value = await fs_1.promises.readFile(marker, 'utf8');
            if (/^\d{13}$/.test(value))
                return { marker, time: Number(value) };
        }
        catch (_a) {
            /* Entries without instrumentation have no sample. */
        }
    }
    async recoverScriptSample(id, transaction) {
        const sample = await this.readScriptSample(id);
        if (!sample)
            return;
        await this.saveScriptSample(id, sample, transaction);
        this.retireReceiptAfterCommit(id, sample.marker, transaction, 'start');
    }
    async saveScriptSample(id, sample, transaction) {
        if (sample)
            await this.database.query(`UPDATE CronTriggers SET script_started_at=$time
      WHERE id=$id AND script_started_at IS NULL AND started_at <= $time AND $time <= $now
      AND (finished_at IS NULL OR state='unknown' OR $time <= finished_at)`, { transaction, bind: { time: sample.time, now: Date.now(), id } });
    }
    async settleInstance(id, transaction) {
        const [row] = await this.database.query(`SELECT cron_id,instance_id,log_path,state,finished_at,exit_code FROM CronTriggers
       WHERE id=$id AND instance_id IS NOT NULL AND finished_at IS NOT NULL`, { transaction, bind: { id }, type: sequelize_1.QueryTypes.SELECT });
        if (!row)
            return;
        if (row.state === 'skipped') {
            // The launch gate closed before user code ran.
            await this.database.query('DELETE FROM RunningInstances WHERE id=$instance AND status=0', { transaction, bind: { instance: row.instance_id } });
            await this.database.query('UPDATE CronTriggers SET instance_id=NULL WHERE id=$id', { transaction, bind: { id } });
        }
        else {
            const status = row.state === 'finished'
                ? 1
                : row.state === 'stopped'
                    ? 2
                    : row.state === 'unknown'
                        ? 4
                        : 3;
            const updated = await this.database.query(`UPDATE RunningInstances SET status=$status,finished_at=$end,exit_code=$code,
        updatedAt=CURRENT_TIMESTAMP WHERE id=$instance AND cron_id=$cronId AND status=0`, {
                transaction,
                type: sequelize_1.QueryTypes.BULKUPDATE,
                bind: {
                    instance: row.instance_id,
                    cronId: row.cron_id,
                    status,
                    end: Math.floor(row.finished_at / 1000),
                    code: row.exit_code,
                },
            });
            if (!updated) {
                // A late exit corrects only the historical instance. Its replacement
                // already owns the task row, even when it uses the same PID and log.
                if (status !== 4)
                    await this.database.query(`UPDATE RunningInstances
          SET status=$status,finished_at=$end,exit_code=$code,updatedAt=CURRENT_TIMESTAMP
          WHERE id=$instance AND cron_id=$cronId AND status=4`, {
                        transaction,
                        bind: {
                            instance: row.instance_id,
                            cronId: row.cron_id,
                            status,
                            end: Math.floor(row.finished_at / 1000),
                            code: row.exit_code,
                        },
                    });
                return;
            }
        }
        // A newer manual reservation owns its own token. Never clear it while an older run exits.
        const [active] = await this.database.query('SELECT pid,log_path,started_at FROM RunningInstances WHERE cron_id=$cronId AND status=0 ORDER BY id DESC LIMIT 1', { transaction, bind: { cronId: row.cron_id }, type: sequelize_1.QueryTypes.SELECT });
        if (active) {
            await this.database.query(`UPDATE Crontabs SET status=0,pid=$pid,log_path=$log
        WHERE id=$cronId AND status IS NOT 3`, {
                transaction,
                bind: { cronId: row.cron_id, pid: active.pid, log: active.log_path },
            });
        }
        else {
            await this.database.query(`UPDATE Crontabs SET status=1,pid=NULL,queued_token=NULL
        WHERE id=$cronId AND status=0 AND log_path IS $log`, { transaction, bind: { cronId: row.cron_id, log: row.log_path } });
        }
    }
    async exitBeforeStop(id) {
        const recovered = await Promise.all((await (0, exitReceipt_cjs_1.retiringExits)())
            .filter((copy) => copy.id === id)
            .map((copy) => (0, exitReceipt_cjs_1.readExit)(id, copy.file)));
        const canonical = await (0, exitReceipt_cjs_1.readExit)(id);
        const verified = recovered.some((copy) => (copy === null || copy === void 0 ? void 0 : copy.version) === 1);
        const unreadable = canonical === null ||
            recovered.some((copy) => copy === null ||
                (copy && copy.version !== 1 && isBoundPublication(copy.file)));
        return {
            canonical,
            recovered,
            published: Boolean(canonical || verified),
            unreadable,
        };
    }
}
exports.TriggerSettlement = TriggerSettlement;
//# sourceMappingURL=triggerSettlement.js.map