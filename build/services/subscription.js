"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const config_1 = __importDefault(require("../config"));
const subscription_1 = require("../data/subscription");
const util_1 = require("../config/util");
const promises_1 = __importDefault(require("fs/promises"));
const sequelize_1 = require("sequelize");
const path_1 = __importStar(require("path"));
const schedule_1 = __importDefault(require("./schedule"));
const sock_1 = __importDefault(require("./sock"));
const sshKey_1 = __importDefault(require("./sshKey"));
const const_1 = require("../config/const");
const subscription_2 = require("../config/subscription");
const cron_1 = require("../data/cron");
const cron_2 = __importDefault(require("./cron"));
let SubscriptionService = class SubscriptionService {
    constructor(logger, scheduleService, sockService, sshKeyService, crontabService) {
        this.logger = logger;
        this.scheduleService = scheduleService;
        this.sockService = sockService;
        this.sshKeyService = sshKeyService;
        this.crontabService = crontabService;
    }
    async list(searchText) {
        let query = {};
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
                where: query,
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
        const { url } = (0, subscription_2.formatUrl)(doc);
        doc.command = (0, subscription_2.formatCommand)(doc, url);
        if (doc.schedule_type === 'crontab') {
            this.scheduleService.cancelCronTask(doc);
            needCreate &&
                (await this.scheduleService.createCronTask(doc, this.taskCallbacks(doc), runImmediately));
        }
        else if (doc.interval_schedule) {
            this.scheduleService.cancelIntervalTask(doc);
            const { type, value } = doc.interval_schedule;
            needCreate &&
                (await this.scheduleService.createIntervalTask(doc, { [type]: value }, runImmediately, this.taskCallbacks(doc)));
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
                const absolutePath = await (0, util_1.handleLogPath)(logPath, `## 开始执行... ${startTime.format('YYYY-MM-DD HH:mm:ss')}\n`);
                // 执行sub_before
                let beforeStr = '';
                try {
                    if (doc.sub_before) {
                        await promises_1.default.appendFile(absolutePath, `\n## 执行before命令...\n\n`);
                        beforeStr = await (0, util_1.promiseExec)(doc.sub_before);
                    }
                }
                catch (error) {
                    beforeStr =
                        (error.stderr && error.stderr.toString()) || JSON.stringify(error);
                }
                if (beforeStr) {
                    await promises_1.default.appendFile(absolutePath, `${beforeStr}\n`);
                }
            },
            onStart: async (cp, startTime) => {
                await subscription_1.SubscriptionModel.update({
                    pid: cp.pid,
                }, { where: { id: doc.id } });
            },
            onEnd: async (cp, endTime, diff) => {
                const sub = await this.getDb({ id: doc.id });
                const absolutePath = await (0, util_1.handleLogPath)(sub.log_path);
                // 执行 sub_after
                let afterStr = '';
                try {
                    if (sub.sub_after) {
                        await promises_1.default.appendFile(absolutePath, `\n\n## 执行after命令...\n\n`);
                        afterStr = await (0, util_1.promiseExec)(sub.sub_after);
                    }
                }
                catch (error) {
                    afterStr =
                        (error.stderr && error.stderr.toString()) || JSON.stringify(error);
                }
                if (afterStr) {
                    await promises_1.default.appendFile(absolutePath, `${afterStr}\n`);
                }
                await promises_1.default.appendFile(absolutePath, `\n## 执行结束... ${endTime.format('YYYY-MM-DD HH:mm:ss')}  耗时 ${diff} 秒${const_1.LOG_END_SYMBOL}`);
                await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.idle, pid: undefined }, { where: { id: sub.id } });
                this.sockService.sendMessage({
                    type: 'runSubscriptionEnd',
                    message: '订阅执行完成',
                    references: [doc.id],
                });
            },
            onError: async (message) => {
                const sub = await this.getDb({ id: doc.id });
                const absolutePath = await (0, util_1.handleLogPath)(sub.log_path);
                await promises_1.default.appendFile(absolutePath, `\n${message}`);
            },
            onLog: async (message) => {
                const sub = await this.getDb({ id: doc.id });
                const absolutePath = await (0, util_1.handleLogPath)(sub.log_path);
                await promises_1.default.appendFile(absolutePath, `\n${message}`);
            },
        };
    }
    async create(payload) {
        const tab = new subscription_1.Subscription(payload);
        const doc = await this.insert(tab);
        await this.handleTask(doc);
        await this.setSshConfig();
        return doc;
    }
    async insert(payload) {
        return await subscription_1.SubscriptionModel.create(payload, { returning: true });
    }
    async update(payload) {
        const doc = await this.getDb({ id: payload.id });
        const tab = new subscription_1.Subscription(Object.assign(Object.assign({}, doc), payload));
        const newDoc = await this.updateDb(tab);
        await this.handleTask(newDoc, !newDoc.is_disabled);
        await this.setSshConfig();
        return newDoc;
    }
    async updateDb(payload) {
        await subscription_1.SubscriptionModel.update(payload, { where: { id: payload.id } });
        return await this.getDb({ id: payload.id });
    }
    async status({ ids, status, pid, log_path, last_running_time = 0, last_execution_time = 0, }) {
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
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        for (const doc of docs) {
            await this.handleTask(doc, false);
        }
        await subscription_1.SubscriptionModel.destroy({ where: { id: ids } });
        await this.setSshConfig();
        if ((query === null || query === void 0 ? void 0 : query.force) === true) {
            const crons = await cron_1.CrontabModel.findAll({ where: { sub_id: ids } });
            if (crons === null || crons === void 0 ? void 0 : crons.length) {
                await this.crontabService.remove(crons.map((x) => x.id));
            }
            for (const doc of docs) {
                const filePath = (0, path_1.join)(config_1.default.scriptPath, doc.alias);
                await (0, util_1.rmPath)(filePath);
            }
        }
    }
    async getDb(query) {
        const doc = await subscription_1.SubscriptionModel.findOne({ where: Object.assign({}, query) });
        if (!doc) {
            throw new Error(`${JSON.stringify(query)} not found`);
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
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        for (const doc of docs) {
            if (doc.pid) {
                try {
                    await (0, util_1.killTask)(doc.pid);
                }
                catch (error) {
                    this.logger.error(error);
                }
            }
        }
        await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.idle, pid: undefined }, { where: { id: ids } });
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
        });
    }
    async disabled(ids) {
        await subscription_1.SubscriptionModel.update({ is_disabled: 1 }, { where: { id: ids } });
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        await this.setSshConfig();
        for (const doc of docs) {
            await this.handleTask(doc, false);
        }
    }
    async enabled(ids) {
        await subscription_1.SubscriptionModel.update({ is_disabled: 0 }, { where: { id: ids } });
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        await this.setSshConfig();
        for (const doc of docs) {
            await this.handleTask(doc);
        }
    }
    async log(id) {
        const doc = await this.getDb({ id });
        if (!doc || !doc.log_path) {
            return '';
        }
        const absolutePath = await (0, util_1.handleLogPath)(doc.log_path);
        return await (0, util_1.getFileContentByName)(absolutePath);
    }
    async logs(id) {
        const doc = await this.getDb({ id });
        if (!doc) {
            return [];
        }
        if (doc.log_path) {
            const relativeDir = path_1.default.dirname(`${doc.log_path}`);
            const dir = path_1.default.resolve(config_1.default.logPath, relativeDir);
            const _exist = await (0, util_1.fileExist)(dir);
            if (_exist) {
                let files = await promises_1.default.readdir(dir);
                return (await Promise.all(files.map(async (x) => ({
                    filename: x,
                    directory: relativeDir.replace(config_1.default.logPath, ''),
                    time: (await promises_1.default.lstat(`${dir}/${x}`)).mtime.getTime(),
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