"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNextRun = exports.previewSchedule = void 0;
const cronScheduler_1 = require("./cronScheduler");
const cache = new Map();
function previewSchedule(schedule, count, now) {
    const key = JSON.stringify([
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        schedule,
    ]);
    const cached = cache.get(key);
    if (cached && now >= cached.after) {
        const future = cached.times.filter((time) => time > now);
        if (future.length >= count)
            return future.slice(0, count);
    }
    const times = (0, cronScheduler_1.upcomingSlots)(schedule, now, count);
    if (cache.size >= 512)
        cache.delete(cache.keys().next().value);
    cache.set(key, { after: now, times });
    return times;
}
exports.previewSchedule = previewSchedule;
function withNextRun(cron) {
    let nextRunTime = null;
    if (cron.schedule &&
        !cron.isDisabled &&
        cron.saved !== false &&
        !cron.schedule.startsWith('@once') &&
        !cron.schedule.startsWith('@boot')) {
        try {
            const now = Date.now();
            nextRunTime = Math.min(...[
                cron.schedule,
                ...(cron.extra_schedules || []).map((x) => x.schedule),
            ].map((rule) => previewSchedule(rule, 1, now)[0]));
        }
        catch (_a) {
            // Legacy invalid rows remain visible and editable.
        }
    }
    return Object.assign(Object.assign({}, cron), { nextRunTime });
}
exports.withNextRun = withNextRun;
//# sourceMappingURL=cronPreview.js.map