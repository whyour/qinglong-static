"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const dependence_1 = __importDefault(require("../services/dependence"));
const celebrate_1 = require("celebrate");
const route = express_1.Router();
exports.default = (app) => {
    app.use('/', route);
    route.get('/dependencies', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const dependenceService = typedi_1.Container.get(dependence_1.default);
            const data = await dependenceService.dependencies(req.query);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/dependencies', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.object({
            name: celebrate_1.Joi.string().required(),
            type: celebrate_1.Joi.number().required(),
            remark: celebrate_1.Joi.number().optional().allow(''),
        })),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const dependenceService = typedi_1.Container.get(dependence_1.default);
            const data = await dependenceService.create(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/dependencies', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            name: celebrate_1.Joi.string().required(),
            _id: celebrate_1.Joi.string().required(),
            type: celebrate_1.Joi.number().required(),
            remark: celebrate_1.Joi.number().optional().allow(''),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const dependenceService = typedi_1.Container.get(dependence_1.default);
            const data = await dependenceService.update(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/dependencies', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const dependenceService = typedi_1.Container.get(dependence_1.default);
            const data = await dependenceService.remove(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/dependencies/force', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const dependenceService = typedi_1.Container.get(dependence_1.default);
            const data = await dependenceService.removeDb(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/dependencies/:id', celebrate_1.celebrate({
        params: celebrate_1.Joi.object({
            id: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const dependenceService = typedi_1.Container.get(dependence_1.default);
            const data = await dependenceService.get(req.params.id);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/dependencies/reinstall', celebrate_1.celebrate({
        body: celebrate_1.Joi.array().items(celebrate_1.Joi.string().required()),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const dependenceService = typedi_1.Container.get(dependence_1.default);
            const data = await dependenceService.reInstall(req.body);
            return res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=dependence.js.map