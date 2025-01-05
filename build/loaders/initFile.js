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
const utils_1 = require("../shared/utils");
const rootPath = process.env.QL_DIR;
let dataPath = path_1.default.join(rootPath, 'data/');
if (process.env.QL_DATA_DIR) {
    dataPath = process.env.QL_DATA_DIR.replace(/\/$/g, '');
}
const preloadPath = path_1.default.join(rootPath, 'shell/preload/');
const configPath = path_1.default.join(dataPath, 'config/');
const scriptPath = path_1.default.join(dataPath, 'scripts/');
const logPath = path_1.default.join(dataPath, 'log/');
const uploadPath = path_1.default.join(dataPath, 'upload/');
const bakPath = path_1.default.join(dataPath, 'bak/');
const samplePath = path_1.default.join(rootPath, 'sample/');
const tmpPath = path_1.default.join(logPath, '.tmp/');
const confFile = path_1.default.join(configPath, 'config.sh');
const sampleConfigFile = path_1.default.join(samplePath, 'config.sample.sh');
const sampleTaskShellFile = path_1.default.join(samplePath, 'task.sample.sh');
const sampleNotifyJsFile = path_1.default.join(samplePath, 'notify.js');
const sampleNotifyPyFile = path_1.default.join(samplePath, 'notify.py');
const scriptNotifyJsFile = path_1.default.join(scriptPath, 'sendNotify.js');
const scriptNotifyPyFile = path_1.default.join(scriptPath, 'notify.py');
const jsNotifyFile = path_1.default.join(preloadPath, 'notify.js');
const pyNotifyFile = path_1.default.join(preloadPath, 'notify.py');
const TaskBeforeFile = path_1.default.join(configPath, 'task_before.sh');
const TaskBeforeJsFile = path_1.default.join(configPath, 'task_before.js');
const TaskBeforePyFile = path_1.default.join(configPath, 'task_before.py');
const TaskAfterFile = path_1.default.join(configPath, 'task_after.sh');
const homedir = os_1.default.homedir();
const sshPath = path_1.default.resolve(homedir, '.ssh');
const sshdPath = path_1.default.join(dataPath, 'ssh.d');
const systemLogPath = path_1.default.join(dataPath, 'syslog');
const directories = [
    configPath,
    scriptPath,
    preloadPath,
    logPath,
    tmpPath,
    uploadPath,
    sshPath,
    bakPath,
    sshdPath,
    systemLogPath,
];
const files = [
    {
        target: confFile,
        source: sampleConfigFile,
        checkExistence: true,
    },
    {
        target: jsNotifyFile,
        source: sampleNotifyJsFile,
        checkExistence: false,
    },
    {
        target: pyNotifyFile,
        source: sampleNotifyPyFile,
        checkExistence: false,
    },
    {
        target: scriptNotifyJsFile,
        source: sampleNotifyJsFile,
        checkExistence: true,
    },
    {
        target: scriptNotifyPyFile,
        source: sampleNotifyPyFile,
        checkExistence: true,
    },
    {
        target: TaskBeforeFile,
        source: sampleTaskShellFile,
        checkExistence: true,
    },
    {
        target: TaskBeforeJsFile,
        content: '// The JavaScript code that executes before the JavaScript task execution will execute.',
        checkExistence: true,
    },
    {
        target: TaskBeforePyFile,
        content: '# The Python code that executes before the Python task execution will execute.',
        checkExistence: true,
    },
    {
        target: TaskAfterFile,
        source: sampleTaskShellFile,
        checkExistence: true,
    },
];
exports.default = async () => {
    for (const dirPath of directories) {
        if (!(await (0, util_1.fileExist)(dirPath))) {
            await promises_1.default.mkdir(dirPath);
        }
    }
    for (const item of files) {
        const exists = await (0, util_1.fileExist)(item.target);
        if (!item.checkExistence || !exists) {
            if (!item.content && !item.source) {
                throw new Error(`Neither content nor source specified for ${item.target}`);
            }
            const content = item.content || (await promises_1.default.readFile(item.source));
            await (0, utils_1.writeFileWithLock)(item.target, content);
        }
    }
    logger_1.default.info('✌️ Init file down');
    console.log('✌️ Init file down');
};
//# sourceMappingURL=initFile.js.map