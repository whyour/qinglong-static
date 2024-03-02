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
const path_1 = require("path");
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
const got_1 = __importDefault(require("got"));
let ConfigService = class ConfigService {
    constructor() { }
    async getFile(filePath, res) {
        let content = '';
        if (config_1.default.blackFileList.includes(filePath) || !filePath) {
            res.send({ code: 403, message: '文件无法访问' });
        }
        if (filePath.startsWith('sample/')) {
            const res = await got_1.default.get(`https://gitlab.com/whyour/qinglong/-/raw/master/${filePath}`);
            content = res.body;
        }
        else if (filePath.startsWith('data/scripts/')) {
            content = await (0, util_1.getFileContentByName)((0, path_1.join)(config_1.default.rootPath, filePath));
        }
        else {
            content = await (0, util_1.getFileContentByName)((0, path_1.join)(config_1.default.configPath, filePath));
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