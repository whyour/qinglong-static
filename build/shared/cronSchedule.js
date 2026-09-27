"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvalidCronSchedules = exports.isValidCronSchedule = void 0;
const cron_parser_v4_1 = __importDefault(require("cron-parser-v4"));
const schedule_1 = require("../interface/schedule");
// Keep validation aligned with node-schedule's locked cron-parser version.
// cron-parser 5 accepts syntax (e.g. H) that the scheduler cannot execute.
function isValidCronSchedule(schedule) {
    if (typeof schedule !== 'string' || !schedule.trim())
        return false;
    try {
        return cron_parser_v4_1.default.parseExpression(schedule).hasNext();
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
    return [cron.schedule, ...(cron.extra_schedules || []).map((x) => x.schedule)]
        .filter((schedule) => !isValidCronSchedule(schedule));
}
exports.getInvalidCronSchedules = getInvalidCronSchedules;
//# sourceMappingURL=cronSchedule.js.map