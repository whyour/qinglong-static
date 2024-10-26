"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sentry = __importStar(require("@sentry/node"));
const logger_1 = __importDefault(require("./logger"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../config"));
const util_1 = require("../config/util");
let version = '1.0.0';
try {
    const content = fs_1.default.readFileSync(config_1.default.versionFile, 'utf-8');
    ({ version } = (0, util_1.parseContentVersion)(content));
}
catch (error) { }
Sentry.init({
    ignoreErrors: [
        /SequelizeUniqueConstraintError/i,
        /Validation error/i,
        /UnauthorizedError/i,
        /celebrate request validation failed/i,
    ],
    dsn: 'https://8b5c84cfef3e22541bc84de0ed00497b@o1098464.ingest.sentry.io/6122819',
    tracesSampleRate: 0.5,
    release: version,
});
logger_1.default.info('✌️ Sentry loaded');
console.log('✌️ Sentry loaded');
//# sourceMappingURL=sentry.js.map