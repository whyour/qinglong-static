"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonCronSchema = exports.scheduleSchema = void 0;
const celebrate_1 = require("celebrate");
const cron_parser_1 = require("cron-parser");
const schedule_1 = require("../interface/schedule");
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const validateSchedule = (value, helpers) => {
    if (value.startsWith(schedule_1.ScheduleType.ONCE) ||
        value.startsWith(schedule_1.ScheduleType.BOOT)) {
        return value;
    }
    try {
        if (cron_parser_1.CronExpressionParser.parse(value).hasNext()) {
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
    log_name: celebrate_1.Joi.string()
        .optional()
        .allow('')
        .allow(null)
        .custom((value, helpers) => {
        if (!value)
            return value;
        // Check if it's an absolute path
        if (value.startsWith('/')) {
            // Allow /dev/null as special case
            if (value === '/dev/null') {
                return value;
            }
            // For other absolute paths, ensure they are within the safe log directory
            const normalizedValue = path_1.default.normalize(value);
            const normalizedLogPath = path_1.default.normalize(config_1.default.logPath);
            if (!normalizedValue.startsWith(normalizedLogPath)) {
                return helpers.error('string.unsafePath');
            }
            return value;
        }
        if (!/^(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?:\/)?(?:[\w.-]+\/)*[\w.-]+\/?$/.test(value)) {
            return helpers.error('string.pattern.base');
        }
        if (value.length > 100) {
            return helpers.error('string.max');
        }
        return value;
    })
        .messages({
        'string.pattern.base': '日志名称只能包含字母、数字、下划线和连字符',
        'string.max': '日志名称不能超过100个字符',
        'string.unsafePath': '绝对路径必须在日志目录内或使用 /dev/null',
    }),
    allow_multiple_instances: celebrate_1.Joi.number().optional().valid(0, 1).allow(null),
};
//# sourceMappingURL=schedule.js.map