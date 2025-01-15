"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileWithLock = void 0;
const proper_lockfile_1 = require("proper-lockfile");
const promises_1 = require("fs/promises");
const util_1 = require("../config/util");
async function writeFileWithLock(path, content, options = {}) {
    if (typeof options === 'string') {
        options = { encoding: options };
    }
    if (!(await (0, util_1.fileExist)(path))) {
        const fileHandle = await (0, promises_1.open)(path, 'w');
        fileHandle.close();
    }
    const release = await (0, proper_lockfile_1.lock)(path, {
        retries: {
            retries: 10,
            factor: 2,
            minTimeout: 100,
            maxTimeout: 3000,
        },
    });
    await (0, promises_1.writeFile)(path, content, Object.assign({ encoding: 'utf8' }, options));
    await release();
}
exports.writeFileWithLock = writeFileWithLock;
//# sourceMappingURL=utils.js.map