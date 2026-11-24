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
const cronExecution_1 = require("../cron/execution/cronExecution");
const cronScheduling_1 = require("../cron/scheduling/cronScheduling");
const systemCron_1 = require("../cron/scheduling/systemCron");
const cronOperand_1 = require("../cron/execution/cronOperand");
const errors_1 = require("../shared/errors");
const history_1 = require("../cron/history");
const cronSchedule_1 = require("../cron/scheduling/cronSchedule");
const schedulerMutationLock_1 = require("../cron/scheduling/schedulerMutationLock");
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config"));
const logPath_1 = require("../shared/logPath");
const cron_1 = require("../data/cron");
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const util_1 = require("../config/util");
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const client_1 = __importDefault(require("../schedule/client"));
const pickBy_1 = __importDefault(require("lodash/pickBy"));
const utils_1 = require("../shared/utils");
const i18n_1 = require("../shared/i18n");
const childProcess_1 = require("../shared/childProcess");
const lodash_1 = require("lodash");
const cronLog_1 = require("../cron/queries/cronLog");
const cronViews_1 = require("../cron/queries/cronViews");
function statusFilter(values, exclude, forDisplay) {
    const column = forDisplay ? cronViews_1.visibleStatus : (0, sequelize_1.col)('status');
    const disabled = values.includes(cron_1.CrontabStatus.disabled);
    if (exclude) {
        return {
            [sequelize_1.Op.and]: [
                {
                    [sequelize_1.Op.or]: [
                        (0, sequelize_1.where)(column, { [sequelize_1.Op.notIn]: values }),
                        (0, sequelize_1.where)(column, { [sequelize_1.Op.is]: null }),
                    ],
                },
                ...(disabled ? [{ isDisabled: { [sequelize_1.Op.ne]: 1 } }] : []),
            ],
        };
    }
    const matches = (0, sequelize_1.where)(column, { [sequelize_1.Op.in]: values });
    return disabled
        ? { [sequelize_1.Op.or]: [matches, { isDisabled: 1 }] }
        : { [sequelize_1.Op.and]: [matches, { isDisabled: 0 }] };
}
let CronService = class CronService {
    constructor(logger) {
        this.logger = logger;
        // One coordinator per service preserves in-flight stop deduplication. Late-bound
        // callbacks keep existing service overrides and execution entry points intact.
        this.execution = new cronExecution_1.CronExecution(this.logger, {
            getDb: (query) => this.getDb(query),
            makeCommand: (tab, realTime) => this.makeCommand(tab, realTime),
            runSingle: (...args) => this.runSingle(...args),
            stopInstance: (cronId, instanceId) => this.stopInstance(cronId, instanceId),
            stop: (ids, requestId) => this.stop(ids, requestId),
        });
    }
    isNodeCron(cron) {
        return (0, cronScheduling_1.isNodeCron)(cron);
    }
    get schedulerMode() {
        return (0, cronScheduling_1.schedulerMode)();
    }
    shouldUseCronClient(cron) {
        return (0, cronScheduling_1.shouldUseCronClient)(cron, this.schedulerMode);
    }
    isOnceSchedule(schedule) {
        return (0, cronScheduling_1.isOnceSchedule)(schedule);
    }
    isBootSchedule(schedule) {
        return (0, cronScheduling_1.isBootSchedule)(schedule);
    }
    isSpecialSchedule(schedule) {
        return (0, cronScheduling_1.isSpecialSchedule)(schedule);
    }
    async getLogName(cron) {
        const { log_name, command, id } = cron;
        if (log_name === '/dev/null') {
            return log_name;
        }
        const candidate = log_name || (await (0, util_1.getUniqPath)(command, `${id}`));
        const logDirPath = (0, logPath_1.resolveLogPath)(config_1.default.logPath, candidate);
        await promises_1.default.mkdir(logDirPath, { recursive: true });
        // Shell joins the returned value to dir_log. Normalize old absolute names once.
        return path_1.default.relative(config_1.default.logPath, logDirPath);
    }
    async create(payload) {
        return (0, schedulerMutationLock_1.withSchedulerMutation)(async () => {
            const tab = new cron_1.Crontab(payload);
            tab.saved = false;
            tab.recovery_from = Date.now();
            tab.log_name = await this.getLogName(tab);
            const doc = await this.insert(tab);
            if ((0, util_1.isDemoEnv)()) {
                return doc;
            }
            if (this.shouldUseCronClient(doc)) {
                try {
                    await client_1.default.addCron([(0, cronScheduling_1.nodeCron)(doc, this.makeCommand(doc))]);
                }
                catch (error) {
                    // gRPC 注册失败时回滚 DB 记录，避免产生"僵尸任务"
                    // （DB 和 crontab.list 有记录但调度器永远不会执行）
                    await cron_1.CrontabModel.destroy({ where: { id: doc.id } });
                    this.logger.error('[crontab] Failed to register cron job in scheduler, task creation rolled back:', (error === null || error === void 0 ? void 0 : error.message) || error);
                    throw (0, schedulerMutationLock_1.schedulerRegistrationError)(`${(0, i18n_1.t)('调度器注册失败，任务创建已回滚')}: ${(error === null || error === void 0 ? void 0 : error.details) || (error === null || error === void 0 ? void 0 : error.message)}`, error);
                }
            }
            try {
                await this.setCrontab(undefined, [doc.id]);
            }
            catch (error) {
                if (error.status === 503) {
                    throw new errors_1.PendingCronInstall(doc.id, (0, childProcess_1.asError)(error).message);
                }
                throw error;
            }
            doc.saved = true;
            return doc;
        });
    }
    async insert(payload) {
        return await cron_1.CrontabModel.create(payload, { returning: true });
    }
    async update(payload) {
        return (0, schedulerMutationLock_1.withSchedulerMutation)(async () => {
            const doc = await this.getDb({ id: payload.id });
            const tab = new cron_1.Crontab(Object.assign(Object.assign({}, doc), payload));
            tab.saved = false;
            tab.recovery_from = Math.max(Date.now(), Number(doc.recovery_from || 0) + 1);
            tab.log_name = await this.getLogName(tab);
            if ((0, util_1.isDemoEnv)()) {
                tab.saved = doc.saved;
                return await this.updateDb(tab);
            }
            if (doc.isDisabled === 1) {
                const updated = await this.updateDb(tab);
                await this.setCrontab(undefined, [doc.id]);
                updated.saved = true;
                return updated;
            }
            const register = (row) => client_1.default.addCron([(0, cronScheduling_1.nodeCron)(row, this.makeCommand(row))]);
            const restoreTimer = async () => {
                if (!this.shouldUseCronClient(doc))
                    return;
                try {
                    await register(doc);
                }
                catch (error) {
                    client_1.default.readiness.invalidate();
                    await cron_1.CrontabModel.update({ saved: false }, { where: { id: doc.id } });
                    throw Object.assign(new Error((0, i18n_1.t)('原调度未能恢复，正在重试'), { cause: error }), { status: 503 });
                }
            };
            // addCron stages and atomically replaces a Node timer. Never tear down the
            // old timer for a Node-to-Node edit that the database may still reject.
            const handOff = this.shouldUseCronClient(doc) && !this.shouldUseCronClient(tab);
            if (handOff)
                await client_1.default.delCron([String(doc.id)]);
            let newDoc;
            try {
                newDoc = await this.updateDb(tab);
            }
            catch (error) {
                if (handOff)
                    await restoreTimer();
                throw error;
            }
            const useNode = this.shouldUseCronClient(newDoc);
            const movingFromSystem = useNode &&
                !this.shouldUseCronClient(doc) &&
                !this.isSpecialSchedule(doc.schedule);
            // Remove the previous system entry before the new Node timer can fire.
            if (movingFromSystem)
                await this.setCrontab();
            if (useNode) {
                try {
                    await register(newDoc);
                }
                catch (error) {
                    // gRPC 注册新任务失败 → 回滚 DB 到旧数据，并尝试恢复旧调度注册
                    await this.updateDb(doc);
                    await restoreTimer();
                    if (movingFromSystem) {
                        await cron_1.CrontabModel.update({ saved: false }, { where: { id: doc.id } });
                        await this.setCrontab(undefined, [doc.id]);
                    }
                    this.logger.error('[crontab] Failed to register updated cron job in scheduler, update rolled back:', (error === null || error === void 0 ? void 0 : error.message) || error);
                    throw (0, schedulerMutationLock_1.schedulerRegistrationError)(`${(0, i18n_1.t)('调度器注册失败，任务更新已回滚')}: ${(error === null || error === void 0 ? void 0 : error.details) || (error === null || error === void 0 ? void 0 : error.message)}`, error);
                }
            }
            if (movingFromSystem)
                await cron_1.CrontabModel.update({ saved: true }, { where: { id: doc.id } });
            else
                await this.setCrontab(undefined, [doc.id]);
            newDoc.saved = true;
            return newDoc;
        });
    }
    async updateDb(payload) {
        // A concurrent dispatch owns the runtime fields, including during rollback.
        await cron_1.CrontabModel.update(payload, {
            where: { id: payload.id },
            fields: [
                'name',
                'command',
                'schedule',
                'timestamp',
                'saved',
                'labels',
                'sub_id',
                'extra_schedules',
                'task_before',
                'task_after',
                'log_name',
                'work_dir',
                'allow_multiple_instances',
                'skip_if_pending',
                'max_queue_wait',
                'catchup_seconds',
                'recovery_from',
            ],
        });
        return await this.getDb({ id: payload.id });
    }
    async status({ ids, status, pid, log_path, last_running_time, last_execution_time = 0, exit_code, trigger_id, trigger_stopped, finished_at, }) {
        if (log_path && log_path !== '/dev/null') {
            (0, logPath_1.resolveLogPath)(config_1.default.logPath, log_path);
        }
        const options = {
            status,
            pid,
            log_path,
            last_execution_time,
        };
        if (last_running_time != null && last_running_time > 0) {
            options.last_running_time = last_running_time;
        }
        for (const id of ids) {
            if (!(await cron_1.CrontabModel.findByPk(id, { attributes: ['id'] })))
                continue;
            if (trigger_id &&
                [cron_1.CrontabStatus.running, cron_1.CrontabStatus.idle].includes(status)) {
                await new history_1.TriggerHistory(cron_1.CrontabModel.sequelize).reportInstance(trigger_id, id, status === cron_1.CrontabStatus.running, pid, log_path, last_execution_time, last_running_time, exit_code, trigger_stopped, finished_at);
                continue;
            }
            if (status === cron_1.CrontabStatus.running || status === cron_1.CrontabStatus.idle) {
                if (Number.isSafeInteger(pid) &&
                    pid > 0 &&
                    Number.isSafeInteger(last_execution_time) &&
                    last_execution_time > 0) {
                    await new history_1.TriggerHistory(cron_1.CrontabModel.sequelize).reportLegacy(id, status === cron_1.CrontabStatus.running, pid, log_path, last_execution_time, last_running_time !== null && last_running_time !== void 0 ? last_running_time : 0, exit_code);
                }
                continue;
            }
            await cron_1.CrontabModel.update(Object.assign({}, (0, pickBy_1.default)(options, (v) => v === 0 || !!v)), { where: { id } });
        }
    }
    async remove(targets) {
        return (0, schedulerMutationLock_1.withSchedulerMutation)(async () => {
            var _a;
            const ids = targets.map((target) => typeof target === 'number' ? target : target.id);
            for (const target of targets) {
                if (typeof target === 'number')
                    continue;
                const current = await cron_1.CrontabModel.findByPk(target.id);
                if (!current ||
                    (0, cronOperand_1.cronOperand)(current.command, true) !== target.script ||
                    (target.command !== undefined &&
                        current.command !== target.command) ||
                    (target.revision !== undefined &&
                        current.recovery_from !== target.revision) ||
                    (target.sub_id !== undefined &&
                        ((_a = current.sub_id) !== null && _a !== void 0 ? _a : null) !== target.sub_id)) {
                    throw Object.assign(new Error((0, i18n_1.t)('任务已修改，请刷新后重试')), {
                        status: 409,
                    });
                }
            }
            await client_1.default.delCron(ids.map(String));
            await cron_1.CrontabModel.destroy({ where: { id: ids } });
            await this.setCrontab();
        });
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
    formatViewQuery(query, viewQuery, forDisplay) {
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
                if (property === 'status' &&
                    (operation === 'In' || operation === 'Nin')) {
                    query[primaryOperate].push(statusFilter(Array.isArray(value) ? value : [value], operation === 'Nin', forDisplay));
                    continue;
                }
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
                        q[property] = Array.isArray(value) ? value : [value];
                        break;
                    case 'Nin':
                        q[sequelize_1.Op.or] = [
                            {
                                [property]: {
                                    [sequelize_1.Op.notIn]: Array.isArray(value) ? value : [value],
                                },
                            },
                            { [property]: { [sequelize_1.Op.is]: null } },
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
    formatFilterQuery(query, filterQuery, forDisplay) {
        if (!(0, lodash_1.isEmpty)(filterQuery)) {
            if (!query[sequelize_1.Op.and]) {
                query[sequelize_1.Op.and] = [];
            }
            const filterKeys = Object.keys(filterQuery);
            for (const key of filterKeys) {
                let q = {};
                if (!filterQuery[key])
                    continue;
                if (key === 'status') {
                    q = statusFilter(filterQuery[key], false, forDisplay);
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
            return result === null || result === void 0 ? void 0 : result.get({ plain: true });
        }
        catch (error) {
            throw error;
        }
    }
    async crontabs(params, forDisplay = false) {
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
        this.formatViewQuery(query, viewQuery, forDisplay);
        this.formatSearchText(query, searchText);
        this.formatFilterQuery(query, filterQuery, forDisplay);
        this.formatViewSort(order, viewQuery);
        if (sorterQuery) {
            const { field, type } = sorterQuery;
            if (field && type) {
                order.unshift([field, type]);
            }
        }
        let condition = Object.assign({ where: query, order: (forDisplay
                ? order.map(([field, dir]) => [
                    field === 'status' ? cronViews_1.visibleStatus : field,
                    dir,
                ])
                : order) }, (forDisplay ? { attributes: cronViews_1.visibleAttributes } : {}));
        if (page && size) {
            condition.offset = (page - 1) * size;
            condition.limit = size;
        }
        try {
            const result = await cron_1.CrontabModel.findAll(condition);
            const count = await cron_1.CrontabModel.count({ where: query });
            return { data: result.map((x) => x.get({ plain: true })), total: count };
        }
        catch (error) {
            throw error;
        }
    }
    async getDb(query, projection = false) {
        const attributes = projection === true ? cronViews_1.visibleAttributes : projection;
        const doc = await cron_1.CrontabModel.findOne(Object.assign({ where: Object.assign({}, query) }, (attributes && { attributes })));
        if (!doc) {
            throw new Error(`Cron ${JSON.stringify(query)} not found`);
        }
        return doc.get({ plain: true });
    }
    async run(ids, source = 'manual') {
        return this.execution.run(ids, source);
    }
    async stop(ids, requestId) {
        return this.execution.stop(ids, requestId);
    }
    async resumePendingStops(history, requests, batches = []) {
        return this.execution.resumePendingStops(history, requests, batches);
    }
    stopInstance(cronId, instanceId) {
        return this.execution.stopInstance(cronId, instanceId);
    }
    async runSingle(cronId, expectedToken, triggerId, submitted) {
        return this.execution.runSingle(cronId, expectedToken, triggerId, submitted);
    }
    async disabled(ids) {
        return (0, schedulerMutationLock_1.withSchedulerMutation)(async () => {
            await client_1.default.delCron(ids.map(String));
            await cron_1.CrontabModel.update({ isDisabled: 1, saved: false }, { where: { id: ids } });
            await this.setCrontab(undefined, ids);
        });
    }
    async enabled(ids) {
        return (0, schedulerMutationLock_1.withSchedulerMutation)(async () => {
            await cron_1.CrontabModel.update({ isDisabled: 0, recovery_from: Date.now() }, { where: { id: ids } });
            const docs = await cron_1.CrontabModel.findAll({ where: { id: ids } });
            const crons = docs
                .filter((x) => this.shouldUseCronClient(x))
                .map((doc) => (0, cronScheduling_1.nodeCron)(doc, this.makeCommand(doc)));
            if ((0, util_1.isDemoEnv)()) {
                return;
            }
            try {
                await client_1.default.addCron(crons);
            }
            catch (error) {
                // gRPC 注册失败 → 回滚启用状态，避免 DB 显示已启用但调度器未注册
                await cron_1.CrontabModel.update({ isDisabled: 1 }, { where: { id: ids } });
                this.logger.error('[crontab] Failed to register cron job in scheduler, enable rolled back:', (error === null || error === void 0 ? void 0 : error.message) || error);
                throw (0, schedulerMutationLock_1.schedulerRegistrationError)(`${(0, i18n_1.t)('调度器注册失败，任务启用已回滚')}: ${(error === null || error === void 0 ? void 0 : error.details) || (error === null || error === void 0 ? void 0 : error.message)}`, error);
            }
            await cron_1.CrontabModel.update({ saved: false }, { where: { id: ids } });
            await this.setCrontab(undefined, ids);
        });
    }
    async log(id, options = {}) {
        return new cronLog_1.CronLogReader((cronId, attributes) => this.getDb({ id: cronId }, attributes)).log(id, options);
    }
    async logs(id) {
        return new cronLog_1.CronLogReader((cronId, attributes) => this.getDb({ id: cronId }, attributes)).logs(id);
    }
    makeCommand(tab, realTime) {
        return (0, cronScheduling_1.makeCommand)(tab, realTime);
    }
    async setCrontab(data, appliedIds = []) {
        const tabs = data !== null && data !== void 0 ? data : (await this.crontabs());
        await new systemCron_1.SystemCronAdapter(this.logger).publish(tabs.data, () => this.schedulerMode, (tab) => this.makeCommand(tab));
        // Only these registrations were acknowledged by this mutation. An unrelated
        // file install cannot confirm a pending Node registration.
        if (appliedIds.length)
            await this.markSchedulesSaved(appliedIds);
    }
    async markSchedulesSaved(ids) {
        await cron_1.CrontabModel.update({ saved: true }, { where: { id: ids, saved: false } });
    }
    importCrontab() {
        (0, child_process_1.exec)('crontab -l', (error, stdout) => {
            if (error) {
                const errorMsg = error.message || String(error);
                this.logger.error('[crontab] Failed to read system crontab:', errorMsg);
            }
            const lines = stdout.split('\n');
            const namePrefix = new Date().getTime();
            lines.reverse().forEach(async (line, index) => {
                line = line.replace(/\t+/g, ' ');
                const regex = /^((\@[a-zA-Z]+\s+)|(([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+))/;
                const command = line.replace(regex, '').trim();
                const schedule = line.replace(command, '').trim();
                if (command && schedule && (0, cronSchedule_1.isValidCronSchedule)(schedule)) {
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
    async autosave_crontab(requireScheduler = false) {
        return (0, schedulerMutationLock_1.withSchedulerMutation)(async () => {
            const tabs = await this.crontabs();
            // A bad persisted rule must not block startup or all other schedules.
            // Keep the DB row editable; omit it from both runtime scheduler snapshots.
            tabs.data = tabs.data.filter((doc) => {
                if (doc.isDisabled === 1)
                    return true;
                const invalidSchedules = (0, cronSchedule_1.getInvalidCronSchedules)(doc);
                if (invalidSchedules.length === 0)
                    return true;
                this.logger.warn('[crontab] Skipping task with invalid schedule (id=%s, name=%s): %s', doc.id, doc.name || '', JSON.stringify(invalidSchedules));
                return false;
            });
            const regularCrons = tabs.data
                .filter((x) => x.isDisabled !== 1 && this.shouldUseCronClient(x))
                .map((doc) => (0, cronScheduling_1.nodeCron)(doc, this.makeCommand(doc)));
            if ((0, util_1.isDemoEnv)()) {
                await (0, utils_1.writeFileWithLock)(config_1.default.crontabFile, '');
                return;
            }
            // 先同步 crontab.list 与系统 crontab，确保其始终反映数据库真实状态。
            // gRPC 调度注册为尽力而为：失败时不阻断文件同步，调度器重启后会重新注册。
            // 这避免了因调度器短暂不可用导致 crontab.list 与数据库脱节（订阅更新误判任务已存在）。
            await this.setCrontab(tabs);
            try {
                await client_1.default.addCron(regularCrons, requireScheduler);
                await this.markSchedulesSaved(tabs.data.map((row) => row.id));
            }
            catch (error) {
                this.logger.warn('[crontab] Failed to register cron job in scheduler: %s', (error === null || error === void 0 ? void 0 : error.message) || error);
                if (requireScheduler)
                    throw error;
            }
        });
    }
    async bootTask() {
        const tabs = await this.crontabs();
        const bootTasks = tabs.data.filter((x) => !x.isDisabled && this.isBootSchedule(x.schedule));
        if (bootTasks.length > 0) {
            await this.run(bootTasks.map((task) => task.id), 'boot');
        }
    }
    async recoverQueuedTasks() {
        await this.execution.recoverQueued();
    }
};
CronService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], CronService);
exports.default = CronService;
//# sourceMappingURL=cron.js.map