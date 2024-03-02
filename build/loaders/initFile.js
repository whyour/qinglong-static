"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const logger_1 = __importDefault(require("./logger"));
const util_1 = require("../config/util");
const rootPath = process.env.QL_DIR;
let dataPath = path_1.default.join(rootPath, 'data/');
if (process.env.QL_DATA_DIR) {
    dataPath = process.env.QL_DATA_DIR;
}
const configPath = path_1.default.join(dataPath, 'config/');
const scriptPath = path_1.default.join(dataPath, 'scripts/');
const logPath = path_1.default.join(dataPath, 'log/');
const uploadPath = path_1.default.join(dataPath, 'upload/');
const bakPath = path_1.default.join(dataPath, 'bak/');
const samplePath = path_1.default.join(rootPath, 'sample/');
const tmpPath = path_1.default.join(logPath, '.tmp/');
const confFile = path_1.default.join(configPath, 'config.sh');
const authConfigFile = path_1.default.join(configPath, 'auth.json');
const sampleConfigFile = path_1.default.join(samplePath, 'config.sample.sh');
const sampleAuthFile = path_1.default.join(samplePath, 'auth.sample.json');
const sampleTaskShellFile = path_1.default.join(samplePath, 'task.sample.sh');
const sampleNotifyJsFile = path_1.default.join(samplePath, 'notify.js');
const sampleNotifyPyFile = path_1.default.join(samplePath, 'notify.py');
const scriptNotifyJsFile = path_1.default.join(scriptPath, 'sendNotify.js');
const scriptNotifyPyFile = path_1.default.join(scriptPath, 'notify.py');
const TaskBeforeFile = path_1.default.join(configPath, 'task_before.sh');
const TaskAfterFile = path_1.default.join(configPath, 'task_after.sh');
const homedir = os_1.default.homedir();
const sshPath = path_1.default.resolve(homedir, '.ssh');
const sshdPath = path_1.default.join(dataPath, 'ssh.d');
const systemLogPath = path_1.default.join(dataPath, 'syslog');
exports.default = async () => {
    const authFileExist = await (0, util_1.fileExist)(authConfigFile);
    const confFileExist = await (0, util_1.fileExist)(confFile);
    const scriptDirExist = await (0, util_1.fileExist)(scriptPath);
    const logDirExist = await (0, util_1.fileExist)(logPath);
    const configDirExist = await (0, util_1.fileExist)(configPath);
    const uploadDirExist = await (0, util_1.fileExist)(uploadPath);
    const sshDirExist = await (0, util_1.fileExist)(sshPath);
    const bakDirExist = await (0, util_1.fileExist)(bakPath);
    const sshdDirExist = await (0, util_1.fileExist)(sshdPath);
    const systemLogDirExist = await (0, util_1.fileExist)(systemLogPath);
    const tmpDirExist = await (0, util_1.fileExist)(tmpPath);
    const scriptNotifyJsFileExist = await (0, util_1.fileExist)(scriptNotifyJsFile);
    const scriptNotifyPyFileExist = await (0, util_1.fileExist)(scriptNotifyPyFile);
    const TaskBeforeFileExist = await (0, util_1.fileExist)(TaskBeforeFile);
    const TaskAfterFileExist = await (0, util_1.fileExist)(TaskAfterFile);
    if (!configDirExist) {
        await promises_1.default.mkdir(configPath);
    }
    if (!scriptDirExist) {
        await promises_1.default.mkdir(scriptPath);
    }
    if (!logDirExist) {
        await promises_1.default.mkdir(logPath);
    }
    if (!tmpDirExist) {
        await promises_1.default.mkdir(tmpPath);
    }
    if (!uploadDirExist) {
        await promises_1.default.mkdir(uploadPath);
    }
    if (!sshDirExist) {
        await promises_1.default.mkdir(sshPath);
    }
    if (!bakDirExist) {
        await promises_1.default.mkdir(bakPath);
    }
    if (!sshdDirExist) {
        await promises_1.default.mkdir(sshdPath);
    }
    if (!systemLogDirExist) {
        await promises_1.default.mkdir(systemLogPath);
    }
    // 初始化文件
    if (!authFileExist) {
        await promises_1.default.writeFile(authConfigFile, await promises_1.default.readFile(sampleAuthFile));
    }
    if (!confFileExist) {
        await promises_1.default.writeFile(confFile, await promises_1.default.readFile(sampleConfigFile));
    }
    if (!scriptNotifyJsFileExist) {
        await promises_1.default.writeFile(scriptNotifyJsFile, await promises_1.default.readFile(sampleNotifyJsFile));
    }
    if (!scriptNotifyPyFileExist) {
        await promises_1.default.writeFile(scriptNotifyPyFile, await promises_1.default.readFile(sampleNotifyPyFile));
    }
    if (!TaskBeforeFileExist) {
        await promises_1.default.writeFile(TaskBeforeFile, await promises_1.default.readFile(sampleTaskShellFile));
    }
    if (!TaskAfterFileExist) {
        await promises_1.default.writeFile(TaskAfterFile, await promises_1.default.readFile(sampleTaskShellFile));
    }
    logger_1.default.info('✌️ Init file down');
    console.log('✌️ Init file down');
};
//# sourceMappingURL=initFile.js.map