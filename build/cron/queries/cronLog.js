"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronLogReader = void 0;
const cron_1 = require("../../data/cron");
const runningInstance_1 = require("../../data/runningInstance");
const index_1 = __importDefault(require("../../config/index"));
const utils_1 = require("../../shared/utils");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const cronViews_1 = require("./cronViews");
const triggerQueries_1 = require("./triggerQueries");
const logPath_1 = require("../../shared/logPath");
const logReader_1 = require("../../shared/logReader");
const i18n_1 = require("../../shared/i18n");
// The caller supplies its existing task lookup so missing-task behavior stays
// compatible. Trigger and instance reads are scoped to the requested task.
class CronLogReader {
    constructor(loadCron) {
        this.loadCron = loadCron;
    }
    async log(id, options = {}) {
        var _a, _b;
        let doc;
        if (options.instanceId !== undefined) {
            const instance = await runningInstance_1.RunningInstanceModel.findOne({
                where: { id: options.instanceId, cron_id: id },
                attributes: ['status', 'log_path'],
                raw: true,
            });
            doc = {
                status: (instance === null || instance === void 0 ? void 0 : instance.status) === runningInstance_1.InstanceStatus.running
                    ? cron_1.CrontabStatus.running
                    : cron_1.CrontabStatus.idle,
                log_path: instance === null || instance === void 0 ? void 0 : instance.log_path,
            };
        }
        else if (options.triggerId) {
            const [trigger] = await new triggerQueries_1.TriggerQueries(cron_1.CrontabModel.sequelize).visibleTriggers(id, [options.triggerId]);
            // A retained viewer must never fall back to a sibling if its receipt was removed.
            doc = {
                logTriggerId: options.triggerId,
                log_path: (_a = trigger === null || trigger === void 0 ? void 0 : trigger.log_path) !== null && _a !== void 0 ? _a : undefined,
                status: (trigger === null || trigger === void 0 ? void 0 : trigger.state) === 'running'
                    ? cron_1.CrontabStatus.running
                    : (trigger === null || trigger === void 0 ? void 0 : trigger.state) === 'queued'
                        ? cron_1.CrontabStatus.queued
                        : cron_1.CrontabStatus.idle,
            };
        }
        else {
            doc = await this.loadCron(id, cronViews_1.logAttributes);
        }
        const triggerId = (_b = doc.logTriggerId) !== null && _b !== void 0 ? _b : undefined;
        if (doc.log_name === '/dev/null' || doc.log_path === '/dev/null') {
            return {
                content: (0, i18n_1.t)('日志设置为忽略'),
                status: 'ignored',
                triggerId,
                offset: 0,
                nextOffset: 0,
                total: 0,
                truncated: false,
            };
        }
        if (typeof doc.status === 'number' && doc.status === cron_1.CrontabStatus.queued) {
            // The next run has reserved a slot but has not published its own path yet.
            return {
                triggerId,
                content: '',
                status: 'running',
                offset: 0,
                nextOffset: 0,
                total: 0,
                truncated: false,
            };
        }
        const absolutePath = doc.log_path
            ? (0, logPath_1.resolveLogPath)(index_1.default.logPath, doc.log_path)
            : '';
        const logFileExist = doc.log_path && (await (0, utils_1.fileExist)(absolutePath));
        if (logFileExist) {
            const changed = options.previousPath !== undefined &&
                options.previousPath !== doc.log_path;
            const chunk = await (0, logReader_1.readLogChunk)(absolutePath, changed
                ? Object.assign(Object.assign({}, options), { cursor: undefined, offset: 0, tail: !options.follow }) : options);
            const isRunning = typeof doc.status === 'number' &&
                [cron_1.CrontabStatus.running, cron_1.CrontabStatus.queued].includes(doc.status);
            return Object.assign(Object.assign({}, chunk), { triggerId, logPath: doc.log_path, status: isRunning ? 'running' : 'completed' });
        }
        else {
            const status = typeof doc.status === 'number' &&
                [cron_1.CrontabStatus.queued, cron_1.CrontabStatus.running].includes(doc.status)
                ? 'running'
                : 'notFound';
            return {
                triggerId,
                content: status === 'running' ? (0, i18n_1.t)('运行中...') : (0, i18n_1.t)('日志不存在...'),
                status,
                offset: 0,
                nextOffset: 0,
                total: 0,
                truncated: false,
            };
        }
    }
    async logs(id) {
        const doc = await this.loadCron(id);
        if (!doc || !doc.log_path || doc.log_path === '/dev/null') {
            return [];
        }
        const relativeDir = path_1.default.dirname(`${doc.log_path}`);
        const dir = path_1.default.dirname((0, logPath_1.resolveLogPath)(index_1.default.logPath, doc.log_path));
        const dirExist = await (0, utils_1.fileExist)(dir);
        if (dirExist) {
            let files = await promises_1.default.readdir(dir);
            return (await Promise.all(files.map(async (x) => ({
                filename: x,
                directory: relativeDir.replace(index_1.default.logPath, ''),
                time: (await promises_1.default.lstat(`${dir}/${x}`)).birthtimeMs,
            })))).sort((a, b) => b.time - a.time);
        }
        else {
            return [];
        }
    }
}
exports.CronLogReader = CronLogReader;
//# sourceMappingURL=cronLog.js.map