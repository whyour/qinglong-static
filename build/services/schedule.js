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
const node_schedule_1 = __importDefault(require("node-schedule"));
const toad_scheduler_1 = require("toad-scheduler");
const dayjs_1 = __importDefault(require("dayjs"));
const pLimit_1 = __importDefault(require("../shared/pLimit"));
const cross_spawn_1 = require("cross-spawn");
const childProcess_1 = require("../shared/childProcess");
let ScheduleService = class ScheduleService {
    constructor(logger) {
        this.logger = logger;
        this.scheduleStacks = new Map();
        this.intervalSchedule = new toad_scheduler_1.ToadScheduler();
        this.taskLimitMap = {
            system: 'runWithSystemLimit',
            script: 'runWithScriptLimit',
            subscription: 'runWithSubscriptionLimit',
        };
    }
    async runTask(command, callbacks = {}, params, completionTime = 'end') {
        const { runOrigin } = params, others = __rest(params, ["runOrigin"]);
        let resolveStart;
        let rejectStart;
        const startResult = new Promise((resolve, reject) => {
            resolveStart = resolve;
            rejectStart = reject;
        });
        // Most scheduled callers only observe completion (or intentionally detach).
        void startResult.catch(() => { });
        const completion = pLimit_1.default[this.taskLimitMap[runOrigin]](others, async () => {
            var _a, _b, _c, _d;
            const startTime = (0, dayjs_1.default)();
            let cp;
            let result = { code: null, signal: null };
            try {
                this.logger.info('[panel][开始执行任务] 任务ID: %s', others.id);
                await ((_a = callbacks.onBefore) === null || _a === void 0 ? void 0 : _a.call(callbacks, startTime));
                cp = (0, cross_spawn_1.spawn)(command, { shell: '/bin/bash' });
                const child = cp;
                const observed = (0, childProcess_1.observeChildProcess)(child, {
                    onStart: async () => {
                        var _a;
                        await ((_a = callbacks.onStart) === null || _a === void 0 ? void 0 : _a.call(callbacks, child, startTime));
                    },
                    onStdout: callbacks.onLog,
                    onStderr: callbacks.onError,
                });
                observed.started.then(resolveStart, rejectStart);
                result = await observed.completed;
            }
            catch (error) {
                result.error = (0, childProcess_1.asError)(error);
                rejectStart(result.error);
            }
            if (result.error) {
                this.logger.error('[panel][执行任务失败] 任务ID: %s, 错误: %s', others.id, result.error.message);
                try {
                    await ((_b = callbacks.onError) === null || _b === void 0 ? void 0 : _b.call(callbacks, result.error.message));
                }
                catch (error) {
                    this.logger.error('[panel][任务错误回调失败] %s', (0, childProcess_1.asError)(error).message);
                }
            }
            // Cleanup also runs after setup/spawn failure, and only after both pipes drain.
            const endTime = (0, dayjs_1.default)();
            try {
                await ((_c = callbacks.onEnd) === null || _c === void 0 ? void 0 : _c.call(callbacks, cp, endTime, endTime.diff(startTime, 'seconds')));
            }
            catch (error) {
                (_d = result.error) !== null && _d !== void 0 ? _d : (result.error = (0, childProcess_1.asError)(error));
                this.logger.error('[panel][任务结束回调失败] %s', (0, childProcess_1.asError)(error).message);
            }
            this.logger.info('[panel][执行任务结束] 任务ID: %s, 退出码: %j', others.id, result.code);
            return Object.assign(Object.assign(Object.assign({}, others), { pid: cp === null || cp === void 0 ? void 0 : cp.pid }), result);
        }).catch((error) => {
            // Queue/setup failures must not become unhandled rejections in detached callers.
            rejectStart((0, childProcess_1.asError)(error));
            this.logger.error('[panel][任务队列失败] %s', (0, childProcess_1.asError)(error).message);
            return Object.assign(Object.assign({}, others), { code: null, signal: null, error: (0, childProcess_1.asError)(error) });
        });
        // Returning a PID must not release the execution slot while the process runs.
        return completionTime === 'start' ? startResult : completion;
    }
    async createCronTask({ id = 0, command, name, schedule = '', runOrigin }, callbacks, runImmediately = false) {
        const _id = this.formatId(id);
        this.logger.info('[panel][创建cron任务] 任务ID: %s, cron: %s, 任务名: %s, 执行命令: %s', _id, schedule, name, command);
        this.scheduleStacks.set(_id, node_schedule_1.default.scheduleJob(_id, schedule, async () => {
            this.runTask(command, callbacks, {
                name,
                schedule,
                command,
                id: _id,
                runOrigin,
            });
        }));
        if (runImmediately) {
            this.runTask(command, callbacks, {
                name,
                schedule,
                command,
                id: _id,
                runOrigin,
            });
        }
    }
    async cancelCronTask({ id = 0, name }) {
        var _a;
        const _id = this.formatId(id);
        this.logger.info('[panel][取消定时任务] 任务名: %s', name);
        if (this.scheduleStacks.has(_id)) {
            (_a = this.scheduleStacks.get(_id)) === null || _a === void 0 ? void 0 : _a.cancel();
            this.scheduleStacks.delete(_id);
        }
    }
    async createIntervalTask({ id = 0, command, name = '', runOrigin }, schedule, runImmediately = true, callbacks) {
        const _id = this.formatId(id);
        this.logger.info('[panel][创建interval任务] 任务ID: %s, 任务名: %s, 执行命令: %s', _id, name, command);
        const task = new toad_scheduler_1.Task(name, () => {
            this.runTask(command, callbacks, {
                name,
                command,
                id: _id,
                runOrigin,
            });
        }, (err) => {
            this.logger.error('[panel][执行任务失败] 命令: %s, 错误信息: %j', command, err);
        });
        const job = new toad_scheduler_1.LongIntervalJob(Object.assign({ runImmediately: false }, schedule), task, { id: _id });
        this.intervalSchedule.addIntervalJob(job);
        if (runImmediately) {
            this.runTask(command, callbacks, {
                name,
                command,
                id: _id,
                runOrigin,
            });
        }
    }
    async cancelIntervalTask({ id = 0, name }) {
        const _id = this.formatId(id);
        this.logger.info('[panel][取消interval任务] 任务ID: %s, 任务名: %s', _id, name);
        this.intervalSchedule.removeById(_id);
    }
    formatId(id) {
        return String(id);
    }
};
ScheduleService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], ScheduleService);
exports.default = ScheduleService;
//# sourceMappingURL=schedule.js.map