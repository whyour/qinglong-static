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
const config_1 = __importDefault(require("../config"));
const subscription_1 = require("../data/subscription");
const util_1 = require("../config/util");
const promises_1 = __importDefault(require("fs/promises"));
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const schedule_1 = __importDefault(require("./schedule"));
const sock_1 = __importDefault(require("./sock"));
const i18n_1 = require("../shared/i18n");
const sshKey_1 = __importDefault(require("./sshKey"));
const const_1 = require("../config/const");
const subscription_2 = require("../config/subscription");
const cron_1 = require("../data/cron");
const subscriptionPath_1 = require("../shared/subscriptionPath");
const logPath_1 = require("../shared/logPath");
const subscriptionStorage_1 = require("../shared/subscriptionStorage");
const subscriptionMutationLock_1 = require("../shared/subscriptionMutationLock");
const cron_2 = __importDefault(require("./cron"));
const logStreamManager_1 = require("../shared/logStreamManager");
const logReader_1 = require("../shared/logReader");
let SubscriptionService = class SubscriptionService {
    constructor(logger, scheduleService, sockService, sshKeyService, crontabService) {
        this.logger = logger;
        this.scheduleService = scheduleService;
        this.sockService = sockService;
        this.sshKeyService = sshKeyService;
        this.crontabService = crontabService;
    }
    async list(searchText, ids) {
        let query = {};
        const subIds = JSON.parse(ids || '[]');
        if (searchText) {
            const reg = {
                [sequelize_1.Op.or]: [
                    { [sequelize_1.Op.like]: `%${searchText}%` },
                    { [sequelize_1.Op.like]: `%${encodeURI(searchText)}%` },
                ],
            };
            query = {
                [sequelize_1.Op.or]: [
                    {
                        name: reg,
                    },
                    {
                        url: reg,
                    },
                ],
            };
        }
        try {
            const result = await subscription_1.SubscriptionModel.findAll({
                where: Object.assign(Object.assign({}, query), (ids ? { id: subIds } : undefined)),
                order: [
                    ['is_disabled', 'ASC'],
                    ['createdAt', 'DESC'],
                ],
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async handleTask(doc, needCreate = true, runImmediately = false) {
        // Cancelling by ID must also work for invalid historical subscriptions.
        if (needCreate) {
            const { url } = (0, subscription_2.formatUrl)(doc);
            doc.command = (0, subscription_2.formatCommand)(doc, url);
        }
        if (doc.schedule_type === 'crontab') {
            this.scheduleService.cancelCronTask(doc);
            needCreate &&
                (await this.scheduleService.createCronTask(Object.assign(Object.assign({}, doc), { runOrigin: 'subscription' }), this.taskCallbacks(doc), runImmediately));
        }
        else if (doc.interval_schedule) {
            this.scheduleService.cancelIntervalTask(doc);
            const { type, value } = doc.interval_schedule;
            needCreate &&
                (await this.scheduleService.createIntervalTask(Object.assign(Object.assign({}, doc), { runOrigin: 'subscription' }), { [type]: value }, runImmediately, this.taskCallbacks(doc)));
        }
    }
    async setSshConfig() {
        const docs = await subscription_1.SubscriptionModel.findAll();
        await this.sshKeyService.setSshConfig(docs);
    }
    taskCallbacks(doc) {
        return {
            onBefore: async (startTime) => {
                const logTime = startTime.format('YYYY-MM-DD-HH-mm-ss');
                const logPath = `${doc.alias}/${logTime}.log`;
                await subscription_1.SubscriptionModel.update({
                    status: subscription_1.SubscriptionStatus.running,
                    log_path: logPath,
                }, { where: { id: doc.id } });
                const absolutePath = await (0, util_1.handleLogPath)(logPath, (0, i18n_1.tf)('## 开始执行... %s\n', startTime.format('YYYY-MM-DD HH:mm:ss')));
                // 执行sub_before
                let beforeStr = '';
                try {
                    if (doc.sub_before) {
                        await logStreamManager_1.logStreamManager.write(absolutePath, `\n## ${(0, i18n_1.t)('执行before命令...')}\n\n`);
                        beforeStr = await (0, util_1.promiseExec)(doc.sub_before);
                    }
                }
                catch (error) {
                    beforeStr =
                        (error.stderr && error.stderr.toString()) || JSON.stringify(error);
                }
                if (beforeStr) {
                    await logStreamManager_1.logStreamManager.write(absolutePath, `${beforeStr}\n`);
                }
            },
            onStart: async (cp, startTime) => {
                await subscription_1.SubscriptionModel.update({
                    pid: cp.pid,
                }, { where: { id: doc.id } });
            },
            onEnd: async (cp, endTime, diff) => {
                let absolutePath;
                try {
                    const sub = await this.getDb({ id: doc.id });
                    absolutePath = await (0, util_1.handleLogPath)(sub.log_path);
                    // 执行 sub_after
                    let afterStr = '';
                    try {
                        if (sub.sub_after) {
                            await logStreamManager_1.logStreamManager.write(absolutePath, `\n\n## ${(0, i18n_1.t)('执行after命令...')}\n\n`);
                            afterStr = await (0, util_1.promiseExec)(sub.sub_after);
                        }
                    }
                    catch (error) {
                        afterStr =
                            (error.stderr && error.stderr.toString()) || JSON.stringify(error);
                    }
                    if (afterStr) {
                        await logStreamManager_1.logStreamManager.write(absolutePath, `${afterStr}\n`);
                    }
                    await logStreamManager_1.logStreamManager.write(absolutePath, '\n' +
                        (0, i18n_1.tf)('## 执行结束... %s  耗时 %s 秒', endTime.format('YYYY-MM-DD HH:mm:ss'), String(diff)) +
                        const_1.LOG_END_SYMBOL);
                }
                finally {
                    try {
                        if (absolutePath)
                            await logStreamManager_1.logStreamManager.closeStream(absolutePath);
                    }
                    finally {
                        await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.idle, pid: null }, { where: { id: doc.id } });
                        this.sockService.sendMessage({
                            type: 'runSubscriptionEnd',
                            message: (0, i18n_1.t)('订阅执行完成'),
                            references: [doc.id],
                        });
                    }
                }
            },
            onError: async (message) => {
                const sub = await this.getDb({ id: doc.id });
                const absolutePath = await (0, util_1.handleLogPath)(sub.log_path);
                await logStreamManager_1.logStreamManager.write(absolutePath, `\n${message}`);
            },
            onLog: async (message) => {
                const sub = await this.getDb({ id: doc.id });
                const absolutePath = await (0, util_1.handleLogPath)(sub.log_path);
                await logStreamManager_1.logStreamManager.write(absolutePath, `\n${message}`);
            },
        };
    }
    async create(payload) {
        (0, subscriptionPath_1.assertSubscriptionAlias)(payload.alias);
        return (0, subscriptionMutationLock_1.withSubscriptionMutation)(async () => {
            const tab = new subscription_1.Subscription(payload);
            const doc = await this.insert(tab);
            await this.handleTask(doc.get({ plain: true }));
            await this.setSshConfig();
            return doc;
        });
    }
    async insert(payload) {
        return await subscription_1.SubscriptionModel.create(payload, { returning: true });
    }
    async update(payload) {
        (0, subscriptionPath_1.assertSubscriptionAlias)(payload.alias);
        return (0, subscriptionMutationLock_1.withSubscriptionMutation)(async () => {
            const doc = await this.getDb({ id: payload.id });
            const tab = new subscription_1.Subscription(Object.assign(Object.assign({}, doc), payload));
            const newDoc = await this.updateDb(tab);
            await this.handleTask(newDoc, !newDoc.is_disabled);
            await this.removeSshConfigForSubscription(doc);
            await this.setSshConfig();
            return newDoc;
        });
    }
    async removeSshConfigForSubscription(doc) {
        if (doc.type !== 'private-repo' || doc.pull_type !== 'ssh-key')
            return;
        // Invalid historical rows must remain deletable without deriving unsafe paths.
        try {
            (0, subscriptionPath_1.assertSubscriptionAlias)(doc.alias);
        }
        catch (_a) {
            return;
        }
        await this.sshKeyService.removeSSHKey(doc.alias, '');
    }
    async updateDb(payload) {
        await subscription_1.SubscriptionModel.update(payload, { where: { id: payload.id } });
        return await this.getDb({ id: payload.id });
    }
    async status({ ids, status, pid, log_path, last_running_time = 0, last_execution_time = 0, }) {
        if (log_path)
            (0, logPath_1.resolveLogPath)(config_1.default.logPath, log_path);
        const options = {
            status,
            pid,
            log_path,
            last_execution_time,
        };
        if (last_running_time > 0) {
            options.last_running_time = last_running_time;
        }
        return await subscription_1.SubscriptionModel.update(Object.assign({}, options), { where: { id: ids } });
    }
    async remove(ids, query) {
        return (0, subscriptionMutationLock_1.withSubscriptionMutation)(async () => {
            const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
            const storagePaths = [];
            const retainedPaths = [];
            const collectPaths = (doc, targets, deleting = false) => {
                for (const names of (0, subscriptionStorage_1.getSubscriptionStorageCandidates)(doc)) {
                    // A URL accepted by one engine can produce an invalid name in another.
                    // Validate each candidate independently, retaining the safe candidate.
                    if (!Object.values(names).every(subscriptionStorage_1.isSubscriptionStorageName))
                        continue;
                    const resolve = deleting ? subscriptionStorage_1.resolveSubscriptionStoragePath : path_1.default.resolve;
                    const scriptPath = resolve(config_1.default.scriptPath, names.script);
                    if (scriptPath)
                        targets.push(scriptPath);
                    if (names.repo) {
                        const repoPath = resolve(config_1.default.repoPath, names.repo);
                        if (repoPath)
                            targets.push(repoPath);
                    }
                    if (names.raw) {
                        const rawPath = resolve(path_1.default.join(config_1.default.dataPath, 'raw'), names.raw);
                        if (rawPath)
                            targets.push(rawPath);
                    }
                }
            };
            // Validate all deletion targets before changing rows or removing any files.
            if ((query === null || query === void 0 ? void 0 : query.force) === true) {
                for (const doc of docs) {
                    (0, subscriptionPath_1.assertSubscriptionAlias)(doc.alias);
                    (0, subscriptionStorage_1.resolveSubscriptionStoragePath)(config_1.default.scriptPath, doc.alias);
                    (0, subscriptionStorage_1.resolveSubscriptionStoragePath)(config_1.default.repoPath, doc.alias);
                    collectPaths(doc, storagePaths, true);
                }
                const remaining = await subscription_1.SubscriptionModel.findAll({ where: {} });
                for (const doc of remaining) {
                    if (!ids.includes(doc.id))
                        collectPaths(doc, retainedPaths);
                }
            }
            for (const doc of docs) {
                await this.handleTask(doc.get({ plain: true }), false);
            }
            await subscription_1.SubscriptionModel.destroy({ where: { id: ids } });
            for (const doc of docs) {
                await this.removeSshConfigForSubscription(doc);
            }
            await this.setSshConfig();
            if ((query === null || query === void 0 ? void 0 : query.force) === true) {
                const crons = await cron_1.CrontabModel.findAll({ where: { sub_id: ids } });
                if (crons === null || crons === void 0 ? void 0 : crons.length) {
                    await this.crontabService.remove(crons.map((x) => x.id));
                }
                for (const storagePath of new Set(storagePaths)) {
                    // rm is recursive: an ancestor must also be retained if a surviving
                    // subscription uses a nested branch, and vice versa.
                    const shared = retainedPaths.some((retained) => retained === storagePath ||
                        retained.startsWith(`${storagePath}${path_1.default.sep}`) ||
                        storagePath.startsWith(`${retained}${path_1.default.sep}`));
                    if (!shared)
                        await (0, util_1.rmPath)(storagePath);
                }
            }
        });
    }
    async getDb(query) {
        const doc = await subscription_1.SubscriptionModel.findOne({ where: Object.assign({}, query) });
        if (!doc) {
            throw new Error(`Subscription ${JSON.stringify(query)} not found`);
        }
        return doc.get({ plain: true });
    }
    async run(ids) {
        await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.queued }, { where: { id: ids } });
        ids.forEach((id) => {
            this.runSingle(id);
        });
    }
    async stop(ids) {
        var _a;
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        let failure;
        for (const doc of docs) {
            try {
                if (doc.pid) {
                    await (0, util_1.killTask)(doc.pid, true);
                }
                await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.idle, pid: null }, { where: { id: doc.id, pid: (_a = doc.pid) !== null && _a !== void 0 ? _a : null } });
            }
            catch (error) {
                this.logger.error(error);
                failure !== null && failure !== void 0 ? failure : (failure = error);
            }
        }
        if (failure)
            throw failure;
    }
    async runSingle(subscriptionId) {
        const subscription = await this.getDb({ id: subscriptionId });
        if (subscription.status !== subscription_1.SubscriptionStatus.queued) {
            return;
        }
        const command = (0, subscription_2.formatCommand)(subscription);
        this.scheduleService.runTask(command, this.taskCallbacks(subscription), {
            name: subscription.name,
            schedule: subscription.schedule,
            command,
            id: String(subscription.id),
            runOrigin: 'subscription',
        });
    }
    async disabled(ids) {
        await subscription_1.SubscriptionModel.update({ is_disabled: 1 }, { where: { id: ids } });
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        await this.setSshConfig();
        for (const doc of docs) {
            await this.handleTask(doc.get({ plain: true }), false);
        }
    }
    async enabled(ids) {
        await subscription_1.SubscriptionModel.update({ is_disabled: 0 }, { where: { id: ids } });
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        await this.setSshConfig();
        for (const doc of docs) {
            await this.handleTask(doc.get({ plain: true }));
        }
    }
    async log(id, options = {}) {
        const doc = await this.getDb({ id });
        if (!doc || !doc.log_path) {
            return {
                content: '',
                offset: 0,
                nextOffset: 0,
                total: 0,
                truncated: false,
            };
        }
        const absolutePath = await (0, util_1.handleLogPath)(doc.log_path);
        return await (0, logReader_1.readLogChunk)(absolutePath, options);
    }
    async logs(id) {
        const doc = await this.getDb({ id });
        if (!doc) {
            return [];
        }
        if (doc.log_path) {
            const relativeDir = path_1.default.dirname(`${doc.log_path}`);
            const dir = path_1.default.dirname((0, logPath_1.resolveLogPath)(config_1.default.logPath, doc.log_path));
            const _exist = await (0, util_1.fileExist)(dir);
            if (_exist) {
                let files = await promises_1.default.readdir(dir);
                return (await Promise.all(files.map(async (x) => ({
                    filename: x,
                    directory: relativeDir.replace(config_1.default.logPath, ''),
                    time: (await promises_1.default.lstat(`${dir}/${x}`)).birthtimeMs,
                })))).sort((a, b) => b.time - a.time);
            }
        }
    }
};
SubscriptionService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger, schedule_1.default,
        sock_1.default,
        sshKey_1.default,
        cron_2.default])
], SubscriptionService);
exports.default = SubscriptionService;
//# sourceMappingURL=subscription.js.map