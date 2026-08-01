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
exports.HealthService = void 0;
const typedi_1 = require("typedi");
const logger_1 = __importDefault(require("../loaders/logger"));
const grpc_1 = require("./grpc");
const http_1 = require("./http");
let HealthService = class HealthService {
    constructor(grpcServerService, httpServerService) {
        this.grpcServerService = grpcServerService;
        this.httpServerService = httpServerService;
        this.startTime = Date.now();
    }
    async check() {
        const status = {
            status: 'ok',
            services: {
                http: true,
                grpc: true,
            },
            metrics: {
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                memory: {
                    used: process.memoryUsage().heapUsed,
                    total: process.memoryUsage().heapTotal,
                },
            },
        };
        try {
            const httpServer = this.httpServerService.getServer();
            if (!httpServer) {
                status.services.http = false;
                status.status = 'error';
            }
        }
        catch (err) {
            status.services.http = false;
            status.status = 'error';
            logger_1.default.error('HTTP server check failed:', err);
        }
        try {
            const grpcServer = this.grpcServerService.getServer();
            if (!grpcServer) {
                status.services.grpc = false;
                status.status = 'error';
            }
        }
        catch (err) {
            status.services.grpc = false;
            status.status = 'error';
            logger_1.default.error('gRPC server check failed:', err);
        }
        return status;
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [grpc_1.GrpcServerService,
        http_1.HttpServerService])
], HealthService);
//# sourceMappingURL=health.js.map