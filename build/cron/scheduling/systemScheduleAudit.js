"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemScheduleAudit = exports.confirmSystemPlan = exports.suspendSystemPlan = exports.stageSystemPlan = void 0;
const executionModels_1 = require("../../data/executionModels");
const sequelize_1 = require("sequelize");
const scheduleAudit_1 = require("./scheduleAudit");
async function stageSystemPlan(db, rules, at = Date.now()) {
    const bind = {
        at,
        zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        rules: JSON.stringify([...rules].sort((a, b) => a.id - b.id)),
    };
    return db.transaction({ type: sequelize_1.Transaction.TYPES.IMMEDIATE }, async (transaction) => {
        const [pending] = await (0, executionModels_1.executionModel)(db, 'CronSystemPlans')
            .findAll({
            attributes: ['id', 'confirmed', 'zone', 'rules'],
            order: [['id', 'DESC']],
            limit: 1,
            transaction,
            raw: true,
        })
            .then((rows) => rows.filter((row) => row.confirmed === null &&
            row.zone === bind.zone &&
            row.rules === bind.rules));
        if (pending)
            return pending.id;
        const [id] = await (0, executionModels_1.executionModel)(db, 'CronSystemPlans')
            .create({ staged: bind.at, zone: bind.zone, rules: bind.rules }, { transaction, silent: true, hooks: false, validate: false })
            .then((row) => [row.id]);
        return id;
    });
}
exports.stageSystemPlan = stageSystemPlan;
// On a switch to Node the service can no longer attest the installed daemon rules.
async function suspendSystemPlan(db) {
    await db.query(`INSERT INTO CronSystemPlans(staged,zone,rules)
    SELECT $now,zone,'[]' FROM (SELECT zone,confirmed FROM CronSystemPlans ORDER BY id DESC LIMIT 1)
    WHERE confirmed IS NOT NULL`, { bind: { now: Date.now() } });
}
exports.suspendSystemPlan = suspendSystemPlan;
async function confirmSystemPlan(db, id, at = Date.now()) {
    await db.transaction(async (transaction) => {
        await (0, executionModels_1.executionModel)(db, 'CronSystemPlans').update({ confirmed: at }, {
            where: { id, confirmed: null },
            transaction,
            silent: true,
            hooks: false,
            validate: false,
        });
        // Keep the effective snapshot preceding the retention window.
        await db.query('DELETE FROM CronSystemPlans WHERE id < (SELECT MAX(id) FROM CronSystemPlans WHERE staged < $cutoff AND confirmed IS NOT NULL)', { transaction, bind: { cutoff: at - 3 * 86400000 } });
    });
}
exports.confirmSystemPlan = confirmSystemPlan;
async function systemScheduleAudit(db, dayStart, now = Date.now(), details) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const next = new Date(dayStart);
    next.setHours(24, 0, 0, 0);
    const through = Math.min(now - 5000, +next - 1);
    const { since, installs, receipts } = await db.transaction({ type: sequelize_1.Transaction.TYPES.DEFERRED }, async (transaction) => {
        const [retention] = await (0, executionModels_1.executionModel)(db, 'CronHistoryRetention')
            .findAll({
            attributes: ['cutoff'],
            where: { id: 1 },
            transaction,
            raw: true,
        })
            .then(([row]) => { var _a; return [{ since: Math.max(dayStart, (_a = row === null || row === void 0 ? void 0 : row.cutoff) !== null && _a !== void 0 ? _a : 0) }]; });
        const since = retention.since;
        const installs = await db.query(`SELECT * FROM CronSystemPlans WHERE id >= COALESCE((SELECT MAX(id) FROM CronSystemPlans
       WHERE confirmed < $since - 60000),0) AND staged <= $now ORDER BY id`, { transaction, bind: { since, now }, type: sequelize_1.QueryTypes.SELECT });
        const receipts = await db.query(`SELECT id,cron_id,system_rule,system_dispatch_at,observed_at,state,${details ? 'reason,log_path,' : ''}
       (command_started_at IS NOT NULL OR script_started_at IS NOT NULL OR
        (started_at IS NOT NULL AND EXISTS (SELECT 1 FROM CronLegacyExitBookings b
         WHERE b.trigger_id=CronTriggers.id AND b.bound=1 AND b.disputed=0))) AS launched
       FROM CronTriggers
       WHERE source='system' AND COALESCE(system_dispatch_at,observed_at) >= $since
       AND COALESCE(system_dispatch_at,observed_at) < $end ORDER BY observed_at,id`, {
            transaction,
            bind: {
                since,
                end: Math.min(+next, Math.floor(through / 60000) * 60000 + 60000, now + 1),
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return { since, installs, receipts };
    });
    if (!installs.length && !receipts.length)
        return null;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const minute = 60000;
    const plans = installs.map((plan) => (Object.assign(Object.assign({}, plan), { tasks: new Map(JSON.parse(plan.rules).map((rule) => [rule.id, rule])) })));
    const matched = details && details.kind !== 'missing'
        ? new Map()
        : null;
    const groups = new Map();
    const dispatchedTasks = new Set();
    const legacyThrough = new Map();
    const receiptKey = (task, rule, time) => JSON.stringify([task, rule, time]);
    for (const row of receipts) {
        if (row.system_dispatch_at == null || !row.system_rule) {
            const key = JSON.stringify([row.cron_id, row.system_rule]);
            legacyThrough.set(key, Math.max((_a = legacyThrough.get(key)) !== null && _a !== void 0 ? _a : 0, row.observed_at));
            continue;
        }
        dispatchedTasks.add(row.cron_id + '/' + Math.floor(row.system_dispatch_at / minute));
        const key = receiptKey(row.cron_id, row.system_rule, Math.floor(row.system_dispatch_at / minute) * minute);
        const group = (_b = groups.get(key)) !== null && _b !== void 0 ? _b : [];
        group.push(row);
        groups.set(key, group);
    }
    let expected = 0, observed = 0, dispatched = 0, skipped = 0, missing = 0, duplicates = 0, matchedReceipts = 0;
    let uncertain = 0, awaiting = 0, switchSlots = 0, partial = false;
    const recent = [];
    const dst = new Date(dayStart).getTimezoneOffset() !==
        new Date(+next - 1).getTimezoneOffset();
    let baseline = -1, last = -1;
    const calendar = new Map();
    for (let time = Math.ceil(Math.max(since, (_d = (_c = plans[0]) === null || _c === void 0 ? void 0 : _c.staged) !== null && _d !== void 0 ? _d : since) / minute) * minute; time <= through; time += minute) {
        // A successful crontab install acknowledges the file. crond reads changes at
        // its minute tick. Around that tick either file can still explain a callback.
        while (last + 1 < plans.length && plans[last + 1].staged <= time + 5000)
            last++;
        while (baseline + 1 <= last) {
            let confirmed = baseline + 1;
            while (confirmed <= last && plans[confirmed].confirmed == null)
                confirmed++;
            if (confirmed > last || plans[confirmed].confirmed >= time - minute)
                break;
            baseline = confirmed;
        }
        if (last < 0)
            continue;
        const possible = plans.slice(Math.max(0, baseline), last + 1);
        if (dst || possible.some((plan) => plan.zone !== zone)) {
            partial = true;
            continue;
        }
        const tasks = new Set();
        for (const plan of possible)
            for (const id of plan.tasks.keys())
                tasks.add(id);
        const block = time - (time % scheduleAudit_1.blockSize);
        if (time === block)
            calendar.clear();
        const entries = [];
        for (const task of tasks) {
            const schedules = new Set();
            let name;
            for (const plan of possible) {
                const rule = plan.tasks.get(task);
                if (!rule)
                    continue;
                name = rule.name;
                let times = calendar.get(rule.schedule);
                if (!times) {
                    times = new Set((0, scheduleAudit_1.blockSlots)(rule.schedule, zone, block));
                    calendar.set(rule.schedule, times);
                }
                if (times.has(time))
                    schedules.add(rule.schedule);
            }
            if (!schedules.size)
                continue;
            const [schedule] = schedules;
            const stable = baseline >= 0 &&
                schedules.size === 1 &&
                possible.every((plan) => {
                    var _a;
                    return plan.confirmed != null &&
                        ((_a = plan.tasks.get(task)) === null || _a === void 0 ? void 0 : _a.schedule) === schedule;
                });
            const group = [...schedules].flatMap((rule) => { var _a; return (_a = groups.get(receiptKey(task, rule, time))) !== null && _a !== void 0 ? _a : []; });
            let status;
            const launched = group.find((row) => row.launched === 1);
            const skip = group.find((row) => !row.launched && row.state === 'skipped');
            if (group.length) {
                ++expected;
                ++observed;
                if (matched)
                    for (const row of group)
                        matched.set(row.id, { time, name });
                matchedReceipts += group.length;
                duplicates += group.length - 1;
                if (launched)
                    ++dispatched;
                else if (skip)
                    ++skipped;
                status = launched ? 'started' : skip ? 'skipped' : 'unconfirmed';
            }
            else if (!stable) {
                ++switchSlots;
                partial = true;
                status = 'switch';
            }
            else {
                ++expected;
                const lastUndated = Math.max((_e = legacyThrough.get(JSON.stringify([task, null]))) !== null && _e !== void 0 ? _e : 0, (_f = legacyThrough.get(JSON.stringify([task, schedule]))) !== null && _f !== void 0 ? _f : 0);
                if (time <= lastUndated ||
                    dispatchedTasks.has(task + '/' + time / minute)) {
                    ++uncertain;
                    status = 'uncertain';
                }
                else if (time + minute > now) {
                    ++awaiting;
                    status = 'awaiting';
                }
                else {
                    ++missing;
                    if ((details === null || details === void 0 ? void 0 : details.kind) === 'missing')
                        details.add({
                            task,
                            name,
                            rule: schedule,
                            time,
                            source: 'system',
                            trigger: null,
                            observed: null,
                            reason: null,
                            logPath: null,
                        });
                    status = 'missing';
                }
            }
            entries.push({
                time,
                task,
                name,
                status,
                triggerCount: group.length,
                startCount: group.filter((row) => row.launched === 1).length,
                skipCount: group.filter((row) => !row.launched && row.state === 'skipped').length,
                unknownExitCount: group.filter((row) => row.launched === 1 && row.state === 'unknown').length,
                id: (_g = (launched || skip || group[0])) === null || _g === void 0 ? void 0 : _g.id,
            });
        }
        if (entries.length)
            recent.unshift(...entries.sort((a, b) => a.task - b.task).slice(0, 25));
        recent.splice(25);
    }
    let actualSkips = 0, actualUnconfirmed = 0;
    for (const row of receipts) {
        if (row.launched === 1)
            continue;
        const kind = row.state === 'skipped' ? 'skipped' : 'unconfirmed';
        if (kind === 'skipped')
            actualSkips++;
        else
            actualUnconfirmed++;
        if ((details === null || details === void 0 ? void 0 : details.kind) === kind) {
            const slot = matched === null || matched === void 0 ? void 0 : matched.get(row.id);
            details.add({
                task: row.cron_id,
                name: slot === null || slot === void 0 ? void 0 : slot.name,
                rule: row.system_rule,
                time: (_h = slot === null || slot === void 0 ? void 0 : slot.time) !== null && _h !== void 0 ? _h : null,
                source: 'system',
                trigger: row.id,
                observed: row.observed_at,
                reason: row.reason,
                logPath: row.log_path,
            });
        }
    }
    return {
        since: Math.max(since, (_k = (_j = plans[0]) === null || _j === void 0 ? void 0 : _j.staged) !== null && _k !== void 0 ? _k : since),
        through,
        confirmedAt: (_m = (_l = [...plans].reverse().find((p) => p.confirmed != null)) === null || _l === void 0 ? void 0 : _l.confirmed) !== null && _m !== void 0 ? _m : null,
        pending: ((_o = plans.at(-1)) === null || _o === void 0 ? void 0 : _o.confirmed) == null,
        partial,
        expected,
        observed,
        dispatched,
        skipped,
        missing,
        duplicates,
        uncertain,
        awaiting,
        switchSlots,
        actualSkips,
        actualUnconfirmed,
        actualStarts: receipts.filter((row) => row.launched === 1).length,
        unmatched: receipts.length - matchedReceipts,
        recent,
    };
}
exports.systemScheduleAudit = systemScheduleAudit;
//# sourceMappingURL=systemScheduleAudit.js.map