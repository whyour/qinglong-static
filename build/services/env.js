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
const config_1 = __importDefault(require("../config"));
const fs = __importStar(require("fs"));
const nedb_1 = __importDefault(require("nedb"));
const env_1 = require("../data/env");
const lodash_1 = __importDefault(require("lodash"));
let EnvService = class EnvService {
    constructor(logger) {
        this.logger = logger;
        this.envDb = new nedb_1.default({ filename: config_1.default.envDbFile });
        this.envDb.loadDatabase((err) => {
            if (err)
                throw err;
        });
    }
    getDb() {
        return this.envDb;
    }
    async create(payloads) {
        const envs = await this.envs();
        let position = env_1.initEnvPosition;
        if (envs && envs.length > 0 && envs[envs.length - 1].position) {
            position = envs[envs.length - 1].position;
        }
        const tabs = payloads.map((x) => {
            position = position / 2;
            const tab = new env_1.Env(Object.assign(Object.assign({}, x), { position }));
            return tab;
        });
        const docs = await this.insert(tabs);
        await this.set_envs();
        return docs;
    }
    async insert(payloads) {
        return new Promise((resolve) => {
            this.envDb.insert(payloads, (err, docs) => {
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
        const tab = new env_1.Env(Object.assign(Object.assign({}, doc), other));
        const newDoc = await this.updateDb(tab);
        await this.set_envs();
        return newDoc;
    }
    async updateDb(payload) {
        return new Promise((resolve) => {
            this.envDb.update({ _id: payload._id }, payload, { returnUpdatedDocs: true }, (err, num, doc) => {
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
            this.envDb.remove({ _id: { $in: ids } }, { multi: true }, async (err) => {
                await this.set_envs();
                resolve();
            });
        });
    }
    async move(_id, { fromIndex, toIndex, }) {
        let targetPosition;
        const isUpward = fromIndex > toIndex;
        const envs = await this.envs();
        if (toIndex === 0 || toIndex === envs.length - 1) {
            targetPosition = isUpward
                ? envs[0].position * 2
                : envs[toIndex].position / 2;
        }
        else {
            targetPosition = isUpward
                ? (envs[toIndex].position + envs[toIndex - 1].position) / 2
                : (envs[toIndex].position + envs[toIndex + 1].position) / 2;
        }
        const newDoc = await this.update({
            _id,
            position: targetPosition,
        });
        return newDoc;
    }
    async envs(searchText = '', sort = { position: -1 }, query = {}) {
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
        return newDocs;
    }
    async find(query, sort) {
        return new Promise((resolve) => {
            this.envDb
                .find(query)
                .sort(Object.assign({}, sort))
                .exec((err, docs) => {
                resolve(docs);
            });
        });
    }
    async get(_id) {
        return new Promise((resolve) => {
            this.envDb.find({ _id }).exec((err, docs) => {
                resolve(docs[0]);
            });
        });
    }
    async getBySort(sort) {
        return new Promise((resolve) => {
            this.envDb
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
            this.envDb.update({ _id: { $in: ids } }, { $set: { status: env_1.EnvStatus.disabled } }, { multi: true }, async (err) => {
                await this.set_envs();
                resolve();
            });
        });
    }
    async enabled(ids) {
        return new Promise((resolve) => {
            this.envDb.update({ _id: { $in: ids } }, { $set: { status: env_1.EnvStatus.normal } }, { multi: true }, async (err, num) => {
                await this.set_envs();
                resolve();
            });
        });
    }
    async updateNames({ ids, name }) {
        return new Promise((resolve) => {
            this.envDb.update({ _id: { $in: ids } }, { $set: { name } }, { multi: true }, async (err, num) => {
                await this.set_envs();
                resolve();
            });
        });
    }
    async set_envs() {
        const envs = await this.envs('', { position: -1 }, { name: { $exists: true } });
        const groups = lodash_1.default.groupBy(envs, 'name');
        let env_string = '';
        for (const key in groups) {
            if (Object.prototype.hasOwnProperty.call(groups, key)) {
                const group = groups[key];
                // 忽略不符合bash要求的环境变量名称
                if (/^[a-zA-Z_][0-9a-zA-Z_]+$/.test(key)) {
                    env_string += `export ${key}="${lodash_1.default(group)
                        .filter((x) => x.status !== env_1.EnvStatus.disabled)
                        .map('value')
                        .join('&')
                        .replace(/ /g, '')}"\n`;
                }
            }
        }
        fs.writeFileSync(config_1.default.envFile, env_string);
    }
};
EnvService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object])
], EnvService);
exports.default = EnvService;
//# sourceMappingURL=env.js.map