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
const validationErrors_1 = __importDefault(require("../middlewares/validationErrors"));
const serverEnv_1 = require("../config/serverEnv");
const store_1 = require("../shared/store");
const auth_1 = require("../shared/auth");
const path_1 = __importDefault(require("path"));
const i18n_1 = require("../shared/i18n");
const uniqueConstraintError_1 = __importDefault(require("../middlewares/uniqueConstraintError"));
const protectedPathCase_1 = __importDefault(require("../middlewares/protectedPathCase"));
const logger_1 = __importDefault(require("./logger"));
function resolveTrustProxy(value = process.env.QL_TRUST_PROXY) {
    const setting = value === null || value === void 0 ? void 0 : value.trim();
    if (!setting) {
        return 'loopback';
    }
    if (setting === 'true' || setting === 'false') {
        return setting === 'true';
    }
    if (/^\d+$/.test(setting)) {
        return Number(setting);
    }
    return setting;
}
exports.default = ({ app }) => {
    // Security: Enable strict routing to prevent case-insensitive path bypass
    app.set('case sensitive routing', true);
    app.set('strict routing', true);
    app.set('trust proxy', resolveTrustProxy());
    app.use((0, cors_1.default)());
    // Security: Reject case variations under protected API namespaces before
    // authentication checks can interpret the request differently from routing.
    app.use(protectedPathCase_1.default);
    // Rewrite URLs to strip baseUrl prefix if configured
    // This allows the rest of the app to work without baseUrl awareness
    if (config_1.default.baseUrl) {
        app.use((0, express_urlrewrite_1.default)(`${config_1.default.baseUrl}/*`, '/$1'));
    }
    app.get(`${config_1.default.api.prefix}/env.js`, serverEnv_1.serveEnv);
    app.use(`${config_1.default.api.prefix}/static`, express_1.default.static(config_1.default.uploadPath, {
        setHeaders: (res) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'");
        },
    }));
    const credentialPaths = ['/api', '/open'].flatMap((prefix) => ['/user/login', '/user/init', '/user/two-factor/login'].map((route) => `${prefix}${route}`));
    app.use(credentialPaths, body_parser_1.default.json({ limit: '16kb' }), body_parser_1.default.urlencoded({ limit: '16kb', extended: false }));
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
    const frontendPath = path_1.default.join(config_1.default.rootPath, 'static/dist');
    app.use(express_1.default.static(frontendPath));
    app.use((0, express_jwt_1.expressjwt)({
        secret: config_1.default.jwt.secret,
        algorithms: ['HS384'],
    }).unless({
        path: [...config_1.default.apiWhiteList, /^(\/(?!api\/).*)$/i],
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
        const pathLower = req.path.toLowerCase();
        if (!['/open/', '/api/'].some((x) => pathLower.startsWith(x))) {
            return next();
        }
        const headerToken = (0, util_1.getToken)(req);
        if (pathLower.startsWith('/open/')) {
            const apps = await store_1.shareStore.getApps();
            const doc = (_a = apps === null || apps === void 0 ? void 0 : apps.filter((x) => { var _a; return (_a = x.tokens) === null || _a === void 0 ? void 0 : _a.find((y) => y.value === headerToken); })) === null || _a === void 0 ? void 0 : _a[0];
            if (doc && doc.tokens && doc.tokens.length > 0) {
                const currentToken = doc.tokens.find((x) => x.value === headerToken);
                const keyMatch = pathLower.match(/\/open\/([a-z]+)\/*/);
                const key = keyMatch && keyMatch[1];
                const isReadRequest = (['GET', 'HEAD'].includes(req.method) &&
                    !(key === 'crons' && /^\/open\/crons\/import\/?$/.test(pathLower))) ||
                    (['scripts', 'logs'].includes(key || '') &&
                        req.method === 'POST' &&
                        /^\/open\/(?:scripts|logs)\/download\/?$/.test(pathLower));
                const hasNamespaceScope = doc.scopes.includes(key) ||
                    ([
                        'crons',
                        'subscriptions',
                        'envs',
                        'configs',
                        'scripts',
                        'logs',
                        'dependencies',
                        'dashboard',
                    ].includes(key || '') &&
                        doc.scopes.includes(`${key}:read`) &&
                        isReadRequest);
                if (!hasNamespaceScope) {
                    const err = new express_jwt_1.UnauthorizedError('credentials_bad_scheme', {
                        message: (0, i18n_1.t)('暂无权限'),
                    });
                    return next(err);
                }
                // The built-in system app still needs its local CLI maintenance API.
                const appRouteAllowed = key !== 'system' ||
                    doc.name === 'system' ||
                    ((req.method === 'GET' || req.method === 'HEAD') &&
                        (pathLower === '/open/system' || pathLower === '/open/system/')) ||
                    (req.method === 'PUT' && pathLower === '/open/system/notify');
                if (!appRouteAllowed) {
                    const err = new express_jwt_1.UnauthorizedError('credentials_bad_scheme', {
                        message: (0, i18n_1.t)('暂无权限'),
                    });
                    return next(err);
                }
                if (!currentToken ||
                    currentToken.expiration < Math.round(Date.now() / 1000)) {
                    const err = new express_jwt_1.UnauthorizedError('invalid_token', {
                        message: (0, i18n_1.t)('Token 已失效'),
                    });
                    return next(err);
                }
                return next();
            }
        }
        const originPath = `${req.baseUrl}${pathLower === '/' ? '' : pathLower}`;
        if (!headerToken &&
            originPath &&
            config_1.default.apiWhiteList.includes(originPath)) {
            return next();
        }
        const authInfo = await store_1.shareStore.getAuthInfo();
        if ((0, auth_1.isValidToken)(authInfo, headerToken, req.platform, config_1.default.jwt.secret)) {
            return next();
        }
        const errorCode = headerToken ? 'invalid_token' : 'credentials_required';
        const errorMessage = headerToken ? (0, i18n_1.t)('Token 已失效') : (0, i18n_1.t)('请先登录');
        const err = new express_jwt_1.UnauthorizedError(errorCode, { message: errorMessage });
        next(err);
    });
    app.use(async (req, res, next) => {
        const pathLower = req.path.toLowerCase();
        if (!['/api/user/init', '/open/user/init'].includes(pathLower)) {
            return next();
        }
        const authInfo = (await store_1.shareStore.getAuthInfo()) || {};
        let isInitialized = !(0, auth_1.isDefaultAuthInfo)(authInfo);
        if (isInitialized) {
            return res.send({ code: 450, message: (0, i18n_1.t)('未知错误') });
        }
        else {
            return next();
        }
    });
    app.use((0, express_urlrewrite_1.default)('/open/*', '/api/$1'));
    app.use(config_1.default.api.prefix, (0, api_1.default)());
    app.get('*', (req, res, next) => {
        // Don't serve index.html for API routes
        if (req.path === config_1.default.api.prefix ||
            req.path.startsWith(`${config_1.default.api.prefix}/`)) {
            return res.status(404).json({ code: 404, message: 'Not Found' });
        }
        const indexPath = path_1.default.join(frontendPath, 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                const err = new Error('Not Found');
                err['status'] = 404;
                next(err);
            }
        });
    });
    app.use(validationErrors_1.default);
    app.use(uniqueConstraintError_1.default);
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            let message = err.message;
            if (!config_1.default.isDevelopment) {
                if (err.code === 'credentials_bad_scheme') {
                    message = (0, i18n_1.t)('暂无权限');
                }
                else if (err.code === 'credentials_required') {
                    message = (0, i18n_1.t)('请先登录');
                }
                else {
                    message = (0, i18n_1.t)('Token 已失效');
                }
            }
            return res.status(401).send({ code: 401, message }).end();
        }
        return next(err);
    });
    app.use((err, req, res, next) => {
        var _a;
        const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
            ? err.status
            : 500;
        if (status >= 500) {
            const route = typeof ((_a = req.route) === null || _a === void 0 ? void 0 : _a.path) === 'string' ? req.route.path : '?';
            const errorName = /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(err.name)
                ? err.name
                : 'Error';
            logger_1.default.error('HTTP request failed: status=%d method=%s route=%s type=%s', status, req.method, route, errorName);
        }
        res.status(status);
        res.json({
            code: status,
            message: !config_1.default.isDevelopment && status >= 500 ? (0, i18n_1.t)('未知错误') : err.message,
        });
    });
};
//# sourceMappingURL=express.js.map