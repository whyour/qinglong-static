"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const util_1 = require("../config/util");
const rootPath = process.cwd();
const confFile = path_1.default.join(rootPath, 'config/config.sh');
const sampleConfigFile = path_1.default.join(rootPath, 'sample/config.sample.sh');
const sampleAuthFile = path_1.default.join(rootPath, 'sample/auth.sample.json');
const authConfigFile = path_1.default.join(rootPath, 'config/auth.json');
const configPath = path_1.default.join(rootPath, 'config/');
const scriptPath = path_1.default.join(rootPath, 'scripts/');
const logPath = path_1.default.join(rootPath, 'log/');
exports.default = async () => {
    const authFileExist = await util_1.fileExist(authConfigFile);
    const confFileExist = await util_1.fileExist(confFile);
    const scriptDirExist = await util_1.fileExist(scriptPath);
    const logDirExist = await util_1.fileExist(logPath);
    const configDirExist = await util_1.fileExist(configPath);
    if (!configDirExist) {
        fs_1.default.mkdirSync(configPath);
    }
    if (!authFileExist) {
        fs_1.default.writeFileSync(authConfigFile, fs_1.default.readFileSync(sampleAuthFile));
    }
    if (!confFileExist) {
        fs_1.default.writeFileSync(confFile, fs_1.default.readFileSync(sampleConfigFile));
    }
    if (!scriptDirExist) {
        fs_1.default.mkdirSync(scriptPath);
    }
    if (!logDirExist) {
        fs_1.default.mkdirSync(logPath);
    }
    dotenv_1.default.config({ path: confFile });
    logger_1.default.info('✌️ Init file down');
};
//# sourceMappingURL=initFile.js.map