"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upcomingSlots = exports.createCronJob = void 0;
const i18n_1 = require("../../shared/i18n");
const node_cron_1 = require("node-cron");
const cronSchedule_1 = require("./cronSchedule");
function acceptsSlot(parsed, tasks, index, date) {
    if (tasks.length === 1)
        return true;
    // Preserve cron-parser 4's day/weekday OR semantics, including its
    // month-dependent full-day range and the global nth-week constraint.
    if (parsed.nthDay && Math.ceil(date.getDate() / 7) !== parsed.nthDay)
        return false;
    if (index === 1)
        return !tasks[0].match(date);
    const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return parsed.dayCount < monthDays[date.getMonth()] || tasks[1].match(date);
}
// node-cron owns timers and calendar calculation; Qinglong owns execution
// concurrency and process lifetime. Missed in-process slots join that same queue.
function createCronJob(schedule, callback, options) {
    const parsed = (0, cronSchedule_1.parseCronSchedule)(schedule);
    const tasks = [];
    let cancelled = false;
    let started = false;
    const dispatch = async (index, date, missed) => {
        if (cancelled || !started || !acceptsSlot(parsed, tasks, index, date))
            return;
        if (missed) {
            options.logger.warn((0, i18n_1.t)('[schedule][补执行迟到任务] 任务: %s, 计划时间: %s'), options.name, date.toISOString());
        }
        try {
            await callback(date);
        }
        catch (error) {
            options.logger.error((0, i18n_1.t)('[schedule][定时回调失败] 任务: %s, 错误: %s'), options.name, error instanceof Error ? error.message : String(error));
        }
    };
    try {
        for (const [index, pattern] of parsed.patterns.entries()) {
            const task = (0, node_cron_1.createTask)(pattern, (context) => dispatch(index, context.date, false), {
                noOverlap: false,
                missedExecutionTolerance: 5000,
            });
            tasks.push(task);
            task.on('execution:missed', (context) => dispatch(index, context.date, true));
            // Fail before an existing schedule is cancelled, including impossible dates.
            task.getNextRuns(1);
        }
    }
    catch (error) {
        tasks.forEach((task) => task.destroy());
        throw error;
    }
    const job = {
        start() {
            if (started || cancelled)
                return;
            started = true;
            tasks.forEach((task) => task.start());
        },
        cancel() {
            if (cancelled)
                return;
            cancelled = true;
            tasks.forEach((task) => task.destroy());
        },
    };
    if (options.start !== false)
        job.start();
    return job;
}
exports.createCronJob = createCronJob;
// node-cron 4.6.0 exposes getNextRuns only from the wall clock. Its pinned
// inline matcher also accepts an explicit cursor, needed for previews and recovery.
function upcomingSlots(schedule, after, count = 1, through) {
    const parsed = (0, cronSchedule_1.parseCronSchedule)(schedule);
    const tasks = [];
    try {
        const matchers = parsed.patterns.map((pattern) => {
            const task = (0, node_cron_1.createTask)(pattern, () => { });
            tasks.push(task);
            return task.timeMatcher;
        });
        const next = matchers.map((matcher) => matcher.getNextMatch(new Date(after)));
        // All calendar branches share their clock fields. For bounded audit ranges,
        // resolve each matching minute once, including the matcher's DST choice.
        const seconds = through == null
            ? []
            : [...new Set(matchers[0].expressions[0])].sort((a, b) => a - b);
        const slots = [];
        let horizon = after + 366 * 100 * 86400000;
        while (slots.length < count) {
            const time = Math.min(...next.map(Number));
            if (through != null && time > through)
                break;
            if (!Number.isFinite(time) || time > horizon)
                throw new Error('No matching calendar date');
            let accepted = false;
            next.forEach((date, index) => {
                if (+date !== time)
                    return;
                const valid = acceptsSlot(parsed, tasks, index, date);
                accepted || (accepted = valid);
                // Both branches share the clock fields. Rejection applies to the
                // entire local day, including schedules that fire every second.
                const cursor = new Date(time);
                if (!valid)
                    cursor.setHours(23, 59, 59, 999);
                else if (through != null)
                    cursor.setTime(time - (time % 60000) + 59999);
                next[index] = matchers[index].getNextMatch(cursor);
            });
            if (accepted) {
                if (through == null)
                    slots.push(time);
                else
                    for (const second of seconds) {
                        const slot = time - (time % 60000) + second * 1000;
                        if (slot >= time && slot <= through && slots.length < count)
                            slots.push(slot);
                    }
                horizon = time + 366 * 100 * 86400000;
            }
        }
        return slots;
    }
    finally {
        tasks.forEach((task) => task.destroy());
    }
}
exports.upcomingSlots = upcomingSlots;
//# sourceMappingURL=cronScheduler.js.map