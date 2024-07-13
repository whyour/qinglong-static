"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata"); // We need this in order to use @Decorators
const config_1 = __importDefault(require("./config"));
const express_1 = __importDefault(require("express"));
const depInjector_1 = __importDefault(require("./loaders/depInjector"));
const logger_1 = __importDefault(require("./loaders/logger"));
async function startServer() {
    const app = (0, express_1.default)();
    (0, depInjector_1.default)();
    await require('./loaders/update').default({ app });
    app
        .listen(config_1.default.updatePort, '0.0.0.0', () => {
        var _a;
        logger_1.default.debug(`✌️ 更新服务启动成功！`);
        console.debug(`✌️ 更新服务启动成功！`);
        (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
    })
        .on('error', (err) => {
        logger_1.default.error(err);
        console.error(err);
        process.exit(1);
    });
}
startServer();
//# sourceMappingURL=update.js.map