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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const fs = __importStar(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const preset_default_1 = require("@otplib/preset-default");
const nedb_1 = __importDefault(require("nedb"));
const auth_1 = require("../data/auth");
const notify_1 = __importDefault(require("./notify"));
const schedule_1 = __importDefault(require("./schedule"));
const child_process_1 = require("child_process");
const sock_1 = __importDefault(require("./sock"));
const got_1 = __importDefault(require("got"));
let UserService = class UserService {
    constructor(logger, scheduleService, sockService) {
        this.logger = logger;
        this.scheduleService = scheduleService;
        this.sockService = sockService;
        this.authDb = new nedb_1.default({ filename: config_1.default.authDbFile });
        this.authDb.loadDatabase((err) => {
            if (err)
                throw err;
        });
    }
    async login(payloads, req, needTwoFactor = true) {
        if (!fs.existsSync(config_1.default.authConfigFile)) {
            return this.initAuthInfo();
        }
        let { username, password } = payloads;
        const content = this.getAuthInfo();
        const timestamp = Date.now();
        if (content) {
            let { username: cUsername, password: cPassword, retries = 0, lastlogon, lastip, lastaddr, twoFactorActivated, twoFactorActived, tokens = {}, platform, } = content;
            // patch old field
            twoFactorActivated = twoFactorActivated || twoFactorActived;
            if ((cUsername === 'admin' && cPassword === 'admin') ||
                !cUsername ||
                !cPassword) {
                return this.initAuthInfo();
            }
            if (retries > 2 && Date.now() - lastlogon < Math.pow(3, retries) * 1000) {
                return {
                    code: 410,
                    message: `失败次数过多，请${Math.round((Math.pow(3, retries) * 1000 - Date.now() + lastlogon) / 1000)}秒后重试`,
                    data: Math.round((Math.pow(3, retries) * 1000 - Date.now() + lastlogon) / 1000),
                };
            }
            const { ip, address } = await util_1.getNetIp(req);
            if (username === cUsername && password === cPassword) {
                if (twoFactorActivated && needTwoFactor) {
                    this.updateAuthInfo(content, {
                        isTwoFactorChecking: true,
                    });
                    return {
                        code: 420,
                        message: '请输入两步验证token',
                    };
                }
                const data = util_1.createRandomString(50, 100);
                const expiration = twoFactorActivated ? 30 : 3;
                let token = jsonwebtoken_1.default.sign({ data }, config_1.default.secret, {
                    expiresIn: 60 * 60 * 24 * expiration,
                    algorithm: 'HS384',
                });
                this.updateAuthInfo(content, {
                    token,
                    tokens: Object.assign(Object.assign({}, tokens), { [req.platform]: token }),
                    lastlogon: timestamp,
                    retries: 0,
                    lastip: ip,
                    lastaddr: address,
                    platform: req.platform,
                    isTwoFactorChecking: false,
                });
                await this.notificationService.notify('登录通知', `你于${new Date(timestamp).toLocaleString()}在 ${address} ${req.platform}端 登录成功，ip地址 ${ip}`);
                await this.getLoginLog();
                await this.insertDb({
                    type: auth_1.AuthDataType.loginLog,
                    info: {
                        timestamp,
                        address,
                        ip,
                        platform: req.platform,
                        status: auth_1.LoginStatus.success,
                    },
                });
                return {
                    code: 200,
                    data: { token, lastip, lastaddr, lastlogon, retries, platform },
                };
            }
            else {
                this.updateAuthInfo(content, {
                    retries: retries + 1,
                    lastlogon: timestamp,
                    lastip: ip,
                    lastaddr: address,
                    platform: req.platform,
                });
                await this.notificationService.notify('登录通知', `你于${new Date(timestamp).toLocaleString()}在 ${address} ${req.platform}端 登录失败，ip地址 ${ip}`);
                await this.getLoginLog();
                await this.insertDb({
                    type: auth_1.AuthDataType.loginLog,
                    info: {
                        timestamp,
                        address,
                        ip,
                        platform: req.platform,
                        status: auth_1.LoginStatus.fail,
                    },
                });
                return { code: 400, message: config_1.default.authError };
            }
        }
        else {
            return this.initAuthInfo();
        }
    }
    async logout(platform) {
        const authInfo = this.getAuthInfo();
        this.updateAuthInfo(authInfo, {
            token: '',
            tokens: Object.assign(Object.assign({}, authInfo.tokens), { [platform]: '' }),
        });
    }
    async getLoginLog() {
        return new Promise((resolve) => {
            this.authDb.find({ type: auth_1.AuthDataType.loginLog }).exec((err, docs) => {
                if (err || docs.length === 0) {
                    resolve([]);
                }
                else {
                    const result = docs.sort((a, b) => b.info.timestamp - a.info.timestamp);
                    if (result.length > 100) {
                        this.authDb.remove({ _id: result[result.length - 1]._id });
                    }
                    resolve(result.map((x) => x.info));
                }
            });
        });
    }
    async insertDb(payload) {
        return new Promise((resolve) => {
            this.authDb.insert(payload, (err, doc) => {
                if (err) {
                    this.logger.error(err);
                }
                else {
                    resolve(doc);
                }
            });
        });
    }
    initAuthInfo() {
        const newPassword = util_1.createRandomString(16, 22);
        fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify({
            username: 'admin',
            password: newPassword,
        }));
        return {
            code: 100,
            message: '已初始化密码，请前往auth.json查看并重新登录',
        };
    }
    async updateUsernameAndPassword({ username, password, }) {
        if (password === 'admin') {
            return { code: 400, message: '密码不能设置为admin' };
        }
        const authInfo = this.getAuthInfo();
        this.updateAuthInfo(authInfo, { username, password });
        return { code: 200, message: '更新成功' };
    }
    getUserInfo() {
        return new Promise((resolve) => {
            fs.readFile(config_1.default.authConfigFile, 'utf8', (err, data) => {
                if (err)
                    console.log(err);
                resolve(JSON.parse(data));
            });
        });
    }
    initTwoFactor() {
        const secret = preset_default_1.authenticator.generateSecret();
        const authInfo = this.getAuthInfo();
        const otpauth = preset_default_1.authenticator.keyuri(authInfo.username, 'qinglong', secret);
        this.updateAuthInfo(authInfo, { twoFactorSecret: secret });
        return { secret, url: otpauth };
    }
    activeTwoFactor(code) {
        const authInfo = this.getAuthInfo();
        const isValid = preset_default_1.authenticator.verify({
            token: code,
            secret: authInfo.twoFactorSecret,
        });
        if (isValid) {
            this.updateAuthInfo(authInfo, { twoFactorActivated: true });
        }
        return isValid;
    }
    async twoFactorLogin({ username, password, code, }, req) {
        const authInfo = this.getAuthInfo();
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
            const { ip, address } = await util_1.getNetIp(req);
            this.updateAuthInfo(authInfo, {
                lastip: ip,
                lastaddr: address,
                platform: req.platform,
            });
            return { code: 430, message: '验证失败' };
        }
    }
    deactiveTwoFactor() {
        const authInfo = this.getAuthInfo();
        this.updateAuthInfo(authInfo, {
            twoFactorActivated: false,
            twoFactorActived: false,
            twoFactorSecret: '',
        });
        return true;
    }
    getAuthInfo() {
        const content = fs.readFileSync(config_1.default.authConfigFile, 'utf8');
        return JSON.parse(content || '{}');
    }
    updateAuthInfo(authInfo, info) {
        fs.writeFileSync(config_1.default.authConfigFile, JSON.stringify(Object.assign(Object.assign({}, authInfo), info)));
    }
    async getNotificationMode() {
        return new Promise((resolve) => {
            this.authDb
                .find({ type: auth_1.AuthDataType.notification })
                .exec((err, docs) => {
                if (err || docs.length === 0) {
                    resolve({});
                }
                else {
                    resolve(docs[0].info);
                }
            });
        });
    }
    async getLogRemoveFrequency() {
        return new Promise((resolve) => {
            this.authDb
                .find({ type: auth_1.AuthDataType.removeLogFrequency })
                .exec((err, docs) => {
                if (err || docs.length === 0) {
                    resolve({});
                }
                else {
                    resolve(docs[0].info);
                }
            });
        });
    }
    async updateAuthDb(payload) {
        return new Promise((resolve) => {
            this.authDb.update({ type: payload.type }, Object.assign({}, payload), { upsert: true, returnUpdatedDocs: true }, (err, num, doc) => {
                if (err) {
                    resolve({});
                }
                else {
                    resolve(Object.assign(Object.assign({}, doc.info), { _id: doc._id }));
                }
            });
        });
    }
    async updateNotificationMode(notificationInfo) {
        const code = Math.random().toString().slice(-6);
        const isSuccess = await this.notificationService.testNotify(notificationInfo, '青龙', `【蛟龙】测试通知 https://t.me/jiao_long`);
        if (isSuccess) {
            const result = await this.updateAuthDb({
                type: auth_1.AuthDataType.notification,
                info: Object.assign({}, notificationInfo),
            });
            return { code: 200, data: Object.assign(Object.assign({}, result), { code }) };
        }
        else {
            return { code: 400, data: '通知发送失败，请检查参数' };
        }
    }
    async updateLogRemoveFrequency(frequency) {
        const result = await this.updateAuthDb({
            type: auth_1.AuthDataType.removeLogFrequency,
            info: { frequency },
        });
        const cron = {
            _id: result._id,
            name: '删除日志',
            command: `ql rmlog ${frequency}`,
            schedule: `5 23 */${frequency} * *`,
        };
        await this.scheduleService.cancelSchedule(cron);
        if (frequency > 0) {
            await this.scheduleService.generateSchedule(cron);
        }
        return { code: 200, data: Object.assign({}, cron) };
    }
    async checkUpdate() {
        try {
            const versionRegx = /.*export const version = \'(.*)\'\;/;
            const logRegx = /.*export const changeLog = \`((.*\n.*)+)\`;/;
            const currentVersionFile = fs.readFileSync(config_1.default.versionFile, 'utf8');
            const currentVersion = currentVersionFile.match(versionRegx)[1];
            const lastVersionFileContent = await (await got_1.default.get(config_1.default.lastVersionFile)).body;
            const lastVersion = lastVersionFileContent.match(versionRegx)[1];
            const lastLog = lastVersionFileContent.match(logRegx)
                ? lastVersionFileContent.match(logRegx)[1]
                : '';
            return {
                code: 200,
                data: {
                    hasNewVersion: currentVersion !== lastVersion,
                    lastVersion,
                    lastLog,
                },
            };
        }
        catch (error) {
            return {
                code: 400,
                data: error.message,
            };
        }
    }
    async updateSystem() {
        const cp = child_process_1.spawn('ql -l update', { shell: '/bin/bash' });
        this.sockService.sendMessage({
            type: 'updateSystemVersion',
            message: `开始更新系统`,
        });
        cp.stdout.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'updateSystemVersion',
                message: data.toString(),
            });
        });
        cp.stderr.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'updateSystemVersion',
                message: data.toString(),
            });
        });
        cp.on('error', (err) => {
            this.sockService.sendMessage({
                type: 'updateSystemVersion',
                message: JSON.stringify(err),
            });
        });
        return { code: 200 };
    }
};
__decorate([
    typedi_1.Inject((type) => notify_1.default),
    __metadata("design:type", notify_1.default)
], UserService.prototype, "notificationService", void 0);
UserService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object, schedule_1.default,
        sock_1.default])
], UserService);
exports.default = UserService;
//# sourceMappingURL=user.js.map