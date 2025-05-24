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
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    debug: '🐛', // debug调试图标
};
const baseFormat = [
    winston_1.default.format.splat(),
    winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston_1.default.format.align(),
];
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ level: true }), ...baseFormat, winston_1.default.format.printf((info) => {
    return `[${info.level} ${info.timestamp}]:${info.message}`;
}));
const plainFormat = winston_1.default.format.combine(winston_1.default.format.uncolorize(), ...baseFormat, winston_1.default.format.printf((info) => {
    return `[${levelMap[info.level] || ''}${info.level} ${info.timestamp}]:${info.message}`;
}));
const consoleTransport = new winston_1.default.transports.Console({
    format: consoleFormat,
    level: 'debug',
});
const fileTransport = new winston_1.default.transports.DailyRotateFile({
    filename: path_1.default.join(config_1.default.systemLogPath, '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    format: plainFormat,
    level: config_1.default.logs.level || 'info',
});
const LoggerInstance = winston_1.default.createLogger({
    level: 'debug',
    levels: winston_1.default.config.npm.levels,
    transports: [consoleTransport, fileTransport],
    exceptionHandlers: [consoleTransport, fileTransport],
    rejectionHandlers: [consoleTransport, fileTransport],
});
LoggerInstance.on('error', (error) => {
    console.error('Logger error:', error);
});
exports.default = LoggerInstance;
//# sourceMappingURL=logger.js.map