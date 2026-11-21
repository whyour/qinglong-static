"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDailyExit = exports.recordCronResult = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const sequelize_1 = require("sequelize");
// Hold the receipt claim and the daily increment in the same write transaction.
async function recordCronResult(database, cronId, _code, elapsedMs, finishedAt, triggerId, transaction) {
    var _a;
    if (!triggerId)
        throw new Error('Execution identity required');
    if (!transaction) {
        return database.transaction((tx) => recordCronResult(database, cronId, _code, elapsedMs, finishedAt, triggerId, tx));
    }
    const bind = { ref: cronId, id: triggerId };
    const claimed = await database.query("UPDATE CronTriggers SET counted=1,exit_pending=NULL WHERE cron_id=$ref AND id=$id AND counted=0 AND started_at IS NOT NULL AND state IN ('finished','failed','stopped')", { bind, type: sequelize_1.QueryTypes.BULKUPDATE, transaction });
    if (!claimed) {
        const rows = await database.query('SELECT 1 FROM CronTriggers WHERE cron_id=$ref AND id=$id', { bind, type: sequelize_1.QueryTypes.SELECT, transaction });
        if (!rows.length)
            throw new Error('Unknown trigger');
        return;
    }
    const [receipt] = await database.query(`SELECT state,finished_at,EXISTS(SELECT 1 FROM CronLegacyExitBookings WHERE trigger_id=$id) AS reversible
     FROM CronTriggers WHERE cron_id=$ref AND id=$id`, { bind, type: sequelize_1.QueryTypes.SELECT, transaction });
    const day = (0, dayjs_1.default)((_a = receipt.finished_at) !== null && _a !== void 0 ? _a : finishedAt).format('YYYY-MM-DD');
    await addDailyExit(database, cronId, day, receipt.state, elapsedMs, Boolean(receipt.reversible), transaction);
    if (receipt.reversible) {
        await database.query(`UPDATE CronLegacyExitBookings SET stopped=$stopped,
      stat_id=(SELECT id FROM CrontabStats WHERE ref_id=$ref AND date=$day
        AND NOT EXISTS (SELECT 1 FROM CronStatRetention WHERE id=1 AND first_day>$day))
      WHERE trigger_id=$id`, { bind: Object.assign(Object.assign({}, bind), { day, stopped: Number(receipt.state === 'stopped') }), transaction });
    }
}
exports.recordCronResult = recordCronResult;
async function addDailyExit(database, cronId, day, state, elapsedMs, reversible, transaction) {
    await database.query(`INSERT INTO "CrontabStats"
           (ref_id, date, run_count, success_count, fail_count, total_time, max_time, fixed_max_time, createdAt, updatedAt)
         SELECT $id, $date, 1, $success, $fail, $elapsed, $elapsed, $fixedMax, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         WHERE NOT EXISTS (SELECT 1 FROM CronStatRetention WHERE id=1 AND first_day>$date)
         ON CONFLICT(ref_id, date) DO UPDATE SET
           run_count = COALESCE(run_count, 0) + 1,
           success_count = COALESCE(success_count, 0) + excluded.success_count,
           fail_count = COALESCE(fail_count, 0) + excluded.fail_count,
           total_time = COALESCE(total_time, 0) + excluded.total_time,
           max_time = MAX(COALESCE(max_time, 0), excluded.max_time),
           fixed_max_time = MAX(COALESCE(fixed_max_time,max_time,0),excluded.fixed_max_time),
           updatedAt = excluded.updatedAt`, { transaction, bind: { id: cronId, date: day, fixedMax: reversible ? 0 : elapsedMs,
            success: Number(state === 'finished'), fail: Number(state === 'failed'), elapsed: elapsedMs } });
}
exports.addDailyExit = addDailyExit;
//# sourceMappingURL=cronStatistics.js.map