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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
const i18n_1 = require("../shared/i18n");
const undici_1 = require("undici");
const fileAccess_1 = require("../shared/fileAccess");
let ConfigService = class ConfigService {
    constructor() { }
    async getFile(filePath, res) {
        let content = '';
        if (!filePath) {
            return res.send({ code: 403, message: (0, i18n_1.t)('文件无法访问') });
        }
        const scriptFile = filePath.startsWith('data/scripts/');
        const resolved = (0, fileAccess_1.resolveFileAccess)(scriptFile ? config_1.default.scriptPath : config_1.default.configPath, [scriptFile ? filePath.slice('data/scripts/'.length) : filePath], config_1.default.blackFileList);
        if (!resolved) {
            return res.send({ code: 403, message: (0, i18n_1.t)('文件无法访问') });
        }
        if (filePath.startsWith('sample/')) {
            const res = await (0, undici_1.request)(`https://gitlab.com/whyour/qinglong/-/raw/master/${filePath}`);
            content = await res.body.text();
        }
        else {
            content = await (0, util_1.getFileContentByName)(resolved);
        }
        res.send({ code: 200, data: content });
    }
};
ConfigService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], ConfigService);
exports.default = ConfigService;
//# sourceMappingURL=config.js.map