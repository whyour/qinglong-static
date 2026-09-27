"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const index_1 = __importDefault(require("../config/index"));
const logger_1 = __importDefault(require("./logger"));
async function linkCommand() {
    const homeDir = os_1.default.homedir();
    let userBinDir = path_1.default.join(homeDir, 'bin');
    try {
        await promises_1.default.mkdir(userBinDir, { recursive: true });
        await linkCommandToDir(userBinDir);
    }
    catch (error) {
        logger_1.default.error('Linking command failed:', error);
    }
}
async function linkCommandToDir(commandDir) {
    var _a, _b;
    const cliRoot = process.env.QL_CLI_ROOT;
    if (cliRoot) {
        if (!path_1.default.isAbsolute(cliRoot)) {
            throw new Error('QL_CLI_ROOT must be an absolute CLI installation path');
        }
        const { installCliEntrypoints } = require(path_1.default.join(cliRoot, 'dist/local/entrypoints.js'));
        await installCliEntrypoints(commandDir, cliRoot);
        const { installCronEntrypoint } = require(path_1.default.join(cliRoot, 'dist/local/cronEntrypoint.js'));
        await installCronEntrypoint(commandDir, cliRoot, index_1.default.crontabFile, Object.assign(Object.assign({}, process.env), { QL_DIR: index_1.default.rootPath, QL_DATA_DIR: index_1.default.dataPath }));
        // Container-wide legacy links may precede ~/bin. Ensure panel children use
        // the explicitly selected entries without changing system-wide links.
        process.env.PATH = [
            commandDir,
            ...((_b = (_a = process.env.PATH) === null || _a === void 0 ? void 0 : _a.split(path_1.default.delimiter)) !== null && _b !== void 0 ? _b : []).filter((entry) => entry !== commandDir),
        ].join(path_1.default.delimiter);
        return;
    }
    const cronBridge = path_1.default.join(commandDir, 'crontab');
    try {
        if ((await promises_1.default.lstat(cronBridge)).isFile() &&
            (await promises_1.default.readFile(cronBridge, 'utf8')).includes('// QingLong CLI crontab bridge')) {
            await promises_1.default.unlink(cronBridge);
        }
    }
    catch (error) {
        if (error.code !== 'ENOENT')
            throw error;
    }
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
        try {
            const stats = await promises_1.default.lstat(tmpTarget);
            if (stats) {
                await promises_1.default.unlink(tmpTarget);
            }
        }
        catch (error) { }
        await promises_1.default.symlink(source, tmpTarget);
        await promises_1.default.rename(tmpTarget, target);
    }
}
exports.default = async () => {
    await linkCommand();
};
//# sourceMappingURL=deps.js.map