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
const identity_1 = require("../cron/identity");
const legacyDailyStatistics_1 = require("../cron/settlement/legacyDailyStatistics");
const errors_1 = require("../shared/errors");
const history_1 = require("../cron/history");
const cronPreview_1 = require("../cron/queries/cronPreview");
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const typedi_1 = require("typedi");
const cron_1 = __importDefault(require("../services/cron"));
const cronView_1 = __importDefault(require("../services/cronView"));
const celebrate_1 = require("celebrate");
const schedule_1 = require("../validation/schedule");
const runningInstance_1 = require("../data/runningInstance");
const i18n_1 = require("../shared/i18n");
const client_1 = __importDefault(require("../schedule/client"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/crons', route);
    route.use(async (req, res, next) => {
        // Keep stop/status callbacks available even when the scheduler is down.
        if (['POST', 'PUT', 'DELETE'].includes(req.method) &&
            [
                '/',
                '/run',
                '/enable',
                '/disable',
                '/views/enable',
                '/views/disable',
            ].includes(req.path)) {
            try {
                await client_1.default.readiness.ensureReady();
            }
            catch (error) {
                return next(error);
            }
        }
        return next();
    });
    route.get('/views', async (req, res, next) => {
        try {
            const cronViewService = typedi_1.Container.get(cronView_1.default);
            const data = await cronViewService.list();
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.post('/views', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            name: celebrate_1.Joi.string().required(),
            sorts: celebrate_1.Joi.array().optional().allow(null),
            filters: celebrate_1.Joi.array().optional(),
            filterRelation: celebrate_1.Joi.string().optional(),
        }),
    }), async (req, res, next) => {
        try {
            const cronViewService = typedi_1.Container.get(cronView_1.default);
            const data = await cronViewService.create(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/views', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            name: celebrate_1.Joi.string().required(),
            id: celebrate_1.Joi.number().required(),
            sorts: celebrate_1.Joi.array().optional().allow(null),
            filters: celebrate_1.Joi.array().optional(),
            filterRelation: celebrate_1.Joi.string().optional(),
        }),
    }), async (req, res, next) => {
        try {
            const cronViewService = typedi_1.Container.get(cronView_1.default);
            if (req.body.type === 1) {
                return res.send({ code: 400, message: (0, i18n_1.t)('参数错误') });
            }
            else {
                const data = await cronViewService.update(req.body);
                return res.send({ code: 200, data });
            }
        }
        catch (e) {
            return next(e);
        }
    });
    route.delete('/views', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        try {
            const cronViewService = typedi_1.Container.get(cronView_1.default);
            const data = await cronViewService.remove(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/views/move', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            fromIndex: celebrate_1.Joi.number().required(),
            toIndex: celebrate_1.Joi.number().required(),
            id: celebrate_1.Joi.number().required(),
        }),
    }), async (req, res, next) => {
        try {
            const cronViewService = typedi_1.Container.get(cronView_1.default);
            const data = await cronViewService.move(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/views/disable', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronViewService = typedi_1.Container.get(cronView_1.default);
            const data = await cronViewService.disabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/views/enable', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronViewService = typedi_1.Container.get(cronView_1.default);
            const data = await cronViewService.enabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const result = await cronService.crontabs(req.query, true);
            return res.send({
                code: 200,
                data: Object.assign(Object.assign({}, result), { data: result.data.map(cronPreview_1.withNextRun) }),
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/preview', (0, celebrate_1.celebrate)({
        query: celebrate_1.Joi.object({
            schedule: celebrate_1.Joi.string().required(),
        }).unknown(true),
    }), (req, res) => {
        try {
            const times = (0, cronPreview_1.previewSchedule)(String(req.query.schedule), 3, Date.now());
            return res.send({
                code: 200,
                data: {
                    times,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            });
        }
        catch (_a) {
            return res
                .status(400)
                .send({ code: 400, message: (0, i18n_1.t)('Cron表达式格式有误') });
        }
    });
    route.get('/detail', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.find(req.query);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object(schedule_1.commonCronSchema),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.create(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            if (e instanceof errors_1.PendingCronInstall) {
                return res.status(e.status).send({
                    code: e.status,
                    message: e.message,
                    data: { id: e.cronId, saved: false },
                });
            }
            return next(e);
        }
    });
    route.put('/run', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.run(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/stop', (0, celebrate_1.celebrate)({
        headers: celebrate_1.Joi.object({
            'idempotency-key': celebrate_1.Joi.string().guid().optional(),
        }).unknown(true),
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.stop(req.body, req.get('Idempotency-Key'));
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.delete('/labels', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            ids: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
            labels: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.removeLabels(req.body.ids, req.body.labels);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.post('/labels', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            ids: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
            labels: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.addLabels(req.body.ids, req.body.labels);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/disable', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.disabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/enable', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.enabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:id/log', (0, celebrate_1.celebrate)({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.number().required(),
        }),
        query: celebrate_1.Joi.object({
            triggerId: celebrate_1.Joi.string().max(256).optional(),
            instanceId: celebrate_1.Joi.number().integer().positive().optional(),
            previousPath: celebrate_1.Joi.string().optional(),
            follow: celebrate_1.Joi.boolean().optional(),
            cursor: celebrate_1.Joi.string()
                .pattern(/^\d{1,16}\.[a-f0-9]{64}$/)
                .optional(),
            offset: celebrate_1.Joi.number().integer().min(0).optional(),
            limit: celebrate_1.Joi.number()
                .integer()
                .min(1)
                .max(1024 * 1024)
                .optional(),
            tail: celebrate_1.Joi.boolean().optional(),
            t: celebrate_1.Joi.string().optional(),
        }).unknown(true),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const result = await cronService.log(req.params.id, {
                triggerId: req.query.triggerId,
                instanceId: req.query.instanceId === undefined
                    ? undefined
                    : Number(req.query.instanceId),
                previousPath: req.query.previousPath,
                follow: req.query.follow,
                cursor: req.query.cursor,
                offset: req.query.offset,
                limit: req.query.limit,
                tail: req.query.tail,
            });
            return res.send({
                code: 200,
                data: result.content,
                logStatus: result.status,
                logPath: result.logPath,
                triggerId: result.triggerId,
                cursor: result.cursor,
                reset: result.reset,
                offset: result.offset,
                nextOffset: result.nextOffset,
                total: result.total,
                truncated: result.truncated,
            });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object(Object.assign(Object.assign({}, schedule_1.commonCronSchema), { id: celebrate_1.Joi.number().required() })),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.update(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.delete('/', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array()
            .min(1)
            .items(celebrate_1.Joi.number().integer().positive(), celebrate_1.Joi.object({
            id: celebrate_1.Joi.number().integer().positive().required(),
            script: celebrate_1.Joi.string().required(),
            revision: celebrate_1.Joi.number().integer(),
            command: celebrate_1.Joi.string(),
            sub_id: celebrate_1.Joi.number().integer().allow(null),
        })),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.remove(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/pin', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.pin(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/unpin', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.unPin(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/import', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.importCrontab();
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:id', (0, celebrate_1.celebrate)({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.number().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.getDb({ id: req.params.id }, true);
            return res.send({ code: 200, data: (0, cronPreview_1.withNextRun)(data) });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/status', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            ids: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
            status: celebrate_1.Joi.string().required(),
            pid: celebrate_1.Joi.string().optional().allow(null),
            log_path: celebrate_1.Joi.string().optional().allow(null),
            last_running_time: celebrate_1.Joi.number().optional().allow(null),
            last_execution_time: celebrate_1.Joi.number().optional().allow(null),
            exit_code: celebrate_1.Joi.number().optional().allow(null),
            trigger_stopped: celebrate_1.Joi.boolean().optional(),
            execution_id: celebrate_1.Joi.string().pattern(identity_1.executionIdPattern).optional(),
            trigger_id: celebrate_1.Joi.string()
                .pattern(/^[a-z0-9-]{1,120}$/)
                .optional(),
        }).oxor('execution_id', 'trigger_id'),
    }), async (req, res, next) => {
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const _a = req.body, { execution_id } = _a, body = __rest(_a, ["execution_id"]);
            const data = await cronService.status(Object.assign(Object.assign(Object.assign(Object.assign({}, body), { finished_at: (0, identity_1.receiptFinishTime)(req.get('X-QL-Finished-At')) }), (execution_id && { trigger_id: (0, identity_1.executionTriggerId)(execution_id) })), { status: req.body.status ? parseInt(req.body.status) : undefined, pid: req.body.pid ? parseInt(req.body.pid) : undefined }));
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:id/daily-results', (0, celebrate_1.celebrate)({
        params: celebrate_1.Joi.object({ id: celebrate_1.Joi.number().integer().positive().required() }),
    }), async (req, res, next) => {
        try {
            const data = await (0, legacyDailyStatistics_1.readDailyResults)(runningInstance_1.RunningInstanceModel.sequelize, Number(req.params.id));
            return res.send({ code: 200, data });
        }
        catch (error) {
            return next(error);
        }
    });
    route.get('/:id/triggers', (0, celebrate_1.celebrate)({
        params: celebrate_1.Joi.object({ id: celebrate_1.Joi.number().integer().positive().required() }),
        query: celebrate_1.Joi.object({
            offset: celebrate_1.Joi.number().integer().min(0),
            limit: celebrate_1.Joi.number().integer().min(1).max(26).default(25),
            ids: celebrate_1.Joi.array().items(celebrate_1.Joi.string().max(256)).min(1).max(25).single(),
            beforeTime: celebrate_1.Joi.number().integer().min(0),
            beforeId: celebrate_1.Joi.string().max(256),
        })
            .and('beforeTime', 'beforeId')
            .oxor('offset', 'beforeTime', 'ids')
            .unknown(true),
    }), async (req, res, next) => {
        try {
            const { offset, limit, beforeTime, beforeId, ids } = req.query;
            const history = (0, history_1.triggerHistory)();
            const before = beforeId
                ? { time: Number(beforeTime), id: String(beforeId) }
                : undefined;
            const data = ids
                ? await history.visibleTriggers(Number(req.params.id), ids)
                : await history.recent(Number(req.params.id), Number(offset || 0), Number(limit), before);
            if (req.query.withQueueWait === 'true') {
                const now = Date.now();
                return res.send({
                    code: 200,
                    data: data.map((row) => {
                        var _a;
                        return row.state === 'queued' && row.queued_at != null
                            ? Object.assign(Object.assign({}, row), { queue_wait_ms: Math.max(0, ((_a = row.dequeued_at) !== null && _a !== void 0 ? _a : now) - row.queued_at) }) : row;
                    }),
                });
            }
            return res.send({ code: 200, data });
        }
        catch (err) {
            next(err);
        }
    });
    route.get('/:id/instances', (0, celebrate_1.celebrate)({
        // This route historically ignored query parameters. Only validate and
        // apply cursor options when the caller explicitly requests pagination.
        query: celebrate_1.Joi.alternatives().conditional(celebrate_1.Joi.object({ paged: celebrate_1.Joi.valid('true').required() }).unknown(), {
            then: celebrate_1.Joi.object({
                limit: celebrate_1.Joi.number().integer().min(1).max(100),
                before: celebrate_1.Joi.number().integer().positive(),
                ids: celebrate_1.Joi.string().pattern(/^\d+(,\d+){0,99}$/),
            })
                .unknown(true)
                .oxor('ids', 'limit')
                .oxor('ids', 'before'),
            otherwise: celebrate_1.Joi.object().unknown(true),
        }),
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.number().required(),
        }),
    }), async (req, res, next) => {
        var _a;
        try {
            // The instance row may retain a provisional end for cleanup after a restart.
            const pending = `EXISTS (SELECT 1 FROM CronTriggers t WHERE t.instance_id=RunningInstance.id
          AND (t.exit_pending=1 OR (t.state='unknown' AND t.reason='restart')))`;
            const paged = req.query.paged === 'true';
            const ids = paged && req.query.ids
                ? String(req.query.ids).split(',').map(Number)
                : undefined;
            const limit = paged && !ids ? Number((_a = req.query.limit) !== null && _a !== void 0 ? _a : 25) : undefined;
            const instances = await runningInstance_1.RunningInstanceModel.findAll(Object.assign(Object.assign({ attributes: {
                    exclude: ['finished_at', 'exit_code'],
                    include: [
                        [
                            (0, sequelize_1.literal)(`CASE WHEN ${pending} THEN NULL ELSE finished_at END`),
                            'finished_at',
                        ],
                        [
                            (0, sequelize_1.literal)(`CASE WHEN ${pending} THEN NULL ELSE exit_code END`),
                            'exit_code',
                        ],
                    ],
                }, where: Object.assign(Object.assign({ cron_id: req.params.id }, (ids && { id: { [sequelize_1.Op.in]: ids } })), (paged &&
                    req.query.before && {
                    id: { [sequelize_1.Op.lt]: Number(req.query.before) },
                })), order: paged
                    ? [['id', 'DESC']]
                    : [
                        ['started_at', 'DESC'],
                        ['id', 'DESC'],
                    ] }, (limit && { limit: limit + 1 })), { raw: true }));
            if (limit)
                return res.send({
                    code: 200,
                    data: instances.slice(0, limit),
                    next: instances.length > limit ? instances[limit - 1].id : null,
                });
            return res.send({ code: 200, data: instances });
        }
        catch (e) {
            return next(e);
        }
    });
    route.post('/:id/instances/:instanceId/stop', (0, celebrate_1.celebrate)({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.number().required(),
            instanceId: celebrate_1.Joi.number().required(),
        }),
    }), async (req, res, next) => {
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.stopInstance(Number(req.params.id), Number(req.params.instanceId));
            return res.status(data.code).send(data);
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:id/logs', (0, celebrate_1.celebrate)({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.number().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.logs(req.params.id);
            return res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=cron.js.map