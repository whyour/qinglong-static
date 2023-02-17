"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const fs_1 = __importStar(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const subscription_1 = require("../config/subscription");
let SshKeyService = class SshKeyService {
    constructor(logger) {
        this.logger = logger;
        this.homedir = os_1.default.homedir();
        this.sshPath = path_1.default.resolve(this.homedir, '.ssh');
        this.sshConfigFilePath = path_1.default.resolve(this.sshPath, 'config');
    }
    generatePrivateKeyFile(alias, key) {
        try {
            fs_1.default.writeFileSync(`${this.sshPath}/${alias}`, `${key}${os_1.default.EOL}`, {
                encoding: 'utf8',
                mode: '400',
            });
        }
        catch (error) {
            this.logger.error('生成私钥文件失败', error);
        }
    }
    getConfigRegx(alias) {
        return new RegExp(`Host ${alias}\n.*[^StrictHostKeyChecking]*.*[\n]*.*StrictHostKeyChecking no`, 'g');
    }
    removePrivateKeyFile(alias) {
        try {
            const filePath = path_1.default.join(this.sshPath, alias);
            if ((0, fs_1.existsSync)(filePath)) {
                fs_1.default.unlinkSync(`${this.sshPath}/${alias}`);
            }
        }
        catch (error) {
            this.logger.error('删除私钥文件失败', error);
        }
    }
    generateSingleSshConfig(alias, host, proxy) {
        if (host === 'github.com') {
            host = `ssh.github.com\n    Port 443\n    HostkeyAlgorithms +ssh-rsa\n    PubkeyAcceptedAlgorithms +ssh-rsa`;
        }
        const proxyStr = proxy ? `    ProxyCommand nc -v -x ${proxy} %h %p\n` : '';
        return `Host ${alias}\n    Hostname ${host}\n    IdentityFile ${this.sshPath}/${alias}\n    StrictHostKeyChecking no\n${proxyStr}`;
    }
    generateSshConfig(configs) {
        try {
            fs_1.default.writeFileSync(this.sshConfigFilePath, configs.join('\n'), {
                encoding: 'utf8',
            });
        }
        catch (error) {
            this.logger.error('写入ssh配置文件失败', error);
        }
    }
    removeSshConfig(alias) {
        try {
            const configRegx = this.getConfigRegx(alias);
            const data = fs_1.default
                .readFileSync(this.sshConfigFilePath, { encoding: 'utf8' })
                .replace(configRegx, '')
                .replace(/\n[\n]+/g, '\n');
            fs_1.default.writeFileSync(this.sshConfigFilePath, data, {
                encoding: 'utf8',
            });
        }
        catch (error) {
            this.logger.error(`删除ssh配置文件${alias}失败`, error);
        }
    }
    addSSHKey(key, alias, host, proxy) {
        this.generatePrivateKeyFile(alias, key);
        const config = this.generateSingleSshConfig(alias, host, proxy);
        this.removeSshConfig(alias);
        this.generateSshConfig([config]);
    }
    removeSSHKey(alias, host, proxy) {
        this.removePrivateKeyFile(alias);
        const config = this.generateSingleSshConfig(alias, host, proxy);
        this.removeSshConfig(config);
    }
    setSshConfig(docs) {
        let result = [];
        for (const doc of docs) {
            if (doc.type === 'private-repo' && doc.pull_type === 'ssh-key') {
                const { alias, proxy } = doc;
                const { host } = (0, subscription_1.formatUrl)(doc);
                this.removePrivateKeyFile(alias);
                this.generatePrivateKeyFile(alias, doc.pull_option.private_key);
                const config = this.generateSingleSshConfig(alias, host, proxy);
                result.push(config);
            }
        }
        this.generateSshConfig(result);
    }
};
SshKeyService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], SshKeyService);
exports.default = SshKeyService;
//# sourceMappingURL=sshKey.js.map