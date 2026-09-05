"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const celebrate_1 = require("celebrate");
const express_1 = require("express");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const i18n_1 = require("../shared/i18n");
const util_1 = require("../config/util");
const log_1 = __importDefault(require("../services/log"));
const runningInstance_1 = require("../data/runningInstance");
const logReader_1 = require("../shared/logReader");
const route = (0, express_1.Router)();
const blacklist = ['.tmp'];
exports.default = (app) => {
    app.use('/logs', route);
    route.get('/', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const result = await (0, util_1.readDirs)(config_1.default.logPath, config_1.default.logPath, blacklist);
            res.send({
                code: 200,
                data: result,
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/detail', (0, celebrate_1.celebrate)({
        query: celebrate_1.Joi.object({
            path: celebrate_1.Joi.string().allow('').optional(),
            file: celebrate_1.Joi.string().required(),
            offset: celebrate_1.Joi.number().integer().min(0).optional(),
            limit: celebrate_1.Joi.number()
                .integer()
                .min(1)
                .max(logReader_1.MAX_LOG_CHUNK_BYTES)
                .optional(),
            tail: celebrate_1.Joi.boolean().optional(),
            t: celebrate_1.Joi.string().optional(),
        }).unknown(true),
    }), async (req, res, next) => {
        try {
            const logService = typedi_1.Container.get(log_1.default);
            const finalPath = logService.checkFilePath(req.query.path || '', req.query.file || '');
            if (!finalPath || blacklist.includes(req.query.path)) {
                return res.send({
                    code: 403,
                    message: (0, i18n_1.t)('暂无权限'),
                });
            }
            const logPath = `${req.query.path}/${req.query.file}`;
            const runningInstance = await runningInstance_1.RunningInstanceModel.findOne({
                where: { log_path: logPath, status: runningInstance_1.InstanceStatus.running },
            });
            const chunk = await (0, logReader_1.readLogChunk)(finalPath, {
                offset: req.query.offset,
                limit: req.query.limit,
                tail: req.query.tail,
            });
            res.send({
                code: 200,
                data: (0, util_1.removeAnsi)(chunk.content),
                logStatus: runningInstance ? 'running' : undefined,
                offset: chunk.offset,
                nextOffset: chunk.nextOffset,
                total: chunk.total,
                truncated: chunk.truncated,
            });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:file', (req, res) => {
        return res.send({
            code: 410,
            message: (0, i18n_1.t)('接口已下线，请使用 /logs/detail 接口'),
        });
    });
    route.delete('/', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().allow(''),
            type: celebrate_1.Joi.string().optional(),
        }),
    }), async (req, res, next) => {
        try {
            let { filename, path } = req.body;
            const logService = typedi_1.Container.get(log_1.default);
            const finalPath = logService.checkFilePath(path, filename);
            if (!finalPath || blacklist.includes(path)) {
                return res.send({
                    code: 403,
                    message: (0, i18n_1.t)('暂无权限'),
                });
            }
            await (0, util_1.rmPath)(finalPath);
            res.send({ code: 200 });
        }
        catch (e) {
            return next(e);
        }
    });
    route.post('/download', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().allow(''),
        }),
    }), async (req, res, next) => {
        try {
            let { filename, path } = req.body;
            const logService = typedi_1.Container.get(log_1.default);
            const filePath = logService.checkFilePath(path, filename);
            if (!filePath) {
                return res.send({
                    code: 403,
                    message: (0, i18n_1.t)('暂无权限'),
                });
            }
            return res.download(filePath, filename, (err) => {
                if (err) {
                    return next(err);
                }
            });
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=log.js.map