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
exports.updateLinuxMirrorFile = exports.detectOS = exports.isDemoEnv = exports.getUninstallCommand = exports.getInstallCommand = exports.getGetCommand = exports.isPythonSourceDependency = exports.setSystemTimezone = exports.rmPath = exports.errStack = exports.safeJSONParse = exports.getUniqPath = exports.parseContentVersion = exports.parseVersion = exports.killAllTasks = exports.getAllPids = exports.getPid = exports.killTask = exports.psTree = exports.parseBody = exports.parseHeaders = exports.promiseExecSuccess = exports.promiseExec = exports.readDir = exports.readDirs = exports.dirSort = exports.concurrentRun = exports.handleLogPath = exports.createFile = exports.fileExist = exports.getPlatform = exports.getToken = exports.getLastModifyFilePath = exports.removeAnsi = exports.getFileContentByName = void 0;
const fs = __importStar(require("fs/promises"));
const fs_1 = require("fs");
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
const os_1 = __importDefault(require("os"));
const container_1 = require("./container");
const shellQuote_1 = require("../shared/shellQuote");
const fileAccess_1 = require("../shared/fileAccess");
const linuxMirror_1 = require("../shared/linuxMirror");
__exportStar(require("./share"), exports);
let osType;
function getOsTypeSync() {
    var _a;
    // 1. 环境变量覆盖
    const envOs = (_a = process.env.QL_OS_TYPE) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (envOs === 'alpine')
        return 'Alpine';
    if (envOs === 'debian')
        return 'Debian';
    if (envOs === 'ubuntu')
        return 'Ubuntu';
    // 2. 模块缓存（由 detectOS 设置）
    if (osType)
        return osType;
    // 3. 能力检测：检查包管理器二进制
    try {
        (0, child_process_1.execSync)('which apt-get', { stdio: 'ignore' });
        return 'Debian';
    }
    catch (_b) {
        try {
            (0, child_process_1.execSync)('which apk', { stdio: 'ignore' });
            return 'Alpine';
        }
        catch (_c) {
            // macOS / 未知系统
        }
    }
    return undefined;
}
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
    const absolutePath = (0, fileAccess_1.resolveFileAccess)(index_1.default.logPath, [logPath]);
    if (!absolutePath)
        throw new Error('Log path is outside the log directory');
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
const FILE_SYSTEM_READ_CONCURRENCY = 32;
function createFileSystemTaskRunner(concurrency) {
    let activeCount = 0;
    const queue = [];
    const runNext = () => {
        var _a;
        while (activeCount < concurrency && queue.length > 0) {
            activeCount += 1;
            (_a = queue.shift()) === null || _a === void 0 ? void 0 : _a();
        }
    };
    return (task) => new Promise((resolve, reject) => {
        queue.push(() => {
            task()
                .then(resolve, reject)
                .finally(() => {
                activeCount -= 1;
                runNext();
            });
        });
        runNext();
    });
}
async function readDirsWithRunner(dir, baseDir, blacklist, sort, runFileSystemTask) {
    const relativePath = path.relative(baseDir, dir);
    const entries = await runFileSystemTask(() => fs.readdir(dir, { withFileTypes: true }));
    const items = await Promise.all(entries.map(async (entry) => {
        if (blacklist.includes(entry.name) || entry.isSymbolicLink()) {
            return undefined;
        }
        const subPath = path.join(dir, entry.name);
        const stats = await runFileSystemTask(() => fs.lstat(subPath));
        if (stats.isSymbolicLink()) {
            return undefined;
        }
        const key = path.join(relativePath, entry.name);
        if (stats.isDirectory()) {
            const children = await readDirsWithRunner(subPath, baseDir, blacklist, sort, runFileSystemTask);
            return {
                title: entry.name,
                key,
                type: 'directory',
                parent: relativePath,
                createTime: stats.birthtime.getTime(),
                children,
            };
        }
        return {
            title: entry.name,
            type: 'file',
            key,
            parent: relativePath,
            size: stats.size,
            createTime: stats.birthtime.getTime(),
        };
    }));
    return items.filter((item) => Boolean(item)).sort(sort);
}
async function readDirs(dir, baseDir = '', blacklist = [], sort = dirSort) {
    return readDirsWithRunner(dir, baseDir, blacklist, sort, createFileSystemTaskRunner(FILE_SYSTEM_READ_CONCURRENCY));
}
exports.readDirs = readDirs;
async function readDir(dir, baseDir = '', blacklist = []) {
    const absoluteDir = path.resolve(baseDir, dir);
    if (!absoluteDir.startsWith(path.resolve(baseDir))) {
        return [];
    }
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
async function killTask(pid, waitForExit = false) {
    const descendants = await psTree(pid);
    const signal = (target, sig) => {
        try {
            process.kill(target, sig);
        }
        catch (error) {
            if (error.code !== 'ESRCH')
                throw error;
        }
    };
    if (!waitForExit) {
        if (descendants.length) {
            // A child may exit after psTree; keep signalling the remaining tree.
            for (const target of [pid, ...descendants].reverse()) {
                signal(target, 'SIGTERM');
            }
        }
        else
            signal(pid, 'SIGINT');
        return;
    }
    const pids = [...descendants.reverse(), pid];
    for (const target of pids)
        signal(target, 'SIGTERM');
    const alive = async (target) => {
        try {
            process.kill(target, 0);
        }
        catch (error) {
            if (error.code === 'ESRCH')
                return false;
            throw error;
        }
        if (process.platform === 'linux') {
            try {
                const stat = await fs.readFile(`/proc/${target}/stat`, 'utf8');
                // The command field may contain spaces and parentheses. Zombies have
                // exited even while their parent has not reaped the PID yet.
                const state = stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0];
                if (['Z', 'X', 'x'].includes(state))
                    return false;
            }
            catch (_a) {
                // /proc may be unavailable, or the process may have just exited.
                // Retain the portable signal probe rather than assuming it is dead.
                try {
                    process.kill(target, 0);
                }
                catch (error) {
                    if (error.code === 'ESRCH')
                        return false;
                    throw error;
                }
            }
        }
        return true;
    };
    const wait = async () => {
        const deadline = Date.now() + 1000;
        let remaining = pids;
        while (true) {
            const states = await Promise.all(remaining.map(alive));
            remaining = remaining.filter((_, index) => states[index]);
            if (!remaining.length || Date.now() >= deadline)
                return remaining;
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
    };
    let remaining = await wait();
    if (!remaining.length)
        return;
    for (const target of remaining)
        signal(target, 'SIGKILL');
    remaining = await wait();
    if (remaining.length)
        throw new Error(`Task processes did not exit: ${remaining.join(', ')}`);
}
exports.killTask = killTask;
async function getPid(cmd) {
    const taskCommand = `ps -eo pid,command | grep "${cmd}" | grep -v grep | awk '{print $1}' | head -1 | xargs echo -n`;
    const pid = await promiseExec(taskCommand);
    return pid ? Number(pid) : undefined;
}
exports.getPid = getPid;
async function getAllPids(cmd) {
    const taskCommand = `ps -eo pid,command | grep "${cmd}" | grep -v grep | awk '{print $1}'`;
    const pidsStr = await promiseExec(taskCommand);
    if (!pidsStr)
        return [];
    return pidsStr
        .split('\n')
        .map((p) => Number(p.trim()))
        .filter((p) => !isNaN(p) && p > 0);
}
exports.getAllPids = getAllPids;
async function killAllTasks(cmd) {
    const pids = await getAllPids(cmd);
    for (const pid of pids) {
        try {
            await killTask(pid);
        }
        catch (error) {
            // Ignore errors if process already terminated
        }
    }
}
exports.killAllTasks = killAllTasks;
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
        logger_1.default.error('[safeJSONParse error]', error);
        return {};
    }
}
exports.safeJSONParse = safeJSONParse;
var errors_1 = require("../shared/errors");
Object.defineProperty(exports, "errStack", { enumerable: true, get: function () { return errors_1.errStack; } });
async function rmPath(path) {
    try {
        const _exsit = await fileExist(path);
        if (_exsit) {
            await fs.rm(path, { force: true, recursive: true, maxRetries: 5 });
        }
    }
    catch (error) {
        logger_1.default.error('[rmPath error]', error);
    }
}
exports.rmPath = rmPath;
async function setSystemTimezone(timezone) {
    try {
        if (!(await fileExist(`/usr/share/zoneinfo/${timezone}`))) {
            throw new Error('Invalid timezone');
        }
        await promiseExec((0, container_1.maybeSudo)(`ln -sf /usr/share/zoneinfo/${timezone} /etc/localtime`));
        await promiseExec(`echo "${timezone}" | ${(0, container_1.maybeSudo)('tee /etc/timezone')}`);
        return true;
    }
    catch (error) {
        logger_1.default.error('[setSystemTimezone error]', error);
        return false;
    }
}
exports.setSystemTimezone = setSystemTimezone;
// Helper function to check if a name is a GitHub URL
function getPythonExecutable() {
    return const_1.PYTHON_VENV_DIR
        ? (0, shellQuote_1.shellQuote)(path.resolve(index_1.default.rootPath, const_1.PYTHON_VENV_DIR, 'bin/python3'))
        : 'python3';
}
function getPythonPip() {
    return const_1.PYTHON_VENV_DIR ? `${getPythonExecutable()} -m pip` : 'pip3';
}
function isGitHubUrl(name) {
    // Support git+https://, git+http://, https://, and http:// URLs
    // This covers GitHub URLs and other git-compatible repositories
    return !!name.match(/^(git\+https?:\/\/|https?:\/\/)/i);
}
// Helper function to check if a name is a requirements file
function isRequirementsFile(name) {
    return !!name.match(/requirements.*\.(txt|in)$/i);
}
// Helper function to check if a name is a pyproject.toml file
function isPyprojectToml(name) {
    return name.endsWith('pyproject.toml');
}
function isPythonSourceDependency(name) {
    const source = name.trim();
    return (isGitHubUrl(source) || isRequirementsFile(source) || isPyprojectToml(source));
}
exports.isPythonSourceDependency = isPythonSourceDependency;
function getGetCommand(type, name) {
    const trimmedName = name.trim();
    // For Python dependencies installed from GitHub or requirements files,
    // we can't reliably check if they're installed, so skip the check
    if (type === dependence_1.DependenceTypes.python3) {
        if (isPythonSourceDependency(trimmedName)) {
            // Return a command that will always indicate not installed
            // This ensures GitHub URLs and requirements files are always installed
            return 'echo ""';
        }
    }
    const baseCommands = {
        [dependence_1.DependenceTypes.nodejs]: `pnpm ls -g  | grep "${trimmedName}" | head -1`,
        [dependence_1.DependenceTypes.python3]: `${getPythonExecutable()} -c ${(0, shellQuote_1.shellQuote)(`from importlib.metadata import version, PackageNotFoundError
import importlib.util
import sys
try:
 try:
  from packaging.requirements import Requirement
 except ImportError:
  from pip._vendor.packaging.requirements import Requirement
 requirement = Requirement(sys.argv[1])
 if requirement.marker and not requirement.marker.evaluate():
  print('not applicable')
 else:
  try:
   installed = version(requirement.name)
  except PackageNotFoundError:
   if not requirement.specifier and not requirement.extras and not requirement.url:
    if importlib.util.find_spec(requirement.name):
     print(requirement.name)
  else:
   if requirement.specifier.contains(installed, prereleases=True):
    print(installed)
except Exception:
 pass`)} ${(0, shellQuote_1.shellQuote)(trimmedName)}`,
        [dependence_1.DependenceTypes.linux]: getOsTypeSync() === 'Alpine'
            ? `apk info -es ${trimmedName}`
            : (0, container_1.maybeSudo)(`dpkg-query -s ${trimmedName}`),
    };
    return baseCommands[type];
}
exports.getGetCommand = getGetCommand;
function getInstallCommand(type, name) {
    if (type === dependence_1.DependenceTypes.python3) {
        const prefix = const_1.PYTHON_INSTALL_DIR && !const_1.PYTHON_VENV_DIR
            ? ` --prefix=${(0, shellQuote_1.shellQuote)(const_1.PYTHON_INSTALL_DIR)}`
            : '';
        const pip = `${getPythonPip()} install --disable-pip-version-check${const_1.PYTHON_VENV_DIR ? '' : ' --root-user-action=ignore'}${prefix}`;
        name = name.trim();
        if (isRequirementsFile(name) || isPyprojectToml(name)) {
            const file = [index_1.default.scriptPath, index_1.default.repoPath]
                .filter(Boolean)
                .map((root) => (0, fileAccess_1.resolveFileAccess)(root, [name]))
                .find((file) => {
                if (!file)
                    return false;
                try {
                    return (0, fs_1.statSync)(file).isFile();
                }
                catch (_a) {
                    return false;
                }
            });
            if (!file)
                throw new Error('Python dependency file must be inside scripts or repo');
            return isRequirementsFile(name)
                ? `${pip} -r ${(0, shellQuote_1.shellQuote)(file)}`
                : `${pip} ${(0, shellQuote_1.shellQuote)(path.dirname(file))}`;
        }
        return `${pip} -- ${(0, shellQuote_1.shellQuote)(name)}`;
    }
    const baseCommands = {
        [dependence_1.DependenceTypes.nodejs]: 'pnpm add -g',
        [dependence_1.DependenceTypes.linux]: getOsTypeSync() === 'Alpine'
            ? 'apk add --no-check-certificate'
            : (0, container_1.maybeSudo)('apt-get install -y'),
    };
    return `${baseCommands[type]} ${name.trim()}`;
}
exports.getInstallCommand = getInstallCommand;
function getUninstallCommand(type, name) {
    var _a;
    if (type === dependence_1.DependenceTypes.python3) {
        name = name.trim();
        if (isRequirementsFile(name)) {
            const file = [index_1.default.scriptPath, index_1.default.repoPath]
                .filter(Boolean)
                .map((root) => (0, fileAccess_1.resolveFileAccess)(root, [name]))
                .find((file) => {
                if (!file)
                    return false;
                try {
                    return (0, fs_1.statSync)(file).isFile();
                }
                catch (_a) {
                    return false;
                }
            });
            if (!file)
                throw new Error('Python dependency file must be inside scripts or repo');
            return `${getPythonPip()} uninstall --disable-pip-version-check${const_1.PYTHON_VENV_DIR ? '' : ' --root-user-action=ignore'} -y -r ${(0, shellQuote_1.shellQuote)(file)}`;
        }
        if (isPyprojectToml(name) || isGitHubUrl(name)) {
            // A source URL/project can install several distributions and has no safe
            // inverse. Removing its panel entry leaves installed packages intact.
            return `printf '%s\\n' ${(0, shellQuote_1.shellQuote)('Remove installed Python distributions separately by package name.')}`;
        }
        const packageName = ((_a = name.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]+\])?(?=\s*(?:[<>=!~;@]|$))/)) === null || _a === void 0 ? void 0 : _a[1]) || name;
        return `${getPythonPip()} uninstall --disable-pip-version-check${const_1.PYTHON_VENV_DIR ? '' : ' --root-user-action=ignore'} -y -- ${(0, shellQuote_1.shellQuote)(packageName)}`;
    }
    const baseCommands = {
        [dependence_1.DependenceTypes.nodejs]: 'pnpm remove -g',
        [dependence_1.DependenceTypes.linux]: getOsTypeSync() === 'Alpine' ? 'apk del' : (0, container_1.maybeSudo)('apt-get remove -y'),
    };
    return `${baseCommands[type]} ${name.trim()}`;
}
exports.getUninstallCommand = getUninstallCommand;
function isDemoEnv() {
    return process.env.DeployEnv === 'demo';
}
exports.isDemoEnv = isDemoEnv;
async function getOSReleaseInfo() {
    const osRelease = await fs.readFile('/etc/os-release', 'utf8');
    return osRelease;
}
function isDebian(osReleaseInfo) {
    return osReleaseInfo.includes('Debian');
}
function isUbuntu(osReleaseInfo) {
    return osReleaseInfo.includes('Ubuntu');
}
function isCentOS(osReleaseInfo) {
    return osReleaseInfo.includes('CentOS') || osReleaseInfo.includes('Red Hat');
}
function isAlpine(osReleaseInfo) {
    return osReleaseInfo.includes('Alpine');
}
async function detectOS() {
    var _a;
    if (osType)
        return osType;
    const envOs = (_a = process.env.QL_OS_TYPE) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (envOs === 'alpine') {
        osType = 'Alpine';
        return osType;
    }
    if (envOs === 'debian') {
        osType = 'Debian';
        return osType;
    }
    if (envOs === 'ubuntu') {
        osType = 'Ubuntu';
        return osType;
    }
    const platform = os_1.default.platform();
    if (platform === 'linux') {
        const osReleaseInfo = await getOSReleaseInfo();
        if (isDebian(osReleaseInfo)) {
            osType = 'Debian';
        }
        else if (isUbuntu(osReleaseInfo)) {
            osType = 'Ubuntu';
        }
        else if (isAlpine(osReleaseInfo)) {
            osType = 'Alpine';
        }
        else {
            logger_1.default.error(`Unknown Linux Distribution: ${osReleaseInfo}`);
            console.error(`Unknown Linux Distribution: ${osReleaseInfo}`);
        }
    }
    else if (platform === 'darwin') {
        osType = undefined;
    }
    else {
        logger_1.default.error(`Unsupported platform: ${platform}`);
        console.error(`Unsupported platform: ${platform}`);
    }
    return osType;
}
exports.detectOS = detectOS;
async function _updateLinuxMirror(osType, mirror) {
    var _a, _b;
    const defaults = {
        Debian: 'http://deb.debian.org/debian',
        Ubuntu: 'http://archive.ubuntu.com/ubuntu',
        Alpine: 'http://dl-cdn.alpinelinux.org/alpine',
    };
    if (!defaults[osType])
        throw new Error('Unsupported OS type for updating mirrors.');
    const target = mirror || defaults[osType];
    (0, linuxMirror_1.normalizeMirror)(target);
    const S = osType !== 'Alpine' && (0, container_1.isInContainer)() ? 'sudo ' : '';
    const update = osType === 'Alpine' ? 'apk update' : `${S}apt-get update --error-on=any`;
    let file = osType === 'Alpine'
        ? '/etc/apk/repositories'
        : `/etc/apt/sources.list.d/${osType.toLowerCase()}.sources`;
    let content = '';
    try {
        content = await fs.readFile(file, 'utf8');
    }
    catch (error) {
        if (error.code !== 'ENOENT')
            throw error;
        if (osType !== 'Alpine') {
            try {
                file = '/etc/apt/sources.list';
                content = await fs.readFile(file, 'utf8');
            }
            catch (legacyError) {
                if (legacyError.code !== 'ENOENT')
                    throw legacyError;
                file = `/etc/apt/sources.list.d/${osType.toLowerCase()}.sources`;
            }
        }
    }
    if (!content.trim()) {
        const release = await fs.readFile('/etc/os-release', 'utf8');
        if (osType === 'Alpine') {
            const version = (_a = release.match(/^VERSION_ID=["']?(\d+\.\d+)/m)) === null || _a === void 0 ? void 0 : _a[1];
            if (!version)
                throw new Error('Cannot determine Alpine repository version');
            content = `${defaults.Alpine}/v${version}/main\n${defaults.Alpine}/v${version}/community\n`;
        }
        else {
            // The fallback may have read an empty legacy .list. Deb822 stanzas must
            // be written to a .sources file, leaving the legacy file untouched.
            file = `/etc/apt/sources.list.d/${osType.toLowerCase()}.sources`;
            const codename = (_b = release.match(/^VERSION_CODENAME=["']?([\w-]+)/m)) === null || _b === void 0 ? void 0 : _b[1];
            if (!codename)
                throw new Error('Cannot determine APT repository codename');
            const ubuntu = osType === 'Ubuntu';
            content = `Types: deb\nURIs: ${defaults[osType]}\nSuites: ${codename} ${codename}-updates${ubuntu ? ` ${codename}-backports` : ''}\nComponents: ${ubuntu ? 'main restricted universe multiverse' : 'main'}\nSigned-By: /usr/share/keyrings/${osType.toLowerCase()}-archive-keyring.gpg\n`;
            if (!ubuntu)
                content += `\nTypes: deb\nURIs: http://security.debian.org/debian-security\nSuites: ${codename}-security\nComponents: main\nSigned-By: /usr/share/keyrings/debian-archive-keyring.gpg\n`;
        }
    }
    return (0, linuxMirror_1.mirrorWriteCommand)(file, (0, linuxMirror_1.rewriteMirrorSources)(content, target), S, update);
}
async function updateLinuxMirrorFile(mirror) {
    const detectedOS = await detectOS();
    if (!detectedOS) {
        throw Error(`Unknown Linux Distribution`);
    }
    return await _updateLinuxMirror(detectedOS, mirror);
}
exports.updateLinuxMirrorFile = updateLinuxMirrorFile;
//# sourceMappingURL=util.js.map