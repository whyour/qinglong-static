"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("../api"));
const config_1 = __importDefault(require("../config"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("../config/util");
exports.default = ({ app }) => {
    app.enable('trust proxy');
    app.use(cors_1.default());
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
    app.use(express_jwt_1.default({ secret: config_1.default.secret, algorithms: ['HS384'] }).unless({
        path: ['/api/login'],
    }));
    app.use((req, res, next) => {
        const data = fs_1.default.readFileSync(config_1.default.authConfigFile, 'utf8');
        const headerToken = util_1.getToken(req);
        if (data) {
            const { token } = JSON.parse(data);
            if (token && headerToken === token) {
                return next();
            }
            if (!headerToken && req.path && req.path.includes('/api/login')) {
                return next();
            }
        }
        const err = new Error('UnauthorizedError');
        err['status'] = 401;
        next(err);
    });
    app.use(config_1.default.api.prefix, api_1.default());
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });
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
//# sourceMappingURL=express.js.map