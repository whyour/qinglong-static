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
const path_1 = __importDefault(require("path"));
const sock_1 = __importDefault(require("./sock"));
const cron_1 = __importDefault(require("./cron"));
const schedule_1 = __importDefault(require("./schedule"));
const config_1 = __importDefault(require("../config"));
const const_1 = require("../config/const");
const util_1 = require("../config/util");
const pLimit_1 = __importDefault(require("../shared/pLimit"));
let ScriptService = class ScriptService {
    constructor(logger, sockService, cronService, scheduleService) {
        this.logger = logger;
        this.sockService = sockService;
        this.cronService = cronService;
        this.scheduleService = scheduleService;
    }
    taskCallbacks(filePath) {
        return {
            onEnd: async (cp, endTime, diff) => {
                await (0, util_1.rmPath)(filePath);
            },
            onError: async (message) => {
                this.sockService.sendMessage({
                    type: 'manuallyRunScript',
                    message,
                });
            },
            onLog: async (message) => {
                this.sockService.sendMessage({
                    type: 'manuallyRunScript',
                    message,
                });
            },
        };
    }
    async runScript(filePath) {
        const relativePath = path_1.default.relative(config_1.default.scriptPath, filePath);
        const command = `${const_1.TASK_COMMAND} ${relativePath} now`;
        const pid = await this.scheduleService.runTask(`real_time=true ${command}`, this.taskCallbacks(filePath), { command, id: relativePath.replace(/ /g, '-'), runOrigin: 'script' }, 'start');
        return { code: 200, data: pid };
    }
    async stopScript(filePath, pid) {
        if (!pid) {
            const relativePath = path_1.default.relative(config_1.default.scriptPath, filePath);
            pLimit_1.default.removeQueuedCron(relativePath.replace(/ /g, '-'));
            pid = (await (0, util_1.getPid)(`${const_1.TASK_COMMAND} ${relativePath} now`));
        }
        try {
            await (0, util_1.killTask)(pid);
        }
        catch (error) { }
        return { code: 200 };
    }
    checkFilePath(filePath, fileName) {
        const finalPath = path_1.default.resolve(config_1.default.scriptPath, filePath, fileName);
        return finalPath.startsWith(config_1.default.scriptPath) ? finalPath : '';
    }
    async getFile(filePath, fileName) {
        const finalPath = this.checkFilePath(filePath, fileName);
        if (!finalPath) {
            return '';
        }
        const content = await (0, util_1.getFileContentByName)(finalPath);
        return content;
    }
};
ScriptService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger, sock_1.default,
        cron_1.default,
        schedule_1.default])
], ScriptService);
exports.default = ScriptService;
//# sourceMappingURL=script.js.map