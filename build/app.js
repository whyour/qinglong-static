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
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./loaders/logger"));
const errors_1 = require("./shared/errors");
const languageSync_1 = require("./shared/languageSync");
const startupTiming_1 = require("./shared/startupTiming");
class Application {
    constructor() {
        this.isShuttingDown = false;
        this.workerMetadataMap = new Map();
    }
    async start() {
        try {
            if (cluster_1.default.isPrimary) {
                await (0, startupTiming_1.startupStage)('database', () => this.initializeDatabase());
            }
            await (0, startupTiming_1.startupStage)('language', () => (0, languageSync_1.initializeLanguageSync)());
            if (cluster_1.default.isPrimary) {
                this.startMasterProcess();
            }
            else {
                await this.startWorkerProcess();
            }
        }
        catch (error) {
            logger_1.default.error(`Failed to start application:\n${(0, errors_1.errStack)(error)}`);
            process.exit(1);
        }
    }
    startMasterProcess() {
        // Source transpilation competes with the frontend's cold compilation in
        // development. Keep a bounded wait without applying that budget to normal
        // production startup.
        const readyTimeout = process.env.NODE_ENV === 'development' ||
            (process.arch === 'arm' &&
                Number(process.config.variables.arm_version) === 6)
            ? 120000
            : 30000;
        // Fork gRPC worker first and wait for it to be ready
        const grpcWorker = this.forkWorker('grpc');
        // Wait for gRPC worker to signal it's ready before starting HTTP worker
        this.waitForWorkerReady(grpcWorker, readyTimeout)
            .then(() => {
            logger_1.default.info('[boot] gRPC worker is ready, starting HTTP worker');
            this.httpWorker = this.forkWorker('http');
        })
            .catch((error) => {
            logger_1.default.error(`[boot] Failed to wait for gRPC worker:\n${(0, errors_1.errStack)(error)}`);
            process.exit(1);
        });
        cluster_1.default.on('exit', (worker, code, signal) => {
            var _a;
            const metadata = this.workerMetadataMap.get(worker.id);
            if (metadata) {
                if (!this.isShuttingDown) {
                    logger_1.default.error(`${metadata.serviceType} worker ${worker.process.pid} died (${signal || code}). Restarting...`);
                    // If gRPC worker died, restart it and wait for it to be ready
                    if (metadata.serviceType === 'grpc') {
                        try {
                            (_a = this.httpWorker) === null || _a === void 0 ? void 0 : _a.send('scheduler-unavailable');
                        }
                        catch (error) {
                            logger_1.default.warn('Unable to notify HTTP worker of scheduler exit');
                        }
                        const newGrpcWorker = this.forkWorker('grpc');
                        this.waitForWorkerReady(newGrpcWorker, readyTimeout)
                            .then(() => {
                            logger_1.default.info('gRPC worker restarted and ready');
                            // Re-register cron jobs by notifying the HTTP worker
                            if (this.httpWorker) {
                                try {
                                    this.httpWorker.send('reregister-crons');
                                    logger_1.default.info('Sent reregister-crons message to HTTP worker');
                                }
                                catch (error) {
                                    logger_1.default.error(`Failed to send reregister-crons message:\n${(0, errors_1.errStack)(error)}`);
                                }
                            }
                        })
                            .catch((error) => {
                            logger_1.default.error(`Failed to restart gRPC worker:\n${(0, errors_1.errStack)(error)}`);
                            process.exit(1);
                        });
                    }
                    else {
                        // For HTTP worker, just restart it
                        const newWorker = this.forkWorker(metadata.serviceType);
                        this.httpWorker = newWorker;
                        logger_1.default.info(`Restarted ${metadata.serviceType} worker (PID: ${newWorker.process.pid})`);
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
        const workerEnv = { SERVICE_TYPE: serviceType };
        // PM2's fork launcher is inherited by our own cluster workers. Their APM
        // messages go to this primary, not PM2, and duplicate its sampling work.
        // Keep primary monitoring and allow restoring the inherited worker APM.
        if (process.env.pm_id !== undefined && process.env.QL_WORKER_APM !== 'true') {
            workerEnv.pmx = 'false';
        }
        const worker = cluster_1.default.fork(workerEnv);
        if (serviceType === 'grpc')
            worker.on('message', (msg) => {
                var _a;
                if (msg === 'crontab-install-failed' && ((_a = this.httpWorker) === null || _a === void 0 ? void 0 : _a.isConnected())) {
                    this.httpWorker.send('reregister-crons');
                }
            });
        if (serviceType === 'http')
            worker.on('message', (msg) => {
                var _a;
                if ((msg === null || msg === void 0 ? void 0 : msg.type) !== 'cancel-queued-triggers')
                    return;
                for (const [id, meta] of this.workerMetadataMap) {
                    const target = (_a = cluster_1.default.workers) === null || _a === void 0 ? void 0 : _a[id];
                    if (meta.serviceType === 'grpc' && (target === null || target === void 0 ? void 0 : target.isConnected()))
                        target.send(msg);
                }
            });
        this.workerMetadataMap.set(worker.id, {
            id: worker.id,
            pid: worker.process.pid,
            serviceType,
            startTime: new Date(),
        });
        return worker;
    }
    async initializeDatabase() {
        const { runStartupProcess } = await Promise.resolve().then(() => __importStar(require('./shared/startupProcess')));
        await runStartupProcess(require.resolve('./bootstrap/database'));
    }
    async setupMiddlewares() {
        const { createHttpApplication } = await Promise.resolve().then(() => __importStar(require('./loaders/httpApplication')));
        return createHttpApplication();
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
                            logger_1.default.info(`Worker ${worker.process.pid} exited`);
                            resolve();
                        });
                        try {
                            worker.send('shutdown');
                        }
                        catch (error) {
                            logger_1.default.warn(`Failed to send shutdown to worker ${worker.process.pid}:\n${(0, errors_1.errStack)(error)}`);
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
                            logger_1.default.warn('Worker shutdown timeout reached');
                            resolve();
                        }, 10000);
                    }),
                ]);
                process.exit(0);
            }
            catch (error) {
                logger_1.default.error(`Error during worker shutdown:\n${(0, errors_1.errStack)(error)}`);
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
            logger_1.default.error('[boot] Invalid SERVICE_TYPE:', serviceType);
            process.exit(1);
        }
        logger_1.default.info(`[boot] ${serviceType} worker started (PID: ${process.pid})`);
        try {
            const { triggerHistory } = await (0, startupTiming_1.startupStage)('history.import', () => Promise.resolve().then(() => __importStar(require('./shared/triggerHistory'))));
            const history = triggerHistory();
            await (0, startupTiming_1.startupStage)('history.recover', () => history.interrupt(serviceType));
            if (serviceType === 'http') {
                await this.startHttpService();
                const retryExits = async () => {
                    try {
                        await history.retryPendingExits();
                    }
                    catch (error) {
                        logger_1.default.error(`[scheduler] Exit receipt retry failed: ${(0, errors_1.errStack)(error)}`);
                    }
                    finally {
                        if (!this.isShuttingDown)
                            setTimeout(retryExits, 15000).unref();
                    }
                };
                setTimeout(retryExits, 15000).unref();
            }
            else {
                await this.startGrpcService();
            }
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
        }
        catch (error) {
            logger_1.default.error(`[boot] ${serviceType} worker failed:\n${(0, errors_1.errStack)(error)}`);
            process.exit(1);
        }
    }
    async startHttpService() {
        // 在导入任何 gRPC 客户端模块之前初始化 mTLS 证书
        const { initGrpcCerts } = await (0, startupTiming_1.startupStage)('certificates.import', () => Promise.resolve().then(() => __importStar(require('./config/grpcCerts'))));
        await (0, startupTiming_1.startupStage)('certificates.initialize', () => initGrpcCerts());
        const app = await (0, startupTiming_1.startupStage)('http.middleware', () => this.setupMiddlewares());
        const { HttpServerService } = await Promise.resolve().then(() => __importStar(require('./services/http')));
        this.httpServerService = typedi_1.Container.get(HttpServerService);
        const appLoader = await (0, startupTiming_1.startupStage)('http.import', () => Promise.resolve().then(() => __importStar(require('./loaders/app'))));
        await (0, startupTiming_1.startupStage)('http.initialize', () => appLoader.default({ app }));
        const server = await this.httpServerService.initialize(app, config_1.default.port);
        const serverLoader = await Promise.resolve().then(() => __importStar(require('./loaders/server')));
        await serverLoader.default({ server });
        this.setupWorkerShutdown('http');
    }
    async startGrpcService() {
        const { GrpcServerService } = await (0, startupTiming_1.startupStage)('grpc.import', () => Promise.resolve().then(() => __importStar(require('./services/grpc'))));
        this.grpcServerService = typedi_1.Container.get(GrpcServerService);
        await (0, startupTiming_1.startupStage)('grpc.initialize', () => this.grpcServerService.initialize());
        this.setupWorkerShutdown('grpc');
    }
    setupWorkerShutdown(serviceType) {
        process.on('message', async (msg) => {
            if (msg === 'shutdown') {
                this.gracefulShutdown(serviceType);
            }
            else if (serviceType === 'grpc' && typeof msg === 'object' && msg &&
                'type' in msg && msg.type === 'cancel-queued-triggers' && 'ids' in msg && Array.isArray(msg.ids)) {
                const { cancelWaitingTriggers } = await Promise.resolve().then(() => __importStar(require('./shared/runCron')));
                cancelWaitingTriggers(msg.ids);
            }
            else if (serviceType === 'http' &&
                (msg === 'reregister-crons' || msg === 'scheduler-unavailable')) {
                const { default: cronClient } = await Promise.resolve().then(() => __importStar(require('./schedule/client')));
                cronClient.readiness.invalidate();
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
            const { triggerHistory } = await Promise.resolve().then(() => __importStar(require('./shared/triggerHistory')));
            await triggerHistory().interrupt(serviceType);
            if (serviceType === 'http') {
                await ((_a = this.httpServerService) === null || _a === void 0 ? void 0 : _a.shutdown());
            }
            else {
                await ((_b = this.grpcServerService) === null || _b === void 0 ? void 0 : _b.shutdown());
            }
            process.exit(0);
        }
        catch (error) {
            logger_1.default.error(`[${serviceType}] Error during shutdown:\n${(0, errors_1.errStack)(error)}`);
            process.exit(1);
        }
    }
}
const app = new Application();
app.start().catch((error) => {
    logger_1.default.error(`🙅‍♀️ Application failed to start:\n${(0, errors_1.errStack)(error)}`);
    process.exit(1);
});
//# sourceMappingURL=app.js.map