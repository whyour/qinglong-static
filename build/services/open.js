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
const util_1 = require("../config/util");
const config_1 = __importDefault(require("../config"));
const nedb_1 = __importDefault(require("nedb"));
const open_1 = require("../data/open");
const uuid_1 = require("uuid");
let OpenService = class OpenService {
    constructor(logger) {
        this.logger = logger;
        this.appDb = new nedb_1.default({ filename: config_1.default.appDbFile });
        this.appDb.loadDatabase((err) => {
            if (err)
                throw err;
        });
    }
    getDb() {
        return this.appDb;
    }
    async findTokenByValue(token) {
        return new Promise((resolve) => {
            this.appDb.find({ tokens: { $elemMatch: { value: token } } }, (err, docs) => {
                if (err) {
                    this.logger.error(err);
                }
                else {
                    resolve(docs[0]);
                }
            });
        });
    }
    async create(payload) {
        const tab = new open_1.App(Object.assign({}, payload));
        tab.client_id = util_1.createRandomString(12, 12);
        tab.client_secret = util_1.createRandomString(24, 24);
        const docs = await this.insert([tab]);
        return Object.assign(Object.assign({}, docs[0]), { tokens: [] });
    }
    async insert(payloads) {
        return new Promise((resolve) => {
            this.appDb.insert(payloads, (err, docs) => {
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
        const { _id, client_id, client_secret, tokens } = payload, other = __rest(payload, ["_id", "client_id", "client_secret", "tokens"]);
        const doc = await this.get(_id);
        const tab = new open_1.App(Object.assign(Object.assign({}, doc), other));
        const newDoc = await this.updateDb(tab);
        return Object.assign(Object.assign({}, newDoc), { tokens: [] });
    }
    async updateDb(payload) {
        return new Promise((resolve) => {
            this.appDb.update({ _id: payload._id }, payload, { returnUpdatedDocs: true }, (err, num, doc, up) => {
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
            this.appDb.remove({ _id: { $in: ids } }, { multi: true }, async (err) => {
                resolve();
            });
        });
    }
    async resetSecret(_id) {
        const doc = await this.get(_id);
        const tab = new open_1.App(Object.assign({}, doc));
        tab.client_secret = util_1.createRandomString(24, 24);
        tab.tokens = [];
        const newDoc = await this.updateDb(tab);
        return newDoc;
    }
    async list(searchText = '', sort = {}, query = {}) {
        let condition = Object.assign({}, query);
        if (searchText) {
            const reg = new RegExp(searchText);
            condition = {
                $or: [
                    {
                        value: reg,
                    },
                    {
                        name: reg,
                    },
                    {
                        remarks: reg,
                    },
                ],
            };
        }
        const newDocs = await this.find(condition, sort);
        return newDocs.map((x) => (Object.assign(Object.assign({}, x), { tokens: [] })));
    }
    async find(query, sort) {
        return new Promise((resolve) => {
            this.appDb
                .find(query)
                .sort(Object.assign({}, sort))
                .exec((err, docs) => {
                resolve(docs);
            });
        });
    }
    async get(_id) {
        return new Promise((resolve) => {
            this.appDb.find({ _id }).exec((err, docs) => {
                resolve(docs[0]);
            });
        });
    }
    async authToken({ client_id, client_secret, }) {
        const token = uuid_1.v4();
        const expiration = Math.round(Date.now() / 1000) + 2592000; // 2592000 30天
        return new Promise((resolve) => {
            this.appDb.find({ client_id, client_secret }).exec((err, docs) => {
                if (docs && docs[0]) {
                    this.appDb.update({ client_id, client_secret }, { $push: { tokens: { value: token, expiration } } }, {}, (err, num, doc) => {
                        resolve({
                            code: 200,
                            data: {
                                token,
                                token_type: 'Bearer',
                                expiration,
                            },
                        });
                    });
                }
                else {
                    resolve({ code: 400, message: 'client_id或client_seret有误' });
                }
            });
        });
    }
};
OpenService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object])
], OpenService);
exports.default = OpenService;
//# sourceMappingURL=open.js.map