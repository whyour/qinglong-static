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
const promises_1 = __importDefault(require("fs/promises"));
const cron_parser_1 = __importDefault(require("cron-parser"));
const util_1 = require("../config/util");
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const const_1 = require("../config/const");
const client_1 = __importDefault(require("../schedule/client"));
const pLimit_1 = __importDefault(require("../shared/pLimit"));
const cross_spawn_1 = require("cross-spawn");
const dayjs_1 = __importDefault(require("dayjs"));
const pickBy_1 = __importDefault(require("lodash/pickBy"));
const omit_1 = __importDefault(require("lodash/omit"));
const utils_1 = require("../shared/utils");
let CronService = class CronService {
    constructor(logger) {
        this.logger = logger;
    }
    isNodeCron(cron) {
        const { schedule, extra_schedules } = cron;
        if (Number(schedule === null || schedule === void 0 ? void 0 : schedule.split(/ +/).length) > 5 || (extra_schedules === null || extra_schedules === void 0 ? void 0 : extra_schedules.length)) {
            return true;
        }
        return false;
    }
    async create(payload) {
        const tab = new cron_1.Crontab(payload);
        tab.saved = false;
        const doc = await this.insert(tab);
        if (this.isNodeCron(doc)) {
            await client_1.default.addCron([
                {
                    name: doc.name || '',
                    id: String(doc.id),
                    schedule: doc.schedule,
                    command: this.makeCommand(doc),
                    extraSchedules: doc.extra_schedules || [],
                },
            ]);
        }
        await this.set_crontab();
        return doc;
    }
    async insert(payload) {
        return await cron_1.CrontabModel.create(payload, { returning: true });
    }
    async update(payload) {
        const doc = await this.getDb({ id: payload.id });
        const tab = new cron_1.Crontab(Object.assign(Object.assign({}, doc), payload));
        tab.saved = false;
        const newDoc = await this.updateDb(tab);
        if (doc.isDisabled === 1) {
            return newDoc;
        }
        if (this.isNodeCron(doc)) {
            await client_1.default.delCron([String(doc.id)]);
        }
        if (this.isNodeCron(newDoc)) {
            await client_1.default.addCron([
                {
                    name: doc.name || '',
                    id: String(newDoc.id),
                    schedule: newDoc.schedule,
                    command: this.makeCommand(newDoc),
                    extraSchedules: newDoc.extra_schedules || [],
                },
            ]);
        }
        await this.set_crontab();
        return newDoc;
    }
    async updateDb(payload) {
        await cron_1.CrontabModel.update(payload, { where: { id: payload.id } });
        return await this.getDb({ id: payload.id });
    }
    async status({ ids, status, pid, log_path, last_running_time = 0, last_execution_time = 0, }) {
        let options = {
            status,
            pid,
            log_path,
            last_execution_time,
        };
        if (last_running_time > 0) {
            options.last_running_time = last_running_time;
        }
        for (const id of ids) {
            let cron;
            try {
                cron = await this.getDb({ id });
            }
            catch (err) { }
            if (!cron) {
                continue;
            }
            if (status === cron_1.CrontabStatus.idle && log_path !== cron.log_path) {
                options = (0, omit_1.default)(options, ['status', 'log_path', 'pid']);
            }
            await cron_1.CrontabModel.update(Object.assign({}, (0, pickBy_1.default)(options, (v) => v === 0 || !!v)), { where: { id } });
        }
    }
    async remove(ids) {
        await cron_1.CrontabModel.destroy({ where: { id: ids } });
        await client_1.default.delCron(ids.map(String));
        await this.set_crontab();
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
    formatViewQuery(query, viewQuery) {
        if (viewQuery.filters && viewQuery.filters.length > 0) {
            const primaryOperate = viewQuery.filterRelation === 'or' ? sequelize_1.Op.or : sequelize_1.Op.and;
            if (!query[primaryOperate]) {
                query[primaryOperate] = [];
            }
            for (const col of viewQuery.filters) {
                const { property, value, operation } = col;
                let q = {};
                let operate2 = null;
                let operate = null;
                switch (operation) {
                    case 'Reg':
                        operate = sequelize_1.Op.like;
                        operate2 = sequelize_1.Op.or;
                        break;
                    case 'NotReg':
                        operate = sequelize_1.Op.notLike;
                        operate2 = sequelize_1.Op.and;
                        break;
                    case 'In':
                        q[sequelize_1.Op.or] = [
                            {
                                [property]: Array.isArray(value) ? value : [value],
                            },
                            property === 'status' && value.includes(2)
                                ? { isDisabled: 1 }
                                : {},
                        ];
                        break;
                    case 'Nin':
                        q[sequelize_1.Op.and] = [
                            {
                                [property]: {
                                    [sequelize_1.Op.notIn]: Array.isArray(value) ? value : [value],
                                },
                            },
                            property === 'status' && value.includes(2)
                                ? { isDisabled: { [sequelize_1.Op.ne]: 1 } }
                                : {},
                        ];
                        break;
                    default:
                        break;
                }
                if (operate && operate2) {
                    q[property] = {
                        [sequelize_1.Op.or]: [
                            {
                                [operate2]: [
                                    { [operate]: `%${value}%` },
                                    { [operate]: `%${encodeURI(value)}%` },
                                ],
                            },
                            {
                                [operate2]: [
                                    (0, sequelize_1.where)((0, sequelize_1.col)(property), operate, `%${value}%`),
                                    (0, sequelize_1.where)((0, sequelize_1.col)(property), operate, `%${encodeURI(value)}%`),
                                ],
                            },
                        ],
                    };
                }
                query[primaryOperate].push(q);
            }
        }
    }
    formatSearchText(query, searchText) {
        if (searchText) {
            if (!query[sequelize_1.Op.and]) {
                query[sequelize_1.Op.and] = [];
            }
            let q = {};
            const textArray = searchText.split(':');
            switch (textArray[0]) {
                case 'name':
                case 'command':
                case 'schedule':
                case 'label':
                    const column = textArray[0] === 'label' ? 'labels' : textArray[0];
                    q[column] = {
                        [sequelize_1.Op.or]: [
                            { [sequelize_1.Op.like]: `%${textArray[1]}%` },
                            { [sequelize_1.Op.like]: `%${encodeURI(textArray[1])}%` },
                        ],
                    };
                    break;
                default:
                    const reg = {
                        [sequelize_1.Op.or]: [
                            { [sequelize_1.Op.like]: `%${searchText}%` },
                            { [sequelize_1.Op.like]: `%${encodeURI(searchText)}%` },
                        ],
                    };
                    q[sequelize_1.Op.or] = [
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
                    ];
                    break;
            }
            query[sequelize_1.Op.and].push(q);
        }
    }
    formatFilterQuery(query, filterQuery) {
        if (filterQuery) {
            if (!query[sequelize_1.Op.and]) {
                query[sequelize_1.Op.and] = [];
            }
            const filterKeys = Object.keys(filterQuery);
            for (const key of filterKeys) {
                let q = {};
                if (!filterQuery[key])
                    continue;
                if (key === 'status') {
                    if (filterQuery[key].includes(cron_1.CrontabStatus.disabled)) {
                        q = { [sequelize_1.Op.or]: [{ [key]: filterQuery[key] }, { isDisabled: 1 }] };
                    }
                    else {
                        q = { [sequelize_1.Op.and]: [{ [key]: filterQuery[key] }, { isDisabled: 0 }] };
                    }
                }
                else {
                    q[key] = filterQuery[key];
                }
                query[sequelize_1.Op.and].push(q);
            }
        }
    }
    formatViewSort(order, viewQuery) {
        if (viewQuery.sorts && viewQuery.sorts.length > 0) {
            for (const { property, type } of viewQuery.sorts) {
                order.unshift([property, type]);
            }
        }
    }
    async find({ log_path, }) {
        try {
            const result = await cron_1.CrontabModel.findOne({ where: { log_path } });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async crontabs(params) {
        const searchText = params === null || params === void 0 ? void 0 : params.searchValue;
        const page = Number((params === null || params === void 0 ? void 0 : params.page) || '0');
        const size = Number((params === null || params === void 0 ? void 0 : params.size) || '0');
        const viewQuery = (0, util_1.safeJSONParse)(params === null || params === void 0 ? void 0 : params.queryString);
        const filterQuery = (0, util_1.safeJSONParse)(params === null || params === void 0 ? void 0 : params.filters);
        const sorterQuery = (0, util_1.safeJSONParse)(params === null || params === void 0 ? void 0 : params.sorter);
        let query = {};
        let order = [
            ['isPinned', 'DESC'],
            ['isDisabled', 'ASC'],
            ['status', 'ASC'],
            ['createdAt', 'DESC'],
        ];
        this.formatViewQuery(query, viewQuery);
        this.formatSearchText(query, searchText);
        this.formatFilterQuery(query, filterQuery);
        this.formatViewSort(order, viewQuery);
        if (sorterQuery) {
            const { field, type } = sorterQuery;
            if (field && type) {
                order.unshift([field, type]);
            }
        }
        let condition = {
            where: query,
            order: order,
        };
        if (page && size) {
            condition.offset = (page - 1) * size;
            condition.limit = size;
        }
        try {
            const result = await cron_1.CrontabModel.findAll(condition);
            const count = await cron_1.CrontabModel.count({ where: query });
            return { data: result, total: count };
        }
        catch (error) {
            throw error;
        }
    }
    async getDb(query) {
        const doc = await cron_1.CrontabModel.findOne({ where: Object.assign({}, query) });
        if (!doc) {
            throw new Error(`Cron ${JSON.stringify(query)} not found`);
        }
        return doc.get({ plain: true });
    }
    async run(ids) {
        await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.queued }, { where: { id: ids } });
        ids.forEach((id) => {
            this.runSingle(id);
        });
    }
    async stop(ids) {
        const docs = await cron_1.CrontabModel.findAll({ where: { id: ids } });
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
        await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: undefined }, { where: { id: ids } });
    }
    async runSingle(cronId) {
        return pLimit_1.default.manualRunWithCronLimit(() => {
            return new Promise(async (resolve) => {
                var _a;
                const cron = await this.getDb({ id: cronId });
                const params = {
                    name: cron.name,
                    command: cron.command,
                    schedule: cron.schedule,
                    extraSchedules: cron.extra_schedules,
                };
                if (cron.status !== cron_1.CrontabStatus.queued) {
                    resolve(params);
                    return;
                }
                this.logger.info(`[panel][开始执行任务] 参数: ${JSON.stringify(params)}`);
                let { id, command, log_path } = cron;
                const uniqPath = await (0, util_1.getUniqPath)(command, `${id}`);
                const logTime = (0, dayjs_1.default)().format('YYYY-MM-DD-HH-mm-ss-SSS');
                const logDirPath = path_1.default.resolve(config_1.default.logPath, `${uniqPath}`);
                if ((_a = log_path === null || log_path === void 0 ? void 0 : log_path.split('/')) === null || _a === void 0 ? void 0 : _a.every((x) => x !== uniqPath)) {
                    await promises_1.default.mkdir(logDirPath, { recursive: true });
                }
                const logPath = `${uniqPath}/${logTime}.log`;
                const absolutePath = path_1.default.resolve(config_1.default.logPath, `${logPath}`);
                const cp = (0, cross_spawn_1.spawn)(`real_log_path=${logPath} no_delay=true ${this.makeCommand(cron, true)}`, { shell: '/bin/bash' });
                await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.running, pid: cp.pid, log_path: logPath }, { where: { id } });
                cp.stdout.on('data', async (data) => {
                    await promises_1.default.appendFile(absolutePath, data.toString());
                });
                cp.stderr.on('data', async (data) => {
                    this.logger.info('[panel][执行任务失败] 命令: %s, 错误信息: %j', command, data.toString());
                    await promises_1.default.appendFile(absolutePath, data.toString());
                });
                cp.on('error', async (err) => {
                    this.logger.error('[panel][创建任务失败] 命令: %s, 错误信息: %j', command, err);
                    await promises_1.default.appendFile(absolutePath, JSON.stringify(err));
                });
                cp.on('exit', async (code) => {
                    this.logger.info('[panel][执行任务结束] 参数: %s, 退出码: %j', JSON.stringify(params), code);
                    await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: undefined }, { where: { id } });
                    resolve(Object.assign(Object.assign({}, params), { pid: cp.pid, code }));
                });
            });
        });
    }
    async disabled(ids) {
        await cron_1.CrontabModel.update({ isDisabled: 1 }, { where: { id: ids } });
        await client_1.default.delCron(ids.map(String));
        await this.set_crontab();
    }
    async enabled(ids) {
        await cron_1.CrontabModel.update({ isDisabled: 0 }, { where: { id: ids } });
        const docs = await cron_1.CrontabModel.findAll({ where: { id: ids } });
        const sixCron = docs
            .filter((x) => this.isNodeCron(x))
            .map((doc) => ({
            name: doc.name || '',
            id: String(doc.id),
            schedule: doc.schedule,
            command: this.makeCommand(doc),
            extraSchedules: doc.extra_schedules || [],
        }));
        await client_1.default.addCron(sixCron);
        await this.set_crontab();
    }
    async log(id) {
        const doc = await this.getDb({ id });
        if (!doc) {
            return '';
        }
        const absolutePath = path_1.default.resolve(config_1.default.logPath, `${doc.log_path}`);
        const logFileExist = doc.log_path && (await (0, util_1.fileExist)(absolutePath));
        if (logFileExist) {
            return await (0, util_1.getFileContentByName)(`${absolutePath}`);
        }
        else {
            return '任务未运行';
        }
    }
    async logs(id) {
        const doc = await this.getDb({ id });
        if (!doc || !doc.log_path) {
            return [];
        }
        const relativeDir = path_1.default.dirname(`${doc.log_path}`);
        const dir = path_1.default.resolve(config_1.default.logPath, relativeDir);
        const dirExist = await (0, util_1.fileExist)(dir);
        if (dirExist) {
            let files = await promises_1.default.readdir(dir);
            return (await Promise.all(files.map(async (x) => ({
                filename: x,
                directory: relativeDir.replace(config_1.default.logPath, ''),
                time: (await promises_1.default.lstat(`${dir}/${x}`)).mtime.getTime(),
            })))).sort((a, b) => b.time - a.time);
        }
        else {
            return [];
        }
    }
    makeCommand(tab, realTime) {
        let command = tab.command.trim();
        if (!command.startsWith(const_1.TASK_PREFIX) && !command.startsWith(const_1.QL_PREFIX)) {
            command = `${const_1.TASK_PREFIX}${tab.command}`;
        }
        let commandVariable = `real_time=${Boolean(realTime)} no_tee=true ID=${tab.id} `;
        if (tab.task_before) {
            commandVariable += `task_before='${tab.task_before
                .replace(/'/g, "'\\''")
                .replace(/;? *\n/g, ';')
                .trim()}' `;
        }
        if (tab.task_after) {
            commandVariable += `task_after='${tab.task_after
                .replace(/'/g, "'\\''")
                .replace(/;? *\n/g, ';')
                .trim()}' `;
        }
        const crontab_job_string = `${commandVariable}${command}`;
        return crontab_job_string;
    }
    async set_crontab(data) {
        const tabs = data !== null && data !== void 0 ? data : (await this.crontabs());
        var crontab_string = '';
        tabs.data.forEach((tab) => {
            var _a;
            const _schedule = tab.schedule && tab.schedule.split(/ +/);
            if (tab.isDisabled === 1 ||
                _schedule.length !== 5 ||
                ((_a = tab.extra_schedules) === null || _a === void 0 ? void 0 : _a.length)) {
                crontab_string += '# ';
                crontab_string += tab.schedule;
                crontab_string += ' ';
                crontab_string += this.makeCommand(tab);
                crontab_string += '\n';
            }
            else {
                crontab_string += tab.schedule;
                crontab_string += ' ';
                crontab_string += this.makeCommand(tab);
                crontab_string += '\n';
            }
        });
        await (0, utils_1.writeFileWithLock)(config_1.default.crontabFile, crontab_string);
        (0, child_process_1.execSync)(`crontab ${config_1.default.crontabFile}`);
        await cron_1.CrontabModel.update({ saved: true }, { where: {} });
    }
    import_crontab() {
        (0, child_process_1.exec)('crontab -l', (error, stdout, stderr) => {
            const lines = stdout.split('\n');
            const namePrefix = new Date().getTime();
            lines.reverse().forEach(async (line, index) => {
                line = line.replace(/\t+/g, ' ');
                const regex = /^((\@[a-zA-Z]+\s+)|(([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+))/;
                const command = line.replace(regex, '').trim();
                const schedule = line.replace(command, '').trim();
                if (command &&
                    schedule &&
                    cron_parser_1.default.parseExpression(schedule).hasNext()) {
                    const name = namePrefix + '_' + index;
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
    async autosave_crontab() {
        const tabs = await this.crontabs();
        this.set_crontab(tabs);
        const sixCron = tabs.data
            .filter((x) => this.isNodeCron(x) && x.isDisabled !== 1)
            .map((doc) => ({
            name: doc.name || '',
            id: String(doc.id),
            schedule: doc.schedule,
            command: this.makeCommand(doc),
            extraSchedules: doc.extra_schedules || [],
        }));
        await client_1.default.addCron(sixCron);
    }
};
CronService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], CronService);
exports.default = CronService;
//# sourceMappingURL=cron.js.map