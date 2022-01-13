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
const child_process_1 = require("child_process");
const sock_1 = __importDefault(require("./sock"));
const cron_1 = __importDefault(require("./cron"));
let ScriptService = class ScriptService {
    constructor(logger, sockService, cronService) {
        this.logger = logger;
        this.sockService = sockService;
        this.cronService = cronService;
    }
    async runScript(path) {
        const cp = child_process_1.spawn(`task -l ${path} now`, { shell: '/bin/bash' });
        cp.stdout.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'manuallyRunScript',
                message: data.toString(),
            });
        });
        cp.stderr.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'manuallyRunScript',
                message: data.toString(),
            });
        });
        cp.on('error', (err) => {
            this.sockService.sendMessage({
                type: 'manuallyRunScript',
                message: JSON.stringify(err),
            });
        });
        cp.on('close', (err) => {
            this.sockService.sendMessage({
                type: 'manuallyRunScript',
                message: `执行结束`,
            });
        });
        return { code: 200 };
    }
    async stopScript(path) {
        const err = await this.cronService.killTask(`task -l ${path} now`);
        const str = err ? `\n${err}` : '';
        this.sockService.sendMessage({
            type: 'manuallyRunScript',
            message: `${str}\n## 执行结束...  ${new Date()
                .toLocaleString('zh', { hour12: false })
                .replace(' 24:', ' 00:')} `,
        });
        return { code: 200 };
    }
};
ScriptService = __decorate([
    typedi_1.Service(),
    __param(0, typedi_1.Inject('logger')),
    __metadata("design:paramtypes", [Object, sock_1.default,
        cron_1.default])
], ScriptService);
exports.default = ScriptService;
//# sourceMappingURL=script.js.map