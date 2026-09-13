"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const util_1 = require("../config/util");
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const preset_default_1 = require("@otplib/preset-default");
const system_1 = require("../data/system");
const notify_1 = __importDefault(require("./notify"));
const schedule_1 = __importDefault(require("./schedule"));
const sock_1 = __importDefault(require("./sock"));
const dayjs_1 = __importDefault(require("dayjs"));
const ip2region_1 = __importDefault(require("ip2region"));
const uniq_1 = __importDefault(require("lodash/uniq"));
const pickBy_1 = __importDefault(require("lodash/pickBy"));
const isNil_1 = __importDefault(require("lodash/isNil"));
const store_1 = require("../shared/store");
const i18n_1 = require("../shared/i18n");
const clientIp_1 = require("../shared/clientIp");
const auth_1 = require("../shared/auth");
const password_1 = require("../shared/password");
const authMutation_1 = require("../shared/authMutation");
let UserService = class UserService {
    constructor(logger, scheduleService, sockService) {
        this.logger = logger;
        this.scheduleService = scheduleService;
        this.sockService = sockService;
    }
    async login(payloads, req) {
        return this.authenticate(payloads, req);
    }
    async authenticate(payloads, req, needTwoFactor = true) {
        let { username, password } = payloads;
        const content = await this.getAuthInfo();
        if ((0, auth_1.isDefaultAuthInfo)(content)) {
            return { code: 450, message: (0, i18n_1.t)('请先初始化') };
        }
        const timestamp = Date.now();
        const ip = (0, clientIp_1.getClientIp)(req);
        const query = new ip2region_1.default();
        const ipAddress = query.search(ip);
        let address = '';
        if (ipAddress) {
            const { country, province, city, isp } = ipAddress;
            address = (0, uniq_1.default)([country, province, city, isp]).filter(Boolean).join(' ');
        }
        let { username: cUsername, password: cPassword, retries = 0, lastlogon, lastip, lastaddr, twoFactorActivated, tokens = {}, platform, blockedIps = [], } = content;
        if (ip &&
            blockedIps.some((blockedIp) => (0, clientIp_1.normalizeClientIp)(blockedIp) === ip)) {
            await this.insertDb({
                type: system_1.AuthDataType.loginLog,
                info: {
                    timestamp,
                    address,
                    ip,
                    platform: req.platform,
                    status: system_1.LoginStatus.fail,
                },
            });
            this.getLoginLog();
            return { code: 403, message: (0, i18n_1.t)('该 IP 已被列入黑名单') };
        }
        const retriesTime = Math.pow(3, retries) * 1000;
        if (retries > 2 && timestamp - lastlogon < retriesTime) {
            const waitTime = Math.ceil((retriesTime - (timestamp - lastlogon)) / 1000);
            return {
                code: 410,
                message: (0, i18n_1.tf)('失败次数过多，请%s秒后重试', waitTime),
                data: waitTime,
            };
        }
        const passwordMatches = username === cUsername && (await (0, password_1.verifyPassword)(password, cPassword));
        if (passwordMatches && twoFactorActivated && needTwoFactor) {
            await this.updateAuthInfo(content, {
                isTwoFactorChecking: true,
                twoFactorExpiresAt: timestamp + 5 * 60 * 1000,
            });
            return {
                code: 420,
                message: '',
            };
        }
        if (passwordMatches) {
            const data = (0, util_1.createRandomString)(50, 100);
            const expiration = twoFactorActivated ? '60d' : '20d';
            let token = jsonwebtoken_1.default.sign({ data }, config_1.default.jwt.secret, {
                expiresIn: config_1.default.jwt.expiresIn || expiration,
                algorithm: 'HS384',
            });
            const tokenInfo = {
                value: token,
                timestamp,
                ip,
                address,
                platform: req.platform,
            };
            const updatedTokens = this.addTokenToList(tokens, req.platform, tokenInfo);
            await this.updateAuthInfo(content, {
                password: (0, password_1.isPasswordHash)(cPassword)
                    ? cPassword
                    : await (0, password_1.hashPassword)(password),
                token,
                tokens: updatedTokens,
                lastlogon: timestamp,
                retries: 0,
                lastip: ip,
                lastaddr: address,
                platform: req.platform,
                isTwoFactorChecking: false,
                twoFactorExpiresAt: 0,
            });
            this.notificationService.notify((0, i18n_1.t)('登录通知'), (0, i18n_1.t)('你于') +
                (0, dayjs_1.default)(timestamp).format('YYYY-MM-DD HH:mm:ss') +
                (0, i18n_1.t)('在') +
                address +
                ' ' +
                req.platform +
                (0, i18n_1.t)('端') +
                ' ' +
                (0, i18n_1.t)('登录成功') +
                (0, i18n_1.t)('，ip地址') +
                ' ' +
                ip);
            await this.insertDb({
                type: system_1.AuthDataType.loginLog,
                info: {
                    timestamp,
                    address,
                    ip,
                    platform: req.platform,
                    status: system_1.LoginStatus.success,
                },
            });
            this.getLoginLog();
            return {
                code: 200,
                data: {
                    token,
                    lastip,
                    lastaddr,
                    lastlogon,
                    retries,
                    platform,
                },
            };
        }
        else {
            await this.updateAuthInfo(content, {
                retries: retries + 1,
                lastlogon: timestamp,
                lastip: ip,
                lastaddr: address,
                platform: req.platform,
            });
            this.notificationService.notify((0, i18n_1.t)('登录通知'), (0, i18n_1.t)('你于') +
                (0, dayjs_1.default)(timestamp).format('YYYY-MM-DD HH:mm:ss') +
                (0, i18n_1.t)('在') +
                address +
                ' ' +
                req.platform +
                (0, i18n_1.t)('端') +
                ' ' +
                (0, i18n_1.t)('登录失败') +
                (0, i18n_1.t)('，ip地址') +
                ' ' +
                ip);
            await this.insertDb({
                type: system_1.AuthDataType.loginLog,
                info: {
                    timestamp,
                    address,
                    ip,
                    platform: req.platform,
                    status: system_1.LoginStatus.fail,
                },
            });
            this.getLoginLog();
            if (retries > 2) {
                const waitTime = Math.round(Math.pow(3, retries + 1));
                return {
                    code: 410,
                    message: (0, i18n_1.tf)('失败次数过多，请%s秒后重试', waitTime),
                    data: waitTime,
                };
            }
            else {
                return { code: 400, message: (0, i18n_1.t)('错误的用户名密码，请重试') };
            }
        }
    }
    async logout(platform, tokenValue) {
        if (!platform || !tokenValue) {
            this.logger.warn('Invalid logout parameters - empty platform or token');
            return;
        }
        const authInfo = await this.getAuthInfo();
        // Verify the token exists before attempting to remove it
        const tokenExists = this.findTokenInList(authInfo.tokens, platform, tokenValue);
        if (!tokenExists && authInfo.token !== tokenValue) {
            // Token not found, but don't throw error - user may have already logged out
            this.logger.info(`Logout attempted for non-existent token on platform: ${platform}`);
            return;
        }
        const updatedTokens = this.removeTokenFromList(authInfo.tokens, platform, tokenValue);
        await this.updateAuthInfo(authInfo, {
            token: authInfo.token === tokenValue ? '' : authInfo.token,
            tokens: updatedTokens,
        });
    }
    async getLoginLog() {
        const docs = await system_1.SystemModel.findAll({
            where: { type: system_1.AuthDataType.loginLog },
        });
        if (docs && docs.length > 0) {
            const result = docs.sort((a, b) => b.info.timestamp - a.info.timestamp);
            if (result.length > 100) {
                const ids = result.slice(100).map((x) => x.id);
                await system_1.SystemModel.destroy({
                    where: { id: ids },
                });
            }
            return result.map((x) => x.info);
        }
        return [];
    }
    async getIpBlacklist() {
        const authInfo = await this.getAuthInfo();
        return (0, uniq_1.default)((authInfo.blockedIps || []).map(clientIp_1.normalizeClientIp)).filter(Boolean);
    }
    async blockIp(ip) {
        const authInfo = await this.getAuthInfo();
        const blockedIps = (0, uniq_1.default)([
            ...(authInfo.blockedIps || []).map(clientIp_1.normalizeClientIp),
            (0, clientIp_1.normalizeClientIp)(ip),
        ]).filter(Boolean);
        await this.updateAuthInfo(authInfo, { blockedIps });
        return blockedIps;
    }
    async unblockIp(ip) {
        const authInfo = await this.getAuthInfo();
        const normalizedIp = (0, clientIp_1.normalizeClientIp)(ip);
        const blockedIps = (authInfo.blockedIps || [])
            .map(clientIp_1.normalizeClientIp)
            .filter((blockedIp) => blockedIp && blockedIp !== normalizedIp);
        await this.updateAuthInfo(authInfo, { blockedIps });
        return blockedIps;
    }
    async insertDb(payload) {
        const doc = await system_1.SystemModel.create(Object.assign({}, payload), { returning: true });
        return doc;
    }
    async initializeUser({ username, password, }) {
        const authInfo = await this.getAuthInfo();
        if (!(0, auth_1.isDefaultAuthInfo)(authInfo)) {
            return { code: 450, message: (0, i18n_1.t)('未知错误') };
        }
        if (password === 'admin') {
            return { code: 400, message: (0, i18n_1.t)('密码不能设置为admin') };
        }
        await this.updateAuthInfo(authInfo, {
            username,
            password: await (0, password_1.hashPassword)(password),
            token: '',
            tokens: {},
            isTwoFactorChecking: false,
            twoFactorExpiresAt: 0,
        });
        return { code: 200, message: (0, i18n_1.t)('更新成功') };
    }
    async updateUsernameAndPassword({ username, password, }) {
        if (password === 'admin') {
            return { code: 400, message: (0, i18n_1.t)('密码不能设置为admin') };
        }
        const authInfo = await this.getAuthInfo();
        await this.updateAuthInfo(authInfo, {
            username,
            password: await (0, password_1.hashPassword)(password),
            token: '',
            tokens: {},
            isTwoFactorChecking: false,
            twoFactorExpiresAt: 0,
        });
        return { code: 200, message: (0, i18n_1.t)('更新成功') };
    }
    async updateAvatar(avatar) {
        const authInfo = await this.getAuthInfo();
        await this.updateAuthInfo(authInfo, { avatar });
        return { code: 200, data: avatar, message: (0, i18n_1.t)('更新成功') };
    }
    async initTwoFactor() {
        const secret = preset_default_1.authenticator.generateSecret();
        const authInfo = await this.getAuthInfo();
        if (authInfo.twoFactorActivated) {
            throw new Error((0, i18n_1.t)('请先关闭两步验证'));
        }
        const otpauth = preset_default_1.authenticator.keyuri(authInfo.username, 'qinglong', secret);
        await this.updateAuthInfo(authInfo, { twoFactorSecret: secret });
        return { secret, url: otpauth };
    }
    async activeTwoFactor(code) {
        const authInfo = await this.getAuthInfo();
        const isValid = preset_default_1.authenticator.verify({
            token: code,
            secret: authInfo.twoFactorSecret,
        });
        if (isValid) {
            await this.updateAuthInfo(authInfo, {
                twoFactorActivated: true,
                token: '',
                tokens: {},
                isTwoFactorChecking: false,
                twoFactorExpiresAt: 0,
            });
        }
        return isValid;
    }
    async twoFactorLogin({ username, password, code, }, req) {
        const authInfo = await this.getAuthInfo();
        const { isTwoFactorChecking, twoFactorSecret } = authInfo;
        const now = Date.now();
        const retries = authInfo.retries || 0;
        if (retries > 2 && now - authInfo.lastlogon < Math.pow(3, retries) * 1000) {
            return { code: 410, message: (0, i18n_1.t)('失败次数过多，请稍后重试') };
        }
        if (!isTwoFactorChecking ||
            !authInfo.twoFactorActivated ||
            !authInfo.twoFactorExpiresAt ||
            authInfo.twoFactorExpiresAt <= now) {
            return { code: 450, message: (0, i18n_1.t)('未知错误') };
        }
        const step = Math.floor(now / 30000);
        const isValid = username === authInfo.username &&
            (await (0, password_1.verifyPassword)(password, authInfo.password)) &&
            authInfo.lastTwoFactorStep !== step &&
            preset_default_1.authenticator.verify({ token: code, secret: twoFactorSecret });
        if (isValid) {
            await this.updateAuthInfo(authInfo, { lastTwoFactorStep: step });
            return this.authenticate({ username, password }, req, false);
        }
        else {
            const ip = (0, clientIp_1.getClientIp)(req);
            const query = new ip2region_1.default();
            const ipAddress = query.search(ip);
            let address = '';
            if (ipAddress) {
                const { country, province, city, isp } = ipAddress;
                address = (0, uniq_1.default)([country, province, city, isp])
                    .filter(Boolean)
                    .join(' ');
            }
            await this.updateAuthInfo(authInfo, {
                retries: retries + 1,
                lastlogon: now,
                isTwoFactorChecking: retries + 1 < 5,
                lastip: ip,
                lastaddr: address,
                platform: req.platform,
            });
            return { code: 430, message: (0, i18n_1.t)('验证失败') };
        }
    }
    async deactivateTwoFactor() {
        const authInfo = await this.getAuthInfo();
        await this.updateAuthInfo(authInfo, {
            twoFactorActivated: false,
            twoFactorSecret: '',
            token: '',
            tokens: {},
            isTwoFactorChecking: false,
            twoFactorExpiresAt: 0,
        });
        return true;
    }
    async getAuthInfo() {
        const authInfo = await store_1.shareStore.getAuthInfo();
        if (authInfo) {
            return authInfo;
        }
        const doc = await this.getDb({ type: system_1.AuthDataType.authConfig });
        return (doc.info || {});
    }
    async updateAuthInfo(authInfo, info) {
        const result = Object.assign(Object.assign({}, authInfo), info);
        await store_1.shareStore.updateAuthInfo(result);
        await this.updateAuthDb({
            type: system_1.AuthDataType.authConfig,
            info: result,
        });
        if (info.tokens && Object.keys(info.tokens).length === 0) {
            this.sockService.getClients().forEach((conn) => conn.close('401'));
        }
    }
    async getNotificationMode() {
        const doc = await this.getDb({ type: system_1.AuthDataType.notification });
        return (doc.info || {});
    }
    async updateAuthDb(payload) {
        let doc = await system_1.SystemModel.findOne({ where: { type: payload.type } });
        if (doc) {
            const updateResult = await system_1.SystemModel.update(payload, {
                where: { id: doc.id },
                returning: true,
            });
            doc = updateResult[1][0];
        }
        else {
            doc = await system_1.SystemModel.create(payload, { returning: true });
        }
        return doc;
    }
    async getDb(query) {
        const doc = await system_1.SystemModel.findOne({ where: Object.assign({}, query) });
        if (!doc) {
            throw new Error(`${JSON.stringify(query)} not found`);
        }
        return doc.get({ plain: true });
    }
    async updateNotificationMode(notificationInfo) {
        const code = Math.random().toString().slice(-6);
        const isSuccess = await this.notificationService.testNotify(notificationInfo, (0, i18n_1.t)('青龙'), (0, i18n_1.t)('【蛟龙】测试通知 https://t.me/jiao_long'));
        if (isSuccess) {
            const result = await this.updateAuthDb({
                type: system_1.AuthDataType.notification,
                info: Object.assign({}, notificationInfo),
            });
            return { code: 200, data: Object.assign(Object.assign({}, result), { code }) };
        }
        else {
            return { code: 400, message: (0, i18n_1.t)('通知发送失败，请检查参数') };
        }
    }
    normalizeTokens(tokens) {
        const normalized = {};
        for (const [platform, value] of Object.entries(tokens)) {
            if (typeof value === 'string') {
                // Legacy format: convert string token to TokenInfo array
                if (value) {
                    normalized[platform] = [
                        {
                            value,
                            timestamp: Date.now(),
                            ip: '',
                            address: '',
                            platform,
                        },
                    ];
                }
                else {
                    normalized[platform] = [];
                }
            }
            else {
                // Already in new format
                normalized[platform] = value || [];
            }
        }
        return normalized;
    }
    addTokenToList(tokens, platform, tokenInfo, maxTokensPerPlatform = config_1.default.maxTokensPerPlatform) {
        // Validate maxTokensPerPlatform parameter
        if (!Number.isInteger(maxTokensPerPlatform) || maxTokensPerPlatform < 1) {
            this.logger.warn(`Invalid maxTokensPerPlatform value: ${maxTokensPerPlatform}, using default`);
            maxTokensPerPlatform = config_1.default.maxTokensPerPlatform;
        }
        const normalized = this.normalizeTokens(tokens);
        if (!normalized[platform]) {
            normalized[platform] = [];
        }
        // Add new token
        normalized[platform].unshift(tokenInfo);
        // Limit the number of active tokens per platform
        if (normalized[platform].length > maxTokensPerPlatform) {
            normalized[platform] = normalized[platform].slice(0, maxTokensPerPlatform);
        }
        return normalized;
    }
    removeTokenFromList(tokens, platform, tokenValue) {
        const normalized = this.normalizeTokens(tokens);
        if (normalized[platform]) {
            normalized[platform] = normalized[platform].filter((t) => t.value !== tokenValue);
        }
        return normalized;
    }
    findTokenInList(tokens, platform, tokenValue) {
        const normalized = this.normalizeTokens(tokens);
        if (normalized[platform]) {
            return normalized[platform].find((t) => t.value === tokenValue);
        }
        return undefined;
    }
    async resetAuthInfo(info) {
        const { retries, twoFactorActivated, password, username } = info;
        if (password === 'admin') {
            return { code: 400, message: (0, i18n_1.t)('密码不能设置为admin') };
        }
        const authInfo = await this.getAuthInfo();
        const payload = (0, pickBy_1.default)({
            retries,
            twoFactorActivated,
            password,
            username,
        }, (x) => !(0, isNil_1.default)(x));
        if (password !== undefined) {
            payload.password = await (0, password_1.hashPassword)(password);
        }
        if (password !== undefined ||
            username !== undefined ||
            twoFactorActivated !== undefined) {
            Object.assign(payload, {
                token: '',
                tokens: {},
                isTwoFactorChecking: false,
                twoFactorExpiresAt: 0,
            });
        }
        await this.updateAuthInfo(authInfo, payload);
    }
};
__decorate([
    (0, typedi_1.Inject)((type) => notify_1.default),
    __metadata("design:type", notify_1.default)
], UserService.prototype, "notificationService", void 0);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "login", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "logout", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "blockIp", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "unblockIp", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "initializeUser", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "updateUsernameAndPassword", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "updateAvatar", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserService.prototype, "initTwoFactor", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "activeTwoFactor", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "twoFactorLogin", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserService.prototype, "deactivateTwoFactor", null);
__decorate([
    authMutation_1.serializeAuthMutation,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "resetAuthInfo", null);
UserService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger, schedule_1.default,
        sock_1.default])
], UserService);
exports.default = UserService;
//# sourceMappingURL=user.js.map