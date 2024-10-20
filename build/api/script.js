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
const util_1 = require("../config/util");
const express_1 = require("express");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const fs = __importStar(require("fs/promises"));
const celebrate_1 = require("celebrate");
const path_1 = __importStar(require("path"));
const script_1 = __importDefault(require("../services/script"));
const multer_1 = __importDefault(require("multer"));
const route = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config_1.default.scriptPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = (app) => {
    app.use('/scripts', route);
    route.get('/', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let result = [];
            const blacklist = [
                'node_modules',
                '.git',
                '.pnpm',
                'pnpm-lock.yaml',
                'yarn.lock',
                'package-lock.json',
            ];
            if (req.query.path) {
                const targetPath = path_1.default.join(config_1.default.scriptPath, req.query.path);
                result = await (0, util_1.readDir)(targetPath, config_1.default.scriptPath, blacklist);
            }
            else {
                result = await (0, util_1.readDirs)(config_1.default.scriptPath, config_1.default.scriptPath, blacklist, (a, b) => {
                    if (a.type === b.type) {
                        return a.title.localeCompare(b.title);
                    }
                    else {
                        return a.type === 'directory' ? -1 : 1;
                    }
                });
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
    route.get('/detail', async (req, res, next) => {
        try {
            const scriptService = typedi_1.Container.get(script_1.default);
            const content = await scriptService.getFile(req.query.path, req.query.file);
            res.send({ code: 200, data: content });
        }
        catch (e) {
            return next(e);
        }
    });
    route.get('/:file', async (req, res, next) => {
        try {
            const scriptService = typedi_1.Container.get(script_1.default);
            const content = await scriptService.getFile(req.query.path, req.params.file);
            res.send({ code: 200, data: content });
        }
        catch (e) {
            return next(e);
        }
    });
    route.post('/', upload.single('file'), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, path, content, originFilename, directory } = req.body;
            if (!path) {
                path = config_1.default.scriptPath;
            }
            if (!path.endsWith('/')) {
                path += '/';
            }
            if (!path.startsWith('/')) {
                path = (0, path_1.join)(config_1.default.scriptPath, path);
            }
            if (config_1.default.writePathList.every((x) => !path.startsWith(x))) {
                return res.send({
                    code: 430,
                    message: '文件路径禁止访问',
                });
            }
            if (req.file) {
                await fs.rename(req.file.path, (0, path_1.join)(path, filename));
                return res.send({ code: 200 });
            }
            if (directory) {
                await fs.mkdir((0, path_1.join)(path, directory), { recursive: true });
                return res.send({ code: 200 });
            }
            if (!originFilename) {
                originFilename = filename;
            }
            const originFilePath = (0, path_1.join)(path, `${originFilename.replace(/\//g, '')}`);
            const filePath = (0, path_1.join)(path, `${filename.replace(/\//g, '')}`);
            const fileExists = await (0, util_1.fileExist)(filePath);
            if (fileExists) {
                await fs.copyFile(originFilePath, (0, path_1.join)(config_1.default.bakPath, originFilename.replace(/\//g, '')));
                if (filename !== originFilename) {
                    await (0, util_1.rmPath)(originFilePath);
                }
            }
            await fs.writeFile(filePath, content);
            return res.send({ code: 200 });
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
            content: celebrate_1.Joi.string().required().allow(''),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, content, path } = req.body;
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, filename);
            await fs.writeFile(filePath, content);
            return res.send({ code: 200 });
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
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, path, type } = req.body;
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, filename);
            await (0, util_1.rmPath)(filePath);
            res.send({ code: 200 });
        }
        catch (e) {
            return next(e);
        }
    });
    route.post('/download', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename } = req.body;
            const filePath = (0, path_1.join)(config_1.default.scriptPath, filename);
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
            return next(e);
        }
    });
    route.put('/run', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            content: celebrate_1.Joi.string().optional().allow(''),
            path: celebrate_1.Joi.string().optional().allow(''),
        }),
    }), async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            let { filename, content, path } = req.body;
            const { name, ext } = (0, path_1.parse)(filename);
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, `${name}.swap${ext}`);
            await fs.writeFile(filePath, content || '', { encoding: 'utf8' });
            const scriptService = typedi_1.Container.get(script_1.default);
            const result = await scriptService.runScript(filePath);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/stop', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
            pid: celebrate_1.Joi.number().optional().allow(''),
        }),
    }), async (req, res, next) => {
        try {
            let { filename, path, pid } = req.body;
            const { name, ext } = (0, path_1.parse)(filename);
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, `${name}.swap${ext}`);
            const logPath = (0, path_1.join)(config_1.default.logPath, path, `${name}.swap`);
            const scriptService = typedi_1.Container.get(script_1.default);
            const result = await scriptService.stopScript(filePath, pid);
            setTimeout(() => {
                (0, util_1.rmPath)(logPath);
            }, 3000);
            res.send(result);
        }
        catch (e) {
            return next(e);
        }
    });
    route.put('/rename', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().allow(''),
            newFilename: celebrate_1.Joi.string().required(),
        }),
    }), async (req, res, next) => {
        try {
            let { filename, path, type, newFilename } = req.body;
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, filename);
            const newPath = (0, path_1.join)(config_1.default.scriptPath, path, newFilename);
            await fs.rename(filePath, newPath);
            res.send({ code: 200 });
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=script.js.map