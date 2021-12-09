"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("./user"));
const env_1 = __importDefault(require("./env"));
const config_1 = __importDefault(require("./config"));
const log_1 = __importDefault(require("./log"));
const cron_1 = __importDefault(require("./cron"));
const script_1 = __importDefault(require("./script"));
const open_1 = __importDefault(require("./open"));
const dependence_1 = __importDefault(require("./dependence"));
exports.default = () => {
    const app = express_1.Router();
    user_1.default(app);
    env_1.default(app);
    config_1.default(app);
    log_1.default(app);
    cron_1.default(app);
    script_1.default(app);
    open_1.default(app);
    dependence_1.default(app);
    return app;
};
//# sourceMappingURL=index.js.map