"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const celebrate_1 = require("celebrate");
const express_1 = require("express");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
const log_1 = __importDefault(require("../services/log"));
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
    route.get('/detail', async (req, res, next) => {
        try {
            const logService = typedi_1.Container.get(log_1.default);
            const finalPath = logService.checkFilePath(req.query.path || '', req.query.file || '');
            if (!finalPath || blacklist.includes(req.query.path)) {
                return res.send({
                    code: 403,
                    message: '暂无权限',
                });
            }
            const content = await (0, util_1.getFileContentByName)(finalPath);
            res.send({ code: 200, data: (0, util_1.removeAnsi)(content) });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:file', async (req, res, next) => {
        try {
            const logService = typedi_1.Container.get(log_1.default);
            const finalPath = logService.checkFilePath(req.query.path || '', req.params.file || '');
            if (!finalPath || blacklist.includes(req.query.path)) {
                return res.send({
                    code: 403,
                    message: '暂无权限',
                });
            }
            const content = await (0, util_1.getFileContentByName)(finalPath);
            res.send({ code: 200, data: content });
        }
        catch (e) {
            return next(e);
        }
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
                    message: '暂无权限',
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
                    message: '暂无权限',
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