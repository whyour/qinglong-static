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
exports.safeJSONParse = exports.getUniqPath = exports.parseContentVersion = exports.parseVersion = exports.getPid = exports.killTask = exports.psTree = exports.parseBody = exports.parseHeaders = exports.promiseExecSuccess = exports.promiseExec = exports.emptyDir = exports.readDir = exports.readDirs = exports.dirSort = exports.concurrentRun = exports.handleLogPath = exports.createFile = exports.fileExist = exports.getPlatform = exports.getNetIp = exports.getToken = exports.getLastModifyFilePath = exports.getFileContentByName = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const got_1 = __importDefault(require("got"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const child_process_1 = require("child_process");
const form_data_1 = __importDefault(require("form-data"));
const pstree_remy_1 = __importDefault(require("pstree.remy"));
const util_1 = require("util");
const js_yaml_1 = require("js-yaml");
const index_1 = __importDefault(require("./index"));
const const_1 = require("./const");
const logger_1 = __importDefault(require("../loaders/logger"));
__exportStar(require("./share"), exports);
function getFileContentByName(fileName) {
    if (fs.existsSync(fileName)) {
        return fs.readFileSync(fileName, 'utf8');
    }
    return '';
}
exports.getFileContentByName = getFileContentByName;
function getLastModifyFilePath(dir) {
    let filePath = '';
    if (fs.existsSync(dir)) {
        const arr = fs.readdirSync(dir);
        arr.forEach((item) => {
            const fullpath = path.join(dir, item);
            const stats = fs.statSync(fullpath);
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
async function getNetIp(req) {
    const ipArray = [
        ...new Set([
            ...(req.headers['x-real-ip'] || '').split(','),
            ...(req.headers['x-forwarded-for'] || '').split(','),
            req.ip,
            ...req.ips,
            req.socket.remoteAddress,
        ]),
    ];
    let ip = ipArray[0];
    if (ipArray.length > 1) {
        for (let i = 0; i < ipArray.length; i++) {
            const ipNumArray = ipArray[i].split('.');
            const tmp = ipNumArray[0] + '.' + ipNumArray[1];
            if (tmp === '192.168' ||
                (ipNumArray[0] === '172' &&
                    ipNumArray[1] >= 16 &&
                    ipNumArray[1] <= 32) ||
                tmp === '10.7' ||
                tmp === '127.0') {
                continue;
            }
            ip = ipArray[i];
            break;
        }
    }
    ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
    if (ip.includes('127.0') || ip.includes('192.168') || ip.includes('10.7')) {
        ip = '';
    }
    if (!ip) {
        return { address: `获取失败`, ip };
    }
    try {
        const baiduApi = got_1.default
            .get(`https://www.cip.cc/${ip}`, { timeout: 10000, retry: 0 })
            .text();
        const ipApi = got_1.default
            .get(`https://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`, {
            timeout: 10000,
            retry: 0,
        })
            .buffer();
        const [data, ipApiBody] = await await Promise.all([baiduApi, ipApi]);
        const ipRegx = /.*IP	:(.*)\n/;
        const addrRegx = /.*数据二	:(.*)\n/;
        if (data && ipRegx.test(data) && addrRegx.test(data)) {
            const ip = data.match(ipRegx)[1];
            const addr = data.match(addrRegx)[1];
            return { address: addr, ip };
        }
        else if (ipApiBody) {
            const { addr, ip } = JSON.parse(iconv_lite_1.default.decode(ipApiBody, 'GBK'));
            return { address: `${addr}`, ip };
        }
        else {
            return { address: `获取失败`, ip };
        }
    }
    catch (error) {
        return { address: `获取失败`, ip };
    }
}
exports.getNetIp = getNetIp;
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
    let platform = 'desktop';
    if (system === 'windows' || system === 'macos' || system === 'linux') {
        platform = 'desktop';
    }
    else if (system === 'android' || system === 'ios' || testUa(/mobile/g)) {
        platform = 'mobile';
    }
    return platform;
}
exports.getPlatform = getPlatform;
async function fileExist(file) {
    return new Promise((resolve) => {
        try {
            fs.accessSync(file);
            resolve(true);
        }
        catch (error) {
            resolve(false);
        }
    });
}
exports.fileExist = fileExist;
async function createFile(file, data = '') {
    return new Promise((resolve) => {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, data);
        resolve(true);
    });
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
    if (a.type !== b.type) {
        return FileType[a.type] < FileType[b.type] ? -1 : 1;
    }
    else if (a.mtime !== b.mtime) {
        return a.mtime > b.mtime ? -1 : 1;
    }
    else {
        return 0;
    }
}
exports.dirSort = dirSort;
function readDirs(dir, baseDir = '', blacklist = []) {
    const relativePath = path.relative(baseDir, dir);
    const files = fs.readdirSync(dir);
    const result = files
        .filter((x) => !blacklist.includes(x))
        .map((file) => {
        const subPath = path.join(dir, file);
        const stats = fs.statSync(subPath);
        const key = path.join(relativePath, file);
        if (stats.isDirectory()) {
            return {
                title: file,
                key,
                type: 'directory',
                parent: relativePath,
                mtime: stats.mtime.getTime(),
                children: readDirs(subPath, baseDir).sort(dirSort),
            };
        }
        return {
            title: file,
            type: 'file',
            isLeaf: true,
            key,
            parent: relativePath,
            size: stats.size,
            mtime: stats.mtime.getTime(),
        };
    });
    return result.sort(dirSort);
}
exports.readDirs = readDirs;
function readDir(dir, baseDir = '', blacklist = []) {
    const relativePath = path.relative(baseDir, dir);
    const files = fs.readdirSync(dir);
    const result = files
        .filter((x) => !blacklist.includes(x))
        .map((file) => {
        const subPath = path.join(dir, file);
        const stats = fs.statSync(subPath);
        const key = path.join(relativePath, file);
        return {
            title: file,
            type: stats.isDirectory() ? 'directory' : 'file',
            key,
            parent: relativePath,
        };
    });
    return result;
}
exports.readDir = readDir;
async function emptyDir(path) {
    const pathExist = await fileExist(path);
    if (!pathExist) {
        return;
    }
    const files = fs.readdirSync(path);
    for (const file of files) {
        const filePath = `${path}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            await emptyDir(filePath);
        }
        else {
            fs.unlinkSync(filePath);
        }
    }
    fs.rmdirSync(path);
}
exports.emptyDir = emptyDir;
async function promiseExec(command) {
    try {
        const { stderr, stdout } = await (0, util_1.promisify)(child_process_1.exec)(command, { maxBuffer: 200 * 1024 * 1024, encoding: 'utf8' });
        return stdout || stderr;
    }
    catch (error) {
        return JSON.stringify(error);
    }
}
exports.promiseExec = promiseExec;
async function promiseExecSuccess(command) {
    try {
        const { stdout } = await (0, util_1.promisify)(child_process_1.exec)(command, { maxBuffer: 200 * 1024 * 1024, encoding: 'utf8' });
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
function parseBody(body, contentType) {
    if (!body)
        return '';
    const parsed = {};
    let key;
    let val;
    let i;
    body &&
        body.split('\n').forEach(function parser(line) {
            i = line.indexOf(':');
            key = line.substring(0, i).trim().toLowerCase();
            val = line.substring(i + 1).trim();
            if (!key || parsed[key]) {
                return;
            }
            try {
                const jsonValue = JSON.parse(val);
                parsed[key] = jsonValue;
            }
            catch (error) {
                parsed[key] = val;
            }
        });
    switch (contentType) {
        case 'multipart/form-data':
            return Object.keys(parsed).reduce((p, c) => {
                p.append(c, parsed[c]);
                return p;
            }, new form_data_1.default());
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
        (0, pstree_remy_1.default)(pid, (err, pids) => {
            if (err) {
                reject(err);
            }
            resolve(pids.filter((x) => !isNaN(x)));
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
async function getPid(name) {
    const taskCommand = `ps -eo pid,command | grep "${name}" | grep -v grep | awk '{print $1}' | head -1 | xargs echo -n`;
    const pid = await promiseExec(taskCommand);
    return pid ? Number(pid) : undefined;
}
exports.getPid = getPid;
async function parseVersion(path) {
    return (0, js_yaml_1.load)(await (0, util_1.promisify)(fs.readFile)(path, 'utf8'));
}
exports.parseVersion = parseVersion;
async function parseContentVersion(content) {
    return (0, js_yaml_1.load)(content);
}
exports.parseContentVersion = parseContentVersion;
async function getUniqPath(command, id) {
    if (/^\d+$/.test(id)) {
        id = `_${id}`;
    }
    else {
        id = '';
    }
    const items = command.split(/ +/);
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
    return `${str}${id}`;
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
        logger_1.default.error('[JSON.parse失败]', error);
        return {};
    }
}
exports.safeJSONParse = safeJSONParse;
//# sourceMappingURL=util.js.map