"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const cron_1 = __importDefault(require("../services/cron"));
const cronView_1 = __importDefault(require("../services/cronView"));
const celebrate_1 = require("celebrate");
const schedule_1 = require("../validation/schedule");
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/crons', route);
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
                return res.send({ code: 400, message: '参数错误' });
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
            const data = await cronService.crontabs(req.query);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
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
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.stop(req.body);
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
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.log(req.params.id);
            return res.send({ code: 200, data });
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
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.number().required()),
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
            const data = await cronService.getDb({ id: req.params.id });
            return res.send({ code: 200, data });
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
        }),
    }), async (req, res, next) => {
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.status(Object.assign(Object.assign({}, req.body), { status: req.body.status ? parseInt(req.body.status) : undefined, pid: req.body.pid ? parseInt(req.body.pid) : undefined }));
            return res.send({ code: 200, data });
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