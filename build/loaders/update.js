"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const celebrate_1 = require("celebrate");
const cors_1 = __importDefault(require("cors"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const typedi_1 = __importDefault(require("typedi"));
const config_1 = __importDefault(require("../config"));
const system_1 = __importDefault(require("../services/system"));
const logger_1 = __importDefault(require("./logger"));
exports.default = ({ app }) => {
    app.set('trust proxy', 'loopback');
    app.use((0, cors_1.default)());
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
    app.use((0, express_jwt_1.default)({
        secret: config_1.default.secret,
        algorithms: ['HS384'],
    }));
    app.put('/api/reload', async (req, res, next) => {
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
    app.put('/api/system', async (req, res, next) => {
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
    app.put('/api/data', async (req, res, next) => {
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
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });
    app.use((0, celebrate_1.errors)());
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            return res
                .status(err.status)
                .send({ code: 401, message: err.message })
                .end();
        }
        return next(err);
    });
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            code: err.status || 500,
            message: err.message,
        });
    });
};
//# sourceMappingURL=update.js.map