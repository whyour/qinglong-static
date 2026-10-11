"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = __importDefault(require("typedi"));
const logger_1 = __importDefault(require("../loaders/logger"));
const system_1 = __importDefault(require("../services/system"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/update', route);
    route.put('/reload', async (req, res, next) => {
        try {
            const systemService = typedi_1.default.get(system_1.default);
            const result = await systemService.reloadSystem();
            res.send(result);
        }
        catch (e) {
            logger_1.default.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/system', async (req, res, next) => {
        try {
            const systemService = typedi_1.default.get(system_1.default);
            const result = await systemService.reloadSystem('system');
            res.send(result);
        }
        catch (e) {
            logger_1.default.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/data', async (req, res, next) => {
        try {
            const systemService = typedi_1.default.get(system_1.default);
            const result = await systemService.reloadSystem('data');
            res.send(result);
        }
        catch (e) {
            logger_1.default.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
//# sourceMappingURL=update.js.map