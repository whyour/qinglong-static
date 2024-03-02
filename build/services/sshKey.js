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
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const subscription_1 = require("../config/subscription");
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
let SshKeyService = class SshKeyService {
    constructor(logger) {
        this.logger = logger;
        this.homedir = os_1.default.homedir();
        this.sshPath = config_1.default.sshdPath;
        this.sshConfigFilePath = path_1.default.resolve(this.homedir, '.ssh', 'config');
        this.sshConfigHeader = `Include ${path_1.default.join(this.sshPath, '*.config')}`;
        this.initSshConfigFile();
    }
    async initSshConfigFile() {
        let config = '';
        const _exist = await (0, util_1.fileExist)(this.sshConfigFilePath);
        if (_exist) {
            config = await promises_1.default.readFile(this.sshConfigFilePath, { encoding: 'utf-8' });
        }
        else {
            await promises_1.default.writeFile(this.sshConfigFilePath, '');
        }
        if (!config.includes(this.sshConfigHeader)) {
            await promises_1.default.writeFile(this.sshConfigFilePath, `${this.sshConfigHeader}\n\n${config}`, { encoding: 'utf-8' });
        }
    }
    async generatePrivateKeyFile(alias, key) {
        try {
            await promises_1.default.writeFile(path_1.default.join(this.sshPath, alias), `${key}${os_1.default.EOL}`, {
                encoding: 'utf8',
                mode: '400',
            });
        }
        catch (error) {
            this.logger.error('生成私钥文件失败', error);
        }
    }
    async removePrivateKeyFile(alias) {
        try {
            const filePath = path_1.default.join(this.sshPath, alias);
            await (0, util_1.rmPath)(filePath);
        }
        catch (error) {
            this.logger.error('删除私钥文件失败', error);
        }
    }
    async generateSingleSshConfig(alias, host, proxy) {
        if (host === 'github.com') {
            host = `ssh.github.com\n    Port 443\n    HostkeyAlgorithms +ssh-rsa`;
        }
        const proxyStr = proxy
            ? `    ProxyCommand nc -v -x ${proxy} %h %p 2>/dev/null\n`
            : '';
        const config = `Host ${alias}\n    Hostname ${host}\n    IdentityFile ${path_1.default.join(this.sshPath, alias)}\n    StrictHostKeyChecking no\n${proxyStr}`;
        await promises_1.default.writeFile(`${path_1.default.join(this.sshPath, `${alias}.config`)}`, config, {
            encoding: 'utf8',
        });
    }
    async removeSshConfig(alias) {
        try {
            const filePath = path_1.default.join(this.sshPath, `${alias}.config`);
            await (0, util_1.rmPath)(filePath);
        }
        catch (error) {
            this.logger.error(`删除ssh配置文件${alias}失败`, error);
        }
    }
    async addSSHKey(key, alias, host, proxy) {
        await this.generatePrivateKeyFile(alias, key);
        await this.generateSingleSshConfig(alias, host, proxy);
    }
    async removeSSHKey(alias, host, proxy) {
        await this.removePrivateKeyFile(alias);
        await this.removeSshConfig(alias);
    }
    async setSshConfig(docs) {
        for (const doc of docs) {
            if (doc.type === 'private-repo' && doc.pull_type === 'ssh-key') {
                const { alias, proxy } = doc;
                const { host } = (0, subscription_1.formatUrl)(doc);
                await this.removePrivateKeyFile(alias);
                await this.removeSshConfig(alias);
                await this.generatePrivateKeyFile(alias, doc.pull_option.private_key);
                await this.generateSingleSshConfig(alias, host, proxy);
            }
        }
    }
};
SshKeyService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], SshKeyService);
exports.default = SshKeyService;
//# sourceMappingURL=sshKey.js.map