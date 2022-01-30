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
const path_1 = __importStar(require("path"));
const script_1 = __importDefault(require("../services/script"));
const route = express_1.Router();
exports.default = (app) => {
    app.use('/scripts', route);
    route.get('/files', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const fileList = fs.readdirSync(config_1.default.scriptPath, 'utf-8');
            let result = [];
            for (let i = 0; i < fileList.length; i++) {
                const fileOrDir = fileList[i];
                const fPath = path_1.default.join(config_1.default.scriptPath, fileOrDir);
                const dirStat = fs.statSync(fPath);
                if (['node_modules'].includes(fileOrDir)) {
                    continue;
                }
                if (dirStat.isDirectory()) {
                    const childFileList = fs.readdirSync(fPath, 'utf-8');
                    let children = [];
                    for (let j = 0; j < childFileList.length; j++) {
                        const childFile = childFileList[j];
                        const sPath = path_1.default.join(config_1.default.scriptPath, fileOrDir, childFile);
                        const _fileExist = await util_1.fileExist(sPath);
                        if (_fileExist && fs.statSync(sPath).isFile()) {
                            const statObj = fs.statSync(sPath);
                            children.push({
                                title: childFile,
                                value: childFile,
                                key: `${fileOrDir}/${childFile}`,
                                mtime: statObj.mtimeMs,
                                parent: fileOrDir,
                            });
                        }
                    }
                    result.push({
                        title: fileOrDir,
                        value: fileOrDir,
                        key: fileOrDir,
                        mtime: dirStat.mtimeMs,
                        disabled: true,
                        children: children.sort((a, b) => b.mtime - a.mtime),
                    });
                }
                else {
                    result.push({
                        title: fileOrDir,
                        value: fileOrDir,
                        key: fileOrDir,
                        mtime: dirStat.mtimeMs,
                    });
                }
            }
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
            const filePath = path_1.join(config_1.default.scriptPath, req.query.path, req.params.file);
            const content = util_1.getFileContentByName(filePath);
            res.send({ code: 200, data: content });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
            content: celebrate_1.Joi.string().allow(''),
            originFilename: celebrate_1.Joi.string().allow(''),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, path, content, originFilename } = req.body;
            if (!path) {
                path = config_1.default.scriptPath;
            }
            if (!path.endsWith('/')) {
                path += '/';
            }
            if (!path.startsWith('/')) {
                path = `${config_1.default.scriptPath}${path}`;
            }
            if (config_1.default.writePathList.every((x) => !path.startsWith(x))) {
                return res.send({
                    code: 430,
                    data: '文件路径禁止访问',
                });
            }
            if (!originFilename) {
                originFilename = filename;
            }
            const originFilePath = `${path}${originFilename.replace(/\//g, '')}`;
            const filePath = `${path}${filename.replace(/\//g, '')}`;
            if (fs.existsSync(originFilePath)) {
                if (!fs.existsSync(config_1.default.bakPath)) {
                    fs.mkdirSync(config_1.default.bakPath);
                }
                fs.copyFileSync(originFilePath, `${config_1.default.bakPath}${originFilename.replace(/\//g, '')}`);
                if (filename !== originFilename) {
                    fs.unlinkSync(originFilePath);
                }
            }
            fs.writeFileSync(filePath, content);
            return res.send({ code: 200 });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
            content: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, content, path } = req.body;
            const filePath = path_1.join(config_1.default.scriptPath, path, filename);
            fs.writeFileSync(filePath, content);
            return res.send({ code: 200 });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().allow(''),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, path } = req.body;
            const filePath = path_1.join(config_1.default.scriptPath, path, filename);
            fs.unlinkSync(filePath);
            res.send({ code: 200 });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/download', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename } = req.body;
            const filePath = `${config_1.default.scriptPath}${filename}`;
            // const stats = fs.statSync(filePath);
            // res.set({
            //   'Content-Type': 'application/octet-stream', //告诉浏览器这是一个二进制文件
            //   'Content-Disposition': 'attachment; filename=' + filename, //告诉浏览器这是一个需要下载的文件
            //   'Content-Length': stats.size  //文件大小
            // });
            // fs.createReadStream(filePath).pipe(res);
            return res.download(filePath, filename, (err) => {
                return next(err);
            });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/run', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, path } = req.body;
            const filePath = path_1.join(path, filename);
            const scriptService = typedi_1.Container.get(script_1.default);
            const result = await scriptService.runScript(filePath);
            res.send(result);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/stop', celebrate_1.celebrate({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, path } = req.body;
            const filePath = path_1.join(path, filename);
            const scriptService = typedi_1.Container.get(script_1.default);
            const result = await scriptService.stopScript(filePath);
            res.send(result);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=script.js.map