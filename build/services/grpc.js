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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcServerService = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const cron_1 = require("../protos/cron");
const health_1 = require("../protos/health");
const api_1 = require("../protos/api");
const addCron_1 = require("../schedule/addCron");
const delCron_1 = require("../schedule/delCron");
const health_2 = require("../schedule/health");
const Api = __importStar(require("../schedule/api"));
const logger_1 = __importDefault(require("../loaders/logger"));
const util_1 = require("util");
const config_1 = __importDefault(require("../config"));
const metrics_1 = require("./metrics");
const typedi_1 = require("typedi");
let GrpcServerService = class GrpcServerService {
    constructor() {
        this.server = new grpc_js_1.Server({ 'grpc.enable_http_proxy': 0 });
    }
    async initialize() {
        try {
            this.server.addService(health_1.HealthService, { check: health_2.check });
            this.server.addService(cron_1.CronService, { addCron: addCron_1.addCron, delCron: delCron_1.delCron });
            this.server.addService(api_1.ApiService, Api);
            const grpcPort = config_1.default.grpcPort;
            const bindAsync = (0, util_1.promisify)(this.server.bindAsync).bind(this.server);
            await bindAsync(`0.0.0.0:${grpcPort}`, grpc_js_1.ServerCredentials.createInsecure());
            logger_1.default.debug(`✌️ gRPC service started successfully`);
            metrics_1.metricsService.record('grpc_service_start', 1, {
                port: grpcPort.toString(),
            });
            return grpcPort;
        }
        catch (err) {
            logger_1.default.error('Failed to start gRPC service:', err);
            throw err;
        }
    }
    async shutdown() {
        try {
            if (this.server) {
                await new Promise((resolve) => {
                    this.server.tryShutdown(() => {
                        logger_1.default.debug('gRPC service stopped');
                        metrics_1.metricsService.record('grpc_service_stop', 1);
                        resolve(null);
                    });
                });
            }
        }
        catch (err) {
            logger_1.default.error('Error while shutting down gRPC service:', err);
            throw err;
        }
    }
    getServer() {
        return this.server;
    }
};
exports.GrpcServerService = GrpcServerService;
exports.GrpcServerService = GrpcServerService = __decorate([
    (0, typedi_1.Service)()
], GrpcServerService);
//# sourceMappingURL=grpc.js.map