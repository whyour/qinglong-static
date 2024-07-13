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
const node_schedule_1 = __importDefault(require("node-schedule"));
const toad_scheduler_1 = require("toad-scheduler");
const dayjs_1 = __importDefault(require("dayjs"));
const pLimit_1 = __importDefault(require("../shared/pLimit"));
const cross_spawn_1 = require("cross-spawn");
let ScheduleService = class ScheduleService {
    constructor(logger) {
        this.logger = logger;
        this.scheduleStacks = new Map();
        this.intervalSchedule = new toad_scheduler_1.ToadScheduler();
        this.maxBuffer = 200 * 1024 * 1024;
    }
    async runTask(command, callbacks = {}, params, completionTime = 'end') {
        return pLimit_1.default.runWithCronLimit(() => {
            return new Promise(async (resolve, reject) => {
                var _a, _b, _c;
                this.logger.info(`[panel][开始执行任务] 参数 ${JSON.stringify(Object.assign(Object.assign({}, params), { command }))}`);
                try {
                    const startTime = (0, dayjs_1.default)();
                    await ((_a = callbacks.onBefore) === null || _a === void 0 ? void 0 : _a.call(callbacks, startTime));
                    const cp = (0, cross_spawn_1.spawn)(command, { shell: '/bin/bash' });
                    (_b = callbacks.onStart) === null || _b === void 0 ? void 0 : _b.call(callbacks, cp, startTime);
                    completionTime === 'start' && resolve(cp.pid);
                    cp.stdout.on('data', async (data) => {
                        var _a;
                        await ((_a = callbacks.onLog) === null || _a === void 0 ? void 0 : _a.call(callbacks, data.toString()));
                    });
                    cp.stderr.on('data', async (data) => {
                        var _a;
                        this.logger.info('[panel][执行任务失败] 命令: %s, 错误信息: %j', command, data.toString());
                        await ((_a = callbacks.onError) === null || _a === void 0 ? void 0 : _a.call(callbacks, data.toString()));
                    });
                    cp.on('error', async (err) => {
                        var _a;
                        this.logger.error('[panel][创建任务失败] 命令: %s, 错误信息: %j', command, err);
                        await ((_a = callbacks.onError) === null || _a === void 0 ? void 0 : _a.call(callbacks, JSON.stringify(err)));
                    });
                    cp.on('exit', async (code) => {
                        var _a;
                        const endTime = (0, dayjs_1.default)();
                        await ((_a = callbacks.onEnd) === null || _a === void 0 ? void 0 : _a.call(callbacks, cp, endTime, endTime.diff(startTime, 'seconds')));
                        resolve(Object.assign(Object.assign({}, params), { pid: cp.pid, code }));
                    });
                }
                catch (error) {
                    this.logger.error('[panel][执行任务失败] 命令: %s, 错误信息: %j', command, error);
                    await ((_c = callbacks.onError) === null || _c === void 0 ? void 0 : _c.call(callbacks, JSON.stringify(error)));
                }
            });
        });
    }
    async createCronTask({ id = 0, command, name, schedule = '' }, callbacks, runImmediately = false) {
        const _id = this.formatId(id);
        this.logger.info('[panel][创建cron任务], 任务ID: %s, cron: %s, 任务名: %s, 执行命令: %s', _id, schedule, name, command);
        this.scheduleStacks.set(_id, node_schedule_1.default.scheduleJob(_id, schedule, async () => {
            this.runTask(command, callbacks, {
                name,
                schedule,
                command,
            });
        }));
        if (runImmediately) {
            this.runTask(command, callbacks, {
                name,
                schedule,
                command,
            });
        }
    }
    async cancelCronTask({ id = 0, name }) {
        var _a;
        const _id = this.formatId(id);
        this.logger.info('[panel][取消定时任务], 任务名: %s', name);
        if (this.scheduleStacks.has(_id)) {
            (_a = this.scheduleStacks.get(_id)) === null || _a === void 0 ? void 0 : _a.cancel();
            this.scheduleStacks.delete(_id);
        }
    }
    async createIntervalTask({ id = 0, command, name = '' }, schedule, runImmediately = true, callbacks) {
        const _id = this.formatId(id);
        this.logger.info('[panel][创建interval任务], 任务ID: %s, 任务名: %s, 执行命令: %s', _id, name, command);
        const task = new toad_scheduler_1.Task(name, () => {
            this.runTask(command, callbacks, {
                name,
                command,
            });
        }, (err) => {
            this.logger.error('[执行任务失败] 命令: %s, 错误信息: %j', command, err);
        });
        const job = new toad_scheduler_1.LongIntervalJob(Object.assign({ runImmediately: false }, schedule), task, _id);
        this.intervalSchedule.addIntervalJob(job);
        if (runImmediately) {
            this.runTask(command, callbacks, {
                name,
                command,
            });
        }
    }
    async cancelIntervalTask({ id = 0, name }) {
        const _id = this.formatId(id);
        this.logger.info('[取消interval任务], 任务ID: %s, 任务名: %s', _id, name);
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