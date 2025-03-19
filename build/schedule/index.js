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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_js_1 = require("@grpc/grpc-js");
const cron_1 = require("../protos/cron");
const addCron_1 = require("./addCron");
const delCron_1 = require("./delCron");
const health_1 = require("../protos/health");
const health_2 = require("./health");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../loaders/logger"));
const api_1 = require("../protos/api");
const Api = __importStar(require("./api"));
const server = new grpc_js_1.Server({ 'grpc.enable_http_proxy': 0 });
server.addService(health_1.HealthService, { check: health_2.check });
server.addService(cron_1.CronService, { addCron: addCron_1.addCron, delCron: delCron_1.delCron });
server.addService(api_1.ApiService, Api);
server.bindAsync(`0.0.0.0:${config_1.default.cronPort}`, grpc_js_1.ServerCredentials.createInsecure(), (err, port) => {
    var _a;
    if (err) {
        throw err;
    }
    logger_1.default.debug(`✌️ 定时服务启动成功！`);
    console.debug(`✌️ 定时服务启动成功！`);
    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
});
//# sourceMappingURL=index.js.map