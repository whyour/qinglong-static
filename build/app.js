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
const cluster_1 = __importDefault(require("cluster"));
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
        this.workerMetadataMap = new Map();
        this.app = (0, express_1.default)();
        // 创建一个全局中间件，删除查询参数中的t
        this.app.use((req, res, next) => {
            if (req.query.t) {
                delete req.query.t;
            }
            next();
        });
    }
    async start() {
        try {
            if (cluster_1.default.isPrimary) {
                await this.initializeDatabase();
            }
            if (cluster_1.default.isPrimary) {
                this.startMasterProcess();
            }
            else {
                await this.startWorkerProcess();
            }
        }
        catch (error) {
            logger_1.default.error('Failed to start application:', error);
            process.exit(1);
        }
    }
    startMasterProcess() {
        // Fork gRPC worker first and wait for it to be ready
        const grpcWorker = this.forkWorker('grpc');
        // Wait for gRPC worker to signal it's ready before starting HTTP worker
        this.waitForWorkerReady(grpcWorker, 30000)
            .then(() => {
            logger_1.default.info('✌️ gRPC worker is ready, starting HTTP worker');
            this.httpWorker = this.forkWorker('http');
        })
            .catch((error) => {
            logger_1.default.error('✌️ Failed to wait for gRPC worker:', error);
            process.exit(1);
        });
        cluster_1.default.on('exit', (worker, code, signal) => {
            const metadata = this.workerMetadataMap.get(worker.id);
            if (metadata) {
                if (!this.isShuttingDown) {
                    logger_1.default.error(`✌️ ${metadata.serviceType} worker ${worker.process.pid} died (${signal || code}). Restarting...`);
                    // If gRPC worker died, restart it and wait for it to be ready
                    if (metadata.serviceType === 'grpc') {
                        const newGrpcWorker = this.forkWorker('grpc');
                        this.waitForWorkerReady(newGrpcWorker, 30000)
                            .then(() => {
                            logger_1.default.info('✌️ gRPC worker restarted and ready');
                            // Re-register cron jobs by notifying the HTTP worker
                            if (this.httpWorker) {
                                try {
                                    this.httpWorker.send('reregister-crons');
                                    logger_1.default.info('✌️ Sent reregister-crons message to HTTP worker');
                                }
                                catch (error) {
                                    logger_1.default.error('✌️ Failed to send reregister-crons message:', error);
                                }
                            }
                        })
                            .catch((error) => {
                            logger_1.default.error('✌️ Failed to restart gRPC worker:', error);
                            process.exit(1);
                        });
                    }
                    else {
                        // For HTTP worker, just restart it
                        const newWorker = this.forkWorker(metadata.serviceType);
                        this.httpWorker = newWorker;
                        logger_1.default.info(`✌️ Restarted ${metadata.serviceType} worker (PID: ${newWorker.process.pid})`);
                    }
                }
                this.workerMetadataMap.delete(worker.id);
            }
        });
        this.setupMasterShutdown();
    }
    waitForWorkerReady(worker, timeoutMs) {
        return new Promise((resolve, reject) => {
            const messageHandler = (msg) => {
                if (msg === 'ready') {
                    worker.removeListener('message', messageHandler);
                    clearTimeout(timeoutId);
                    resolve();
                }
            };
            worker.on('message', messageHandler);
            // Timeout after specified milliseconds
            const timeoutId = setTimeout(() => {
                worker.removeListener('message', messageHandler);
                reject(new Error(`Worker failed to start within ${timeoutMs / 1000} seconds`));
            }, timeoutMs);
        });
    }
    forkWorker(serviceType) {
        const worker = cluster_1.default.fork({ SERVICE_TYPE: serviceType });
        this.workerMetadataMap.set(worker.id, {
            id: worker.id,
            pid: worker.process.pid,
            serviceType,
            startTime: new Date(),
        });
        return worker;
    }
    async initializeDatabase() {
        const dbLoader = await Promise.resolve().then(() => __importStar(require('./loaders/db')));
        await dbLoader.default();
    }
    setupMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false,
        }));
        this.app.use((0, cors_1.default)(config_1.default.cors));
        this.app.use((0, compression_1.default)());
        this.app.use(monitoring_1.monitoringMiddleware);
    }
    setupMasterShutdown() {
        const shutdown = async () => {
            if (this.isShuttingDown)
                return;
            this.isShuttingDown = true;
            const workers = Object.values(cluster_1.default.workers || {});
            const workerPromises = [];
            workers.forEach((worker) => {
                if (worker) {
                    const exitPromise = new Promise((resolve) => {
                        worker.once('exit', () => {
                            logger_1.default.info(`✌️ Worker ${worker.process.pid} exited`);
                            resolve();
                        });
                        try {
                            worker.send('shutdown');
                        }
                        catch (error) {
                            logger_1.default.warn(`✌️ Failed to send shutdown to worker ${worker.process.pid}:`, error);
                        }
                    });
                    workerPromises.push(exitPromise);
                }
            });
            try {
                await Promise.race([
                    Promise.all(workerPromises),
                    new Promise((resolve) => {
                        setTimeout(() => {
                            logger_1.default.warn('✌️ Worker shutdown timeout reached');
                            resolve();
                        }, 10000);
                    }),
                ]);
                process.exit(0);
            }
            catch (error) {
                logger_1.default.error('✌️ Error during worker shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    async startWorkerProcess() {
        var _a;
        const serviceType = process.env.SERVICE_TYPE;
        if (!serviceType || !['http', 'grpc'].includes(serviceType)) {
            logger_1.default.error('✌️ Invalid SERVICE_TYPE:', serviceType);
            process.exit(1);
        }
        logger_1.default.info(`✌️ ${serviceType} worker started (PID: ${process.pid})`);
        try {
            if (serviceType === 'http') {
                await this.startHttpService();
            }
            else {
                await this.startGrpcService();
            }
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
        }
        catch (error) {
            logger_1.default.error(`✌️ ${serviceType} worker failed:`, error);
            process.exit(1);
        }
    }
    async startHttpService() {
        this.setupMiddlewares();
        const { HttpServerService } = await Promise.resolve().then(() => __importStar(require('./services/http')));
        this.httpServerService = typedi_1.Container.get(HttpServerService);
        const appLoader = await Promise.resolve().then(() => __importStar(require('./loaders/app')));
        await appLoader.default({ app: this.app });
        const server = await this.httpServerService.initialize(this.app, config_1.default.port);
        const serverLoader = await Promise.resolve().then(() => __importStar(require('./loaders/server')));
        await serverLoader.default({ server });
        this.setupWorkerShutdown('http');
    }
    async startGrpcService() {
        const { GrpcServerService } = await Promise.resolve().then(() => __importStar(require('./services/grpc')));
        this.grpcServerService = typedi_1.Container.get(GrpcServerService);
        await this.grpcServerService.initialize();
        this.setupWorkerShutdown('grpc');
    }
    setupWorkerShutdown(serviceType) {
        process.on('message', async (msg) => {
            if (msg === 'shutdown') {
                this.gracefulShutdown(serviceType);
            }
            else if (msg === 'reregister-crons' && serviceType === 'http') {
                // Re-register cron jobs when gRPC worker restarts
                try {
                    logger_1.default.info('✌️ Received reregister-crons message, re-registering cron jobs...');
                    const CronService = (await Promise.resolve().then(() => __importStar(require('./services/cron')))).default;
                    const cronService = typedi_1.Container.get(CronService);
                    await cronService.autosave_crontab();
                    logger_1.default.info('✌️ Cron jobs re-registered successfully');
                }
                catch (error) {
                    logger_1.default.error('✌️ Failed to re-register cron jobs:', error);
                }
            }
        });
        const shutdown = () => this.gracefulShutdown(serviceType);
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    async gracefulShutdown(serviceType) {
        var _a, _b;
        if (this.isShuttingDown)
            return;
        this.isShuttingDown = true;
        try {
            if (serviceType === 'http') {
                await ((_a = this.httpServerService) === null || _a === void 0 ? void 0 : _a.shutdown());
            }
            else {
                await ((_b = this.grpcServerService) === null || _b === void 0 ? void 0 : _b.shutdown());
            }
            process.exit(0);
        }
        catch (error) {
            logger_1.default.error(`✌️ [${serviceType}] Error during shutdown:`, error);
            process.exit(1);
        }
    }
}
const app = new Application();
app.start().catch((error) => {
    logger_1.default.error('🙅‍♀️ Application failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=app.js.map