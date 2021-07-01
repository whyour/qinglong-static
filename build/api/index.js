"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const cookie_1 = __importDefault(require("./cookie"));
const config_1 = __importDefault(require("./config"));
const log_1 = __importDefault(require("./log"));
const cron_1 = __importDefault(require("./cron"));
exports.default = () => {
    const app = express_1.Router();
    auth_1.default(app);
    cookie_1.default(app);
    config_1.default(app);
    log_1.default(app);
    cron_1.default(app);
    return app;
};
//# sourceMappingURL=index.js.map