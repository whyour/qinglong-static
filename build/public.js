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
const client = new health_1.HealthClient(`localhost:${config_1.default.cronPort}`, grpc_js_1.credentials.createInsecure());
app.get('/api/health', (req, res) => {
    client.check({ service: 'cron' }, (err, response) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        return res.status(200).send({ data: response });
    });
});
app
    .listen(config_1.default.publicPort, async () => {
    await require('./loaders/sentry').default({ expressApp: app });
    await require('./loaders/db').default();
    logger_1.default.debug(`✌️ 公共服务启动成功！`);
})
    .on('error', (err) => {
    logger_1.default.error(err);
    process.exit(1);
});
//# sourceMappingURL=public.js.map