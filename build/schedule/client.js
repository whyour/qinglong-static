"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_js_1 = require("@grpc/grpc-js");
const cron_1 = require("../protos/cron");
const config_1 = __importDefault(require("../config"));
class Client {
    constructor() {
        this.client = new cron_1.CronClient(`0.0.0.0:${config_1.default.cronPort}`, grpc_js_1.credentials.createInsecure(), { 'grpc.enable_http_proxy': 0 });
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