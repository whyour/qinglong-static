"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const cron_1 = __importDefault(require("../services/cron"));
const celebrate_1 = require("celebrate");
const cron_parser_1 = __importDefault(require("cron-parser"));
const route = express_1.Router();
exports.default = (app) => {
    app.use('/', route);
    route.get('/crons', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.crontabs(req.query.searchValue);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/crons', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            command: celebrate_1.Joi.string().required(),
            schedule: celebrate_1.Joi.string().required(),
            name: celebrate_1.Joi.string().optional(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            if (cron_parser_1.default.parseExpression(req.body.schedule).hasNext()) {
                const cronService = typedi_1.Container.get(cron_1.default);
                const data = await cronService.create(req.body);
                return res.send({ code: 200, data });
            }
            else {
                return res.send({ code: 400, message: 'param schedule error' });
            }
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/crons/run', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.run(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/crons/stop', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.stop(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/crons/disable', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.disabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/crons/enable', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.enabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/crons/:id/log', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.log(req.params.id);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/crons', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            command: celebrate_1.Joi.string().optional(),
            schedule: celebrate_1.Joi.string().optional(),
            name: celebrate_1.Joi.string().optional(),
            _id: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            if (!req.body.schedule ||
                cron_parser_1.default.parseExpression(req.body.schedule).hasNext()) {
                const cronService = typedi_1.Container.get(cron_1.default);
                const data = await cronService.update(req.body);
                return res.send({ code: 200, data });
            }
            else {
                return res.send({ code: 400, message: 'param schedule error' });
            }
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/crons', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.remove(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/crons/import', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.import_crontab();
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/crons/:id', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.get(req.params.id);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/crons/status', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            ids: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
            status: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cronService = typedi_1.Container.get(cron_1.default);
            const data = await cronService.status(Object.assign(Object.assign({}, req.body), { status: parseInt(req.body.status) }));
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=cron.js.map