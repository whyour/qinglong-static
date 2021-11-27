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
const express_1 = require("express");
const typedi_1 = require("typedi");
const fs = __importStar(require("fs"));
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
const route = express_1.Router();
exports.default = (app) => {
    app.use('/', route);
    route.get('/logs', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const fileList = fs.readdirSync(config_1.default.logPath, 'utf-8');
            const dirs = [];
            for (let i = 0; i < fileList.length; i++) {
                const stat = fs.lstatSync(config_1.default.logPath + fileList[i]);
                if (stat.isDirectory()) {
                    const fileListTmp = fs.readdirSync(`${config_1.default.logPath}/${fileList[i]}`, 'utf-8');
                    dirs.push({
                        name: fileList[i],
                        isDir: true,
                        files: fileListTmp.reverse(),
                    });
                }
                else {
                    dirs.push({
                        name: fileList[i],
                        isDir: false,
                        files: [],
                    });
                }
            }
            res.send({ code: 200, dirs });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/logs/:dir/:file', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const { dir, file } = req.params;
            const content = util_1.getFileContentByName(`${config_1.default.logPath}/${dir}/${file}`);
            res.send({ code: 200, data: content });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/logs/:file', async (req, res, next) => {
        const logger = typedi_1.Container.get('logger');
        try {
            const { file } = req.params;
            const content = util_1.getFileContentByName(`${config_1.default.logPath}/${file}`);
            res.send({ code: 200, data: content });
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=log.js.map