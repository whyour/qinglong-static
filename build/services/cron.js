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
const cron_1 = require("../data/cron");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const cron_parser_1 = __importDefault(require("cron-parser"));
const util_1 = require("../config/util");
const fs_2 = require("fs");
const util_2 = require("util");
const sequelize_1 = require("sequelize");
let CronService = class CronService {
    constructor(logger) {
        this.logger = logger;
    }
    isSixCron(cron) {
        const { schedule } = cron;
        if (schedule.split(/ +/).length === 6) {
            return true;
        }
        return false;
    }
    async create(payload) {
        const tab = new cron_1.Crontab(payload);
        tab.saved = false;
        const doc = await this.insert(tab);
        await this.set_crontab(this.isSixCron(doc));
        return doc;
    }
    async insert(payload) {
        const cron = await cron_1.CrontabModel.findOne({
            where: { command: payload.command },
        });
        if (cron) {
            return cron;
        }
        return await cron_1.CrontabModel.create(payload, { returning: true });
    }
    async update(payload) {
        payload.saved = false;
        const newDoc = await this.updateDb(payload);
        await this.set_crontab(this.isSixCron(newDoc));
        return newDoc;
    }
    async updateDb(payload) {
        await cron_1.CrontabModel.update(payload, { where: { id: payload.id } });
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
        return await cron_1.CrontabModel.update(Object.assign({}, options), { where: { id: ids } });
    }
    async remove(ids) {
        await cron_1.CrontabModel.destroy({ where: { id: ids } });
        await this.set_crontab(true);
    }
    async pin(ids) {
        await cron_1.CrontabModel.update({ isPinned: 1 }, { where: { id: ids } });
    }
    async unPin(ids) {
        await cron_1.CrontabModel.update({ isPinned: 0 }, { where: { id: ids } });
    }
    async addLabels(ids, labels) {
        const docs = await cron_1.CrontabModel.findAll({ where: { id: ids } });
        for (const doc of docs) {
            await cron_1.CrontabModel.update({
                labels: Array.from(new Set((doc.labels || []).concat(labels))),
            }, { where: { id: doc.id } });
        }
    }
    async removeLabels(ids, labels) {
        const docs = await cron_1.CrontabModel.findAll({ where: { id: ids } });
        for (const doc of docs) {
            await cron_1.CrontabModel.update({
                labels: (doc.labels || []).filter((label) => !labels.includes(label)),
            }, { where: { id: doc.id } });
        }
    }
    async crontabs(searchText) {
        let query = {};
        if (searchText) {
            const textArray = searchText.split(':');
            switch (textArray[0]) {
                case 'name':
                case 'command':
                case 'schedule':
                case 'label':
                    const column = textArray[0] === 'label' ? 'labels' : textArray[0];
                    query = {
                        [column]: {
                            [sequelize_1.Op.or]: [
                                { [sequelize_1.Op.like]: `%${textArray[1]}%` },
                                { [sequelize_1.Op.like]: `%${encodeURIComponent(textArray[1])}%` },
                            ],
                        },
                    };
                    break;
                default:
                    const reg = {
                        [sequelize_1.Op.or]: [
                            { [sequelize_1.Op.like]: `%${searchText}%` },
                            { [sequelize_1.Op.like]: `%${encodeURIComponent(searchText)}%` },
                        ],
                    };
                    query = {
                        [sequelize_1.Op.or]: [
                            {
                                name: reg,
                            },
                            {
                                command: reg,
                            },
                            {
                                schedule: reg,
                            },
                            {
                                labels: reg,
                            },
                        ],
                    };
                    break;
            }
        }
        try {
            const result = await cron_1.CrontabModel.findAll({
                where: query,
                order: [['updatedAt', 'DESC']],
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getDb(query) {
        const doc = await cron_1.CrontabModel.findOne({ where: Object.assign({}, query) });
        return doc && doc.get({ plain: true });
    }
    async run(ids) {
        await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.queued }, { where: { id: ids } });
        util_1.concurrentRun(ids.map((id) => async () => await this.runSingle(id)), 10);
    }
    async stop(ids) {
        const docs = await cron_1.CrontabModel.findAll({ where: { id: ids } });
        for (const doc of docs) {
            if (doc.pid) {
                try {
                    process.kill(-doc.pid);
                }
                catch (error) {
                    this.logger.silly(error);
                }
            }
            const err = await this.killTask(doc.command);
            if (doc.log_path) {
                const str = err ? `\n${err}` : '';
                fs_1.default.appendFileSync(`${doc.log_path}`, `${str}\n## 执行结束...  ${new Date()
                    .toLocaleString('zh', { hour12: false })
                    .replace(' 24:', ' 00:')} `);
            }
        }
        await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: undefined }, { where: { id: ids } });
    }
    async killTask(name) {
        let taskCommand = `ps -ef | grep "${name}" | grep -v grep | awk '{print $1}'`;
        const execAsync = util_2.promisify(child_process_1.exec);
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
                pids = pids.slice(0, 3);
                for (const id of pids) {
                    const c = `kill -9 ${id.slice(1)}`;
                    const { stdout, stderr } = await execAsync(c);
                    if (stderr) {
                        killLogs.push(stderr);
                    }
                    if (stdout) {
                        killLogs.push(stdout);
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
            if (cron.status !== cron_1.CrontabStatus.queued) {
                resolve();
                return;
            }
            let { id, command, log_path } = cron;
            this.logger.silly('Running job');
            this.logger.silly('ID: ' + id);
            this.logger.silly('Original command: ' + command);
            let cmdStr = command;
            if (!cmdStr.includes('task ') && !cmdStr.includes('ql ')) {
                cmdStr = `task ${cmdStr}`;
            }
            if (cmdStr.endsWith('.js')) {
                cmdStr = `${cmdStr} now`;
            }
            const cp = child_process_1.spawn(cmdStr, { shell: '/bin/bash' });
            await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.running, pid: cp.pid }, { where: { id } });
            cp.stderr.on('data', (data) => {
                if (log_path) {
                    fs_1.default.appendFileSync(`${log_path}`, `${data}`);
                }
            });
            cp.on('error', (err) => {
                if (log_path) {
                    fs_1.default.appendFileSync(`${log_path}`, `${JSON.stringify(err)}`);
                }
            });
            cp.on('exit', async (code, signal) => {
                this.logger.info(`${command} pid: ${cp.pid} exit ${code} signal ${signal}`);
                await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: undefined }, { where: { id } });
                resolve();
            });
            cp.on('close', async (code) => {
                this.logger.info(`${command} pid: ${cp.pid} closed ${code}`);
                await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: undefined }, { where: { id } });
                resolve();
            });
        });
    }
    async disabled(ids) {
        await cron_1.CrontabModel.update({ isDisabled: 1 }, { where: { id: ids } });
        await this.set_crontab(true);
    }
    async enabled(ids) {
        await cron_1.CrontabModel.update({ isDisabled: 0 }, { where: { id: ids } });
        await this.set_crontab(true);
    }
    async log(id) {
        const doc = await this.getDb({ id });
        if (!doc) {
            return '';
        }
        if (doc.log_path) {
            return util_1.getFileContentByName(`${doc.log_path}`);
        }
        const [, commandStr, url] = doc.command.split(/ +/);
        let logPath = this.getKey(commandStr);
        const isQlCommand = doc.command.startsWith('ql ');
        const key = (url && ['repo', 'raw'].includes(commandStr) && this.getKey(url)) ||
            logPath;
        if (isQlCommand) {
            logPath = 'update';
        }
        let logDir = `${config_1.default.logPath}${logPath}`;
        if (fs_2.existsSync(logDir)) {
            let files = await fs_2.promises.readdir(logDir);
            if (isQlCommand) {
                files = files.filter((x) => x.includes(key));
            }
            return util_1.getFileContentByName(`${logDir}/${files[files.length - 1]}`);
        }
        else {
            return '';
        }
    }
    getKey(command) {
        const start = command.lastIndexOf('/') !== -1 ? command.lastIndexOf('/') + 1 : 0;
        const end = command.lastIndexOf('.') !== -1
            ? command.lastIndexOf('.')
            : command.length;
        return command.substring(start, end);
    }
    make_command(tab) {
        const crontab_job_string = `ID=${tab.id} ${tab.command}`;
        return crontab_job_string;
    }
    async set_crontab(needReloadSchedule = false) {
        const tabs = await this.crontabs();
        var crontab_string = '';
        tabs.forEach((tab) => {
            const _schedule = tab.schedule && tab.schedule.split(/ +/);
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
        await cron_1.CrontabModel.update({ saved: true }, { where: {} });
    }
    import_crontab() {
        child_process_1.exec('crontab -l', (error, stdout, stderr) => {
            var lines = stdout.split('\n');
            var namePrefix = new Date().getTime();
            lines.reverse().forEach(async (line, index) => {
                line = line.replace(/\t+/g, ' ');
                var regex = /^((\@[a-zA-Z]+\s+)|(([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+))/;
                var command = line.replace(regex, '').trim();
                var schedule = line.replace(command, '').trim();
                if (command &&
                    schedule &&
                    cron_parser_1.default.parseExpression(schedule).hasNext()) {
                    var name = namePrefix + '_' + index;
                    const _crontab = await cron_1.CrontabModel.findOne({
                        where: { command, schedule },
                    });
                    if (!_crontab) {
                        await this.create({ name, command, schedule });
                    }
                    else {
                        _crontab.command = command;
                        _crontab.schedule = schedule;
                        await this.update(_crontab);
                    }
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