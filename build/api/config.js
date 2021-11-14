"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const util_1 = require("../config/util");
const express_1 = require("express");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const fs = __importStar(require("fs"));
const celebrate_1 = require("celebrate");
const route = express_1.Router();
exports.default = (app) => {
    app.use('/', route);
    route.get('/configs/files', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const fileList = fs.readdirSync(config_1.default.configPath, 'utf-8');
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
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/configs/:file', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let content = '';
            if (config_1.default.blackFileList.includes(req.params.file)) {
                res.send({ code: 403, message: '文件无法访问' });
            }
            if (req.params.file.includes('sample')) {
                content = util_1.getFileContentByName(`${config_1.default.samplePath}${req.params.file}`);
            }
            else {
                content = util_1.getFileContentByName(`${config_1.default.configPath}${req.params.file}`);
            }
            res.send({ code: 200, data: content });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/configs/save', celebrate_1.celebrate({
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
            const path = `${config_1.default.configPath}${name}`;
            fs.writeFileSync(path, content);
            res.send({ code: 200, message: '保存成功' });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=config.js.map