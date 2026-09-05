"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const undici_1 = require("undici");
const config_1 = __importDefault(require("../config"));
function formatError(error) {
    if (!(error instanceof Error)) {
        return String(error);
    }
    const detailedError = error;
    const details = [error.message, detailedError.code];
    if (Array.isArray(detailedError.errors)) {
        details.push(...detailedError.errors.map(formatError));
    }
    else if (detailedError.cause) {
        details.push(formatError(detailedError.cause));
    }
    return [...new Set(details.filter(Boolean))].join(': ') || error.name;
}
async function getRecentSystemLog(lineLimit = 300) {
    try {
        const entries = await promises_1.default.readdir(config_1.default.systemLogPath);
        const latestLog = entries
            .filter((entry) => entry.endsWith('.log'))
            .sort()
            .at(-1);
        if (!latestLog) {
            return `No system log found in ${config_1.default.systemLogPath}`;
        }
        const content = await promises_1.default.readFile(path_1.default.join(config_1.default.systemLogPath, latestLog), 'utf8');
        return content.split('\n').slice(-lineLimit).join('\n').trim();
    }
    catch (error) {
        return `Unable to read system log from ${config_1.default.systemLogPath}: ${error instanceof Error ? error.message : String(error)}`;
    }
}
const check = async (call, callback) => {
    var _a;
    switch (call.request.service) {
        case 'cron': {
            const healthUrl = `http://localhost:${config_1.default.port}${config_1.default.baseUrl || ''}/api/health`;
            let failure = '';
            try {
                const response = await (0, undici_1.request)(healthUrl, {
                    method: 'GET',
                    headersTimeout: 5000,
                    bodyTimeout: 5000,
                });
                const body = (await response.body.json());
                if (response.statusCode >= 200 &&
                    response.statusCode < 300 &&
                    body.code === 200 &&
                    ((_a = body.data) === null || _a === void 0 ? void 0 : _a.status) === 'ok') {
                    return callback(null, { status: 1 });
                }
                failure = `HTTP ${response.statusCode}: ${JSON.stringify(body)}`;
            }
            catch (error) {
                failure = formatError(error);
            }
            const systemLog = await getRecentSystemLog();
            const containerHint = process.env.QL_CONTAINER === 'true'
                ? 'PM2 file logging is disabled in containers. Check `docker logs <container>` for early startup errors.'
                : 'Check `pm2 logs qinglong --lines 300` for early startup errors.';
            return callback(new Error([
                `HTTP health check failed: ${healthUrl}`,
                failure,
                containerHint,
                `Recent system log (${config_1.default.systemLogPath}):`,
                systemLog,
            ]
                .filter(Boolean)
                .join('\n')));
        }
        default:
            return callback(null, { status: 1 });
    }
};
exports.check = check;
//# sourceMappingURL=health.js.map