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
const cross_spawn_1 = require("cross-spawn");
const fs_1 = __importDefault(require("fs"));
const got_1 = __importDefault(require("got"));
const sum_1 = __importDefault(require("lodash/sum"));
const path_1 = __importDefault(require("path"));
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config"));
const const_1 = require("../config/const");
const util_1 = require("../config/util");
const dependence_1 = require("../data/dependence");
const system_1 = require("../data/system");
const pLimit_1 = __importDefault(require("../shared/pLimit"));
const notify_1 = __importDefault(require("./notify"));
const schedule_1 = __importDefault(require("./schedule"));
const sock_1 = __importDefault(require("./sock"));
const os_1 = __importDefault(require("os"));
const dayjs_1 = __importDefault(require("dayjs"));
let SystemService = class SystemService {
    constructor(logger, scheduleService, sockService) {
        this.logger = logger;
        this.scheduleService = scheduleService;
        this.sockService = sockService;
    }
    async getSystemConfig() {
        const doc = await this.getDb({ type: system_1.AuthDataType.systemConfig });
        return doc;
    }
    async updateAuthDb(payload) {
        const { id } = payload, others = __rest(payload, ["id"]);
        await system_1.SystemModel.update(others, { where: { id } });
        const doc = await this.getDb({ id });
        return doc;
    }
    async getDb(query) {
        const doc = await system_1.SystemModel.findOne({ where: query });
        if (!doc) {
            throw new Error(`System ${JSON.stringify(query)} not found`);
        }
        return doc.get({ plain: true });
    }
    async updateNotificationMode(notificationInfo) {
        const code = Math.random().toString().slice(-6);
        const isSuccess = await this.notificationService.testNotify(notificationInfo, '青龙', `【蛟龙】测试通知 https://t.me/jiao_long`);
        if (isSuccess) {
            const result = await this.updateAuthDb({
                type: system_1.AuthDataType.notification,
                info: Object.assign({}, notificationInfo),
            });
            return { code: 200, data: Object.assign(Object.assign({}, result), { code }) };
        }
        else {
            return { code: 400, message: '通知发送失败，请检查参数' };
        }
    }
    async updateLogRemoveFrequency(info) {
        var _a;
        const oDoc = await this.getSystemConfig();
        const result = await this.updateAuthDb(Object.assign(Object.assign({}, oDoc), { info: Object.assign(Object.assign({}, oDoc.info), info) }));
        const cron = {
            id: result.id,
            name: '删除日志',
            command: `ql rmlog ${info.logRemoveFrequency}`,
            runOrigin: 'system',
        };
        if ((_a = oDoc.info) === null || _a === void 0 ? void 0 : _a.logRemoveFrequency) {
            await this.scheduleService.cancelIntervalTask(cron);
        }
        if (info.logRemoveFrequency && info.logRemoveFrequency > 0) {
            this.scheduleService.createIntervalTask(cron, {
                days: info.logRemoveFrequency,
            }, true);
        }
        return { code: 200, data: info };
    }
    async updateCronConcurrency(info) {
        const oDoc = await this.getSystemConfig();
        await this.updateAuthDb(Object.assign(Object.assign({}, oDoc), { info: Object.assign(Object.assign({}, oDoc.info), info) }));
        if (info.cronConcurrency) {
            await pLimit_1.default.setCustomLimit(info.cronConcurrency);
        }
        return { code: 200, data: info };
    }
    async updateDependenceProxy(info) {
        const oDoc = await this.getSystemConfig();
        await this.updateAuthDb(Object.assign(Object.assign({}, oDoc), { info: Object.assign(Object.assign({}, oDoc.info), info) }));
        if (info.dependenceProxy) {
            await fs_1.default.promises.writeFile(config_1.default.dependenceProxyFile, `export http_proxy="${info.dependenceProxy}"\nexport https_proxy="${info.dependenceProxy}"`);
        }
        else {
            await fs_1.default.promises.rm(config_1.default.dependenceProxyFile);
        }
        return { code: 200, data: info };
    }
    async updateNodeMirror(info, res) {
        const oDoc = await this.getSystemConfig();
        await this.updateAuthDb(Object.assign(Object.assign({}, oDoc), { info: Object.assign(Object.assign({}, oDoc.info), info) }));
        let cmd = 'pnpm config delete registry';
        if (info.nodeMirror) {
            cmd = `pnpm config set registry ${info.nodeMirror}`;
        }
        let command = `cd && ${cmd}`;
        const docs = await dependence_1.DependenceModel.findAll({
            where: {
                type: dependence_1.DependenceTypes.nodejs,
                status: dependence_1.DependenceStatus.installed,
            },
        });
        if (docs.length > 0) {
            command += ` && pnpm i -g`;
        }
        this.scheduleService.runTask(command, {
            onStart: async (cp) => {
                res === null || res === void 0 ? void 0 : res.setHeader('QL-Task-Pid', `${cp.pid}`);
                res === null || res === void 0 ? void 0 : res.end();
            },
            onEnd: async () => {
                this.sockService.sendMessage({
                    type: 'updateNodeMirror',
                    message: 'update node mirror end',
                });
            },
            onError: async (message) => {
                this.sockService.sendMessage({ type: 'updateNodeMirror', message });
            },
            onLog: async (message) => {
                this.sockService.sendMessage({ type: 'updateNodeMirror', message });
            },
        }, {
            command,
            id: 'update-node-mirror',
            runOrigin: 'system',
        });
    }
    async updatePythonMirror(info) {
        const oDoc = await this.getSystemConfig();
        await this.updateAuthDb(Object.assign(Object.assign({}, oDoc), { info: Object.assign(Object.assign({}, oDoc.info), info) }));
        let cmd = 'pip config unset global.index-url';
        if (info.pythonMirror) {
            cmd = `pip3 config set global.index-url ${info.pythonMirror}`;
        }
        await (0, util_1.promiseExec)(cmd);
        return { code: 200, data: info };
    }
    async updateLinuxMirror(info, res, onEnd) {
        const oDoc = await this.getSystemConfig();
        await this.updateAuthDb(Object.assign(Object.assign({}, oDoc), { info: Object.assign(Object.assign({}, oDoc.info), info) }));
        let defaultDomain = 'https://dl-cdn.alpinelinux.org';
        let targetDomain = 'https://dl-cdn.alpinelinux.org';
        if (os_1.default.platform() !== 'linux') {
            return;
        }
        const content = await fs_1.default.promises.readFile('/etc/apk/repositories', {
            encoding: 'utf-8',
        });
        const domainMatch = content.match(/(http.*)\/alpine\/.*/);
        if (domainMatch) {
            defaultDomain = domainMatch[1];
        }
        if (info.linuxMirror) {
            targetDomain = info.linuxMirror;
        }
        const command = `sed -i 's/${defaultDomain.replace(/\//g, '\\/')}/${targetDomain.replace(/\//g, '\\/')}/g' /etc/apk/repositories && apk update -f`;
        this.scheduleService.runTask(command, {
            onStart: async (cp) => {
                res === null || res === void 0 ? void 0 : res.setHeader('QL-Task-Pid', `${cp.pid}`);
                res === null || res === void 0 ? void 0 : res.end();
            },
            onEnd: async () => {
                this.sockService.sendMessage({
                    type: 'updateLinuxMirror',
                    message: 'update linux mirror end',
                });
                onEnd === null || onEnd === void 0 ? void 0 : onEnd();
            },
            onError: async (message) => {
                this.sockService.sendMessage({ type: 'updateLinuxMirror', message });
            },
            onLog: async (message) => {
                this.sockService.sendMessage({ type: 'updateLinuxMirror', message });
            },
        }, {
            command,
            id: 'update-linux-mirror',
            runOrigin: 'system',
        });
    }
    async checkUpdate() {
        try {
            const currentVersionContent = await (0, util_1.parseVersion)(config_1.default.versionFile);
            let lastVersionContent;
            try {
                const result = await got_1.default.get(`${config_1.default.lastVersionFile}?t=${Date.now()}`, {
                    timeout: 30000,
                });
                lastVersionContent = (0, util_1.parseContentVersion)(result.body);
            }
            catch (error) { }
            if (!lastVersionContent) {
                lastVersionContent = currentVersionContent;
            }
            return {
                code: 200,
                data: {
                    hasNewVersion: this.checkHasNewVersion(currentVersionContent.version, lastVersionContent.version),
                    lastVersion: lastVersionContent.version,
                    lastLog: lastVersionContent.changeLog,
                    lastLogLink: lastVersionContent.changeLogLink,
                },
            };
        }
        catch (error) {
            return {
                code: 400,
                message: error.message,
            };
        }
    }
    checkHasNewVersion(curVersion, lastVersion) {
        const curArr = curVersion.split('.').map((x) => parseInt(x, 10));
        const lastArr = lastVersion.split('.').map((x) => parseInt(x, 10));
        if (curArr[0] < lastArr[0]) {
            return true;
        }
        if (curArr[0] === lastArr[0] && curArr[1] < lastArr[1]) {
            return true;
        }
        if (curArr[0] === lastArr[0] &&
            curArr[1] === lastArr[1] &&
            curArr[2] < lastArr[2]) {
            return true;
        }
        return false;
    }
    async updateSystem() {
        const cp = (0, cross_spawn_1.spawn)('real_time=true ql update false', { shell: '/bin/bash' });
        cp.stdout.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'updateSystemVersion',
                message: data.toString(),
            });
        });
        cp.stderr.on('data', (data) => {
            this.sockService.sendMessage({
                type: 'updateSystemVersion',
                message: data.toString(),
            });
        });
        cp.on('error', (err) => {
            this.sockService.sendMessage({
                type: 'updateSystemVersion',
                message: JSON.stringify(err),
            });
        });
        return { code: 200 };
    }
    async reloadSystem(target) {
        const cmd = `real_time=true ql reload ${target || ''}`;
        const cp = (0, cross_spawn_1.spawn)(cmd, { shell: '/bin/bash' });
        cp.unref();
        return { code: 200 };
    }
    async notify({ title, content }) {
        const isSuccess = await this.notificationService.notify(title, content);
        if (isSuccess) {
            return { code: 200, message: '通知发送成功' };
        }
        else {
            return { code: 400, message: '通知发送失败，请检查系统设置/通知配置' };
        }
    }
    async run({ command }, callback) {
        if (!command.startsWith(const_1.TASK_COMMAND)) {
            command = `${const_1.TASK_COMMAND} ${command}`;
        }
        this.scheduleService.runTask(`real_time=true ${command}`, callback, {
            command,
            id: command.replace(/ /g, '-'),
            runOrigin: 'system',
        });
    }
    async stop({ command, pid }) {
        if (!pid && !command) {
            return { code: 400, message: '参数错误' };
        }
        if (pid) {
            await (0, util_1.killTask)(pid);
            return { code: 200 };
        }
        if (!command.startsWith(const_1.TASK_COMMAND)) {
            command = `${const_1.TASK_COMMAND} ${command}`;
        }
        const _pid = await (0, util_1.getPid)(command);
        if (_pid) {
            await (0, util_1.killTask)(_pid);
            return { code: 200 };
        }
        else {
            return { code: 400, message: '任务未找到' };
        }
    }
    async exportData(res) {
        try {
            await (0, util_1.promiseExec)(`cd ${config_1.default.dataPath} && cd ../ && tar -zcvf ${config_1.default.dataTgzFile} data/`);
            res.download(config_1.default.dataTgzFile);
        }
        catch (error) {
            return res.send({ code: 400, message: error.message });
        }
    }
    async importData() {
        try {
            await (0, util_1.promiseExec)(`rm -rf ${path_1.default.join(config_1.default.tmpPath, 'data')}`);
            const res = await (0, util_1.promiseExec)(`cd ${config_1.default.tmpPath} && tar -zxvf ${config_1.default.dataTgzFile}`);
            return { code: 200, data: res };
        }
        catch (error) {
            return { code: 400, message: error.message };
        }
    }
    async getSystemLog(res, query) {
        const startTime = (0, dayjs_1.default)(query.startTime || undefined)
            .startOf('d')
            .valueOf();
        const endTime = (0, dayjs_1.default)(query.endTime || undefined)
            .endOf('d')
            .valueOf();
        const result = await (0, util_1.readDirs)(config_1.default.systemLogPath, config_1.default.systemLogPath);
        const logs = result
            .reverse()
            .filter((x) => x.title.endsWith('.log'))
            .filter((x) => x.createTime >= startTime && x.createTime <= endTime);
        res.set({
            'Content-Length': (0, sum_1.default)(logs.map((x) => x.size)),
        });
        (function sendFiles(res, fileNames) {
            if (fileNames.length === 0) {
                res.end();
                return;
            }
            const currentLog = fileNames.shift();
            if (currentLog) {
                const currentFileStream = fs_1.default.createReadStream(path_1.default.join(config_1.default.systemLogPath, currentLog.title));
                currentFileStream.on('end', () => {
                    sendFiles(res, fileNames);
                });
                currentFileStream.pipe(res, { end: false });
            }
        })(res, logs);
    }
    async deleteSystemLog() {
        const result = await (0, util_1.readDirs)(config_1.default.systemLogPath, config_1.default.systemLogPath);
        const logs = result.reverse().filter((x) => x.title.endsWith('.log'));
        for (const log of logs) {
            await (0, util_1.rmPath)(path_1.default.join(config_1.default.systemLogPath, log.title));
        }
    }
};
__decorate([
    (0, typedi_1.Inject)((type) => notify_1.default),
    __metadata("design:type", notify_1.default)
], SystemService.prototype, "notificationService", void 0);
SystemService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger, schedule_1.default,
        sock_1.default])
], SystemService);
exports.default = SystemService;
//# sourceMappingURL=system.js.map