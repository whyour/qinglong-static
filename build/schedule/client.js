"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_js_1 = require("@grpc/grpc-js");
const cron_1 = require("../protos/cron");
const config_1 = __importDefault(require("../config"));
const grpcCerts_1 = require("../config/grpcCerts");
class Client {
    constructor() {
        this._client = null;
    }
    get client() {
        if (!this._client) {
            const tlsConfig = (0, grpcCerts_1.getGrpcCerts)();
            this._client = new cron_1.CronClient(`localhost:${config_1.default.grpcPort}`, grpc_js_1.credentials.createSsl(Buffer.from(tlsConfig.caCert), Buffer.from(tlsConfig.clientKey), Buffer.from(tlsConfig.clientCert)), { 'grpc.enable_http_proxy': 0 });
        }
        return this._client;
    }
    addCron(request) {
        return new Promise((resolve, reject) => {
            this.client.addCron({ crons: request }, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    }
    delCron(request) {
        return new Promise((resolve, reject) => {
            this.client.delCron({ ids: request }, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    }
}
exports.default = new Client();
//# sourceMappingURL=client.js.map