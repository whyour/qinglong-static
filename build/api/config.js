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
const config_1 = __importDefault(require("../config"));
const fs = __importStar(require("fs/promises"));
const celebrate_1 = require("celebrate");
const path_1 = require("path");
const const_1 = require("../config/const");
const config_2 = __importDefault(require("../services/config"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/configs', route);
    route.get('/samples', async (req, res, next) => {
        try {
            res.send({
                code: 200,
                data: const_1.SAMPLE_FILES,
            });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/files', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const fileList = await fs.readdir(config_1.default.configPath, 'utf-8');
            res.send({
                code: 200,
                data: fileList
                    .filter((x) => !config_1.default.blackFileList.includes(x))
                    .map((x) => {
                    return { title: x, value: x };
                }),
            });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/detail', async (req, res, next) => {
        try {
            const configService = typedi_1.Container.get(config_2.default);
            await configService.getFile(req.query.path, res);
        }
        catch (e) {
            return next(e);
        }
    });
    route.post('/save', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            name: celebrate_1.Joi.string().required(),
            content: celebrate_1.Joi.string().allow('').optional(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const { name, content } = req.body;
            if (config_1.default.blackFileList.includes(name)) {
                res.send({ code: 403, message: '文件无法访问' });
            }
            let path = (0, path_1.join)(config_1.default.configPath, name);
            if (name.startsWith('data/scripts/')) {
                path = (0, path_1.join)(config_1.default.rootPath, name);
            }
            await fs.writeFile(path, content);
            res.send({ code: 200, message: '保存成功' });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:file', async (req, res, next) => {
        try {
            const configService = typedi_1.Container.get(config_2.default);
            await configService.getFile(req.params.file, res);
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=config.js.map