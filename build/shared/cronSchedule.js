"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvalidCronSchedules = exports.isValidCronSchedule = exports.parseCronSchedule = void 0;
const cron_parser_1 = __importDefault(require("cron-parser"));
const node_cron_1 = require("node-cron");
const schedule_1 = require("../interface/schedule");
const aliases = {
    '@yearly': '0 0 0 1 1 *',
    '@annually': '0 0 0 1 1 *',
    '@monthly': '0 0 0 1 * *',
    '@weekly': '0 0 0 * * 0',
    '@daily': '0 0 0 * * *',
    '@midnight': '0 0 0 * * *',
    '@hourly': '0 0 * * * *',
    '@minutely': '0 * * * * *',
};
// Validation and registration repeatedly see identical rules in large snapshots.
// Cache only immutable syntax, never dates or running tasks, and bound user input.
const scheduleCache = new Map();
// Canonicalize legacy shorthand, aliases, names and numeric-start steps before
// node-cron sees them. Extend legacy aliases explicitly; reject H and bare /N.
function parseCronSchedule(schedule) {
    if (typeof schedule !== 'string' || !schedule.trim()) {
        throw new Error('Invalid cron schedule');
    }
    let source = schedule.trim();
    const cacheKey = source;
    const cached = scheduleCache.get(cacheKey);
    if (cached)
        return cached;
    if (source.startsWith('@')) {
        if (!Object.hasOwn(aliases, source))
            throw new Error('Invalid cron alias');
        source = aliases[source];
    }
    let parts = source.split(/\s+/);
    if (parts.length > 6 ||
        parts.some((part) => /(^|,)\//.test(part) || /H(?:\(|\/|$)/i.test(part))) {
        throw new Error('Unsupported cron syntax');
    }
    parts = [
        ...['0', '*', '*', '*', '*', '*'].slice(0, 6 - parts.length),
        ...parts,
    ];
    if (parts.some((part, index) => index !== 3 && index !== 5 && part.includes('?'))) {
        throw new Error('Question mark is only valid in day fields');
    }
    const expression = cron_parser_1.default.parse(parts.join(' '));
    if (!expression.hasNext())
        throw new Error('Cron schedule has no next execution');
    const normalized = expression.stringify(true).replace(/\?/g, '*').split(' ');
    const dayCount = expression.fields.dayOfMonth.values.length;
    const weekCount = expression.fields.dayOfWeek.values.length;
    const patterns = dayCount < 31 && weekCount < 8
        ? [
            [...normalized.slice(0, 5), '*'].join(' '),
            [...normalized.slice(0, 3), '*', ...normalized.slice(4)].join(' '),
        ]
        : [normalized.join(' ')];
    if (!patterns.every((pattern) => (0, node_cron_1.validate)(pattern))) {
        throw new Error('Unsupported cron schedule');
    }
    const parsed = {
        patterns,
        dayCount,
        nthDay: expression.fields.dayOfWeek.nthDay,
    };
    Object.freeze(patterns);
    Object.freeze(parsed);
    if (scheduleCache.size >= 512)
        scheduleCache.delete(scheduleCache.keys().next().value);
    scheduleCache.set(cacheKey, parsed);
    return parsed;
}
exports.parseCronSchedule = parseCronSchedule;
function isValidCronSchedule(schedule) {
    try {
        parseCronSchedule(schedule);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isValidCronSchedule = isValidCronSchedule;
function getInvalidCronSchedules(cron) {
    var _a, _b;
    if (((_a = cron.schedule) === null || _a === void 0 ? void 0 : _a.startsWith(schedule_1.ScheduleType.ONCE)) ||
        ((_b = cron.schedule) === null || _b === void 0 ? void 0 : _b.startsWith(schedule_1.ScheduleType.BOOT))) {
        return [];
    }
    return [
        cron.schedule,
        ...(cron.extra_schedules || []).map((x) => x.schedule),
    ].filter((schedule) => !isValidCronSchedule(schedule));
}
exports.getInvalidCronSchedules = getInvalidCronSchedules;
//# sourceMappingURL=cronSchedule.js.map