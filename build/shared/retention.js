"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectorySize = exports.isDependenceCacheType = exports.normalizeRetentionPolicy = exports.normalizeRetentionDays = exports.DEPENDENCE_CACHE_TYPES = exports.MAX_RETENTION_DAYS = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
exports.MAX_RETENTION_DAYS = 3650;
exports.DEPENDENCE_CACHE_TYPES = ['node', 'python3'];
function normalizeRetentionDays(value) {
    const days = Number(value);
    if (!Number.isFinite(days))
        return 0;
    return Math.min(Math.max(Math.trunc(days), 0), exports.MAX_RETENTION_DAYS);
}
exports.normalizeRetentionDays = normalizeRetentionDays;
function normalizeRetentionPolicy(policy) {
    return {
        runningInstanceRetentionDays: normalizeRetentionDays(policy.runningInstanceRetentionDays),
        cronStatRetentionDays: normalizeRetentionDays(policy.cronStatRetentionDays),
    };
}
exports.normalizeRetentionPolicy = normalizeRetentionPolicy;
function isDependenceCacheType(value) {
    return exports.DEPENDENCE_CACHE_TYPES.includes(value);
}
exports.isDependenceCacheType = isDependenceCacheType;
async function getDirectorySize(rootPath) {
    const pending = [rootPath];
    let total = 0;
    while (pending.length > 0) {
        const currentPath = pending.pop();
        let entries;
        try {
            entries = await promises_1.default.readdir(currentPath, { withFileTypes: true });
        }
        catch (error) {
            if ((error === null || error === void 0 ? void 0 : error.code) === 'ENOENT')
                continue;
            throw error;
        }
        for (const entry of entries) {
            if (entry.isSymbolicLink())
                continue;
            const entryPath = path_1.default.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                pending.push(entryPath);
            }
            else if (entry.isFile()) {
                total += (await promises_1.default.stat(entryPath)).size;
            }
        }
    }
    return total;
}
exports.getDirectorySize = getDirectorySize;
//# sourceMappingURL=retention.js.map