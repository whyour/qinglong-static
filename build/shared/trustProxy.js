"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnoseClientIp = exports.updateTrustProxy = exports.initializeTrustProxy = exports.getTrustProxyConfig = exports.resolveTrustProxy = void 0;
const express_1 = __importDefault(require("express"));
const system_1 = require("../data/system");
const clientIp_1 = require("./clientIp");
const DEFAULT_TRUST_PROXY = 'loopback';
let activeApp;
function getEnvironmentSetting() {
    var _a;
    return ((_a = process.env.QL_TRUST_PROXY) === null || _a === void 0 ? void 0 : _a.trim()) || '';
}
function normalizeSetting(value) {
    return (value === null || value === void 0 ? void 0 : value.trim()) || DEFAULT_TRUST_PROXY;
}
function resolveTrustProxy(value) {
    const setting = normalizeSetting(value);
    if (setting === 'true' || setting === 'false') {
        return setting === 'true';
    }
    if (/^\d+$/.test(setting)) {
        return Number(setting);
    }
    return setting;
}
exports.resolveTrustProxy = resolveTrustProxy;
function validateTrustProxy(value) {
    const setting = normalizeSetting(value);
    if (setting.length > 500 || /[\r\n]/.test(setting)) {
        throw new Error('trust proxy 配置格式无效');
    }
    if (/^\d+$/.test(setting) && Number(setting) > 20) {
        throw new Error('代理层数不能超过 20');
    }
    const probe = (0, express_1.default)();
    probe.set('trust proxy', resolveTrustProxy(setting));
    return setting;
}
async function getStoredSetting() {
    const doc = await system_1.SystemModel.findOne({
        where: { type: system_1.AuthDataType.systemConfig },
    });
    const info = ((doc === null || doc === void 0 ? void 0 : doc.get('info')) || {});
    return typeof info.trustProxy === 'string' ? info.trustProxy : '';
}
async function getTrustProxyConfig() {
    const environmentSetting = getEnvironmentSetting();
    const storedSetting = await getStoredSetting();
    const trustProxy = normalizeSetting(environmentSetting || storedSetting);
    return {
        trustProxy,
        source: environmentSetting
            ? 'environment'
            : storedSetting
                ? 'system'
                : 'default',
        editable: !environmentSetting,
    };
}
exports.getTrustProxyConfig = getTrustProxyConfig;
async function initializeTrustProxy(app) {
    activeApp = app;
    const { trustProxy } = await getTrustProxyConfig();
    app.set('trust proxy', resolveTrustProxy(trustProxy));
}
exports.initializeTrustProxy = initializeTrustProxy;
async function updateTrustProxy(value) {
    if (getEnvironmentSetting()) {
        throw new Error('环境变量 QL_TRUST_PROXY 已生效，系统设置不可覆盖');
    }
    const trustProxy = validateTrustProxy(value);
    const doc = await system_1.SystemModel.findOne({
        where: { type: system_1.AuthDataType.systemConfig },
    });
    if (!doc) {
        throw new Error('系统配置不存在');
    }
    const plain = doc.get({ plain: true });
    await system_1.SystemModel.update({ info: Object.assign(Object.assign({}, (plain.info || {})), { trustProxy }) }, { where: { id: plain.id } });
    activeApp === null || activeApp === void 0 ? void 0 : activeApp.set('trust proxy', resolveTrustProxy(trustProxy));
    return getTrustProxyConfig();
}
exports.updateTrustProxy = updateTrustProxy;
function parseForwardedFor(value) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return values
        .flatMap((item) => item.split(','))
        .map((item) => (0, clientIp_1.normalizeClientIp)(item))
        .filter(Boolean);
}
async function diagnoseClientIp(req) {
    const remoteAddress = (0, clientIp_1.normalizeClientIp)(req.socket.remoteAddress);
    const forwardedFor = parseForwardedFor(req.headers['x-forwarded-for']);
    const hopsFromApp = [remoteAddress, ...forwardedFor.slice().reverse()].filter(Boolean);
    const trust = req.app.get('trust proxy fn');
    let selectedIndex = Math.max(hopsFromApp.length - 1, 0);
    for (let index = 0; index < hopsFromApp.length - 1; index += 1) {
        if (!(trust === null || trust === void 0 ? void 0 : trust(hopsFromApp[index], index))) {
            selectedIndex = index;
            break;
        }
    }
    const hops = hopsFromApp.map((ip, index) => ({
        ip,
        hop: index,
        status: index < selectedIndex
            ? 'trusted'
            : index === selectedIndex
                ? 'client'
                : 'not_checked',
    }));
    return Object.assign(Object.assign({}, (await getTrustProxyConfig())), { remoteAddress,
        forwardedFor, expressIps: req.ips.map(clientIp_1.normalizeClientIp), clientIp: (0, clientIp_1.normalizeClientIp)(req.ip || req.socket.remoteAddress), hops });
}
exports.diagnoseClientIp = diagnoseClientIp;
//# sourceMappingURL=trustProxy.js.map