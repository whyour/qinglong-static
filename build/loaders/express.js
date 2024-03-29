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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("../api"));
const config_1 = __importDefault(require("../config"));
const express_jwt_1 = __importStar(require("express-jwt"));
const promises_1 = __importDefault(require("fs/promises"));
const util_1 = require("../config/util");
const typedi_1 = __importDefault(require("typedi"));
const open_1 = __importDefault(require("../services/open"));
const express_urlrewrite_1 = __importDefault(require("express-urlrewrite"));
const user_1 = __importDefault(require("../services/user"));
const Sentry = __importStar(require("@sentry/node"));
const celebrate_1 = require("celebrate");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const serverEnv_1 = require("../config/serverEnv");
const logger_1 = __importDefault(require("./logger"));
exports.default = ({ app }) => {
    app.set('trust proxy', 'loopback');
    app.use((0, cors_1.default)());
    app.get(`${config_1.default.api.prefix}/env.js`, serverEnv_1.serveEnv);
    app.use(`${config_1.default.api.prefix}/static`, express_1.default.static(config_1.default.uploadPath));
    app.use('/api/public', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: `http://0.0.0.0:${config_1.default.publicPort}/api`,
        changeOrigin: true,
        pathRewrite: { '/api/public': '' },
        logProvider: () => logger_1.default,
    }));
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
    app.use((0, express_jwt_1.default)({
        secret: config_1.default.secret,
        algorithms: ['HS384'],
    }).unless({
        path: [...config_1.default.apiWhiteList, /^\/open\//],
    }));
    app.use((req, res, next) => {
        if (!req.headers) {
            req.platform = 'desktop';
        }
        else {
            const platform = (0, util_1.getPlatform)(req.headers['user-agent'] || '');
            req.platform = platform;
        }
        return next();
    });
    app.use(async (req, res, next) => {
        const headerToken = (0, util_1.getToken)(req);
        if (req.path.startsWith('/open/')) {
            const openService = typedi_1.default.get(open_1.default);
            const doc = await openService.findTokenByValue(headerToken);
            if (doc && doc.tokens && doc.tokens.length > 0) {
                const currentToken = doc.tokens.find((x) => x.value === headerToken);
                const keyMatch = req.path.match(/\/open\/([a-z]+)\/*/);
                const key = keyMatch && keyMatch[1];
                if (doc.scopes.includes(key) &&
                    currentToken &&
                    currentToken.expiration >= Math.round(Date.now() / 1000)) {
                    return next();
                }
            }
        }
        const originPath = `${req.baseUrl}${req.path === '/' ? '' : req.path}`;
        if (!headerToken &&
            originPath &&
            config_1.default.apiWhiteList.includes(originPath)) {
            return next();
        }
        const data = await promises_1.default.readFile(config_1.default.authConfigFile, 'utf8');
        if (data && headerToken) {
            const { token = '', tokens = {} } = (0, util_1.safeJSONParse)(data);
            if (headerToken === token || tokens[req.platform] === headerToken) {
                return next();
            }
        }
        const errorCode = headerToken ? 'invalid_token' : 'credentials_required';
        const errorMessage = headerToken
            ? 'jwt malformed'
            : 'No authorization token was found';
        const err = new express_jwt_1.UnauthorizedError(errorCode, { message: errorMessage });
        next(err);
    });
    app.use(async (req, res, next) => {
        if (!['/api/user/init', '/api/user/notification/init'].includes(req.path)) {
            return next();
        }
        const userService = typedi_1.default.get(user_1.default);
        const authInfo = await userService.getUserInfo();
        let isInitialized = true;
        if (Object.keys(authInfo).length === 2 &&
            authInfo.username === 'admin' &&
            authInfo.password === 'admin') {
            isInitialized = false;
        }
        if (isInitialized) {
            return res.send({ code: 450, message: '未知错误' });
        }
        else {
            return next();
        }
    });
    app.use((0, express_urlrewrite_1.default)('/open/*', '/api/$1'));
    app.use(config_1.default.api.prefix, (0, api_1.default)());
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
        if (err.name.includes('Sequelize')) {
            return res
                .status(500)
                .send({
                code: 400,
                message: `${err.name} ${err.message}`,
                validation: err.errors,
            })
                .end();
        }
        return next(err);
    });
    app.use((err, req, res, next) => {
        Sentry.captureException(err);
        res.status(err.status || 500);
        res.json({
            code: err.status || 500,
            message: err.message,
        });
    });
};
//# sourceMappingURL=express.js.map