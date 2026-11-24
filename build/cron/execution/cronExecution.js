"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronExecution = void 0;
const crypto_1 = require("crypto");
const dayjs_1 = __importDefault(require("dayjs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../../config/index"));
const util_1 = require("../../config/util");
const cron_1 = require("../../data/cron");
const executionModels_1 = require("../../data/executionModels");
const runningInstance_1 = require("../../data/runningInstance");
const childProcess_1 = require("../../shared/childProcess");
const fileAccess_1 = require("../../shared/fileAccess");
const i18n_1 = require("../../shared/i18n");
const logPath_1 = require("../../shared/logPath");
const logStreamManager_1 = require("../../shared/logStreamManager");
const history_1 = require("../history");
const cronScheduling_1 = require("../scheduling/cronScheduling");
const cronCommandProcess_1 = require("./cronCommandProcess");
const cronLimit_1 = __importDefault(require("./cronLimit"));
const cronProcess_1 = require("./cronProcess");
class CronExecution {
    constructor(logger, host) {
        this.logger = logger;
        this.host = host;
        this.stoppingBatches = new Map();
        this.stoppingInstances = new Map();
    }
    async run(ids, source = 'manual') {
        const token = (0, crypto_1.randomUUID)();
        const database = cron_1.CrontabModel.sequelize;
        const history = new history_1.TriggerHistory(database);
        const submission = await database.transaction(async (transaction) => {
            const rows = await cron_1.CrontabModel.findAll({
                where: { id: ids },
                transaction,
            });
            const accepted = [];
            const triggers = [];
            for (const row of rows) {
                const id = row.id;
                const trigger = token + '-' + id;
                await history.enqueue(trigger, id, source, null, Date.now(), transaction);
                if (!row.allow_multiple_instances &&
                    ((0, cronProcess_1.hasLiveCronProcess)(row.status, row.pid) ||
                        (await history.isRunning(id, transaction)))) {
                    await history.finish(trigger, 'skipped', 'overlap', null, transaction);
                    triggers.push({
                        taskId: id,
                        triggerId: trigger,
                        state: 'skipped',
                        reason: 'overlap',
                    });
                }
                else {
                    accepted.push(row.get({ plain: true }));
                    await database.query('INSERT INTO CronManualSubmissions(trigger_id,token,snapshot) VALUES ($id,$token,$snapshot)', {
                        transaction,
                        bind: {
                            id: trigger,
                            token,
                            snapshot: JSON.stringify(row.get({ plain: true })),
                        },
                    });
                    triggers.push({
                        taskId: id,
                        triggerId: trigger,
                        state: 'queued',
                        reason: null,
                    });
                }
            }
            await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.queued, queued_token: token }, {
                where: { id: accepted.map((row) => row.id) },
                transaction,
            });
            return { queued: accepted, triggers };
        });
        for (const row of submission.queued) {
            const id = row.id;
            void this.host
                .runSingle(id, token, token + '-' + id, row)
                .catch((err) => this.logger.error(String(err)));
        }
        return submission.triggers;
    }
    async recoverQueued() {
        const rows = await (0, executionModels_1.executionModel)(cron_1.CrontabModel.sequelize, 'CronManualSubmissions').findAll({
            attributes: ['trigger_id', 'token', 'snapshot'],
            include: [
                {
                    association: (0, executionModels_1.executionAssociation)(cron_1.CrontabModel.sequelize, 'submissionTrigger'),
                    attributes: [],
                    required: true,
                    where: {
                        state: 'queued',
                        [sequelize_1.Op.or]: [{ stop_requested: null }, { stop_requested: 0 }],
                    },
                },
            ],
            order: [
                [(0, sequelize_1.col)('trigger.queued_at'), 'ASC'],
                [(0, sequelize_1.col)('trigger.id'), 'ASC'],
            ],
            raw: true,
        });
        for (const row of rows) {
            const snapshot = JSON.parse(row.snapshot);
            void this.host
                .runSingle(snapshot.id, row.token, row.trigger_id, snapshot)
                .catch((error) => this.logger.error(String(error)));
        }
    }
    async stop(ids, requestId) {
        if (!ids.length && !requestId)
            return;
        const targets = [...new Set(ids)].sort((a, b) => a - b);
        const cronIds = JSON.stringify(targets);
        if (!requestId)
            return this.stopBatch(targets, cronIds);
        const key = requestId + '/' + cronIds;
        const pending = this.stoppingBatches.get(key);
        if (pending)
            return pending;
        // The database arbitrates different payloads and competing workers.
        const done = this.stopBatch(targets, cronIds, requestId).finally(() => this.stoppingBatches.delete(key));
        this.stoppingBatches.set(key, done);
        return done;
    }
    async stopBatch(ids, cronIds, requestId) {
        var _a, _b, _c, _d, _e;
        const database = cron_1.CrontabModel.sequelize;
        const history = new history_1.TriggerHistory(database);
        const snapshot = await database.transaction({ type: sequelize_1.Transaction.TYPES.IMMEDIATE }, async (transaction) => {
            if (requestId) {
                const [existing] = await (0, executionModels_1.executionModel)(database, 'CronStopBatches').findAll({
                    attributes: ['cron_ids', 'snapshot', 'status_code'],
                    where: { request_id: requestId },
                    transaction,
                    raw: true,
                });
                if (existing) {
                    if (existing.cron_ids !== cronIds)
                        throw Object.assign(new Error('Idempotency-Key already used for different tasks'), { status: 409 });
                    if (existing.status_code === 409)
                        throw Object.assign(new Error((0, i18n_1.t)('实例不存在或已停止')), {
                            status: 409,
                        });
                    return existing.snapshot ? JSON.parse(existing.snapshot) : null;
                }
            }
            const docs = await cron_1.CrontabModel.findAll({
                attributes: [
                    'id',
                    'status',
                    'pid',
                    'log_path',
                    'queued_token',
                    'last_execution_time',
                ],
                where: { id: ids },
                transaction,
                raw: true,
            });
            const cancelled = await history.cancelQueuedInTransaction(ids, transaction);
            const instances = await runningInstance_1.RunningInstanceModel.findAll({
                attributes: ['id', 'cron_id', 'pid'],
                where: { cron_id: ids, status: runningInstance_1.InstanceStatus.running },
                transaction,
                raw: true,
            });
            const { missingTargets, identityConflict } = await this.attachLegacyStopTargets(docs, instances, history, transaction);
            for (const instance of instances) {
                if (instance.pid)
                    await history.queueInstanceStop(instance.id, instance.cron_id, instance.pid, transaction);
            }
            for (const doc of docs) {
                if (doc.status === cron_1.CrontabStatus.queued) {
                    await cron_1.CrontabModel.update({
                        status: cron_1.CrontabStatus.idle,
                        pid: null,
                        queued_token: null,
                    }, {
                        where: { id: doc.id, status: cron_1.CrontabStatus.queued },
                        transaction,
                    });
                }
            }
            const batch = {
                docs,
                cancelled,
                instances,
                missingTargets,
                identityConflict,
            };
            if (requestId) {
                await (0, executionModels_1.executionModel)(database, 'CronStopBatches').create({
                    request_id: requestId,
                    cron_ids: cronIds,
                    snapshot: JSON.stringify(batch),
                }, { transaction, silent: true, hooks: false, validate: false });
            }
            return batch;
        });
        if (!snapshot)
            return;
        const { docs, cancelled, instances, missingPids, missingTargets, identityConflict, } = snapshot;
        if (cancelled.length)
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, { type: 'cancel-queued-triggers', ids: cancelled });
        const stopped = new Set(missingTargets);
        let failure;
        for (const instance of instances) {
            try {
                const result = await this.host.stopInstance(instance.cron_id, instance.id);
                if (result.code === 409)
                    failure !== null && failure !== void 0 ? failure : (failure = Object.assign(new Error(result.message), { status: 409 }));
                if (instance.pid &&
                    'data' in result &&
                    ((_b = result.data) === null || _b === void 0 ? void 0 : _b.outcome) === 'stopped')
                    stopped.add(instance.cron_id + '/' + instance.pid);
            }
            catch (error) {
                failure !== null && failure !== void 0 ? failure : (failure = (0, childProcess_1.asError)(error));
            }
        }
        for (const doc of docs) {
            if (doc.status !== cron_1.CrontabStatus.running ||
                (doc.pid &&
                    !(missingPids === null || missingPids === void 0 ? void 0 : missingPids.includes(doc.pid)) &&
                    !stopped.has(doc.id + '/' + doc.pid)))
                continue;
            const remaining = await runningInstance_1.RunningInstanceModel.count({
                where: { cron_id: doc.id, status: runningInstance_1.InstanceStatus.running },
            });
            if (remaining)
                continue;
            await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: null, queued_token: null }, {
                where: {
                    id: doc.id,
                    status: cron_1.CrontabStatus.running,
                    [sequelize_1.Op.and]: [
                        (0, sequelize_1.where)((0, sequelize_1.col)('queued_token'), {
                            [sequelize_1.Op.eq]: (_c = doc.queued_token) !== null && _c !== void 0 ? _c : null,
                        }),
                        (0, sequelize_1.where)((0, sequelize_1.col)('pid'), { [sequelize_1.Op.eq]: (_d = doc.pid) !== null && _d !== void 0 ? _d : null }),
                        (0, sequelize_1.where)((0, sequelize_1.col)('log_path'), { [sequelize_1.Op.eq]: (_e = doc.log_path) !== null && _e !== void 0 ? _e : null }),
                    ],
                },
            });
        }
        if (failure)
            throw failure;
        // Retain the key after success. Even a much later retry must never take a new snapshot.
        if (requestId)
            await (0, executionModels_1.executionModel)(database, 'CronStopBatches').update({ snapshot: null, status_code: identityConflict ? 409 : 200 }, {
                where: { request_id: requestId, snapshot: { [sequelize_1.Op.not]: null } },
                silent: true,
                hooks: false,
                validate: false,
            });
        if (identityConflict)
            throw Object.assign(new Error((0, i18n_1.t)('实例不存在或已停止')), { status: 409 });
    }
    // Older databases may have a PID or command receipt without an instance.
    // Attach verified targets before releasing the stop snapshot transaction.
    async attachLegacyStopTargets(docs, instances, history, transaction) {
        var _a;
        const commands = await history.activeCommands(docs.map((doc) => doc.id), transaction);
        const registered = new Set(instances.map((row) => row.cron_id + '/' + row.pid));
        const registeredPids = new Set(instances.map((row) => row.pid));
        const legacy = new Map();
        for (const doc of docs) {
            const key = doc.id + '/' + doc.pid;
            if (doc.status === cron_1.CrontabStatus.running &&
                doc.pid &&
                !registered.has(key))
                legacy.set(key, {
                    pid: doc.pid,
                    cronId: doc.id,
                    started: doc.last_execution_time,
                    log: doc.log_path,
                });
        }
        for (const command of commands) {
            const pid = Number(command.command_identity.split(':')[1]);
            const key = command.cron_id + '/' + pid;
            if (!registered.has(key))
                legacy.set(key, {
                    pid,
                    cronId: command.cron_id,
                    trigger: command.id,
                    identity: command.command_identity,
                    started: Math.floor(command.started_at / 1000),
                    log: (_a = command.log_path) !== null && _a !== void 0 ? _a : undefined,
                });
        }
        let identityConflict = false;
        const missingTargets = [];
        for (const target of legacy.values()) {
            const { pid } = target;
            // A different task already owns this PID in the snapshot.
            if (registeredPids.has(pid)) {
                identityConflict = true;
                continue;
            }
            let identity;
            try {
                identity = (0, cronProcess_1.systemOwner)(pid);
                (0, cronProcess_1.verifyCronProcess)(pid, target.cronId, target.identity, target.started);
            }
            catch (error) {
                if (['ENOENT', 'ESRCH'].includes(error.code))
                    missingTargets.push(target.cronId + '/' + pid);
                else if (error.status === 409)
                    identityConflict = true;
                else
                    throw error;
                continue;
            }
            const row = await runningInstance_1.RunningInstanceModel.create({
                cron_id: target.cronId,
                pid,
                status: runningInstance_1.InstanceStatus.running,
                started_at: target.started || (0, dayjs_1.default)().unix(),
                log_path: target.log,
            }, { transaction });
            if (target.trigger)
                await (0, executionModels_1.executionModel)(cron_1.CrontabModel.sequelize, 'CronTriggers').update({ instance_id: row.id, process_identity: identity }, {
                    where: { id: target.trigger, state: 'running' },
                    transaction,
                    silent: true,
                    hooks: false,
                    validate: false,
                });
            await history.queueInstanceStop(row.id, target.cronId, pid, transaction, identity);
            instances.push({ id: row.id, cron_id: target.cronId, pid });
        }
        return { missingTargets, identityConflict };
    }
    async resumePendingStops(history, requests, batches = []) {
        for (const row of requests) {
            try {
                const result = await this.host.stopInstance(row.cron_id, row.instance_id);
                if (result.code !== 200)
                    this.logger.warn(result.message);
            }
            catch (error) {
                this.logger.error((0, i18n_1.t)('[panel][停止实例失败] 实例ID: %s, PID: %s, 错误: %s'), row.instance_id, row.pid, (0, childProcess_1.asError)(error).message);
            }
        }
        for (const batch of batches) {
            try {
                await this.host.stop(JSON.parse(batch.cron_ids), batch.request_id);
            }
            catch (error) {
                this.logger.error((0, childProcess_1.asError)(error).message);
            }
        }
        await history.recoverSystemOwners();
    }
    stopInstance(cronId, instanceId) {
        const key = `${cronId}/${instanceId}`;
        const pending = this.stoppingInstances.get(key);
        if (pending)
            return pending;
        const stop = this.stopOneInstance(cronId, instanceId).finally(() => this.stoppingInstances.delete(key));
        this.stoppingInstances.set(key, stop);
        return stop;
    }
    async stopOneInstance(cronId, instanceId) {
        var _a, _b;
        const ended = {
            code: 200,
            data: { outcome: 'ended' },
            message: (0, i18n_1.t)('实例已结束'),
        };
        const stopped = {
            code: 200,
            data: { outcome: 'stopped' },
            message: (0, i18n_1.t)('实例已停止'),
        };
        const history = new history_1.TriggerHistory(cron_1.CrontabModel.sequelize);
        const instance = await runningInstance_1.RunningInstanceModel.findOne({
            where: { id: instanceId, cron_id: cronId },
        });
        if (!instance) {
            await (0, executionModels_1.executionModel)(cron_1.CrontabModel.sequelize, 'CronStopRequests').destroy({ where: { instance_id: instanceId, cron_id: cronId }, hooks: false });
            return { code: 404, message: (0, i18n_1.t)('实例不存在或已停止') };
        }
        const pending = await history.pendingStop(instanceId);
        const savedTargets = (pending === null || pending === void 0 ? void 0 : pending.targets)
            ? JSON.parse(pending.targets)
            : [];
        const settle = () => history.stopVerifiedInstance(instanceId, (transaction) => this.settleLegacyStop(instanceId, cronId, instance.pid, transaction));
        const finishClaim = async (claim) => {
            await (0, cronProcess_1.finishStoppedTree)(claim.targets ? JSON.parse(claim.targets) : [], claim.signalled_at);
            return (await settle()) ? stopped : ended;
        };
        const releaseUnsignalled = async (recoverEnded = false) => {
            const claimed = await history.forgetStop(instanceId, recoverEnded
                ? async (tx) => {
                    await history.recoverSystemOwners(cronId, tx, instanceId);
                    if ((await history.instanceStopRequested(instanceId, tx)) ===
                        undefined)
                        await this.settleLegacyStop(instanceId, cronId, instance.pid, tx, runningInstance_1.InstanceStatus.unknown);
                }
                : undefined);
            if (claimed)
                return finishClaim(claimed);
        };
        if (pending === null || pending === void 0 ? void 0 : pending.signalled)
            return finishClaim(pending);
        if (instance.status !== runningInstance_1.InstanceStatus.running) {
            if (savedTargets.length)
                await (0, cronProcess_1.finishStoppedTree)(savedTargets);
            const claimed = pending && (await releaseUnsignalled());
            return (claimed !== null && claimed !== void 0 ? claimed : (instance.status === runningInstance_1.InstanceStatus.stopped ? stopped : ended));
        }
        // A cold restart destroys the old process tree. The same numeric PIDs
        // may already belong to another execution, even when script and log match.
        if ((pending === null || pending === void 0 ? void 0 : pending.namespace_owner) &&
            pending.namespace_owner !== (0, cronProcess_1.pidNamespaceOwner)()) {
            return (_a = (await releaseUnsignalled(true))) !== null && _a !== void 0 ? _a : ended;
        }
        if (!instance.pid || instance.pid < 1) {
            return { code: 409, message: (0, i18n_1.t)('实例不存在或已停止') };
        }
        let identity = (pending === null || pending === void 0 ? void 0 : pending.root_identity) ||
            (await history.instanceIdentity(instanceId)) ||
            savedTargets.find((birth) => birth.startsWith(`crond:${instance.pid}:`));
        const verify = () => (0, cronProcess_1.verifyCronProcess)(instance.pid, cronId, identity, instance.started_at, {
            logPath: instance.log_path,
        });
        if (!identity &&
            (await runningInstance_1.RunningInstanceModel.count({
                where: {
                    id: { [sequelize_1.Op.ne]: instanceId },
                    status: runningInstance_1.InstanceStatus.running,
                    pid: instance.pid,
                },
            }))) {
            const claimed = await releaseUnsignalled();
            return claimed !== null && claimed !== void 0 ? claimed : { code: 409, message: (0, i18n_1.t)('实例不存在或已停止') };
        }
        try {
            identity = (_b = verify()) !== null && _b !== void 0 ? _b : identity;
            // Traversing the process tree is asynchronous. Persist the individual
            // request before traversal so a restart here also resumes this stop.
            if (!pending || (!pending.root_identity && identity))
                await history.queueInstanceStop(instanceId, cronId, instance.pid, undefined, identity !== null && identity !== void 0 ? identity : undefined);
            await (0, util_1.killTask)(instance.pid, true, verify, (signal, targets) => history.requestInstanceStop(instanceId, instance.pid, signal, targets));
            return (await settle()) ? stopped : ended;
        }
        catch (error) {
            const cause = error.code;
            if (cause === 'ESRCH' || cause === 'PID_REUSED') {
                if (savedTargets.length)
                    await (0, cronProcess_1.finishStoppedTree)(savedTargets);
                const claimed = await releaseUnsignalled(true);
                if (claimed)
                    return claimed;
                const latest = await runningInstance_1.RunningInstanceModel.findOne({
                    where: { id: instanceId, cron_id: cronId },
                });
                if ((latest === null || latest === void 0 ? void 0 : latest.status) === runningInstance_1.InstanceStatus.stopped)
                    return stopped;
                if ((latest === null || latest === void 0 ? void 0 : latest.status) === runningInstance_1.InstanceStatus.running) {
                    const requested = await history.instanceStopRequested(instanceId);
                    if (requested)
                        return stopped;
                    if (cause === 'PID_REUSED' || requested === undefined)
                        return { code: 409, message: (0, i18n_1.t)('实例不存在或已停止') };
                }
                return ended;
            }
            if (error.status === 409) {
                if (savedTargets.length)
                    await (0, cronProcess_1.finishStoppedTree)(savedTargets);
                const claimed = await releaseUnsignalled();
                return claimed !== null && claimed !== void 0 ? claimed : { code: 409, message: (0, i18n_1.t)('实例不存在或已停止') };
            }
            this.logger.error((0, i18n_1.t)('[panel][停止实例失败] 实例ID: %s, PID: %s, 错误: %s'), instanceId, instance.pid, error);
            throw error;
        }
    }
    async settleLegacyStop(instanceId, cronId, pid, transaction, status = runningInstance_1.InstanceStatus.stopped) {
        const [updated] = await runningInstance_1.RunningInstanceModel.update({ status, finished_at: (0, dayjs_1.default)().unix() }, {
            where: {
                id: instanceId,
                cron_id: cronId,
                status: runningInstance_1.InstanceStatus.running,
            },
            transaction,
        });
        if (!updated) {
            const latest = await runningInstance_1.RunningInstanceModel.findOne({
                where: { id: instanceId, cron_id: cronId },
                transaction,
            });
            return (latest === null || latest === void 0 ? void 0 : latest.status) === runningInstance_1.InstanceStatus.stopped;
        }
        // Check if there are still other running instances for this cron
        const otherRunning = await runningInstance_1.RunningInstanceModel.count({
            where: { cron_id: cronId, status: runningInstance_1.InstanceStatus.running },
            transaction,
        });
        if (otherRunning === 0) {
            await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle, pid: null }, {
                where: { id: cronId, status: cron_1.CrontabStatus.running, pid },
                transaction,
            });
        }
        return status === runningInstance_1.InstanceStatus.stopped;
    }
    async runSingle(cronId, expectedToken, triggerId, submitted) {
        return cronLimit_1.default.manualRunWithCronLimit(async () => {
            var _a, _b;
            let absolutePath;
            let logPath;
            let queuedLogPath;
            let queuedToken = null;
            let claimed = false;
            const history = new history_1.TriggerHistory(cron_1.CrontabModel.sequelize);
            let state = 'skipped';
            let reason = 'changed';
            let exitCode = null;
            try {
                const cron = await this.host.getDb({ id: cronId });
                const independent = Boolean(triggerId &&
                    (submitted === null || submitted === void 0 ? void 0 : submitted.allow_multiple_instances) &&
                    cron.allow_multiple_instances);
                if (!independent &&
                    (cron.status !== cron_1.CrontabStatus.queued ||
                        (expectedToken !== undefined &&
                            cron.queued_token !== expectedToken)))
                    return;
                queuedLogPath = (_a = cron.log_path) !== null && _a !== void 0 ? _a : null;
                if (submitted &&
                    (submitted.recovery_from !== cron.recovery_from ||
                        submitted.isDisabled !== cron.isDisabled ||
                        submitted.command !== cron.command)) {
                    queuedToken = expectedToken !== null && expectedToken !== void 0 ? expectedToken : null;
                    return;
                }
                queuedToken = (_b = cron.queued_token) !== null && _b !== void 0 ? _b : null;
                const { id, command, log_name } = cron;
                if (log_name === '/dev/null') {
                    logPath = '/dev/null';
                }
                else {
                    const uniqPath = log_name
                        ? path_1.default.relative(index_1.default.logPath, (0, logPath_1.resolveLogPath)(index_1.default.logPath, log_name))
                        : await (0, util_1.getUniqPath)(command, `${id}`);
                    const logTime = (0, dayjs_1.default)().format('YYYY-MM-DD-HH-mm-ss-SSS');
                    // Different tasks can share a script/log directory and start in
                    // the same millisecond. Every launch needs its own log identity.
                    // The submission token can also be shared by different tasks.
                    logPath = `${uniqPath}/${logTime}-${(0, crypto_1.randomUUID)()}.log`;
                    absolutePath = (0, fileAccess_1.resolveFileAccess)(index_1.default.logPath, [logPath]);
                    if (!absolutePath)
                        throw new Error('Log path is outside the log directory');
                    await promises_1.default.mkdir(path_1.default.dirname(absolutePath), { recursive: true });
                }
                const outputPath = absolutePath;
                if (triggerId && submitted) {
                    const claim = await history.claimManual(triggerId, submitted, expectedToken, independent);
                    if (claim !== 'started') {
                        reason = claim;
                        queuedToken = expectedToken;
                        return;
                    }
                }
                const launchCommand = `real_log_path=${(0, cronScheduling_1.shellValue)(logPath)} no_delay=true ${this.host.makeCommand(cron, true)}`;
                // Let the independent supervisor own the log, while the command keeps
                // writing to a drained pipe even if the worker dies or the log fills up.
                const supervisedLog = Boolean(triggerId && outputPath);
                const cp = (0, cronCommandProcess_1.spawnCronCommand)(launchCommand, triggerId, undefined, outputPath);
                // Install observers before the first await: very short children may already exit.
                const { completed } = (0, childProcess_1.observeChildProcess)(cp, {
                    onStart: async () => {
                        try {
                            if (triggerId &&
                                !(await history.bindCommand(triggerId, cp.pid, logPath)))
                                throw new Error('Task was cancelled before startup');
                            const [count] = await cron_1.CrontabModel.update(Object.assign({ status: cron_1.CrontabStatus.running, pid: cp.pid, log_path: logPath }, (!triggerId && {
                                last_execution_time: (0, dayjs_1.default)().unix(),
                                last_running_time: null,
                            })), {
                                where: Object.assign({ id }, (independent
                                    ? {}
                                    : {
                                        status: cron_1.CrontabStatus.queued,
                                        [sequelize_1.Op.and]: [
                                            (0, sequelize_1.where)((0, sequelize_1.col)('queued_token'), {
                                                [sequelize_1.Op.eq]: queuedToken,
                                            }),
                                            (0, sequelize_1.where)((0, sequelize_1.col)('log_path'), {
                                                [sequelize_1.Op.eq]: queuedLogPath,
                                            }),
                                        ],
                                    })),
                            });
                            if (count !== 1)
                                throw new Error('Task was stopped or superseded before startup');
                            claimed = true;
                            if (triggerId) {
                                if (await history.shouldStop(triggerId))
                                    cp.stdin.end();
                                else
                                    await (0, cronCommandProcess_1.releaseCronCommand)(cp);
                            }
                        }
                        catch (error) {
                            if (triggerId)
                                cp.stdin.destroy();
                            else if (cp.pid)
                                await (0, util_1.killTask)(cp.pid, true);
                            throw error;
                        }
                    },
                    onStdout: outputPath && !supervisedLog
                        ? (message) => logStreamManager_1.logStreamManager.write(outputPath, message)
                        : undefined,
                    onStderr: supervisedLog
                        ? async (message) => {
                            this.logger.error('[panel][Command supervisor] Task ID: %s, %s', id, message.trim());
                        }
                        : outputPath
                            ? (message) => logStreamManager_1.logStreamManager.write(outputPath, message)
                            : undefined,
                });
                const result = await completed;
                state = result.signal
                    ? 'stopped'
                    : result.error || result.code !== 0
                        ? 'failed'
                        : 'finished';
                reason = result.error ? 'spawn' : result.signal || null;
                exitCode = result.code;
                if (result.error) {
                    this.logger.error((0, i18n_1.t)('[panel][执行任务失败] 任务ID: %s, 错误: %s'), id, result.error.message);
                }
                this.logger.info((0, i18n_1.t)('[panel][执行任务结束] 任务ID: %s, 退出码: %j'), id, result.code);
                return Object.assign(Object.assign(Object.assign({}, cron), { pid: cp.pid }), result);
            }
            catch (error) {
                state = 'failed';
                reason = 'spawn';
                this.logger.error((0, i18n_1.t)('[panel][创建任务失败] 任务ID: %s, 错误: %s'), cronId, (0, childProcess_1.asError)(error).message);
            }
            finally {
                try {
                    if (absolutePath)
                        await logStreamManager_1.logStreamManager.closeStream(absolutePath);
                }
                catch (error) {
                    this.logger.error((0, i18n_1.t)('[panel][关闭任务日志失败] %s'), (0, childProcess_1.asError)(error).message);
                }
                try {
                    // Do not overwrite a newer run's state or its script-reported exit code.
                    await cron_1.CrontabModel.update({
                        status: cron_1.CrontabStatus.idle,
                        pid: null,
                        queued_token: null,
                    }, {
                        where: {
                            id: cronId,
                            [sequelize_1.Op.and]: (0, sequelize_1.where)((0, sequelize_1.col)('queued_token'), {
                                [sequelize_1.Op.eq]: queuedToken,
                            }),
                            [sequelize_1.Op.or]: [
                                ...(queuedLogPath !== undefined && !claimed
                                    ? [
                                        {
                                            status: cron_1.CrontabStatus.queued,
                                            [sequelize_1.Op.and]: (0, sequelize_1.where)((0, sequelize_1.col)('log_path'), {
                                                [sequelize_1.Op.eq]: queuedLogPath,
                                            }),
                                        },
                                    ]
                                    : []),
                                ...(claimed && logPath
                                    ? [{ log_path: logPath, status: cron_1.CrontabStatus.running }]
                                    : []),
                            ],
                        },
                    });
                }
                catch (error) {
                    this.logger.error((0, i18n_1.t)('[panel][清理任务状态失败] %s'), (0, childProcess_1.asError)(error).message);
                }
                if (triggerId)
                    await history.complete(triggerId, state, reason, exitCode);
            }
        }, undefined, {
            id: triggerId,
            name: (submitted === null || submitted === void 0 ? void 0 : submitted.name) || (submitted === null || submitted === void 0 ? void 0 : submitted.command) || String(cronId),
        }, cron_1.CrontabModel.sequelize);
    }
}
exports.CronExecution = CronExecution;
//# sourceMappingURL=cronExecution.js.map