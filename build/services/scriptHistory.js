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
const path_1 = __importDefault(require("path"));
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const scriptHistory_1 = require("../shared/scriptHistory");
/** Panel configuration and lifecycle; the storage core stays independently testable. */
let ScriptHistoryService = class ScriptHistoryService extends scriptHistory_1.ScriptHistory {
    constructor() {
        super(config_1.default.scriptPath, path_1.default.join(config_1.default.dataPath, 'script-history'), config_1.default.blackFileList);
    }
};
ScriptHistoryService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], ScriptHistoryService);
exports.default = ScriptHistoryService;
//# sourceMappingURL=scriptHistory.js.map