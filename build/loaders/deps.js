"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
const index_1 = __importDefault(require("../config/index"));
function linkToNodeModule(src, dst) {
    const target = path_1.default.join(index_1.default.rootPath, 'node_modules', dst || src);
    const source = path_1.default.join(index_1.default.rootPath, src);
    fs_1.default.lstat(target, (err, stat) => {
        if (!stat) {
            fs_1.default.symlink(source, target, 'dir', (err) => {
                if (err)
                    throw err;
            });
        }
    });
}
exports.default = async (src = 'deps') => {
    linkToNodeModule(src);
    const source = path_1.default.join(index_1.default.rootPath, src);
    const watcher = chokidar_1.default.watch(source, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
    });
    watcher
        .on('add', (path) => linkToNodeModule(src))
        .on('change', (path) => linkToNodeModule(src));
};
//# sourceMappingURL=deps.js.map