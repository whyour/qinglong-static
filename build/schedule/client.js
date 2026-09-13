"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_js_1 = require("@grpc/grpc-js");
const cron_1 = require("../protos/cron");
const config_1 = __importDefault(require("../config"));
const grpcCerts_1 = require("../config/grpcCerts");
const health_1 = require("../protos/health");
const schedulerReadiness_1 = require("../shared/schedulerReadiness");
class Client {
    constructor() {
        this.readiness = new schedulerReadiness_1.SchedulerReadiness(() => this.probe());
        this._client = null;
    }
    async waitForReady(timeoutMs) {
        try {
            await new Promise((resolve, reject) => {
                this.client.waitForReady(Date.now() + timeoutMs, (err) => err ? reject(err) : resolve());
            });
        }
        catch (error) {
            this.readiness.invalidate();
            throw Object.assign(error instanceof Error ? error : new Error(String(error)), { status: 503 });
        }
    }
    async probe() {
        await this.waitForReady(1000);
        await new Promise((resolve, reject) => {
            this.client.makeUnaryRequest(health_1.HealthService.check.path, health_1.HealthService.check.requestSerialize, health_1.HealthService.check.responseDeserialize, { service: 'scheduler' }, { deadline: Date.now() + 1000 }, (err, res) => err ? reject(err) : (res === null || res === void 0 ? void 0 : res.status) === 1 ? resolve() : reject(new Error('Scheduler unavailable')));
        });
    }
    get client() {
        if (!this._client) {
            const tlsConfig = (0, grpcCerts_1.getGrpcCerts)();
            this._client = new cron_1.CronClient(`localhost:${config_1.default.grpcPort}`, grpc_js_1.credentials.createSsl(Buffer.from(tlsConfig.caCert), Buffer.from(tlsConfig.clientKey), Buffer.from(tlsConfig.clientCert)), { 'grpc.enable_http_proxy': 0 });
        }
        return this._client;
    }
    async addCron(request, replace = false) {
        await this.waitForReady(2000);
        return new Promise((resolve, reject) => {
            this.client.addCron({ crons: request, replace }, new grpc_js_1.Metadata(), { deadline: Date.now() + 5000 }, (err, res) => {
                if (err) {
                    if (err.code === grpc_js_1.status.UNAVAILABLE || err.code === grpc_js_1.status.DEADLINE_EXCEEDED) {
                        // A timed-out write may already have reached the scheduler.
                        // Reconcile its state from the DB instead of replaying the RPC.
                        this.readiness.invalidate();
                        Object.assign(err, { status: 503 });
                    }
                    return reject(err);
                }
                resolve(res);
            });
        });
    }
    async delCron(request) {
        await this.waitForReady(2000);
        return new Promise((resolve, reject) => {
            this.client.delCron({ ids: request }, new grpc_js_1.Metadata(), { deadline: Date.now() + 5000 }, (err, res) => {
                if (err) {
                    if (err.code === grpc_js_1.status.UNAVAILABLE || err.code === grpc_js_1.status.DEADLINE_EXCEEDED) {
                        this.readiness.invalidate();
                        Object.assign(err, { status: 503 });
                    }
                    return reject(err);
                }
                resolve(res);
            });
        });
    }
}
exports.default = new Client();
//# sourceMappingURL=client.js.map