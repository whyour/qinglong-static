"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const user_1 = __importDefault(require("../services/user"));
const celebrate_1 = require("celebrate");
const route = express_1.Router();
exports.default = (app) => {
    app.use('/user', route);
    route.post('/login', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            username: celebrate_1.Joi.string().required(),
            password: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const data = await userService.login(Object.assign({}, req.body), req);
            return res.send(data);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/logout', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            await userService.logout(req.platform);
            res.send({ code: 200 });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            username: celebrate_1.Joi.string().required(),
            password: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            await userService.updateUsernameAndPassword(req.body);
            res.send({ code: 200, message: '更新成功' });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const authInfo = await userService.getUserInfo();
            res.send({
                code: 200,
                data: {
                    username: authInfo.username,
                    twoFactorActivated: authInfo.twoFactorActivated,
                },
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/two-factor/init', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const data = await userService.initTwoFactor();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/two-factor/active', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            code: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const data = await userService.activeTwoFactor(req.body.code);
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/two-factor/deactive', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const data = await userService.deactiveTwoFactor();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/two-factor/login', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            code: celebrate_1.Joi.string().required(),
            username: celebrate_1.Joi.string().required(),
            password: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const data = await userService.twoFactorLogin(req.body, req);
            res.send(data);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/login-log', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const data = await userService.getLoginLog();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/notification', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const data = await userService.getNotificationMode();
            res.send({ code: 200, data });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/notification', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const result = await userService.updateNotificationMode(req.body);
            res.send(result);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/init', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            username: celebrate_1.Joi.string().required(),
            password: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            await userService.updateUsernameAndPassword(req.body);
            res.send({ code: 200, message: '更新成功' });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/notification/init', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const result = await userService.updateNotificationMode(req.body);
            res.send(result);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=user.js.map