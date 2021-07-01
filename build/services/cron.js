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
const nedb_1 = __importDefault(require("nedb"));
const config_1 = __importDefault(require("../config"));
const cron_1 = require("../data/cron");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const cron_parser_1 = __importDefault(require("cron-parser"));
const util_1 = require("../config/util");
const p_queue_1 = __importDefault(require("p-queue"));
let CronService = class CronService {
    constructor(logger) {
        this.logger = logger;
        this.cronDb = new nedb_1.default({ filename: config_1.default.cronDbFile });
        this.queue = new p_queue_1.default({
            concurrency: parseInt(process.env.MaxConcurrentNum) || 5,
        });
        this.cronDb.loadDatabase((err) => {
            if (err)
                throw err;
        });
    }
    getDb() {
        return this.cronDb;
    }
    isSixCron(cron) {
        const { schedule } = cron;
        if (schedule.split(' ').length === 6) {
            return true;
        }
        return false;
    }
    async create(payload) {
        const tab = new cron_1.Crontab(payload);
        tab.created = new Date().valueOf();
        tab.saved = false;
        const doc = await this.insert(tab);
        await this.set_crontab(this.isSixCron(doc));
        return doc;
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
        const tab = new cron_1.Crontab(Object.assign(Object.assign({}, doc), other));
        tab.saved = false;
        const newDoc = await this.updateDb(tab);
        await this.set_crontab(this.isSixCron(newDoc));
        return newDoc;
    }
    async updateDb(payload) {
        return new Promise((resolve) => {
            this.cronDb.update({ _id: payload._id }, payload, { returnUpdatedDocs: true }, (err, num, docs) => {
                if (err) {
                    this.logger.error(err);
                }
                else {
                    resolve(docs);
                }
            });
        });
    }
    async status({ ids, status, }) {
        this.cronDb.update({ _id: { $in: ids } }, { $set: { status } });
    }
    async remove(ids) {
        return new Promise((resolve) => {
            this.cronDb.remove({ _id: { $in: ids } }, { multi: true }, async (err) => {
                await this.set_crontab(true);
                resolve();
            });
        });
    }
    async crontabs(searchText) {
        let query = {};
        if (searchText) {
            const reg = new RegExp(searchText, 'i');
            query = {
                $or: [
                    {
                        name: reg,
                    },
                    {
                        command: reg,
                    },
                    {
                        schedule: reg,
                    },
                ],
            };
        }
        return new Promise((resolve) => {
            this.cronDb
                .find(query)
                .sort({ created: -1 })
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
    async run(ids) {
        this.cronDb.update({ _id: { $in: ids } }, { $set: { status: cron_1.CrontabStatus.queued } }, { multi: true });
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            this.queue.add(() => this.runSingle(id));
        }
    }
    async stop(ids) {
        return new Promise((resolve) => {
            this.cronDb.find({ _id: { $in: ids } }).exec((err, docs) => {
                this.cronDb.update({ _id: { $in: ids } }, { $set: { status: cron_1.CrontabStatus.idle }, $unset: { pid: true } });
                const pids = docs
                    .map((x) => x.pid)
                    .filter((x) => !!x)
                    .join('\n');
                child_process_1.exec(`echo - e "${pids}" | xargs kill - 9`, (err) => {
                    resolve();
                });
            });
        });
    }
    async runSingle(id) {
        return new Promise(async (resolve) => {
            const cron = await this.get(id);
            if (cron.status !== cron_1.CrontabStatus.queued) {
                resolve();
                return;
            }
            let { _id, command } = cron;
            this.logger.silly('Running job');
            this.logger.silly('ID: ' + _id);
            this.logger.silly('Original command: ' + command);
            let logFile = `${config_1.default.manualLogPath}${_id}.log`;
            fs_1.default.writeFileSync(logFile, `开始执行... ${new Date().toLocaleString()}\n\n`);
            let cmdStr = command;
            if (!cmdStr.includes('task ') && !cmdStr.includes('ql ')) {
                cmdStr = `task ${cmdStr}`;
            }
            if (cmdStr.endsWith('.js')) {
                cmdStr = `${cmdStr} now`;
            }
            const cmd = child_process_1.spawn(cmdStr, { shell: true });
            this.cronDb.update({ _id }, { $set: { status: cron_1.CrontabStatus.running, pid: cmd.pid } });
            cmd.stdout.on('data', (data) => {
                this.logger.silly(`stdout: ${data}`);
                fs_1.default.appendFileSync(logFile, data);
            });
            cmd.stderr.on('data', (data) => {
                this.logger.silly(`stderr: ${data}`);
                fs_1.default.appendFileSync(logFile, data);
            });
            cmd.on('close', (code) => {
                this.logger.silly(`child process exited with code ${code}`);
                this.cronDb.update({ _id }, { $set: { status: cron_1.CrontabStatus.idle }, $unset: { pid: true } });
            });
            cmd.on('error', (err) => {
                this.logger.info(err);
                fs_1.default.appendFileSync(logFile, err.stack);
            });
            cmd.on('exit', (code, signal) => {
                this.logger.silly(`cmd exit ${code}`);
                this.cronDb.update({ _id }, { $set: { status: cron_1.CrontabStatus.idle }, $unset: { pid: true } });
                fs_1.default.appendFileSync(logFile, `\n执行结束...`);
                resolve();
            });
            process.on('SIGINT', function () {
                fs_1.default.appendFileSync(logFile, `\n执行结束...`);
                resolve();
            });
        });
    }
    async disabled(ids) {
        return new Promise((resolve) => {
            this.cronDb.update({ _id: { $in: ids } }, { $set: { isDisabled: 1 } }, { multi: true }, async (err) => {
                await this.set_crontab(true);
                resolve();
            });
        });
    }
    async enabled(ids) {
        return new Promise((resolve) => {
            this.cronDb.update({ _id: { $in: ids } }, { $set: { isDisabled: 0 } }, { multi: true }, async (err) => {
                await this.set_crontab(true);
                resolve();
            });
        });
    }
    async log(_id) {
        let logFile = `${config_1.default.manualLogPath}${_id}.log`;
        return util_1.getFileContentByName(logFile);
    }
    make_command(tab) {
        const crontab_job_string = `ID=${tab._id} ${tab.command}`;
        return crontab_job_string;
    }
    async set_crontab(needReloadSchedule = false) {
        const tabs = await this.crontabs();
        var crontab_string = '';
        tabs.forEach((tab) => {
            const _schedule = tab.schedule && tab.schedule.split(' ');
            if (tab.isDisabled === 1 || _schedule.length !== 5) {
                crontab_string += '# ';
                crontab_string += tab.schedule;
                crontab_string += ' ';
                crontab_string += this.make_command(tab);
                crontab_string += '\n';
            }
            else {
                crontab_string += tab.schedule;
                crontab_string += ' ';
                crontab_string += this.make_command(tab);
                crontab_string += '\n';
            }
        });
        this.logger.silly(crontab_string);
        fs_1.default.writeFileSync(config_1.default.crontabFile, crontab_string);
        child_process_1.execSync(`crontab ${config_1.default.crontabFile}`);
        if (needReloadSchedule) {
            child_process_1.exec(`pm2 reload schedule`);
        }
        this.cronDb.update({}, { $set: { saved: true } }, { multi: true });
    }
    reload_db() {
        this.cronDb.loadDatabase();
    }
    import_crontab() {
        child_process_1.exec('crontab -l', (error, stdout, stderr) => {
            var lines = stdout.split('\n');
            var namePrefix = new Date().getTime();
            lines.reverse().forEach((line, index) => {
                line = line.replace(/\t+/g, ' ');
                var regex = /^((\@[a-zA-Z]+\s+)|(([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+))/;
                var command = line.replace(regex, '').trim();
                var schedule = line.replace(command, '').trim();
                if (command &&
                    schedule &&
                    cron_parser_1.default.parseExpression(schedule).hasNext()) {
                    var name = namePrefix + '_' + index;
                    this.cronDb.findOne({ command, schedule }, (err, doc) => {
                        if (err) {
                            throw err;
                        }
                        if (!doc) {
                            this.create({ name, command, schedule });
                        }
                        else {
                            doc.command = command;
                            doc.schedule = schedule;
                            this.update(doc);
                        }
                    });
                }
            });
        });
    }
    autosave_crontab() {
        return this.set_crontab();
    }
};
CronService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object])
], CronService);
exports.default = CronService;
//# sourceMappingURL=cron.js.map