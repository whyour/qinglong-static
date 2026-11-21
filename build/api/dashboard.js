"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const promises_1 = require("fs/promises");
const fileAccess_1 = require("../shared/fileAccess");
const scheduleAnomalies_1 = require("../shared/scheduleAnomalies");
const scheduleAudit_1 = require("../shared/scheduleAudit");
const systemScheduleAudit_1 = require("../shared/systemScheduleAudit");
const celebrate_1 = require("celebrate");
const executionIdentity_1 = require("../shared/executionIdentity");
const queueDiagnostics_1 = require("../shared/queueDiagnostics");
const containerResources_1 = require("../shared/containerResources");
const triggerHistory_1 = require("../shared/triggerHistory");
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const cron_1 = require("../data/cron");
const cronStats_1 = require("../data/cronStats");
const runningInstance_1 = require("../data/runningInstance");
const dayjs_1 = __importDefault(require("dayjs"));
const os_1 = __importDefault(require("os"));
const lodash_1 = require("lodash");
const i18n_1 = require("../shared/i18n");
function averageElapsed(totalTime, runs, untimed) {
    const samples = Number(runs) - (Number(untimed) || 0);
    return samples > 0 ? Math.round(Number(totalTime) / samples) : 0;
}
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/dashboard', route);
    route.post('/record', async (req, res) => {
        try {
            const { ref_id, code, elapsed, trigger_id, execution_id } = req.body;
            if (!ref_id)
                return res.send({ code: 400, message: 'ref_id required' });
            if (trigger_id != null && (typeof trigger_id !== 'string' || !/^[a-z0-9-]{1,120}$/.test(trigger_id))) {
                return res.send({ code: 400 });
            }
            if (execution_id !== undefined && (trigger_id !== undefined ||
                typeof execution_id !== 'string' || !executionIdentity_1.executionIdPattern.test(execution_id)))
                return res.send({ code: 400 });
            const id = execution_id ? (0, executionIdentity_1.executionTriggerId)(execution_id) : trigger_id;
            // Old wrappers also send a status receipt with the process identity.
            // A stats-only retry cannot be distinguished from another identical run.
            if (!id)
                return res.send({ code: 200, data: { counted: false, reason: 'missing_execution_identity' } });
            const exitCode = typeof code === 'string' && /^-?\d+$/.test(code) ? Number(code) : code;
            const elapsedMs = Number(elapsed !== null && elapsed !== void 0 ? elapsed : 0) * 1000;
            if (!Number.isInteger(exitCode) || !Number.isSafeInteger(elapsedMs) || elapsedMs < 0) {
                return res.send({ code: 400, message: 'invalid exit code or elapsed time' });
            }
            await new triggerHistory_1.TriggerHistory(cronStats_1.CrontabStatModel.sequelize).recordShellResult(id, Number(ref_id), exitCode, elapsedMs, Date.now(), (0, executionIdentity_1.receiptFinishTime)(req.get('X-QL-Finished-At')));
            res.send({ code: 200 });
        }
        catch (e) {
            res.send({ code: 500 });
        }
    });
    route.get('/overview', async (req, res, next) => {
        try {
            const serverNow = Date.now();
            const day = (0, dayjs_1.default)(serverNow).startOf('day');
            const today = day.format('YYYY-MM-DD');
            const [total, enabled, disabled, stats, triggers] = await Promise.all([
                cron_1.CrontabModel.count(),
                cron_1.CrontabModel.count({ where: { isDisabled: 0 } }),
                cron_1.CrontabModel.count({ where: { isDisabled: 1 } }),
                cronStats_1.CrontabStatModel.findOne({
                    attributes: [
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('run_count')), 'total_runs'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('success_count')), 'total_success'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('fail_count')), 'total_fail'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('untimed_count')), 'untimed_count'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('total_time')), 'total_time'],
                    ],
                    where: { date: today },
                    raw: true,
                }),
                new triggerHistory_1.TriggerHistory(cronStats_1.CrontabStatModel.sequelize).metrics(day.valueOf()),
            ]);
            const row = stats;
            const totalRuns = Number(row === null || row === void 0 ? void 0 : row.total_runs) || 0;
            const totalSuccess = Number(row === null || row === void 0 ? void 0 : row.total_success) || 0;
            const totalFail = Number(row === null || row === void 0 ? void 0 : row.total_fail) || 0;
            const totalTime = Number(row === null || row === void 0 ? void 0 : row.total_time) || 0;
            res.send({
                code: 200,
                data: {
                    serverNow,
                    expiresAt: day.add(1, 'day').valueOf(),
                    total,
                    enabled,
                    disabled,
                    triggers,
                    todayRuns: totalRuns,
                    todaySuccess: totalSuccess,
                    todayFail: totalFail,
                    todayStopped: totalRuns - totalSuccess - totalFail,
                    successRate: totalRuns > 0 ? ((totalSuccess / totalRuns) * 100).toFixed(1) : '0',
                    avgTime: averageElapsed(totalTime, totalRuns, row === null || row === void 0 ? void 0 : row.untimed_count),
                },
            });
        }
        catch (e) {
            next(e);
        }
    });
    route.get('/schedule-anomalies', (0, celebrate_1.celebrate)({ query: celebrate_1.Joi.object({
            source: celebrate_1.Joi.string().valid('panel', 'system').required(),
            kind: celebrate_1.Joi.string().valid('missing', 'skipped', 'unconfirmed').required(),
            at: celebrate_1.Joi.number().integer().positive().required(),
            page: celebrate_1.Joi.number().integer().min(1).default(1),
            revision: celebrate_1.Joi.string().hex().length(64),
            live: celebrate_1.Joi.boolean().default(false),
        }).unknown(true) }), async (req, res, next) => {
        var _a;
        try {
            const { source, kind, page, at, revision, live } = req.query;
            const until = Number(at);
            const serverNow = Date.now();
            const expiresAt = (0, dayjs_1.default)(until).startOf('day').add(1, 'day').valueOf();
            if (live && serverNow >= expiresAt)
                return res.send({ code: 200, data: { status: 'expired' } });
            if (until > Date.now() || until < (0, dayjs_1.default)().subtract(1, 'day').startOf('day').valueOf())
                return res.status(400).send({ code: 400 });
            const [snapshotRetention] = live ? await cronStats_1.CrontabStatModel.sequelize.query('SELECT cutoff FROM CronHistoryRetention WHERE id=1', { type: sequelize_1.QueryTypes.SELECT }) : [];
            const details = new scheduleAnomalies_1.AnomalyPage(kind, Number(page), revision);
            const audit = source === 'panel' ? scheduleAudit_1.auditSchedule : systemScheduleAudit_1.systemScheduleAudit;
            const summary = await audit(cronStats_1.CrontabStatModel.sequelize, (0, dayjs_1.default)(until).startOf('day').valueOf(), until, details);
            if (live && (!summary || summary.since > summary.through))
                return res.send({ code: 200, data: { status: 'unavailable' } });
            if (!summary)
                return res.status(409).send({ code: 409 });
            const result = details.result();
            const ids = [...new Set(result.rows.filter(row => !row.name).map(row => row.task))];
            const tasks = ids.length ? await cron_1.CrontabModel.findAll({ where: { id: ids }, attributes: ['id', 'name', 'command'], raw: true }) : [];
            const names = new Map(tasks.map(task => [task.id, task.name || task.command]));
            const rows = await Promise.all(result.rows.map(async (_a) => {
                var { logPath } = _a, row = __rest(_a, ["logPath"]);
                const path = logPath && (0, fileAccess_1.resolveFileAccess)(config_1.default.logPath, [logPath]);
                const hasLog = path ? await (0, promises_1.stat)(path).then(file => file.isFile(), () => false) : false;
                return Object.assign(Object.assign({}, row), { name: row.name || names.get(row.task), hasLog });
            }));
            // Log checks can yield after the audit transaction. Do not publish that
            // snapshot if history cleanup has since removed part of its plan window.
            if (live) {
                const [retention] = await cronStats_1.CrontabStatModel.sequelize.query('SELECT cutoff FROM CronHistoryRetention WHERE id=1', { type: sequelize_1.QueryTypes.SELECT });
                if (retention && retention.cutoff > ((_a = snapshotRetention === null || snapshotRetention === void 0 ? void 0 : snapshotRetention.cutoff) !== null && _a !== void 0 ? _a : 0))
                    return res.send({ code: 200, data: { status: 'unavailable' } });
            }
            if (live && Date.now() >= expiresAt)
                return res.send({ code: 200, data: { status: 'expired' } });
            return res.send({ code: 200, data: Object.assign(Object.assign({}, result), { rows, serverNow, expiresAt, summary: source === 'panel' ? { audit: summary } : { systemAudit: summary }, zone: Intl.DateTimeFormat().resolvedOptions().timeZone }) });
        }
        catch (error) {
            next(error);
        }
    });
    for (const isSuccess of [false, true]) {
        route.get(isSuccess ? '/successes' : '/failures', async (req, res, next) => {
            try {
                const countColumn = isSuccess ? 'success_count' : 'fail_count';
                const rows = (await cronStats_1.CrontabStatModel.findAll({
                    attributes: ['ref_id', [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)(countColumn)), 'result_count']],
                    where: { date: (0, dayjs_1.default)().format('YYYY-MM-DD'), [countColumn]: { [sequelize_1.Op.gt]: 0 } },
                    group: ['ref_id'],
                    order: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)(countColumn)), 'DESC'], ['ref_id', 'ASC']],
                    raw: true,
                }));
                const crons = rows.length > 0 ? await cron_1.CrontabModel.findAll({
                    attributes: ['id', 'name', 'command'],
                    where: { id: { [sequelize_1.Op.in]: rows.map((row) => Number(row.ref_id)) } },
                    raw: true,
                }) : [];
                const cronMap = new Map(crons.map((cron) => [cron.id, cron]));
                res.send({
                    code: 200,
                    data: rows.map((row) => {
                        const id = Number(row.ref_id);
                        const cron = cronMap.get(id);
                        return {
                            id,
                            name: (cron === null || cron === void 0 ? void 0 : cron.name) || (cron === null || cron === void 0 ? void 0 : cron.command) || (0, i18n_1.tf)('任务#%s', id),
                            command: (cron === null || cron === void 0 ? void 0 : cron.command) || '',
                            [isSuccess ? 'successCount' : 'failCount']: Number(row.result_count),
                            deleted: !cron,
                        };
                    }),
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    route.get('/trend', async (req, res, next) => {
        try {
            const requestedDays = req.query.days;
            const days = requestedDays === undefined
                ? 7
                : typeof requestedDays === 'string' && /^[1-9]\d{0,2}$/.test(requestedDays)
                    ? Number(requestedDays)
                    : NaN;
            if (!Number.isInteger(days) || days > 365) {
                return res.status(400).send({ code: 400, message: (0, i18n_1.t)('无效的天数') });
            }
            const dates = [];
            for (let i = days - 1; i >= 0; i--) {
                dates.push((0, dayjs_1.default)().subtract(i, 'day').format('YYYY-MM-DD'));
            }
            const rows = (await cronStats_1.CrontabStatModel.findAll({
                attributes: [
                    'date',
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('run_count')), 'total_runs'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('success_count')), 'total_success'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('fail_count')), 'total_fail'],
                ],
                where: {
                    date: { [sequelize_1.Op.in]: dates },
                },
                group: ['date'],
                order: [['date', 'ASC']],
                raw: true,
            }));
            const dataMap = {};
            rows.forEach((r) => {
                dataMap[r.date] = {
                    total: Number(r.total_runs) || 0,
                    success: Number(r.total_success) || 0,
                    fail: Number(r.total_fail) || 0,
                };
            });
            const data = dates.map((d) => (Object.assign({ date: (0, dayjs_1.default)(d).format('MM-DD') }, (dataMap[d] || { total: 0, success: 0, fail: 0 }))));
            res.send({ code: 200, data });
        }
        catch (e) {
            next(e);
        }
    });
    route.get('/top-time', async (req, res, next) => {
        try {
            const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const rows = (await cronStats_1.CrontabStatModel.findAll({
                attributes: [
                    'ref_id',
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('untimed_count')), 'untimed_count'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('total_time')), 'total_time'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('run_count')), 'run_count'],
                    [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('max_time')), 'max_time'],
                ],
                where: { date: today, run_count: { [sequelize_1.Op.gt]: 0 } },
                group: ['ref_id'],
                order: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('total_time')), 'DESC']],
                limit: 5,
                raw: true,
            }));
            const ids = rows.map((r) => Number(r.ref_id));
            const crons = await cron_1.CrontabModel.findAll({
                where: { id: { [sequelize_1.Op.in]: ids } },
                raw: true,
            });
            const nameMap = {};
            crons.forEach((c) => { nameMap[c.id] = c.name || c.command; });
            const data = rows.map((r, i) => ({
                rank: i + 1,
                name: nameMap[Number(r.ref_id)] || (0, i18n_1.tf)('任务#%s', r.ref_id),
                avgTime: averageElapsed(r.total_time, r.run_count, r.untimed_count),
                maxTime: Number(r.max_time),
            }));
            res.send({ code: 200, data });
        }
        catch (e) {
            next(e);
        }
    });
    route.get('/top-count', async (req, res, next) => {
        try {
            const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const rows = (await cronStats_1.CrontabStatModel.findAll({
                attributes: [
                    'ref_id',
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('run_count')), 'run_count'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('untimed_count')), 'untimed_count'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('total_time')), 'total_time'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('success_count')), 'success_count'],
                ],
                where: { date: today, run_count: { [sequelize_1.Op.gt]: 0 } },
                group: ['ref_id'],
                order: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('run_count')), 'DESC']],
                limit: 5,
                raw: true,
            }));
            const ids = rows.map((r) => Number(r.ref_id));
            const crons = await cron_1.CrontabModel.findAll({
                where: { id: { [sequelize_1.Op.in]: ids } },
                raw: true,
            });
            const nameMap = {};
            crons.forEach((c) => { nameMap[c.id] = c.name || c.command; });
            const data = rows.map((r, i) => ({
                rank: i + 1,
                name: nameMap[Number(r.ref_id)] || (0, i18n_1.tf)('任务#%s', r.ref_id),
                runCount: Number(r.run_count),
                avgTime: averageElapsed(r.total_time, r.run_count, r.untimed_count),
                successRate: Number(r.run_count) > 0
                    ? ((Number(r.success_count) / Number(r.run_count)) * 100).toFixed(1)
                    : '0',
            }));
            res.send({ code: 200, data });
        }
        catch (e) {
            next(e);
        }
    });
    route.get('/runtime', async (req, res, next) => {
        try {
            const queued = await new triggerHistory_1.TriggerHistory(cron_1.CrontabModel.sequelize).queueCounts();
            const runningInstances = await runningInstance_1.RunningInstanceModel.findAll({
                where: {
                    status: runningInstance_1.InstanceStatus.running,
                },
                raw: true,
            });
            // Fetch cron names for running instances
            const cronIds = [
                ...new Set(runningInstances.map((i) => i.cron_id)),
            ];
            const crons = cronIds.length > 0
                ? await cron_1.CrontabModel.findAll({
                    where: { id: cronIds },
                    raw: true,
                })
                : [];
            const cronMap = new Map(crons.map((c) => [c.id, c]));
            const now = (0, dayjs_1.default)().unix();
            const running = runningInstances.map((inst) => {
                const cron = cronMap.get(inst.cron_id);
                return {
                    instanceId: inst.id,
                    id: inst.cron_id,
                    name: (cron === null || cron === void 0 ? void 0 : cron.name) || (cron === null || cron === void 0 ? void 0 : cron.command) || (0, i18n_1.tf)('任务#%s', inst.cron_id),
                    pid: inst.pid,
                    elapsed: inst.started_at ? now - inst.started_at : 0,
                    logPath: inst.log_path,
                };
            });
            const dayAgo = (0, dayjs_1.default)().subtract(24, 'hour').unix();
            const idleTasks = await cron_1.CrontabModel.findAll({
                where: {
                    isDisabled: 0,
                    status: 1,
                    last_execution_time: { [sequelize_1.Op.lt]: dayAgo },
                },
                order: [['last_execution_time', 'ASC']],
                limit: 5,
                raw: true,
            });
            res.send({
                code: 200,
                data: {
                    runningCount: running.length,
                    queuedCount: queued.triggers,
                    queuedTasks: queued.tasks,
                    oldestQueued: queued.triggers ? await (0, queueDiagnostics_1.oldestQueued)(cron_1.CrontabModel.sequelize) : [],
                    running,
                    idleTasks: idleTasks.map((c) => ({
                        id: c.id,
                        name: c.name || c.command || (0, i18n_1.tf)('任务#%s', c.id),
                        lastRun: c.last_execution_time
                            ? dayjs_1.default.unix(c.last_execution_time).format('MM-DD HH:mm')
                            : '-',
                    })),
                },
            });
        }
        catch (e) {
            next(e);
        }
    });
    route.get('/labels', async (req, res, next) => {
        try {
            const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const [crons, stats] = (await Promise.all([
                cron_1.CrontabModel.findAll({ where: { isDisabled: 0 }, raw: true }),
                cronStats_1.CrontabStatModel.findAll({ where: { date: today }, raw: true }),
            ]));
            const statMap = {};
            stats.forEach((s) => { statMap[s.ref_id] = s; });
            const labelMap = {};
            crons.forEach((c) => {
                let rawLabels = c.labels;
                if (typeof rawLabels === 'string')
                    rawLabels = JSON.parse(rawLabels);
                const labels = Array.isArray(rawLabels)
                    ? [...new Set(rawLabels.filter((l) => !(0, lodash_1.isEmpty)(l)))]
                    : [];
                if (labels.length === 0) {
                    labels.push((0, i18n_1.t)('未分类'));
                }
                const st = statMap[c.id];
                labels.forEach((label) => {
                    if (!labelMap[label])
                        labelMap[label] = { count: 0, runs: 0, success: 0, untimed: 0, totalTime: 0 };
                    labelMap[label].count += 1;
                    if (st) {
                        labelMap[label].runs += Number(st.run_count) || 0;
                        labelMap[label].success += Number(st.success_count) || 0;
                        labelMap[label].untimed += Number(st.untimed_count) || 0;
                        labelMap[label].totalTime += Number(st.total_time) || 0;
                    }
                });
            });
            const data = Object.entries(labelMap)
                .map(([label, v]) => ({
                label,
                count: v.count,
                todayRuns: v.runs,
                successRate: v.runs > 0 ? ((v.success / v.runs) * 100).toFixed(1) : '0',
                avgTime: averageElapsed(v.totalTime, v.runs, v.untimed),
            }))
                .sort((a, b) => b.todayRuns - a.todayRuns);
            res.send({ code: 200, data });
        }
        catch (e) {
            next(e);
        }
    });
    route.get('/system', async (req, res, next) => {
        try {
            const memUsage = process.memoryUsage();
            res.send({
                code: 200,
                data: Object.assign(Object.assign({ platform: os_1.default.platform(), uptime: Math.floor(process.uptime()) }, (0, containerResources_1.containerResources)()), { heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), loadAvg: os_1.default.loadavg().map((v) => Number(v.toFixed(2))) }),
            });
        }
        catch (e) {
            next(e);
        }
    });
};
//# sourceMappingURL=dashboard.js.map