"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFileAccess = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function isWithin(root, target) {
    const relative = path_1.default.relative(root, target);
    return (relative === '' ||
        (!relative.startsWith(`..${path_1.default.sep}`) &&
            relative !== '..' &&
            !path_1.default.isAbsolute(relative)));
}
/** Resolve existing files and not-yet-created children without following an
 * existing symlink outside the root. Blacklisted directories cover descendants. */
function resolveFileAccess(root, parts, blacklist = []) {
    if (parts.some((part) => typeof part !== 'string' || part.includes('\0'))) {
        return '';
    }
    const resolvedRoot = path_1.default.resolve(root);
    const target = path_1.default.resolve(resolvedRoot, ...parts);
    if (target === resolvedRoot || !isWithin(resolvedRoot, target))
        return '';
    const isBlocked = (relative) => relative.split(path_1.default.sep).some((part) => blacklist.includes(part));
    if (isBlocked(path_1.default.relative(resolvedRoot, target)))
        return '';
    try {
        const realRoot = fs_1.default.realpathSync(resolvedRoot);
        let existing = target;
        const missing = [];
        while (!fs_1.default.existsSync(existing)) {
            // existsSync is false for a dangling symlink; never treat one as absent.
            try {
                fs_1.default.lstatSync(existing);
                return '';
            }
            catch (error) {
                if (error.code !== 'ENOENT')
                    return '';
            }
            if (existing === resolvedRoot)
                return '';
            missing.unshift(path_1.default.basename(existing));
            existing = path_1.default.dirname(existing);
        }
        const realTarget = path_1.default.resolve(fs_1.default.realpathSync(existing), ...missing);
        if (!isWithin(realRoot, realTarget) ||
            isBlocked(path_1.default.relative(realRoot, realTarget))) {
            return '';
        }
        return target;
    }
    catch (_a) {
        return '';
    }
}
exports.resolveFileAccess = resolveFileAccess;
//# sourceMappingURL=fileAccess.js.map