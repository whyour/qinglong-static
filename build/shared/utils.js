"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileWithLock = void 0;
const proper_lockfile_1 = require("proper-lockfile");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const util_1 = require("../config/util");
function getUniqueLockPath(filePath) {
    const sanitizedPath = filePath
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/^_/, '');
    return path_1.default.join(os_1.default.tmpdir(), `${sanitizedPath}.ql_lock`);
}
async function writeFileWithLock(filePath, content, options = {}) {
    if (typeof options === 'string') {
        options = { encoding: options };
    }
    if (!(await (0, util_1.fileExist)(filePath))) {
        const fileHandle = await (0, promises_1.open)(filePath, 'w');
        fileHandle.close();
    }
    const lockfilePath = getUniqueLockPath(filePath);
    const release = await (0, proper_lockfile_1.lock)(filePath, {
        retries: {
            retries: 10,
            factor: 2,
            minTimeout: 100,
            maxTimeout: 3000,
        },
        lockfilePath,
    });
    await (0, promises_1.writeFile)(filePath, content, Object.assign({ encoding: 'utf8' }, options));
    if (options === null || options === void 0 ? void 0 : options.mode) {
        await (0, promises_1.chmod)(filePath, options.mode);
    }
    await release();
}
exports.writeFileWithLock = writeFileWithLock;
//# sourceMappingURL=utils.js.map