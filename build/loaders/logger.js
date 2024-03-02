"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const config_1 = __importDefault(require("../config"));
const path_1 = __importDefault(require("path"));
const levelMap = {
    info: '🔵',
    warn: '🟡',
    error: '🔴',
    debug: '🔶'
};
const customFormat = winston_1.default.format.combine(winston_1.default.format.splat(), winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.align(), winston_1.default.format.printf((i) => `[${levelMap[i.level]}${i.level}] [${[i.timestamp]}]: ${i.message}`));
const defaultOptions = {
    format: customFormat,
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "7d",
};
const LoggerInstance = winston_1.default.createLogger({
    level: config_1.default.logs.level,
    levels: winston_1.default.config.npm.levels,
    transports: [
        new winston_1.default.transports.DailyRotateFile(Object.assign({ filename: path_1.default.join(config_1.default.systemLogPath, '%DATE%.log') }, defaultOptions))
    ],
});
exports.default = LoggerInstance;
//# sourceMappingURL=logger.js.map