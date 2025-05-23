"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDemoEnv = exports.getUninstallCommand = exports.getInstallCommand = exports.getGetCommand = exports.setSystemTimezone = exports.rmPath = exports.safeJSONParse = exports.getUniqPath = exports.parseContentVersion = exports.parseVersion = exports.getPid = exports.killTask = exports.psTree = exports.parseBody = exports.parseHeaders = exports.promiseExecSuccess = exports.promiseExec = exports.readDir = exports.readDirs = exports.dirSort = exports.concurrentRun = exports.handleLogPath = exports.createFile = exports.fileExist = exports.getPlatform = exports.getToken = exports.getLastModifyFilePath = exports.removeAnsi = exports.getFileContentByName = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const ps_tree_1 = __importDefault(require("ps-tree"));
const util_1 = require("util");
const js_yaml_1 = require("js-yaml");
const index_1 = __importDefault(require("./index"));
const const_1 = require("./const");
const logger_1 = __importDefault(require("../loaders/logger"));
const utils_1 = require("../shared/utils");
const dependence_1 = require("../data/dependence");
const undici_1 = require("undici");
__exportStar(require("./share"), exports);
async function getFileContentByName(fileName) {
    const _exsit = await fileExist(fileName);
    if (_exsit) {
        return await fs.readFile(fileName, 'utf8');
    }
    return '';
}
exports.getFileContentByName = getFileContentByName;
function removeAnsi(text) {
    return text.replace(/\x1b\[\d+m/g, '');
}
exports.removeAnsi = removeAnsi;
async function getLastModifyFilePath(dir) {
    let filePath = '';
    const _exsit = await fileExist(dir);
    if (_exsit) {
        const arr = await fs.readdir(dir);
        arr.forEach(async (item) => {
            const fullpath = path.join(dir, item);
            const stats = await fs.lstat(fullpath);
            if (stats.isFile()) {
                if (stats.mtimeMs >= 0) {
                    filePath = fullpath;
                }
            }
        });
    }
    return filePath;
}
exports.getLastModifyFilePath = getLastModifyFilePath;
function getToken(req) {
    const { authorization = '' } = req.headers;
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
        return authorization
            .replace('Bearer ', '')
            .replace('mobile-', '')
            .replace('desktop-', '');
    }
    return '';
}
exports.getToken = getToken;
function getPlatform(userAgent) {
    const ua = userAgent.toLowerCase();
    const testUa = (regexp) => regexp.test(ua);
    const testVs = (regexp) => (ua.match(regexp) || [])
        .toString()
        .replace(/[^0-9|_.]/g, '')
        .replace(/_/g, '.');
    // 系统
    let system = 'unknow';
    if (testUa(/windows|win32|win64|wow32|wow64/g)) {
        system = 'windows'; // windows系统
    }
    else if (testUa(/macintosh|macintel/g)) {
        system = 'macos'; // macos系统
    }
    else if (testUa(/x11/g)) {
        system = 'linux'; // linux系统
    }
    else if (testUa(/android|adr/g)) {
        system = 'android'; // android系统
    }
    else if (testUa(/ios|iphone|ipad|ipod|iwatch/g)) {
        system = 'ios'; // ios系统
    }
    else if (testUa(/openharmony/g)) {
        system = 'openharmony'; // openharmony系统
    }
    let platform = 'desktop';
    if (system === 'windows' || system === 'macos' || system === 'linux') {
        platform = 'desktop';
    }
    else if (system === 'android' ||
        system === 'ios' ||
        system === 'openharmony' ||
        testUa(/mobile/g)) {
        platform = 'mobile';
    }
    return platform;
}
exports.getPlatform = getPlatform;
async function fileExist(file) {
    try {
        await fs.access(file);
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.fileExist = fileExist;
async function createFile(file, data = '') {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await (0, utils_1.writeFileWithLock)(file, data);
}
exports.createFile = createFile;
async function handleLogPath(logPath, data = '') {
    const absolutePath = path.resolve(index_1.default.logPath, logPath);
    const logFileExist = await fileExist(absolutePath);
    if (!logFileExist) {
        await createFile(absolutePath, data);
    }
    return absolutePath;
}
exports.handleLogPath = handleLogPath;
async function concurrentRun(fnList = [], max = 5) {
    if (!fnList.length)
        return;
    const replyList = []; // 收集任务执行结果
    const startTime = new Date().getTime(); // 记录任务执行开始时间
    // 任务执行程序
    const schedule = async (index) => {
        return new Promise(async (resolve) => {
            const fn = fnList[index];
            if (!fn)
                return resolve(null);
            // 执行当前异步任务
            const reply = await fn();
            replyList[index] = reply;
            // 执行完当前任务后，继续执行任务池的剩余任务
            await schedule(index + max);
            resolve(null);
        });
    };
    // 任务池执行程序
    const scheduleList = new Array(max)
        .fill(0)
        .map((_, index) => schedule(index));
    // 使用 Promise.all 批量执行
    const r = await Promise.all(scheduleList);
    const cost = (new Date().getTime() - startTime) / 1000;
    return replyList;
}
exports.concurrentRun = concurrentRun;
var FileType;
(function (FileType) {
    FileType[FileType["directory"] = 0] = "directory";
    FileType[FileType["file"] = 1] = "file";
})(FileType || (FileType = {}));
function dirSort(a, b) {
    if (a.type === 'file' && b.type === 'file') {
        return b.createTime - a.createTime;
    }
    else if (a.type === 'directory' && b.type === 'directory') {
        return a.title.localeCompare(b.title);
    }
    else {
        return a.type === 'directory' ? -1 : 1;
    }
}
exports.dirSort = dirSort;
async function readDirs(dir, baseDir = '', blacklist = [], sort = dirSort) {
    const relativePath = path.relative(baseDir, dir);
    const files = await fs.readdir(dir);
    const result = [];
    for (const file of files) {
        const subPath = path.join(dir, file);
        const stats = await fs.lstat(subPath);
        const key = path.join(relativePath, file);
        if (blacklist.includes(file) || stats.isSymbolicLink()) {
            continue;
        }
        if (stats.isDirectory()) {
            const children = await readDirs(subPath, baseDir, blacklist, sort);
            result.push({
                title: file,
                key,
                type: 'directory',
                parent: relativePath,
                createTime: stats.birthtime.getTime(),
                children: children.sort(sort),
            });
        }
        else {
            result.push({
                title: file,
                type: 'file',
                key,
                parent: relativePath,
                size: stats.size,
                createTime: stats.birthtime.getTime(),
            });
        }
    }
    return result.sort(sort);
}
exports.readDirs = readDirs;
async function readDir(dir, baseDir = '', blacklist = []) {
    const absoluteDir = path.join(baseDir, dir);
    const relativePath = path.relative(baseDir, absoluteDir);
    try {
        const files = await fs.readdir(absoluteDir);
        const result = [];
        for (const file of files) {
            const subPath = path.join(absoluteDir, file);
            const stats = await fs.lstat(subPath);
            const key = path.join(relativePath, file);
            if (blacklist.includes(file) || stats.isSymbolicLink()) {
                continue;
            }
            if (stats.isDirectory()) {
                result.push({
                    title: file,
                    type: 'directory',
                    key,
                    parent: relativePath,
                    createTime: stats.birthtime.getTime(),
                    children: [],
                });
            }
            else {
                result.push({
                    title: file,
                    type: 'file',
                    key,
                    parent: relativePath,
                    size: stats.size,
                    createTime: stats.birthtime.getTime(),
                });
            }
        }
        return result;
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}
exports.readDir = readDir;
async function promiseExec(command) {
    try {
        const { stderr, stdout } = await (0, util_1.promisify)(child_process_1.exec)(command, {
            maxBuffer: 200 * 1024 * 1024,
            encoding: 'utf8',
        });
        return stdout || stderr;
    }
    catch (error) {
        return JSON.stringify(error);
    }
}
exports.promiseExec = promiseExec;
async function promiseExecSuccess(command) {
    try {
        const { stdout } = await (0, util_1.promisify)(child_process_1.exec)(command, {
            maxBuffer: 200 * 1024 * 1024,
            encoding: 'utf8',
        });
        return stdout || '';
    }
    catch (error) {
        return '';
    }
}
exports.promiseExecSuccess = promiseExecSuccess;
function parseHeaders(headers) {
    if (!headers)
        return {};
    const parsed = {};
    let key;
    let val;
    let i;
    headers &&
        headers.split('\n').forEach(function parser(line) {
            i = line.indexOf(':');
            key = line.substring(0, i).trim().toLowerCase();
            val = line.substring(i + 1).trim();
            if (!key) {
                return;
            }
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        });
    return parsed;
}
exports.parseHeaders = parseHeaders;
function parseString(input, valueFormatFn) {
    const regex = /(\w+):\s*((?:(?!\n\w+:).)*)/g;
    const matches = {};
    let match;
    while ((match = regex.exec(input)) !== null) {
        const [, key, value] = match;
        const _key = key.trim();
        if (!_key || matches[_key]) {
            continue;
        }
        let _value = value.trim();
        try {
            _value = valueFormatFn ? valueFormatFn(_value) : _value;
            const jsonValue = JSON.parse(_value);
            matches[_key] = jsonValue;
        }
        catch (error) {
            matches[_key] = _value;
        }
    }
    return matches;
}
function parseBody(body, contentType, valueFormatFn) {
    if (contentType === 'text/plain' || !body) {
        return valueFormatFn && body ? valueFormatFn(body) : body;
    }
    const parsed = parseString(body, valueFormatFn);
    switch (contentType) {
        case 'multipart/form-data':
            return Object.keys(parsed).reduce((p, c) => {
                p.append(c, parsed[c]);
                return p;
            }, new undici_1.FormData());
        case 'application/x-www-form-urlencoded':
            return Object.keys(parsed).reduce((p, c) => {
                return p ? `${p}&${c}=${parsed[c]}` : `${c}=${parsed[c]}`;
            });
    }
    return parsed;
}
exports.parseBody = parseBody;
function psTree(pid) {
    return new Promise((resolve, reject) => {
        (0, ps_tree_1.default)(pid, (err, children) => {
            if (err) {
                reject(err);
            }
            resolve(children.map((x) => Number(x.PID)).filter((x) => !isNaN(x)));
        });
    });
}
exports.psTree = psTree;
async function killTask(pid) {
    const pids = await psTree(pid);
    if (pids.length) {
        try {
            [pid, ...pids].reverse().forEach((x) => {
                process.kill(x, 15);
            });
        }
        catch (error) { }
    }
    else {
        process.kill(pid, 2);
    }
}
exports.killTask = killTask;
async function getPid(cmd) {
    const taskCommand = `ps -eo pid,command | grep "${cmd}" | grep -v grep | awk '{print $1}' | head -1 | xargs echo -n`;
    const pid = await promiseExec(taskCommand);
    return pid ? Number(pid) : undefined;
}
exports.getPid = getPid;
async function parseVersion(path) {
    return (0, js_yaml_1.load)(await fs.readFile(path, 'utf8'));
}
exports.parseVersion = parseVersion;
function parseContentVersion(content) {
    return (0, js_yaml_1.load)(content);
}
exports.parseContentVersion = parseContentVersion;
async function getUniqPath(command, id) {
    let suffix = '';
    if (/^\d+$/.test(id)) {
        suffix = `_${id}`;
    }
    let items = command.split(/ +/);
    const maxTimeCommandIndex = items.findIndex((x) => x === '-m');
    if (maxTimeCommandIndex !== -1) {
        items = items.slice(maxTimeCommandIndex + 2);
    }
    let str = items[0];
    if (items[0] === const_1.TASK_COMMAND) {
        str = items[1];
    }
    const dotIndex = str.lastIndexOf('.');
    if (dotIndex !== -1) {
        str = str.slice(0, dotIndex);
    }
    const slashIndex = str.lastIndexOf('/');
    let tempStr = '';
    if (slashIndex !== -1) {
        tempStr = str.slice(0, slashIndex);
        const _slashIndex = tempStr.lastIndexOf('/');
        if (_slashIndex !== -1) {
            tempStr = tempStr.slice(_slashIndex + 1);
        }
        str = `${tempStr}_${str.slice(slashIndex + 1)}`;
    }
    return `${str}${suffix}`;
}
exports.getUniqPath = getUniqPath;
function safeJSONParse(value) {
    if (!value) {
        return {};
    }
    try {
        return JSON.parse(value);
    }
    catch (error) {
        logger_1.default.error('[safeJSONParse失败]', error);
        return {};
    }
}
exports.safeJSONParse = safeJSONParse;
async function rmPath(path) {
    try {
        const _exsit = await fileExist(path);
        if (_exsit) {
            await fs.rm(path, { force: true, recursive: true, maxRetries: 5 });
        }
    }
    catch (error) {
        logger_1.default.error('[rmPath失败]', error);
    }
}
exports.rmPath = rmPath;
async function setSystemTimezone(timezone) {
    try {
        if (!(await fileExist(`/usr/share/zoneinfo/${timezone}`))) {
            throw new Error('Invalid timezone');
        }
        await promiseExec(`ln -sf /usr/share/zoneinfo/${timezone} /etc/localtime`);
        await promiseExec(`echo "${timezone}" > /etc/timezone`);
        return true;
    }
    catch (error) {
        logger_1.default.error('[setSystemTimezone失败]', error);
        return false;
    }
}
exports.setSystemTimezone = setSystemTimezone;
function getGetCommand(type, name) {
    const baseCommands = {
        [dependence_1.DependenceTypes.nodejs]: `pnpm ls -g  | grep "${name}" | head -1`,
        [dependence_1.DependenceTypes.python3]: `
    python3 -c "exec('''
name='${name}'
try:
    from importlib.metadata import version
    print(version(name))
except:
    import importlib.util as u
    import importlib.metadata as m
    spec=u.find_spec(name)
    print(name if spec else '')
''')"`,
        [dependence_1.DependenceTypes.linux]: `apk info -es ${name}`,
    };
    return baseCommands[type];
}
exports.getGetCommand = getGetCommand;
function getInstallCommand(type, name) {
    const baseCommands = {
        [dependence_1.DependenceTypes.nodejs]: 'pnpm add -g',
        [dependence_1.DependenceTypes.python3]: 'pip3 install --disable-pip-version-check --root-user-action=ignore',
        [dependence_1.DependenceTypes.linux]: 'apk add --no-check-certificate',
    };
    let command = baseCommands[type];
    if (type === dependence_1.DependenceTypes.python3 && const_1.PYTHON_INSTALL_DIR) {
        command = `${command} --prefix=${const_1.PYTHON_INSTALL_DIR}`;
    }
    return `${command} ${name.trim()}`;
}
exports.getInstallCommand = getInstallCommand;
function getUninstallCommand(type, name) {
    const baseCommands = {
        [dependence_1.DependenceTypes.nodejs]: 'pnpm remove -g',
        [dependence_1.DependenceTypes.python3]: 'pip3 uninstall --disable-pip-version-check --root-user-action=ignore -y',
        [dependence_1.DependenceTypes.linux]: 'apk del',
    };
    return `${baseCommands[type]} ${name.trim()}`;
}
exports.getUninstallCommand = getUninstallCommand;
function isDemoEnv() {
    return process.env.DeployEnv === 'demo';
}
exports.isDemoEnv = isDemoEnv;
//# sourceMappingURL=util.js.map