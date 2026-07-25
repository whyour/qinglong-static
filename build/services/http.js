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
exports.HttpServerService = void 0;
const logger_1 = __importDefault(require("../loaders/logger"));
const metrics_1 = require("./metrics");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
let HttpServerService = class HttpServerService {
    constructor() {
        this.server = undefined;
    }
    async initialize(expressApp, port) {
        const hostsToTry = [
            config_1.default.bindHost,
            ...(config_1.default.bindHost !== '0.0.0.0' ? ['0.0.0.0'] : [])
        ];
        let lastError = null;
        for (const host of hostsToTry) {
            try {
                const server = await this.tryListen(expressApp, port, host);
                logger_1.default.debug(`[boot] HTTP service started successfully on ${host}:${port}`);
                metrics_1.metricsService.record('http_service_start', 1, {
                    port: port.toString(),
                    host
                });
                this.server = server;
                return server;
            }
            catch (err) {
                lastError = err;
                logger_1.default.warn(`Failed to bind HTTP on ${host}:${port}, trying next...`, err);
            }
        }
        logger_1.default.error('Failed to start HTTP service on all hosts');
        throw lastError || new Error('Failed to start HTTP service');
    }
    async tryListen(expressApp, port, host) {
        return new Promise((resolve, reject) => {
            const server = expressApp.listen(port, host, () => {
                resolve(server);
            });
            server.on('error', (err) => {
                server.close();
                reject(err);
            });
        });
    }
    async shutdown() {
        try {
            if (this.server) {
                await new Promise((resolve) => {
                    var _a;
                    (_a = this.server) === null || _a === void 0 ? void 0 : _a.close(() => {
                        logger_1.default.debug('HTTP service stopped');
                        metrics_1.metricsService.record('http_service_stop', 1);
                        resolve(null);
                    });
                });
            }
        }
        catch (err) {
            logger_1.default.error('Error while shutting down HTTP service:', err);
            throw err;
        }
    }
    getServer() {
        return this.server;
    }
};
exports.HttpServerService = HttpServerService;
exports.HttpServerService = HttpServerService = __decorate([
    (0, typedi_1.Service)()
], HttpServerService);
//# sourceMappingURL=http.js.map