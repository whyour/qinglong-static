"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonCronSchema = exports.scheduleSchema = void 0;
const celebrate_1 = require("celebrate");
const cron_parser_1 = __importDefault(require("cron-parser"));
const schedule_1 = require("../interface/schedule");
const validateSchedule = (value, helpers) => {
    if (value.startsWith(schedule_1.ScheduleType.ONCE) ||
        value.startsWith(schedule_1.ScheduleType.BOOT)) {
        return value;
    }
    try {
        if (cron_parser_1.default.parseExpression(value).hasNext()) {
            return value;
        }
    }
    catch (e) {
        return helpers.error('any.invalid');
    }
    return helpers.error('any.invalid');
};
exports.scheduleSchema = celebrate_1.Joi.string()
    .required()
    .custom(validateSchedule)
    .messages({
    'any.invalid': '无效的定时规则',
    'string.empty': '定时规则不能为空',
});
exports.commonCronSchema = {
    name: celebrate_1.Joi.string().optional(),
    command: celebrate_1.Joi.string().required(),
    schedule: exports.scheduleSchema,
    labels: celebrate_1.Joi.array().optional(),
    sub_id: celebrate_1.Joi.number().optional().allow(null),
    extra_schedules: celebrate_1.Joi.array().optional().allow(null),
    task_before: celebrate_1.Joi.string().optional().allow('').allow(null),
    task_after: celebrate_1.Joi.string().optional().allow('').allow(null),
};
//# sourceMappingURL=schedule.js.map