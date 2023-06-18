"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const util_1 = require("../config/util");
const rootPath = process.env.QL_DIR;
;
const dataPath = path_1.default.join(rootPath, 'data/');
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
const sampleNotifyJsFile = path_1.default.join(samplePath, 'notify.js');
const sampleNotifyPyFile = path_1.default.join(samplePath, 'notify.py');
const scriptNotifyJsFile = path_1.default.join(scriptPath, 'sendNotify.js');
const scriptNotifyPyFile = path_1.default.join(scriptPath, 'notify.py');
const homedir = os_1.default.homedir();
const sshPath = path_1.default.resolve(homedir, '.ssh');
const sshdPath = path_1.default.join(dataPath, 'ssh.d');
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
    const tmpDirExist = await (0, util_1.fileExist)(tmpPath);
    const scriptNotifyJsFileExist = await (0, util_1.fileExist)(scriptNotifyJsFile);
    const scriptNotifyPyFileExist = await (0, util_1.fileExist)(scriptNotifyPyFile);
    if (!configDirExist) {
        fs_1.default.mkdirSync(configPath);
    }
    if (!scriptDirExist) {
        fs_1.default.mkdirSync(scriptPath);
    }
    if (!logDirExist) {
        fs_1.default.mkdirSync(logPath);
    }
    if (!tmpDirExist) {
        fs_1.default.mkdirSync(tmpPath);
    }
    if (!uploadDirExist) {
        fs_1.default.mkdirSync(uploadPath);
    }
    if (!sshDirExist) {
        fs_1.default.mkdirSync(sshPath);
    }
    if (!bakDirExist) {
        fs_1.default.mkdirSync(bakPath);
    }
    if (!sshdDirExist) {
        fs_1.default.mkdirSync(sshdPath);
    }
    // 初始化文件
    if (!authFileExist) {
        fs_1.default.writeFileSync(authConfigFile, fs_1.default.readFileSync(sampleAuthFile));
    }
    if (!confFileExist) {
        fs_1.default.writeFileSync(confFile, fs_1.default.readFileSync(sampleConfigFile));
    }
    if (!scriptNotifyJsFileExist) {
        fs_1.default.writeFileSync(scriptNotifyJsFile, fs_1.default.readFileSync(sampleNotifyJsFile));
    }
    if (!scriptNotifyPyFileExist) {
        fs_1.default.writeFileSync(scriptNotifyPyFile, fs_1.default.readFileSync(sampleNotifyPyFile));
    }
    dotenv_1.default.config({ path: confFile });
    logger_1.default.info('✌️ Init file down');
};
//# sourceMappingURL=initFile.js.map