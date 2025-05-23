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
const request_ip_1 = __importDefault(require("request-ip"));
const uniq_1 = __importDefault(require("lodash/uniq"));
const pickBy_1 = __importDefault(require("lodash/pickBy"));
const isNil_1 = __importDefault(require("lodash/isNil"));
const store_1 = require("../shared/store");
let UserService = class UserService {
    constructor(logger, scheduleService, sockService) {
        this.logger = logger;
        this.scheduleService = scheduleService;
        this.sockService = sockService;
    }
    async login(payloads, req, needTwoFactor = true) {
        let { username, password } = payloads;
        const content = await this.getAuthInfo();
        const timestamp = Date.now();
        let { username: cUsername, password: cPassword, retries = 0, lastlogon, lastip, lastaddr, twoFactorActivated, tokens = {}, platform, } = content;
        const retriesTime = Math.pow(3, retries) * 1000;
        if (retries > 2 && timestamp - lastlogon < retriesTime) {
            const waitTime = Math.ceil((retriesTime - (timestamp - lastlogon)) / 1000);
            return {
                code: 410,
                message: `失败次数过多，请${waitTime}秒后重试`,
                data: waitTime,
            };
        }
        if (username === cUsername &&
            password === cPassword &&
            twoFactorActivated &&
            needTwoFactor) {
            await this.updateAuthInfo(content, {
                isTwoFactorChecking: true,
            });
            return {
                code: 420,
                message: '',
            };
        }
        const ip = request_ip_1.default.getClientIp(req) || '';
        const query = new ip2region_1.default();
        const ipAddress = query.search(ip);
        let address = '';
        if (ipAddress) {
            const { country, province, city, isp } = ipAddress;
            address = (0, uniq_1.default)([country, province, city, isp]).filter(Boolean).join(' ');
        }
        if (username === cUsername && password === cPassword) {
            const data = (0, util_1.createRandomString)(50, 100);
            const expiration = twoFactorActivated ? '60d' : '20d';
            let token = jsonwebtoken_1.default.sign({ data }, config_1.default.jwt.secret, {
                expiresIn: config_1.default.jwt.expiresIn || expiration,
                algorithm: 'HS384',
            });
            await this.updateAuthInfo(content, {
                token,
                tokens: Object.assign(Object.assign({}, tokens), { [req.platform]: token }),
                lastlogon: timestamp,
                retries: 0,
                lastip: ip,
                lastaddr: address,
                platform: req.platform,
                isTwoFactorChecking: false,
            });
            this.notificationService.notify('登录通知', `你于${(0, dayjs_1.default)(timestamp).format('YYYY-MM-DD HH:mm:ss')}在 ${address} ${req.platform}端 登录成功，ip地址 ${ip}`);
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
            this.notificationService.notify('登录通知', `你于${(0, dayjs_1.default)(timestamp).format('YYYY-MM-DD HH:mm:ss')}在 ${address} ${req.platform}端 登录失败，ip地址 ${ip}`);
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
                    message: `失败次数过多，请${waitTime}秒后重试`,
                    data: waitTime,
                };
            }
            else {
                return { code: 400, message: config_1.default.authError };
            }
        }
    }
    async logout(platform) {
        const authInfo = await this.getAuthInfo();
        await this.updateAuthInfo(authInfo, {
            token: '',
            tokens: Object.assign(Object.assign({}, authInfo.tokens), { [platform]: '' }),
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
    async insertDb(payload) {
        const doc = await system_1.SystemModel.create(Object.assign({}, payload), { returning: true });
        return doc;
    }
    async updateUsernameAndPassword({ username, password, }) {
        if (password === 'admin') {
            return { code: 400, message: '密码不能设置为admin' };
        }
        const authInfo = await this.getAuthInfo();
        await this.updateAuthInfo(authInfo, { username, password });
        return { code: 200, message: '更新成功' };
    }
    async updateAvatar(avatar) {
        const authInfo = await this.getAuthInfo();
        await this.updateAuthInfo(authInfo, { avatar });
        return { code: 200, data: avatar, message: '更新成功' };
    }
    async initTwoFactor() {
        const secret = preset_default_1.authenticator.generateSecret();
        const authInfo = await this.getAuthInfo();
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
            await this.updateAuthInfo(authInfo, { twoFactorActivated: true });
        }
        return isValid;
    }
    async twoFactorLogin({ username, password, code, }, req) {
        const authInfo = await this.getAuthInfo();
        const { isTwoFactorChecking, twoFactorSecret } = authInfo;
        if (!isTwoFactorChecking) {
            return { code: 450, message: '未知错误' };
        }
        const isValid = preset_default_1.authenticator.verify({
            token: code,
            secret: twoFactorSecret,
        });
        if (isValid) {
            return this.login({ username, password }, req, false);
        }
        else {
            const ip = request_ip_1.default.getClientIp(req) || '';
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
                lastip: ip,
                lastaddr: address,
                platform: req.platform,
            });
            return { code: 430, message: '验证失败' };
        }
    }
    async deactiveTwoFactor() {
        const authInfo = await this.getAuthInfo();
        await this.updateAuthInfo(authInfo, {
            twoFactorActivated: false,
            twoFactorSecret: '',
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
        const isSuccess = await this.notificationService.testNotify(notificationInfo, '青龙', `【蛟龙】测试通知 https://t.me/jiao_long`);
        if (isSuccess) {
            const result = await this.updateAuthDb({
                type: system_1.AuthDataType.notification,
                info: Object.assign({}, notificationInfo),
            });
            return { code: 200, data: Object.assign(Object.assign({}, result), { code }) };
        }
        else {
            return { code: 400, message: '通知发送失败，请检查参数' };
        }
    }
    async resetAuthInfo(info) {
        const { retries, twoFactorActivated, password, username } = info;
        const authInfo = await this.getAuthInfo();
        const payload = (0, pickBy_1.default)({
            retries,
            twoFactorActivated,
            password,
            username,
        }, (x) => !(0, isNil_1.default)(x));
        await this.updateAuthInfo(authInfo, payload);
    }
};
__decorate([
    (0, typedi_1.Inject)((type) => notify_1.default),
    __metadata("design:type", notify_1.default)
], UserService.prototype, "notificationService", void 0);
UserService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger, schedule_1.default,
        sock_1.default])
], UserService);
exports.default = UserService;
//# sourceMappingURL=user.js.map