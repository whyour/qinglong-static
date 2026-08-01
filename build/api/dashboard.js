"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const cron_1 = require("../data/cron");
const cronStats_1 = require("../data/cronStats");
const runningInstance_1 = require("../data/runningInstance");
const dayjs_1 = __importDefault(require("dayjs"));
const os_1 = __importDefault(require("os"));
const lodash_1 = require("lodash");
const i18n_1 = require("../shared/i18n");
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/dashboard', route);
    route.post('/record', async (req, res) => {
        try {
            const { ref_id, code, elapsed } = req.body;
            if (!ref_id)
                return res.send({ code: 400, message: 'ref_id required' });
            const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const isSuccess = code === 0 ? 1 : 0;
            const isFail = code !== 0 ? 1 : 0;
            const elapsedMs = (Number(elapsed) || 0) * 1000;
            const existing = await cronStats_1.CrontabStatModel.findOne({
                where: { ref_id: Number(ref_id), date: today },
            });
            if (existing) {
                await cronStats_1.CrontabStatModel.update({
                    run_count: (existing.run_count || 0) + 1,
                    success_count: (existing.success_count || 0) + isSuccess,
                    fail_count: (existing.fail_count || 0) + isFail,
                    total_time: (existing.total_time || 0) + elapsedMs,
                    max_time: Math.max(existing.max_time || 0, elapsedMs),
                }, { where: { id: existing.id } });
            }
            else {
                await cronStats_1.CrontabStatModel.create({
                    ref_id: Number(ref_id),
                    date: today,
                    run_count: 1,
                    success_count: isSuccess,
                    fail_count: isFail,
                    total_time: elapsedMs,
                    max_time: elapsedMs,
                });
            }
            res.send({ code: 200 });
        }
        catch (e) {
            res.send({ code: 500 });
        }
    });
    route.get('/overview', async (req, res, next) => {
        try {
            const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
            const [total, enabled, disabled, stats] = await Promise.all([
                cron_1.CrontabModel.count(),
                cron_1.CrontabModel.count({ where: { isDisabled: 0 } }),
                cron_1.CrontabModel.count({ where: { isDisabled: 1 } }),
                cronStats_1.CrontabStatModel.findOne({
                    attributes: [
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('run_count')), 'total_runs'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('success_count')), 'total_success'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('fail_count')), 'total_fail'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('total_time')), 'total_time'],
                    ],
                    where: { date: today },
                    raw: true,
                }),
            ]);
            const row = stats;
            const totalRuns = Number(row === null || row === void 0 ? void 0 : row.total_runs) || 0;
            const totalSuccess = Number(row === null || row === void 0 ? void 0 : row.total_success) || 0;
            const totalFail = Number(row === null || row === void 0 ? void 0 : row.total_fail) || 0;
            const totalTime = Number(row === null || row === void 0 ? void 0 : row.total_time) || 0;
            res.send({
                code: 200,
                data: {
                    total,
                    enabled,
                    disabled,
                    todayRuns: totalRuns,
                    todaySuccess: totalSuccess,
                    todayFail: totalFail,
                    successRate: totalRuns > 0 ? ((totalSuccess / totalRuns) * 100).toFixed(1) : '0',
                    avgTime: totalRuns > 0 ? Math.round(totalTime / totalRuns) : 0,
                },
            });
        }
        catch (e) {
            next(e);
        }
    });
    route.get('/trend', async (req, res, next) => {
        try {
            const days = parseInt(req.query.days) || 7;
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
                avgTime: Math.round(Number(r.total_time) / Number(r.run_count)),
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
                avgTime: Math.round(Number(r.total_time) / Number(r.run_count)),
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
            const runningInstances = await runningInstance_1.RunningInstanceModel.findAll({
                where: {
                    status: runningInstance_1.InstanceStatus.running,
                },
                raw: true,
            });
            const queuedCrons = await cron_1.CrontabModel.findAll({
                where: {
                    status: 3, // queued
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
                    queuedCount: queuedCrons.length,
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
                        labelMap[label] = { count: 0, runs: 0, success: 0, totalTime: 0 };
                    labelMap[label].count += 1;
                    if (st) {
                        labelMap[label].runs += Number(st.run_count) || 0;
                        labelMap[label].success += Number(st.success_count) || 0;
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
                avgTime: v.runs > 0 ? Math.round(v.totalTime / v.runs) : 0,
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
                data: {
                    platform: os_1.default.platform(),
                    uptime: Math.floor(process.uptime()),
                    memTotal: os_1.default.totalmem(),
                    memFree: os_1.default.freemem(),
                    memUsagePercent: ((1 - os_1.default.freemem() / os_1.default.totalmem()) * 100).toFixed(1),
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                    loadAvg: os_1.default.loadavg().map((v) => Number(v.toFixed(2))),
                    cpus: os_1.default.cpus().length,
                },
            });
        }
        catch (e) {
            next(e);
        }
    });
};
//# sourceMappingURL=dashboard.js.map