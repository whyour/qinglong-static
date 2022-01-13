"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata"); // We need this in order to use @Decorators
const config_1 = __importDefault(require("./config"));
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./loaders/logger"));
async function startServer() {
    const app = express_1.default();
    await require('./loaders/initFile').default();
    await require('./loaders/sentry').default({ expressApp: app });
    await require('./loaders/db').default();
    await require('./loaders/app').default({ expressApp: app });
    const server = app
        .listen(config_1.default.port, () => {
        logger_1.default.info(`
      ################################################
      🛡️  Server listening on port: ${config_1.default.port} 🛡️
      ################################################
    `);
    })
        .on('error', (err) => {
        logger_1.default.error(err);
        process.exit(1);
    });
    await require('./loaders/server').default({ server });
}
startServer();
//# sourceMappingURL=app.js.map