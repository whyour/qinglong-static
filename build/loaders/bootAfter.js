"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = __importDefault(require("typedi"));
const cron_1 = __importDefault(require("../services/cron"));
exports.default = async () => {
    const cronService = typedi_1.default.get(cron_1.default);
    await cronService.bootTask();
};
//# sourceMappingURL=bootAfter.js.map