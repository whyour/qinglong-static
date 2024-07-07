"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./loaders/logger"));
const config_1 = __importDefault(require("./config"));
const health_1 = require("./protos/health");
const grpc_js_1 = require("@grpc/grpc-js");
const app = (0, express_1.default)();
const client = new health_1.HealthClient(`0.0.0.0:${config_1.default.cronPort}`, grpc_js_1.credentials.createInsecure(), { 'grpc.enable_http_proxy': 0 });
app.get('/api/health', (req, res) => {
    client.check({ service: 'cron' }, (err, response) => {
        if (err) {
            return res.status(200).send({ code: 500, error: err });
        }
        return res.status(200).send({ code: 200, data: response });
    });
});
app
    .listen(config_1.default.publicPort, '0.0.0.0', async () => {
    var _a;
    await require('./loaders/sentry').default({ expressApp: app });
    await require('./loaders/db').default();
    logger_1.default.debug(`✌️ 公共服务启动成功！`);
    console.debug(`✌️ 公共服务启动成功！`);
    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
})
    .on('error', (err) => {
    logger_1.default.error(err);
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=public.js.map