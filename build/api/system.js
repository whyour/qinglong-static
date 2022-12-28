"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const system_1 = __importDefault(require("../services/system"));
const celebrate_1 = require("celebrate");
const user_1 = __importDefault(require("../services/user"));
const env_1 = require("../data/env");
const util_1 = require("../config/util");
const dayjs_1 = __importDefault(require("dayjs"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/system', route);
    route.get('/', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const authInfo = await userService.getUserInfo();
            const envCount = await env_1.EnvModel.count();
            const { version, changeLog, changeLogLink } = await (0, util_1.parseVersion)(config_1.default.versionFile);
            const lastCommitTime = (await (0, util_1.promiseExec)(`cd ${config_1.default.rootPath} && git show -s --format=%ai | head -1`)).replace('\n', '');
            const lastCommitId = (await (0, util_1.promiseExec)(`cd ${config_1.default.rootPath} && git rev-parse --short HEAD`)).replace('\n', '');
            const branch = (await (0, util_1.promiseExec)(`cd ${config_1.default.rootPath} && git symbolic-ref --short HEAD`)).replace('\n', '');
            let isInitialized = true;
            if (Object.keys(authInfo).length === 2 &&
                authInfo.username === 'admin' &&
                authInfo.password === 'admin' &&
                envCount === 0) {
                isInitialized = false;
            }
            res.send({
                code: 200,
                data: {
                    isInitialized,
                    version,
                    lastCommitTime: (0, dayjs_1.default)(lastCommitTime).unix(),
                    lastCommitId,
                    branch,
                    changeLog,
                    changeLogLink,
                },
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/log/remove', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const data = await systemService.getLogRemoveFrequency();
            res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/log/remove', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            frequency: celebrate_1.Joi.number().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.updateLogRemoveFrequency(req.body.frequency);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/update-check', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.checkUpdate();
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/update', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.updateSystem();
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/notify', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            title: celebrate_1.Joi.string().required(),
            content: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.notify(req.body);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=system.js.map