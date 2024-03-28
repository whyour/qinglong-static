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
const fs = __importStar(require("fs/promises"));
const config_1 = __importDefault(require("../config"));
const system_1 = __importDefault(require("../services/system"));
const celebrate_1 = require("celebrate");
const user_1 = __importDefault(require("../services/user"));
const util_1 = require("../config/util");
const dayjs_1 = __importDefault(require("dayjs"));
const multer_1 = __importDefault(require("multer"));
const route = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config_1.default.tmpPath);
    },
    filename: function (req, file, cb) {
        cb(null, 'data.tgz');
    },
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = (app) => {
    app.use('/system', route);
    route.get('/', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const userService = typedi_1.Container.get(user_1.default);
            const authInfo = await userService.getUserInfo();
            const { version, changeLog, changeLogLink, publishTime } = await (0, util_1.parseVersion)(config_1.default.versionFile);
            let isInitialized = true;
            if (Object.keys(authInfo).length === 2 &&
                authInfo.username === 'admin' &&
                authInfo.password === 'admin') {
                isInitialized = false;
            }
            res.send({
                code: 200,
                data: {
                    isInitialized,
                    version,
                    publishTime: (0, dayjs_1.default)(publishTime).unix(),
                    branch: process.env.QL_BRANCH || 'master',
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
    route.get('/config', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const data = await systemService.getSystemConfig();
            res.send({ code: 200, data });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/config/log-remove-frequency', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            logRemoveFrequency: celebrate_1.Joi.number().allow(null),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.updateLogRemoveFrequency(req.body);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/config/cron-concurrency', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            cronConcurrency: celebrate_1.Joi.number().allow(null),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.updateCronConcurrency(req.body);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/config/dependence-proxy', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            dependenceProxy: celebrate_1.Joi.string().allow('').allow(null),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.updateDependenceProxy(req.body);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/config/node-mirror', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            nodeMirror: celebrate_1.Joi.string().allow('').allow(null),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            res.setHeader('Content-type', 'application/octet-stream');
            await systemService.updateNodeMirror(req.body, res);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/config/python-mirror', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            pythonMirror: celebrate_1.Joi.string().allow('').allow(null),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.updatePythonMirror(req.body);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/config/linux-mirror', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            linuxMirror: celebrate_1.Joi.string().allow('').allow(null),
        }),
    }), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            res.setHeader('Content-type', 'application/octet-stream');
            await systemService.updateLinuxMirror(req.body, res);
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
    route.put('/reload', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            type: celebrate_1.Joi.string().optional().allow('').allow(null),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.reloadSystem(req.body.type);
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
            const command = req.body.command;
            const idStr = `cat ${config_1.default.crontabFile} | grep -E "${command}" | perl -pe "s|.*ID=(.*) ${command}.*|\\1|" | head -1 | awk -F " " '{print $1}' | xargs echo -n`;
            let id = await (0, util_1.promiseExec)(idStr);
            const uniqPath = await (0, util_1.getUniqPath)(command, id);
            const logTime = (0, dayjs_1.default)().format('YYYY-MM-DD-HH-mm-ss-SSS');
            const logPath = `${uniqPath}/${logTime}.log`;
            res.setHeader('Content-type', 'application/octet-stream');
            await systemService.run(Object.assign(Object.assign({}, req.body), { logPath }), {
                onStart: async (cp, startTime) => {
                    res.setHeader('QL-Task-Pid', `${cp.pid}`);
                },
                onEnd: async (cp, endTime, diff) => {
                    res.end();
                },
                onError: async (message) => {
                    res.write(`\n${message}`);
                    const absolutePath = await (0, util_1.handleLogPath)(logPath);
                    await fs.appendFile(absolutePath, `\n${message}`);
                },
                onLog: async (message) => {
                    res.write(`\n${message}`);
                    const absolutePath = await (0, util_1.handleLogPath)(logPath);
                    await fs.appendFile(absolutePath, `\n${message}`);
                },
            });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/command-stop', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            command: celebrate_1.Joi.string().optional(),
            pid: celebrate_1.Joi.number().optional(),
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
    route.put('/data/export', async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            await systemService.exportData(res);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/data/import', upload.single('data'), async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            const result = await systemService.importData();
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/log', async (req, res, next) => {
        try {
            const systemService = typedi_1.Container.get(system_1.default);
            await systemService.getSystemLog(res);
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=system.js.map