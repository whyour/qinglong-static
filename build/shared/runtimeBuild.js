"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtimeBuild = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
function read(filename) {
    try {
        return (0, fs_1.readFileSync)(filename);
    }
    catch (_a) {
        return undefined;
    }
}
function manifest() {
    var _a;
    try {
        const value = JSON.parse(((_a = read(path_1.default.resolve(__dirname, '../../build-info.json'))) === null || _a === void 0 ? void 0 : _a.toString()) ||
            '{}');
        return value && typeof value === 'object' ? value : {};
    }
    catch (_b) {
        return {};
    }
}
// Capture before serving requests. Reading the installed files on each request
// would let an old process claim the identity of a newly copied build.
const backend = read(path_1.default.resolve(__dirname, '../app.js'));
const root = process.env.QL_DIR || path_1.default.resolve(__dirname, '../../..');
const version = (_b = (_a = read(path_1.default.join(root, 'version.yaml'))) === null || _a === void 0 ? void 0 : _a.toString().match(/^\uFEFF?version:\s*["']?(\d+\.\d+\.\d+)/m)) === null || _b === void 0 ? void 0 : _b[1];
exports.runtimeBuild = Object.freeze({
    instanceId: (0, crypto_1.randomUUID)(),
    parentPid: process.ppid,
    version,
    sourceCommit: manifest().sourceCommit,
    backendSha256: backend
        ? (0, crypto_1.createHash)('sha256').update(backend).digest('hex')
        : undefined,
});
//# sourceMappingURL=runtimeBuild.js.map