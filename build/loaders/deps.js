"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const chokidar_1 = __importDefault(require("chokidar"));
const index_1 = __importDefault(require("../config/index"));
const util_1 = require("../config/util");
async function linkToNodeModule(src, dst) {
    const target = path_1.default.join(index_1.default.rootPath, 'node_modules', dst || src);
    const source = path_1.default.join(index_1.default.rootPath, src);
    try {
        const stats = await promises_1.default.lstat(target);
        if (!stats) {
            await promises_1.default.symlink(source, target, 'dir');
        }
    }
    catch (error) { }
}
async function linkCommand() {
    const commandPath = await (0, util_1.promiseExec)('which node');
    const commandDir = path_1.default.dirname(commandPath);
    const linkShell = [
        {
            src: 'update.sh',
            dest: 'ql',
            tmp: 'ql_tmp',
        },
        {
            src: 'task.sh',
            dest: 'task',
            tmp: 'task_tmp',
        },
    ];
    for (const link of linkShell) {
        const source = path_1.default.join(index_1.default.rootPath, 'shell', link.src);
        const target = path_1.default.join(commandDir, link.dest);
        const tmpTarget = path_1.default.join(commandDir, link.tmp);
        await promises_1.default.symlink(source, tmpTarget);
        await promises_1.default.rename(tmpTarget, target);
    }
}
exports.default = async (src = 'deps') => {
    await linkCommand();
    await linkToNodeModule(src);
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