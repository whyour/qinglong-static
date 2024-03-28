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
const dependence_1 = require("../data/dependence");
const cross_spawn_1 = require("cross-spawn");
const sock_1 = __importDefault(require("./sock"));
const sequelize_1 = require("sequelize");
const util_1 = require("../config/util");
const dayjs_1 = __importDefault(require("dayjs"));
const pLimit_1 = __importDefault(require("../shared/pLimit"));
let DependenceService = class DependenceService {
    constructor(logger, sockService) {
        this.logger = logger;
        this.sockService = sockService;
    }
    async create(payloads) {
        const tabs = payloads.map((x) => {
            const tab = new dependence_1.Dependence(Object.assign(Object.assign({}, x), { status: dependence_1.DependenceStatus.queued }));
            return tab;
        });
        const docs = await this.insert(tabs);
        this.installDependenceOneByOne(docs);
        return docs;
    }
    async insert(payloads) {
        const docs = await dependence_1.DependenceModel.bulkCreate(payloads);
        return docs;
    }
    async update(payload) {
        const { id } = payload, other = __rest(payload, ["id"]);
        const doc = await this.getDb({ id });
        const tab = new dependence_1.Dependence(Object.assign(Object.assign(Object.assign({}, doc), other), { status: dependence_1.DependenceStatus.queued }));
        const newDoc = await this.updateDb(tab);
        this.installDependenceOneByOne([newDoc]);
        return newDoc;
    }
    async updateDb(payload) {
        await dependence_1.DependenceModel.update(payload, { where: { id: payload.id } });
        return await this.getDb({ id: payload.id });
    }
    async remove(ids, force = false) {
        const docs = await dependence_1.DependenceModel.findAll({ where: { id: ids } });
        const unInstalledDeps = docs.filter((x) => x.status !== dependence_1.DependenceStatus.installed);
        const installedDeps = docs.filter((x) => x.status === dependence_1.DependenceStatus.installed);
        await this.removeDb(unInstalledDeps.map((x) => x.id));
        if (installedDeps.length) {
            await dependence_1.DependenceModel.update({ status: dependence_1.DependenceStatus.queued, log: [] }, { where: { id: ids } });
            this.installDependenceOneByOne(docs, false, force);
        }
        return docs;
    }
    async removeDb(ids) {
        await dependence_1.DependenceModel.destroy({ where: { id: ids } });
    }
    async dependencies({ searchValue, type, status, }, sort = [], query = {}) {
        let condition = Object.assign(Object.assign({}, query), { type: dependence_1.DependenceTypes[type] });
        if (status) {
            condition.status = status.split(',').map(Number);
        }
        if (searchValue) {
            const encodeText = encodeURI(searchValue);
            const reg = {
                [sequelize_1.Op.or]: [
                    { [sequelize_1.Op.like]: `%${searchValue}%` },
                    { [sequelize_1.Op.like]: `%${encodeText}%` },
                ],
            };
            condition = Object.assign(Object.assign({}, condition), { name: reg });
        }
        try {
            const result = await this.find(condition, sort);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    installDependenceOneByOne(docs, isInstall = true, force = false) {
        docs.forEach((dep) => {
            this.installOrUninstallDependency(dep, isInstall, force);
        });
    }
    async reInstall(ids) {
        await dependence_1.DependenceModel.update({ status: dependence_1.DependenceStatus.queued, log: [] }, { where: { id: ids } });
        const docs = await dependence_1.DependenceModel.findAll({ where: { id: ids } });
        this.installDependenceOneByOne(docs, true, true);
        return docs;
    }
    async cancel(ids) {
        const docs = await dependence_1.DependenceModel.findAll({ where: { id: ids } });
        for (const doc of docs) {
            pLimit_1.default.removeQueuedDependency(doc);
            const depInstallCommand = dependence_1.InstallDependenceCommandTypes[doc.type];
            const depUnInstallCommand = dependence_1.unInstallDependenceCommandTypes[doc.type];
            const installCmd = `${depInstallCommand} ${doc.name.trim()}`;
            const unInstallCmd = `${depUnInstallCommand} ${doc.name.trim()}`;
            const pids = await Promise.all([
                (0, util_1.getPid)(installCmd),
                (0, util_1.getPid)(unInstallCmd),
            ]);
            for (const pid of pids) {
                pid && (await (0, util_1.killTask)(pid));
            }
        }
        await dependence_1.DependenceModel.update({ status: dependence_1.DependenceStatus.cancelled }, { where: { id: ids } });
    }
    async find(query, sort = []) {
        const docs = await dependence_1.DependenceModel.findAll({
            where: Object.assign({}, query),
            order: [...sort, ['createdAt', 'DESC']],
        });
        return docs;
    }
    async getDb(query) {
        const doc = await dependence_1.DependenceModel.findOne({ where: Object.assign({}, query) });
        return doc && doc.get({ plain: true });
    }
    async updateLog(ids, log) {
        pLimit_1.default.updateDepLog(async () => {
            const docs = await dependence_1.DependenceModel.findAll({ where: { id: ids } });
            for (const doc of docs) {
                const newLog = (doc === null || doc === void 0 ? void 0 : doc.log) ? [...doc.log, log] : [log];
                await dependence_1.DependenceModel.update({ log: newLog }, { where: { id: doc.id } });
            }
            return null;
        });
    }
    installOrUninstallDependency(dependency, isInstall = true, force = false) {
        return pLimit_1.default.runDependeny(dependency, () => {
            return new Promise(async (resolve) => {
                var _a;
                if (pLimit_1.default.firstDependencyId !== dependency.id) {
                    return resolve(null);
                }
                pLimit_1.default.removeQueuedDependency(dependency);
                const depIds = [dependency.id];
                const status = isInstall
                    ? dependence_1.DependenceStatus.installing
                    : dependence_1.DependenceStatus.removing;
                await dependence_1.DependenceModel.update({ status }, { where: { id: depIds } });
                const socketMessageType = isInstall
                    ? 'installDependence'
                    : 'uninstallDependence';
                let depName = dependency.name.trim();
                const depRunCommand = (isInstall
                    ? dependence_1.InstallDependenceCommandTypes
                    : dependence_1.unInstallDependenceCommandTypes)[dependency.type];
                const actionText = isInstall ? '安装' : '删除';
                const startTime = (0, dayjs_1.default)();
                const message = `开始${actionText}依赖 ${depName}，开始时间 ${startTime.format('YYYY-MM-DD HH:mm:ss')}\n\n`;
                this.sockService.sendMessage({
                    type: socketMessageType,
                    message,
                    references: depIds,
                });
                this.updateLog(depIds, message);
                // 判断是否已经安装过依赖
                if (isInstall && !force) {
                    const getCommandPrefix = dependence_1.GetDependenceCommandTypes[dependency.type];
                    const depVersionStr = dependence_1.versionDependenceCommandTypes[dependency.type];
                    let depVersion = '';
                    if (depName.includes(depVersionStr)) {
                        const symbolRegx = new RegExp(`(.*)${depVersionStr}([0-9\\.\\-\\+a-zA-Z]*)`);
                        const [, _depName, _depVersion] = depName.match(symbolRegx) || [];
                        if (_depVersion && _depName) {
                            depName = _depName;
                            depVersion = _depVersion;
                        }
                    }
                    const isNodeDependence = dependency.type === dependence_1.DependenceTypes.nodejs;
                    const isLinuxDependence = dependency.type === dependence_1.DependenceTypes.linux;
                    const isPythonDependence = dependency.type === dependence_1.DependenceTypes.python3;
                    const depInfo = (await (0, util_1.promiseExecSuccess)(isNodeDependence
                        ? `${getCommandPrefix} | grep "${depName}" | head -1`
                        : `${getCommandPrefix} ${depName}`))
                        .replace(/\s{2,}/, ' ')
                        .replace(/\s+$/, '');
                    if (depInfo &&
                        ((isNodeDependence && ((_a = depInfo.split(' ')) === null || _a === void 0 ? void 0 : _a[0]) === depName) ||
                            (isLinuxDependence &&
                                depInfo.toLocaleLowerCase().includes('apt-manual-installed')) ||
                            isPythonDependence) &&
                        (!depVersion || depInfo.includes(depVersion))) {
                        const endTime = (0, dayjs_1.default)();
                        const _message = `检测到已经安装 ${depName}\n\n${depInfo}\n\n跳过安装\n\n依赖${actionText}成功，结束时间 ${endTime.format('YYYY-MM-DD HH:mm:ss')}，耗时 ${endTime.diff(startTime, 'second')} 秒`;
                        this.sockService.sendMessage({
                            type: socketMessageType,
                            message: _message,
                            references: depIds,
                        });
                        this.updateLog(depIds, _message);
                        await dependence_1.DependenceModel.update({ status: dependence_1.DependenceStatus.installed }, { where: { id: depIds } });
                        return resolve(null);
                    }
                }
                const dependenceProxyFileExist = await (0, util_1.fileExist)(config_1.default.dependenceProxyFile);
                const proxyStr = dependenceProxyFileExist
                    ? `source ${config_1.default.dependenceProxyFile} &&`
                    : '';
                const cp = (0, cross_spawn_1.spawn)(`${proxyStr} ${depRunCommand} ${dependency.name.trim()}`, {
                    shell: '/bin/bash',
                });
                cp.stdout.on('data', async (data) => {
                    this.sockService.sendMessage({
                        type: socketMessageType,
                        message: data.toString(),
                        references: depIds,
                    });
                    this.updateLog(depIds, data.toString());
                });
                cp.stderr.on('data', async (data) => {
                    this.sockService.sendMessage({
                        type: socketMessageType,
                        message: data.toString(),
                        references: depIds,
                    });
                    this.updateLog(depIds, data.toString());
                });
                cp.on('error', async (err) => {
                    this.sockService.sendMessage({
                        type: socketMessageType,
                        message: JSON.stringify(err),
                        references: depIds,
                    });
                    this.updateLog(depIds, JSON.stringify(err));
                });
                cp.on('exit', async (code) => {
                    const endTime = (0, dayjs_1.default)();
                    const isSucceed = code === 0;
                    const resultText = isSucceed ? '成功' : '失败';
                    const message = `\n依赖${actionText}${resultText}，结束时间 ${endTime.format('YYYY-MM-DD HH:mm:ss')}，耗时 ${endTime.diff(startTime, 'second')} 秒`;
                    this.sockService.sendMessage({
                        type: socketMessageType,
                        message,
                        references: depIds,
                    });
                    this.updateLog(depIds, message);
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
                    const docs = await dependence_1.DependenceModel.findAll({ where: { id: depIds } });
                    const _docIds = docs
                        .filter((x) => x.status !== dependence_1.DependenceStatus.cancelled)
                        .map((x) => x.id);
                    if (_docIds.length > 0) {
                        await dependence_1.DependenceModel.update({ status }, { where: { id: _docIds } });
                    }
                    // 如果删除依赖成功或者强制删除
                    if ((isSucceed || force) && !isInstall) {
                        this.removeDb(depIds);
                    }
                    resolve(null);
                });
            });
        });
    }
};
DependenceService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger, sock_1.default])
], DependenceService);
exports.default = DependenceService;
//# sourceMappingURL=dependence.js.map