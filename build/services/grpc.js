"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const registeredPlans_1 = require("../schedule/registeredPlans");
const setConcurrency_1 = require("../schedule/setConcurrency");
const health_2 = require("../schedule/health");
const lazyApiHandlers_1 = require("../schedule/lazyApiHandlers");
const logger_1 = __importDefault(require("../loaders/logger"));
const util_1 = require("util");
const config_1 = __importDefault(require("../config"));
const metrics_1 = require("./metrics");
const typedi_1 = require("typedi");
const grpcCerts_1 = require("../config/grpcCerts");
let GrpcServerService = class GrpcServerService {
    constructor() {
        this.server = new grpc_js_1.Server({ 'grpc.enable_http_proxy': 0 });
    }
    formatGrpcAddress(host, port) {
        if (host === '::') {
            return `[::]:${port}`;
        }
        return `${host}:${port}`;
    }
    async initialize() {
        try {
            this.server.addService(health_1.HealthService, { check: health_2.check });
            this.server.addService(cron_1.CronService, {
                addCron: registeredPlans_1.registeredAdd,
                delCron: registeredPlans_1.registeredDelete,
                setConcurrency: setConcurrency_1.setConcurrency,
            });
            this.server.addService(api_1.ApiService, (0, lazyApiHandlers_1.lazyApiHandlers)());
            const tlsConfig = await (0, grpcCerts_1.initGrpcCerts)();
            const credentials = grpc_js_1.ServerCredentials.createSsl(Buffer.from(tlsConfig.caCert), [
                {
                    cert_chain: Buffer.from(tlsConfig.serverCert),
                    private_key: Buffer.from(tlsConfig.serverKey),
                },
            ], true);
            const grpcPort = config_1.default.grpcPort;
            const hostsToTry = [
                config_1.default.bindHostGrpc,
                ...(config_1.default.bindHostGrpc === '::' ? ['0.0.0.0'] : []),
            ];
            const bindAsync = (0, util_1.promisify)(this.server.bindAsync).bind(this.server);
            let lastError = null;
            for (const host of hostsToTry) {
                try {
                    const address = this.formatGrpcAddress(host, grpcPort);
                    const boundPort = await bindAsync(address, credentials);
                    logger_1.default.debug(`[boot] gRPC service started successfully on ${address}`);
                    metrics_1.metricsService.record('grpc_service_start', 1, {
                        port: grpcPort.toString(),
                        host,
                    });
                    return boundPort;
                }
                catch (err) {
                    lastError = err;
                    logger_1.default.warn(`Failed to bind gRPC on ${host}:${grpcPort}, trying next...`, err);
                }
            }
            logger_1.default.error('Failed to start gRPC service on all hosts');
            throw lastError || new Error('Failed to start gRPC service');
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