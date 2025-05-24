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
require("reflect-metadata");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./loaders/logger"));
const monitoring_1 = require("./middlewares/monitoring");
class Application {
    constructor() {
        this.isShuttingDown = false;
        this.app = (0, express_1.default)();
    }
    async start() {
        var _a;
        try {
            await this.initializeDatabase();
            await this.initServer();
            this.setupMiddlewares();
            await this.initializeServices();
            this.setupGracefulShutdown();
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
        }
        catch (error) {
            logger_1.default.error('Failed to start application:', error);
            process.exit(1);
        }
    }
    async initServer() {
        const { HttpServerService } = await Promise.resolve().then(() => __importStar(require('./services/http')));
        const { GrpcServerService } = await Promise.resolve().then(() => __importStar(require('./services/grpc')));
        this.httpServerService = typedi_1.Container.get(HttpServerService);
        this.grpcServerService = typedi_1.Container.get(GrpcServerService);
    }
    async initializeDatabase() {
        await require('./loaders/db').default();
    }
    setupMiddlewares() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)(config_1.default.cors));
        this.app.use((0, compression_1.default)());
        this.app.use(monitoring_1.monitoringMiddleware);
    }
    async initializeServices() {
        var _a, _b;
        await ((_a = this.grpcServerService) === null || _a === void 0 ? void 0 : _a.initialize());
        await require('./loaders/app').default({ app: this.app });
        const server = await ((_b = this.httpServerService) === null || _b === void 0 ? void 0 : _b.initialize(this.app, config_1.default.port));
        await require('./loaders/server').default({ server });
    }
    setupGracefulShutdown() {
        const shutdown = async () => {
            var _a, _b;
            if (this.isShuttingDown)
                return;
            this.isShuttingDown = true;
            logger_1.default.info('Shutting down services...');
            try {
                await Promise.all([
                    (_a = this.grpcServerService) === null || _a === void 0 ? void 0 : _a.shutdown(),
                    (_b = this.httpServerService) === null || _b === void 0 ? void 0 : _b.shutdown(),
                ]);
                process.exit(0);
            }
            catch (error) {
                logger_1.default.error('Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
}
const app = new Application();
app.start().catch((error) => {
    logger_1.default.error('Application failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=app.js.map