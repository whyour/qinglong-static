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
const crypto_1 = require("crypto");
const fileAccess_1 = require("../shared/fileAccess");
const util_1 = require("../config/util");
const express_1 = require("express");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const fs = __importStar(require("fs/promises"));
const celebrate_1 = require("celebrate");
const path_1 = __importStar(require("path"));
const script_1 = __importDefault(require("../services/script"));
const scriptHistory_1 = __importDefault(require("../services/scriptHistory"));
const i18n_1 = require("../shared/i18n");
const multer_1 = __importDefault(require("multer"));
const utils_1 = require("../shared/utils");
const scriptHistory_2 = require("../shared/scriptHistory");
const route = (0, express_1.Router)();
function isPathAllowed(targetPath) {
    const resolved = path_1.default.resolve(targetPath);
    return config_1.default.writePathList.some((x) => Boolean((0, fileAccess_1.resolveFileAccess)(x, [resolved], 
    // Panel configuration secrets must not restrict user script filenames.
    path_1.default.resolve(x) === path_1.default.resolve(config_1.default.configPath)
        ? config_1.default.blackFileList
        : [])));
}
async function existingWritableRealPath(targetPath) {
    if (!isPathAllowed(targetPath)) {
        throw new scriptHistory_2.ScriptHistoryError(403, '暂无权限');
    }
    const resolved = (0, path_1.resolve)(targetPath);
    for (const writableRoot of config_1.default.writePathList) {
        const root = (0, path_1.resolve)(writableRoot);
        const rootPrefix = root.endsWith(path_1.sep) ? root : root + path_1.sep;
        // Keep an explicit normalized boundary check at the filesystem operation.
        if (!resolved.startsWith(rootPrefix))
            continue;
        const realPath = await fs.realpath(resolved);
        const realRoot = await fs.realpath(root);
        const realRootPrefix = realRoot.endsWith(path_1.sep) ? realRoot : realRoot + path_1.sep;
        if (!realPath.startsWith(realRootPrefix) ||
            !(0, fileAccess_1.resolveFileAccess)(realRoot, [realPath], root === (0, path_1.resolve)(config_1.default.configPath) ? config_1.default.blackFileList : [])) {
            throw new scriptHistory_2.ScriptHistoryError(403, '暂无权限');
        }
        return realPath;
    }
    throw new scriptHistory_2.ScriptHistoryError(403, '暂无权限');
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config_1.default.tmpPath);
    },
    filename: function (req, file, cb) {
        cb(null, (0, crypto_1.randomUUID)());
    },
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = (app) => {
    app.use('/scripts', route);
    route.get('/', (0, celebrate_1.celebrate)({
        query: celebrate_1.Joi.object({
            path: celebrate_1.Joi.string().optional().allow(''),
        }).unknown(true),
    }), async (req, res, next) => {
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
                if (!(0, fileAccess_1.resolveFileAccess)(config_1.default.scriptPath, [req.query.path])) {
                    return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
                }
                result = await (0, util_1.readDir)(req.query.path, config_1.default.scriptPath, blacklist);
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
    route.get('/detail', (0, celebrate_1.celebrate)({
        query: celebrate_1.Joi.object({
            path: celebrate_1.Joi.string().optional().allow(''),
            file: celebrate_1.Joi.string().required(),
        }).unknown(true),
    }), async (req, res, next) => {
        var _a;
        try {
            const scriptService = typedi_1.Container.get(script_1.default);
            const content = await scriptService.getFile(((_a = req.query) === null || _a === void 0 ? void 0 : _a.path) || '', req.query.file);
            res.send({ code: 200, data: content });
        }
        catch (e) {
            return next(e);
        }
    });
    const historyError = (error, res, next) => {
        if (error instanceof scriptHistory_2.ScriptHistoryError) {
            return res.status(error.status).send(Object.assign({ code: error.status, message: (0, i18n_1.t)(error.message) }, (error instanceof scriptHistory_2.HistoryUnavailableError
                ? { historyUnavailable: true, currentHash: error.currentHash }
                : {})));
        }
        return next(error);
    };
    const historyQuery = {
        filename: celebrate_1.Joi.string().required(),
        path: celebrate_1.Joi.string().optional().allow(''),
    };
    route.get('/history', (0, celebrate_1.celebrate)({ query: celebrate_1.Joi.object(historyQuery).unknown(true) }), async (req, res, next) => {
        try {
            const service = typedi_1.Container.get(scriptHistory_1.default);
            const data = await service.list(req.query.path || '', req.query.filename);
            res.send({ code: 200, data });
        }
        catch (error) {
            historyError(error, res, next);
        }
    });
    route.get('/history/detail', (0, celebrate_1.celebrate)({
        query: celebrate_1.Joi.object(Object.assign(Object.assign({}, historyQuery), { id: celebrate_1.Joi.string().uuid().required() })).unknown(true),
    }), async (req, res, next) => {
        try {
            const service = typedi_1.Container.get(scriptHistory_1.default);
            const data = await service.detail(req.query.path || '', req.query.filename, req.query.id);
            res.send({ code: 200, data });
        }
        catch (error) {
            historyError(error, res, next);
        }
    });
    route.put('/history/restore', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object(Object.assign(Object.assign({}, historyQuery), { id: celebrate_1.Joi.string().uuid().required(), expectedHash: celebrate_1.Joi.string().hex().length(64).required() })),
    }), async (req, res, next) => {
        try {
            const { path = '', filename, id, expectedHash } = req.body;
            const service = typedi_1.Container.get(scriptHistory_1.default);
            const data = await service.restore(path, filename, id, expectedHash);
            res.send({ code: 200, data });
        }
        catch (error) {
            historyError(error, res, next);
        }
    });
    route.get('/:file', (req, res) => {
        return res.send({
            code: 410,
            message: (0, i18n_1.t)('接口已下线，请使用 /scripts/detail 接口'),
        });
    });
    route.post('/', (req, res, next) => {
        res.on('finish', () => {
            var _a;
            if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)
                fs.unlink(req.file.path).catch(() => undefined);
        });
        next();
    }, upload.single('file'), (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
            content: celebrate_1.Joi.string().optional().allow(''),
            skipHistory: celebrate_1.Joi.boolean().optional(),
            expectedHash: celebrate_1.Joi.string()
                .hex()
                .length(64)
                .when('skipHistory', { is: true, then: celebrate_1.Joi.required() }),
            originFilename: celebrate_1.Joi.string().optional().allow(''),
            directory: celebrate_1.Joi.string().optional().allow(''),
            file: celebrate_1.Joi.string().optional().allow(''),
        }).unknown(true),
    }), async (req, res, next) => {
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
                    code: 403,
                    message: (0, i18n_1.t)('暂无权限'),
                });
            }
            if (req.file) {
                const uploadPath = (0, path_1.join)(path, filename);
                if (!isPathAllowed(uploadPath)) {
                    return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
                }
                await fs.copyFile(req.file.path, uploadPath);
                await fs.unlink(req.file.path);
                return res.send({ code: 200 });
            }
            if (directory) {
                const dirPath = (0, path_1.join)(path, directory);
                if (!isPathAllowed(dirPath)) {
                    return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
                }
                await fs.mkdir(dirPath, { recursive: true });
                return res.send({ code: 200 });
            }
            if (!originFilename) {
                originFilename = filename;
            }
            const originFilePath = (0, path_1.join)(path, originFilename);
            const filePath = (0, path_1.join)(path, filename);
            if (!isPathAllowed(filePath) || !isPathAllowed(originFilePath)) {
                return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
            }
            // Check the canonical parent directly at the directory creation boundary.
            const parentPath = (0, path_1.resolve)((0, path_1.dirname)(filePath));
            let parentCreated = false;
            for (const writableRoot of config_1.default.writePathList) {
                const root = (0, path_1.resolve)(writableRoot);
                const rootPrefix = root.endsWith(path_1.sep) ? root : root + path_1.sep;
                if (parentPath === root) {
                    await fs.mkdir(root, { recursive: true });
                }
                else if (parentPath.startsWith(rootPrefix)) {
                    await fs.mkdir(parentPath, { recursive: true });
                }
                else {
                    continue;
                }
                parentCreated = true;
                break;
            }
            if (!parentCreated) {
                return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
            }
            const fileExists = await (0, util_1.fileExist)(filePath);
            if (fileExists && (0, fileAccess_1.resolveFileAccess)(config_1.default.scriptPath, [filePath])) {
                let removeSource = filename !== originFilename;
                let backupSource = '';
                if (removeSource) {
                    const [originRealPath, targetRealPath] = await Promise.all([
                        existingWritableRealPath(originFilePath),
                        existingWritableRealPath(filePath),
                    ]);
                    // Aliases of one script are an in-place save. Removing the source
                    // would also remove the destination behind a target symlink.
                    removeSource = originRealPath !== targetRealPath;
                    backupSource = originRealPath;
                }
                // Save-as removes the source after committing the destination. Keep
                // its original content too: destination history only protects the
                // file being overwritten, not the source being deleted.
                if (removeSource) {
                    await fs.copyFile(backupSource, (0, path_1.join)(config_1.default.bakPath, originFilename.replace(/\//g, '')));
                }
                const service = typedi_1.Container.get(scriptHistory_1.default);
                const data = await service.save(path, filename, content, {
                    skipHistory: req.body.skipHistory,
                    expectedHash: req.body.expectedHash,
                });
                if (removeSource)
                    await (0, util_1.rmPath)(originFilePath);
                return res.send({ code: 200, data });
            }
            if (fileExists) {
                await fs.copyFile(originFilePath, (0, path_1.join)(config_1.default.bakPath, originFilename.replace(/\//g, '')));
                if (filename !== originFilename) {
                    await (0, util_1.rmPath)(originFilePath);
                }
            }
            await (0, utils_1.writeFileWithLock)(filePath, content);
            return res.send({ code: 200 });
        }
        catch (e) {
            return historyError(e, res, next);
        }
    });
    route.put('/', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
            content: celebrate_1.Joi.string().required().allow(''),
            skipHistory: celebrate_1.Joi.boolean().optional(),
            expectedHash: celebrate_1.Joi.string()
                .hex()
                .length(64)
                .when('skipHistory', { is: true, then: celebrate_1.Joi.required() }),
        }),
    }), async (req, res, next) => {
        try {
            let { filename, content, path } = req.body;
            const scriptService = typedi_1.Container.get(script_1.default);
            const filePath = scriptService.checkFilePath(path, filename);
            if (!filePath) {
                return res.send({
                    code: 403,
                    message: (0, i18n_1.t)('暂无权限'),
                });
            }
            const service = typedi_1.Container.get(scriptHistory_1.default);
            const data = await service.save(path || '', filename, content, {
                skipHistory: req.body.skipHistory,
                expectedHash: req.body.expectedHash,
            });
            return res.send({ code: 200, data });
        }
        catch (e) {
            return historyError(e, res, next);
        }
    });
    route.delete('/', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            filename: celebrate_1.Joi.string().required(),
            path: celebrate_1.Joi.string().optional().allow(''),
            type: celebrate_1.Joi.string().optional(),
        }),
    }), async (req, res, next) => {
        try {
            let { filename, path } = req.body;
            if (!path) {
                path = '';
            }
            const scriptService = typedi_1.Container.get(script_1.default);
            const filePath = scriptService.checkFilePath(path, filename);
            if (!filePath) {
                return res.send({
                    code: 403,
                    message: (0, i18n_1.t)('暂无权限'),
                });
            }
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
            path: celebrate_1.Joi.string().optional().allow(''),
        }),
    }), async (req, res, next) => {
        try {
            let { filename, path } = req.body;
            if (!path) {
                path = '';
            }
            const scriptService = typedi_1.Container.get(script_1.default);
            const filePath = scriptService.checkFilePath(path, filename);
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
            if (!path) {
                path = '';
            }
            const { name, ext } = (0, path_1.parse)(filename);
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, `${name}.swap${ext}`);
            if (!isPathAllowed(filePath)) {
                return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
            }
            await (0, utils_1.writeFileWithLock)(filePath, content || '');
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
            if (!path) {
                path = '';
            }
            const { name, ext } = (0, path_1.parse)(filename);
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, `${name}.swap${ext}`);
            if (!isPathAllowed(filePath)) {
                return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
            }
            const logPath = (0, fileAccess_1.resolveFileAccess)(config_1.default.logPath, [
                path,
                `${name}.swap`,
            ]);
            if (!logPath) {
                return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
            }
            const scriptService = typedi_1.Container.get(script_1.default);
            const result = await scriptService.stopScript(filePath, pid);
            setTimeout(() => {
                const cleanupPath = (0, fileAccess_1.resolveFileAccess)(config_1.default.logPath, [logPath]);
                if (cleanupPath) {
                    void (0, util_1.rmPath)(cleanupPath);
                }
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
            let { filename, path, newFilename } = req.body;
            if (!path) {
                path = '';
            }
            const filePath = (0, path_1.join)(config_1.default.scriptPath, path, filename);
            const newPath = (0, path_1.join)(config_1.default.scriptPath, path, newFilename);
            if (!isPathAllowed(filePath) || !isPathAllowed(newPath)) {
                return res.send({ code: 403, message: (0, i18n_1.t)('暂无权限') });
            }
            await fs.rename(filePath, newPath);
            res.send({ code: 200 });
        }
        catch (e) {
            return next(e);
        }
    });
};
//# sourceMappingURL=script.js.map