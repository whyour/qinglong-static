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
const util_1 = require("../config/util");
const path_1 = require("path");
const celebrate_1 = require("celebrate");
const route = (0, express_1.Router)();
const blacklist = ['.tmp'];
exports.default = (app) => {
    app.use('/logs', route);
    route.get('/', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const result = (0, util_1.readDirs)(config_1.default.logPath, config_1.default.logPath, blacklist);
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
    route.get('/:file', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            if (blacklist.includes(req.path)) {
                return res.send({ code: 403, message: '暂无权限' });
            }
            const filePath = (0, path_1.join)(config_1.default.logPath, (req.query.path || ''), req.params.file);
            const content = (0, util_1.getFileContentByName)(filePath);
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
            type: celebrate_1.Joi.string().optional()
        }),
    }), async (req, res, next) => {
        try {
            let { filename, path, type } = req.body;
            const filePath = (0, path_1.join)(config_1.default.logPath, path, filename);
            if (type === 'directory') {
                (0, util_1.emptyDir)(filePath);
            }
            else {
                fs.unlinkSync(filePath);
            }
            res.send({ code: 200 });
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=log.js.map