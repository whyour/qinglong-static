"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const cookie_1 = __importDefault(require("../services/cookie"));
const celebrate_1 = require("celebrate");
const route = express_1.Router();
exports.default = (app) => {
    app.use('/', route);
    route.get('/cookies', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.cookies('', { position: -1 }, true);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/cookies', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()).min(1),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.create(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/cookies', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            value: celebrate_1.Joi.string().required(),
            _id: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.update(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/cookies', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.remove(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/cookies/:id/move', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.string().required(),
        }),
        body: celebrate_1.Joi.object({
            fromIndex: celebrate_1.Joi.number().required(),
            toIndex: celebrate_1.Joi.number().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.move(req.params.id, req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/cookies/:id/refresh', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.refreshCookie(req.params.id);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/cookies/disable', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.disabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/cookies/enable', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.enabled(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/cookies/:id', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const cookieService = typedi_1.Container.get(cookie_1.default);
            const data = await cookieService.get(req.params.id);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=cookie.js.map