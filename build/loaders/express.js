"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("../api"));
const config_1 = __importDefault(require("../config"));
const express_jwt_1 = require("express-jwt");
const util_1 = require("../config/util");
const express_urlrewrite_1 = __importDefault(require("express-urlrewrite"));
const celebrate_1 = require("celebrate");
const serverEnv_1 = require("../config/serverEnv");
const store_1 = require("../shared/store");
const auth_1 = require("../shared/auth");
const path_1 = __importDefault(require("path"));
exports.default = ({ app }) => {
    app.set('trust proxy', 'loopback');
    app.use((0, cors_1.default)());
    app.get(`${config_1.default.api.prefix}/env.js`, serverEnv_1.serveEnv);
    app.use(`${config_1.default.api.prefix}/static`, express_1.default.static(config_1.default.uploadPath));
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
    const frontendPath = path_1.default.join(config_1.default.rootPath, 'static/dist');
    app.use(express_1.default.static(frontendPath));
    app.use((0, express_jwt_1.expressjwt)({
        secret: config_1.default.jwt.secret,
        algorithms: ['HS384'],
    }).unless({
        path: [...config_1.default.apiWhiteList, /^\/(?!api\/).*/],
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
        var _a;
        if (!['/open/', '/api/'].some((x) => req.path.startsWith(x))) {
            return next();
        }
        const headerToken = (0, util_1.getToken)(req);
        if (req.path.startsWith('/open/')) {
            const apps = await store_1.shareStore.getApps();
            const doc = (_a = apps === null || apps === void 0 ? void 0 : apps.filter((x) => { var _a; return (_a = x.tokens) === null || _a === void 0 ? void 0 : _a.find((y) => y.value === headerToken); })) === null || _a === void 0 ? void 0 : _a[0];
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
        const authInfo = await store_1.shareStore.getAuthInfo();
        if ((0, auth_1.isValidToken)(authInfo, headerToken, req.platform)) {
            return next();
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
        const authInfo = (await store_1.shareStore.getAuthInfo()) || {};
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
    app.get('*', (_, res, next) => {
        const indexPath = path_1.default.join(frontendPath, 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                const err = new Error('Not Found');
                err['status'] = 404;
                next(err);
            }
        });
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
                message: `${err.message}`,
                errors: err.errors,
            })
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