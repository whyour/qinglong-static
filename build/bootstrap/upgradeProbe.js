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
// A single, disposable backend process. Resolve startup dependencies, but never
// run appLoader: its initData/initTask hooks install dependencies and start user work.
require("reflect-metadata");
const dns_1 = __importDefault(require("dns"));
const http_1 = __importDefault(require("http"));
// The first scheduler connection can outlive its short RPC deadline. Let the
// normal single-flight recovery finish within the supervised startup budget.
async function waitForUpgradeScheduler(readiness, timeoutMs, retryMs = 250) {
    const deadline = Date.now() + timeoutMs;
    do {
        if (await readiness.recover())
            return;
        const remaining = deadline - Date.now();
        if (remaining <= 0)
            break;
        await new Promise((resolve) => setTimeout(resolve, Math.min(retryMs, remaining)));
    } while (Date.now() < deadline);
    throw new Error('Upgrade scheduler readiness failed');
}
async function probeUpgrade() {
    if (!process.send || process.env.QL_UPGRADE_PROBE !== '1')
        throw new Error('Upgrade probe requires its isolated supervisor');
    dns_1.default.setDefaultResultOrder('ipv4first');
    const { default: config } = await Promise.resolve().then(() => __importStar(require('../config')));
    const { sequelize } = await Promise.resolve().then(() => __importStar(require('../data')));
    const { default: loadDatabase } = await Promise.resolve().then(() => __importStar(require('../loaders/db')));
    const { Container } = await Promise.resolve().then(() => __importStar(require('typedi')));
    const { GrpcServerService } = await Promise.resolve().then(() => __importStar(require('../services/grpc')));
    const { HttpServerService } = await Promise.resolve().then(() => __importStar(require('../services/http')));
    const { createHttpApplication } = await Promise.resolve().then(() => __importStar(require('../loaders/httpApplication')));
    const { default: loadServer } = await Promise.resolve().then(() => __importStar(require('../loaders/server')));
    const { default: loadExpress } = await Promise.resolve().then(() => __importStar(require('../loaders/express')));
    await Promise.resolve().then(() => __importStar(require('../loaders/app'))); // Resolve normal startup hooks without running them.
    const { default: inject } = await Promise.resolve().then(() => __importStar(require('../loaders/depInjector')));
    const grpc = Container.get(GrpcServerService);
    const server = Container.get(HttpServerService);
    try {
        await loadDatabase();
        // Exercise an actual on-disk transaction as well as schema initialization.
        await sequelize.transaction(async (transaction) => {
            var _a;
            await sequelize.query('CREATE TABLE upgrade_probe (value INTEGER)', {
                transaction,
            });
            await sequelize.query('INSERT INTO upgrade_probe VALUES (42)', {
                transaction,
            });
            const [rows] = await sequelize.query('SELECT value FROM upgrade_probe', {
                transaction,
            });
            if (((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.value) !== 42)
                throw new Error('Upgrade database readback failed');
        });
        inject();
        config.grpcPort = await grpc.initialize();
        const { default: cronClient } = await Promise.resolve().then(() => __importStar(require('../schedule/client')));
        cronClient.readiness.configure(async () => { });
        await waitForUpgradeScheduler(cronClient.readiness, process.arch === 'arm' &&
            Number(process.config.variables
                .arm_version) === 6
            ? 60000
            : 10000);
        const app = await createHttpApplication();
        loadExpress({ app });
        const listener = await server.initialize(app, 0);
        await loadServer({ server: listener });
        const address = listener.address();
        if (!address || typeof address === 'string')
            throw new Error('No probe HTTP port');
        const health = await new Promise((resolve, reject) => {
            const request = http_1.default.get(`http://127.0.0.1:${address.port}/api/health`, (response) => {
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('error', reject);
                response.on('end', () => {
                    var _a, _b, _c;
                    try {
                        const result = JSON.parse(body);
                        if (response.statusCode !== 200 ||
                            result.code !== 200 ||
                            ((_a = result.data) === null || _a === void 0 ? void 0 : _a.status) !== 'ok' ||
                            !((_b = result.data.services) === null || _b === void 0 ? void 0 : _b.grpc) ||
                            !((_c = result.data.services) === null || _c === void 0 ? void 0 : _c.http))
                            throw new Error('Upgrade HTTP/gRPC health check failed');
                        resolve(result.data);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            request.setTimeout(10000, () => request.destroy(new Error('Upgrade health request timed out')));
            request.on('error', reject);
        });
        process.send({
            type: 'upgrade-probe',
            ok: true,
            build: health.build,
            memory: process.memoryUsage(),
            pid: process.pid,
        });
    }
    finally {
        await server.shutdown();
        grpc.getServer().forceShutdown();
        await sequelize.close();
    }
}
process.once('disconnect', () => process.exit(1));
probeUpgrade()
    .then(() => process.exit(0))
    .catch((error) => {
    var _a;
    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, {
        type: 'upgrade-probe',
        ok: false,
        code: error.code,
        message: error.message,
        stack: error.stack,
    });
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=upgradeProbe.js.map