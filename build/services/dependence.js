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
const config_1 = __importDefault(require("../config"));
const nedb_1 = __importDefault(require("nedb"));
const dependence_1 = require("../data/dependence");
const child_process_1 = require("child_process");
const sock_1 = __importDefault(require("./sock"));
let DependenceService = class DependenceService {
    constructor(logger, sockService) {
        this.logger = logger;
        this.sockService = sockService;
        this.dependenceDb = new nedb_1.default({ filename: config_1.default.dependenceDbFile });
        this.dependenceDb.loadDatabase((err) => {
            if (err)
                throw err;
        });
    }
    getDb() {
        return this.dependenceDb;
    }
    async create(payloads) {
        const tabs = payloads.map((x) => {
            const tab = new dependence_1.Dependence(Object.assign(Object.assign({}, x), { status: dependence_1.DependenceStatus.installing }));
            return tab;
        });
        const docs = await this.insert(tabs);
        this.installOrUninstallDependencies(docs);
        return docs;
    }
    async insert(payloads) {
        return new Promise((resolve) => {
            this.dependenceDb.insert(payloads, (err, docs) => {
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
        const tab = new dependence_1.Dependence(Object.assign(Object.assign(Object.assign({}, doc), other), { status: dependence_1.DependenceStatus.installing }));
        const newDoc = await this.updateDb(tab);
        this.installOrUninstallDependencies([newDoc]);
        return newDoc;
    }
    async updateDb(payload) {
        return new Promise((resolve) => {
            this.dependenceDb.update({ _id: payload._id }, payload, { returnUpdatedDocs: true }, (err, num, doc) => {
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
            this.dependenceDb.update({ _id: { $in: ids } }, { $set: { status: dependence_1.DependenceStatus.removing, log: [] } }, { multi: true, returnUpdatedDocs: true }, async (err, num, docs) => {
                this.installOrUninstallDependencies(docs, false);
                resolve(docs);
            });
        });
    }
    async removeDb(ids) {
        return new Promise((resolve) => {
            this.dependenceDb.remove({ _id: { $in: ids } }, { multi: true }, async (err) => {
                resolve();
            });
        });
    }
    async dependencies({ searchValue, type }, sort = { position: -1 }, query = {}) {
        let condition = Object.assign(Object.assign({}, query), { type: dependence_1.DependenceTypes[type] });
        if (searchValue) {
            const reg = new RegExp(searchValue);
            condition = Object.assign(Object.assign({}, condition), { $or: [
                    {
                        name: reg,
                    },
                ] });
        }
        const newDocs = await this.find(condition, sort);
        return newDocs;
    }
    async reInstall(ids) {
        return new Promise((resolve) => {
            this.dependenceDb.update({ _id: { $in: ids } }, { $set: { status: dependence_1.DependenceStatus.installing, log: [] } }, { multi: true, returnUpdatedDocs: true }, async (err, num, docs) => {
                this.installOrUninstallDependencies(docs);
                resolve(docs);
            });
        });
    }
    async find(query, sort) {
        return new Promise((resolve) => {
            this.dependenceDb
                .find(query)
                .sort(Object.assign({}, sort))
                .exec((err, docs) => {
                resolve(docs);
            });
        });
    }
    async get(_id) {
        return new Promise((resolve) => {
            this.dependenceDb.find({ _id }).exec((err, docs) => {
                resolve(docs[0]);
            });
        });
    }
    async updateLog(ids, log) {
        return new Promise((resolve) => {
            this.dependenceDb.update({ _id: { $in: ids } }, { $push: { log } }, { multi: true }, (err, num, doc) => {
                if (err) {
                    this.logger.error(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    installOrUninstallDependencies(dependencies, isInstall = true) {
        if (dependencies.length === 0) {
            return;
        }
        const depNames = dependencies.map((x) => x.name).join(' ');
        const depRunCommand = (isInstall
            ? dependence_1.InstallDependenceCommandTypes
            : dependence_1.unInstallDependenceCommandTypes)[dependencies[0].type];
        const actionText = isInstall ? '安装' : '删除';
        const depIds = dependencies.map((x) => x._id);
        const cp = child_process_1.spawn(`${depRunCommand} ${depNames}`, { shell: '/bin/bash' });
        const startTime = Date.now();
        this.sockService.sendMessage({
            type: 'installDependence',
            message: `开始${actionText}依赖 ${depNames}，开始时间 ${new Date(startTime).toLocaleString()}`,
            references: depIds,
        });
        this.updateLog(depIds, `开始${actionText}依赖 ${depNames}，开始时间 ${new Date(startTime).toLocaleString()}\n`);
        cp.stdout.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'installDependence',
                message: data.toString(),
                references: depIds,
            });
            this.updateLog(depIds, data.toString());
        });
        cp.stderr.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'installDependence',
                message: data.toString(),
                references: depIds,
            });
            this.updateLog(depIds, data.toString());
        });
        cp.on('error', (err) => {
            this.sockService.sendMessage({
                type: 'installDependence',
                message: JSON.stringify(err),
                references: depIds,
            });
            this.updateLog(depIds, JSON.stringify(err));
        });
        cp.on('close', (code) => {
            const endTime = Date.now();
            const isSucceed = code === 0;
            const resultText = isSucceed ? '成功' : '失败';
            this.sockService.sendMessage({
                type: 'installDependence',
                message: `依赖${actionText}${resultText}，结束时间 ${new Date(endTime).toLocaleString()}，耗时 ${(endTime - startTime) / 1000} 秒`,
                references: depIds,
            });
            this.updateLog(depIds, `依赖${actionText}${resultText}，结束时间 ${new Date(endTime).toLocaleString()}，耗时 ${(endTime - startTime) / 1000} 秒`);
            let status = null;
            if (isSucceed) {
                status = isInstall
                    ? dependence_1.DependenceStatus.installed
                    : dependence_1.DependenceStatus.removed;
            }
            else {
                status = isInstall
                    ? dependence_1.DependenceStatus.installFailed
                    : dependence_1.DependenceStatus.removeFailed;
            }
            this.dependenceDb.update({ _id: { $in: depIds } }, {
                $set: { status },
                $unset: { pid: true },
            }, { multi: true });
            // 如果删除依赖成功，3秒后删除数据库记录
            if (isSucceed && !isInstall) {
                setTimeout(() => {
                    this.removeDb(depIds);
                }, 5000);
            }
        });
    }
};
DependenceService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object, sock_1.default])
], DependenceService);
exports.default = DependenceService;
//# sourceMappingURL=dependence.js.map