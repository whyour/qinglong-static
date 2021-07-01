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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const util_1 = require("../config/util");
const config_1 = __importDefault(require("../config"));
const fs = __importStar(require("fs"));
const nedb_1 = __importDefault(require("nedb"));
const cookie_1 = require("../data/cookie");
let CookieService = class CookieService {
    constructor(logger) {
        this.logger = logger;
        this.cronDb = new nedb_1.default({ filename: config_1.default.cookieDbFile });
        this.cronDb.loadDatabase((err) => {
            if (err)
                throw err;
        });
    }
    async getCookies() {
        const content = util_1.getFileContentByName(config_1.default.cookieFile);
        return this.formatCookie(content.split('\n').filter((x) => !!x));
    }
    async addCookie(cookies) {
        let content = util_1.getFileContentByName(config_1.default.cookieFile);
        const originCookies = content.split('\n').filter((x) => !!x);
        const result = originCookies.concat(cookies);
        fs.writeFileSync(config_1.default.cookieFile, result.join('\n'));
        return '';
    }
    async updateCookie({ cookie, oldCookie }) {
        let content = util_1.getFileContentByName(config_1.default.cookieFile);
        const cookies = content.split('\n');
        const index = cookies.findIndex((x) => x === oldCookie);
        if (index !== -1) {
            cookies[index] = cookie;
            fs.writeFileSync(config_1.default.cookieFile, cookies.join('\n'));
            return '';
        }
        else {
            return '未找到要原有Cookie';
        }
    }
    async deleteCookie(cookie) {
        let content = util_1.getFileContentByName(config_1.default.cookieFile);
        const cookies = content.split('\n');
        const index = cookies.findIndex((x) => x === cookie);
        if (index !== -1) {
            cookies.splice(index, 1);
            fs.writeFileSync(config_1.default.cookieFile, cookies.join('\n'));
            return '';
        }
        else {
            return '未找到要删除的Cookie';
        }
    }
    async formatCookie(data) {
        const result = [];
        for (const x of data) {
            const { nickname, status } = await this.getJdInfo(x);
            if (/pt_pin=(.+?);/.test(x)) {
                result.push({
                    pin: x.match(/pt_pin=(.+?);/)[1],
                    cookie: x,
                    status,
                    nickname: nickname,
                });
            }
            else {
                result.push({
                    pin: 'pin未匹配到',
                    cookie: x,
                    status,
                    nickname: nickname,
                });
            }
        }
        return result;
    }
    async refreshCookie(_id) {
        const current = await this.get(_id);
        const { status, nickname } = await this.getJdInfo(current.value);
        return Object.assign(Object.assign({}, current), { status,
            nickname });
    }
    getJdInfo(cookie) {
        return node_fetch_1.default(`https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&_=${Date.now()}&sceneval=2&g_login_type=1&g_ty=ls`, {
            method: 'get',
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-cn',
                Connection: 'keep-alive',
                Cookie: cookie,
                Referer: 'https://home.m.jd.com/myJd/newhome.action',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
                Host: 'me-api.jd.com',
            },
        })
            .then((x) => x.json())
            .then((x) => {
            if (x.retcode === '0' && x.data && x.data.userInfo) {
                return {
                    nickname: x.data.userInfo.baseInfo.nickname,
                    status: cookie_1.CookieStatus.normal,
                };
            }
            else if (x.retcode === 13) {
                return { status: cookie_1.CookieStatus.invalid, nickname: '-' };
            }
            return { status: cookie_1.CookieStatus.abnormal, nickname: '-' };
        });
    }
    async formatCookies(cookies) {
        const result = [];
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            if (cookie.status !== cookie_1.CookieStatus.disabled) {
                const { status, nickname } = await this.getJdInfo(cookie.value);
                result.push(Object.assign(Object.assign({}, cookie), { status, nickname }));
            }
            else {
                result.push(Object.assign(Object.assign({}, cookie), { nickname: '-' }));
            }
        }
        return result;
    }
    async create(payload) {
        const cookies = await this.cookies();
        let position = cookie_1.initCookiePosition;
        if (cookies && cookies.length > 0) {
            position = cookies[cookies.length - 1].position;
        }
        const tabs = payload.map((x) => {
            const cookie = new cookie_1.Cookie({ value: x, position });
            position = position / 2;
            cookie.position = position;
            return cookie;
        });
        const docs = await this.insert(tabs);
        await this.set_cookies();
        return await this.formatCookies(docs);
    }
    async insert(payload) {
        return new Promise((resolve) => {
            this.cronDb.insert(payload, (err, docs) => {
                if (err) {
                    this.logger.error(err);
                }
                else {
                    resolve(docs);
                }
            });
        });
    }
    async update(payload) {
        const { _id } = payload, other = __rest(payload, ["_id"]);
        const doc = await this.get(_id);
        const tab = new cookie_1.Cookie(Object.assign(Object.assign({}, doc), other));
        const newDoc = await this.updateDb(tab);
        await this.set_cookies();
        const [newCookie] = await this.formatCookies([newDoc]);
        return newCookie;
    }
    async updateDb(payload) {
        return new Promise((resolve) => {
            this.cronDb.update({ _id: payload._id }, payload, { returnUpdatedDocs: true }, (err, num, doc) => {
                if (err) {
                    this.logger.error(err);
                }
                else {
                    resolve(doc);
                }
            });
        });
    }
    async remove(ids) {
        return new Promise((resolve) => {
            this.cronDb.remove({ _id: { $in: ids } }, { multi: true }, async (err) => {
                await this.set_cookies();
                resolve();
            });
        });
    }
    async move(_id, { fromIndex, toIndex, }) {
        let targetPosition;
        const isUpward = fromIndex > toIndex;
        const cookies = await this.cookies();
        if (toIndex === 0 || toIndex === cookies.length - 1) {
            targetPosition = isUpward
                ? cookies[0].position * 2
                : cookies[toIndex].position / 2;
        }
        else {
            targetPosition = isUpward
                ? (cookies[toIndex].position + cookies[toIndex - 1].position) / 2
                : (cookies[toIndex].position + cookies[toIndex + 1].position) / 2;
        }
        this.update({
            _id,
            position: targetPosition,
        });
        await this.set_cookies();
    }
    async cookies(searchText, sort = { position: -1 }, needDetail = false) {
        let query = {};
        if (searchText) {
            const reg = new RegExp(searchText);
            query = {
                $or: [
                    {
                        name: reg,
                    },
                    {
                        command: reg,
                    },
                ],
            };
        }
        const newDocs = await this.find(query, sort);
        if (needDetail) {
            return await this.formatCookies(newDocs);
        }
        else {
            return newDocs;
        }
    }
    async find(query, sort) {
        return new Promise((resolve) => {
            this.cronDb
                .find(query)
                .sort(Object.assign({}, sort))
                .exec((err, docs) => {
                resolve(docs);
            });
        });
    }
    async get(_id) {
        return new Promise((resolve) => {
            this.cronDb.find({ _id }).exec((err, docs) => {
                resolve(docs[0]);
            });
        });
    }
    async getBySort(sort) {
        return new Promise((resolve) => {
            this.cronDb
                .find({})
                .sort(Object.assign({}, sort))
                .limit(1)
                .exec((err, docs) => {
                resolve(docs[0]);
            });
        });
    }
    async disabled(ids) {
        return new Promise((resolve) => {
            this.cronDb.update({ _id: { $in: ids } }, { $set: { status: cookie_1.CookieStatus.disabled } }, { multi: true }, async (err) => {
                await this.set_cookies();
                resolve();
            });
        });
    }
    async enabled(ids) {
        return new Promise((resolve) => {
            this.cronDb.update({ _id: { $in: ids } }, { $set: { status: cookie_1.CookieStatus.noacquired } }, { multi: true }, async (err, num) => {
                await this.set_cookies();
                resolve();
            });
        });
    }
    async set_cookies() {
        const cookies = await this.cookies();
        let cookie_string = '';
        cookies.forEach((tab) => {
            if (tab.status !== cookie_1.CookieStatus.disabled) {
                cookie_string += tab.value;
                cookie_string += '\n';
            }
        });
        fs.writeFileSync(config_1.default.cookieFile, cookie_string);
    }
};
CookieService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object])
], CookieService);
exports.default = CookieService;
//# sourceMappingURL=cookie.js.map