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
const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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
    let normalized = parts.map((part) => part.replace(/\?/g, '*'));
    // cron-parser includes Sunday in stepped ranges ending in 7 even when the
    // step does not land on 7. node-cron accepts those ranges with different days.
    if (/(^|,)(?:\d+|[a-z]{3})-0*7\/\d+(?=,|$)/i.test(normalized[5])) {
        normalized[5] = expression.fields.dayOfWeek.values.join(',');
    }
    // Most rules are already supported; only inspect individual fields on failure.
    if (!(0, node_cron_1.validate)(normalized.join(' '))) {
        const fields = [
            expression.fields.second,
            expression.fields.minute,
            expression.fields.hour,
            expression.fields.dayOfMonth,
            expression.fields.month,
            expression.fields.dayOfWeek,
        ];
        normalized = normalized.map((value, index) => {
            // Preserve supported lists, ranges and names. Expand only fields node-cron
            // cannot consume, such as numeric/name-start steps; never compress them.
            const probe = ['0', '0', '0', '*', '*', '*'];
            probe[index] = value;
            if ((0, node_cron_1.validate)(probe.join(' ')))
                return value;
            const values = fields[index].values;
            if (index === 5 && expression.fields.dayOfWeek.nthDay) {
                // The legacy normalizer treated *#N / ?#N as an unrestricted weekday.
                if (values.length === 8)
                    return '*';
                // # applies to a single weekday; normalize its numeric spelling only.
                return values.length === 1
                    ? `${values[0]}#${expression.fields.dayOfWeek.nthDay}`
                    : value;
            }
            return values.join(',');
        });
    }
    const months = expression.fields.month.values;
    // cron-parser 4 clipped dates outside a single selected month's maximum
    // before deciding whether the day field covered the whole month.
    const dayCount = expression.fields.dayOfMonth.values.filter((day) => months.length !== 1 ||
        typeof day !== 'number' ||
        day <= daysInMonth[months[0] - 1]).length;
    const weekCount = expression.fields.dayOfWeek.values.length;
    // Preserve the legacy count-based wildcard rules, including repeated Sunday
    // and L tokens: an ignored day field must not remain an AND constraint.
    const weekdayPattern = [
        ...normalized.slice(0, 3),
        '*',
        ...normalized.slice(4),
    ].join(' ');
    const patterns = weekCount === 8
        ? [[...normalized.slice(0, 5), '*'].join(' ')]
        : dayCount < 31
            ? [[...normalized.slice(0, 5), '*'].join(' '), weekdayPattern]
            : [weekdayPattern];
    const valid = patterns.map((pattern) => (0, node_cron_1.validate)(pattern));
    if (patterns.length === 2 && !valid[0] && valid[1]) {
        // A date branch can be impossible for all chosen months while the weekday
        // branch still runs. Drop it only if its syntax is valid with any month.
        if ((0, node_cron_1.validate)([...normalized.slice(0, 4), '*', '*'].join(' '))) {
            patterns.shift();
            valid.shift();
        }
    }
    if (!valid.every(Boolean)) {
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