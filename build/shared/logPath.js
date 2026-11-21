"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLogPath = void 0;
const fileAccess_1 = require("./fileAccess");
/** Check stored paths too: old database rows are not trusted input. */
function resolveLogPath(root, value) {
    const target = (0, fileAccess_1.resolveFileAccess)(root, [value]);
    if (!target)
        throw Object.assign(new Error('Log path is outside the log directory'), {
            status: 400,
        });
    return target;
}
exports.resolveLogPath = resolveLogPath;
//# sourceMappingURL=logPath.js.map