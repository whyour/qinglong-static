"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = require("typedi");
const fs = __importStar(require("fs"));
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
    route.put('/command-run', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            command: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const uniqPath = await (0, util_1.getUniqPath)(req.body.command);
            const logTime = (0, dayjs_1.default)().format('YYYY-MM-DD-HH-mm-ss-SSS');
            const logPath = `${uniqPath}/${logTime}.log`;
            res.setHeader('Content-type', 'application/octet-stream');
            await systemService.run(Object.assign(Object.assign({}, req.body), { logPath }), {
                onEnd: async (cp, endTime, diff) => {
                    res.end();
                },
                onError: async (message) => {
                    res.write(`\n${message}`);
                    const absolutePath = await (0, util_1.handleLogPath)(logPath);
                    fs.appendFileSync(absolutePath, `\n${message}`);
                },
                onLog: async (message) => {
                    res.write(`\n${message}`);
                    const absolutePath = await (0, util_1.handleLogPath)(logPath);
                    fs.appendFileSync(absolutePath, `\n${message}`);
                },
            });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/command-stop', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            command: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.stop(req.body);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=system.js.map