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
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const util_1 = require("../config/util");
const fs_2 = require("fs");
const util_2 = require("util");
const path_1 = __importDefault(require("path"));
let SubscriptionService = class SubscriptionService {
    constructor(logger) {
        this.logger = logger;
    }
    async create(payload) {
        const tab = new subscription_1.Subscription(payload);
        const doc = await this.insert(tab);
        return doc;
    }
    async insert(payload) {
        return await subscription_1.SubscriptionModel.create(payload, { returning: true });
    }
    async update(payload) {
        const newDoc = await this.updateDb(payload);
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
    async remove(ids) {
        await subscription_1.SubscriptionModel.destroy({ where: { id: ids } });
    }
    async getDb(query) {
        const doc = await subscription_1.SubscriptionModel.findOne({ where: Object.assign({}, query) });
        return doc && doc.get({ plain: true });
    }
    async run(ids) {
        await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.queued }, { where: { id: ids } });
        (0, util_1.concurrentRun)(ids.map((id) => async () => await this.runSingle(id)), 10);
    }
    async stop(ids) {
        const docs = await subscription_1.SubscriptionModel.findAll({ where: { id: ids } });
        for (const doc of docs) {
            if (doc.pid) {
                try {
                    process.kill(-doc.pid);
                }
                catch (error) {
                    this.logger.silly(error);
                }
            }
            const err = await this.killTask('');
            const absolutePath = path_1.default.resolve(config_1.default.logPath, `${doc.log_path}`);
            const logFileExist = doc.log_path && (await (0, util_1.fileExist)(absolutePath));
            if (logFileExist) {
                const str = err ? `\n${err}` : '';
                fs_1.default.appendFileSync(`${absolutePath}`, `${str}\n## 执行结束...  ${new Date()
                    .toLocaleString('zh', { hour12: false })
                    .replace(' 24:', ' 00:')} `);
            }
        }
        await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.idle, pid: undefined }, { where: { id: ids } });
    }
    async killTask(name) {
        let taskCommand = `ps -ef | grep "${name}" | grep -v grep | awk '{print $1}'`;
        const execAsync = (0, util_2.promisify)(child_process_1.exec);
        try {
            let pid = (await execAsync(taskCommand)).stdout;
            if (pid) {
                pid = (await execAsync(`pstree -p ${pid}`)).stdout;
            }
            else {
                return;
            }
            let pids = pid.match(/\(\d+/g);
            const killLogs = [];
            if (pids && pids.length > 0) {
                // node 执行脚本时还会有10个子进程，但是ps -ef中不存在，所以截取前三个
                for (const id of pids) {
                    const c = `kill -9 ${id.slice(1)}`;
                    try {
                        const { stdout, stderr } = await execAsync(c);
                        if (stderr) {
                            killLogs.push(stderr);
                        }
                        if (stdout) {
                            killLogs.push(stdout);
                        }
                    }
                    catch (error) {
                        killLogs.push(error.message);
                    }
                }
            }
            return killLogs.length > 0 ? JSON.stringify(killLogs) : '';
        }
        catch (e) {
            return JSON.stringify(e);
        }
    }
    async runSingle(cronId) {
        return new Promise(async (resolve) => {
            const cron = await this.getDb({ id: cronId });
            if (cron.status !== subscription_1.SubscriptionStatus.queued) {
                resolve();
                return;
            }
            let { id, log_path } = cron;
            const absolutePath = path_1.default.resolve(config_1.default.logPath, `${log_path}`);
            const logFileExist = log_path && (await (0, util_1.fileExist)(absolutePath));
            this.logger.silly('Running job');
            this.logger.silly('ID: ' + id);
            this.logger.silly('Original command: ');
            let cmdStr = '';
            const cp = (0, child_process_1.spawn)(cmdStr, { shell: '/bin/bash' });
            await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.running, pid: cp.pid }, { where: { id } });
            cp.stderr.on('data', (data) => {
                if (logFileExist) {
                    fs_1.default.appendFileSync(`${absolutePath}`, `${data}`);
                }
            });
            cp.on('error', (err) => {
                if (logFileExist) {
                    fs_1.default.appendFileSync(`${absolutePath}`, `${JSON.stringify(err)}`);
                }
            });
            cp.on('exit', async (code, signal) => {
                this.logger.info(`${''} pid: ${cp.pid} exit ${code} signal ${signal}`);
                await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.idle, pid: undefined }, { where: { id } });
                resolve();
            });
            cp.on('close', async (code) => {
                this.logger.info(`${''} pid: ${cp.pid} closed ${code}`);
                await subscription_1.SubscriptionModel.update({ status: subscription_1.SubscriptionStatus.idle, pid: undefined }, { where: { id } });
                resolve();
            });
        });
    }
    async disabled(ids) {
        await subscription_1.SubscriptionModel.update({ isDisabled: 1 }, { where: { id: ids } });
    }
    async enabled(ids) {
        await subscription_1.SubscriptionModel.update({ isDisabled: 0 }, { where: { id: ids } });
    }
    async log(id) {
        const doc = await this.getDb({ id });
        if (!doc) {
            return '';
        }
        const absolutePath = path_1.default.resolve(config_1.default.logPath, `${doc.log_path}`);
        const logFileExist = doc.log_path && (await (0, util_1.fileExist)(absolutePath));
        if (logFileExist) {
            return (0, util_1.getFileContentByName)(`${absolutePath}`);
        }
    }
    async logs(id) {
        const doc = await this.getDb({ id });
        if (!doc) {
            return [];
        }
        if (doc.log_path) {
            const relativeDir = path_1.default.dirname(`${doc.log_path}`);
            const dir = path_1.default.resolve(config_1.default.logPath, relativeDir);
            if ((0, fs_2.existsSync)(dir)) {
                let files = await fs_2.promises.readdir(dir);
                return files
                    .map((x) => ({
                    filename: x,
                    directory: relativeDir.replace(config_1.default.logPath, ''),
                    time: fs_1.default.statSync(`${dir}/${x}`).mtime.getTime(),
                }))
                    .sort((a, b) => b.time - a.time);
            }
        }
    }
};
SubscriptionService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [Object])
], SubscriptionService);
exports.default = SubscriptionService;
//# sourceMappingURL=subscription.js.map