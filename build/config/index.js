"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.join(__dirname, '../../.env'),
});
const config = {
    port: parseInt(process.env.BACK_PORT || '5600', 10),
    grpcPort: parseInt(process.env.GRPC_PORT || '5500', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },
    api: {
        prefix: '/api',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'whyour-secret',
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    cors: {
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
};
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (!process.env.QL_DIR) {
    let qlHomePath = path_1.default.join(__dirname, '../../');
    if (qlHomePath.endsWith('/static/')) {
        qlHomePath = path_1.default.join(qlHomePath, '../');
    }
    process.env.QL_DIR = qlHomePath.replace(/\/$/g, '');
}
const lastVersionFile = `https://qn.whyour.cn/version.yaml`;
const rootPath = process.env.QL_DIR;
const envFound = dotenv_1.default.config({ path: path_1.default.join(rootPath, '.env') });
let dataPath = path_1.default.join(rootPath, 'data/');
if (process.env.QL_DATA_DIR) {
    dataPath = process.env.QL_DATA_DIR.replace(/\/$/g, '');
}
const shellPath = path_1.default.join(rootPath, 'shell/');
const preloadPath = path_1.default.join(shellPath, 'preload/');
const tmpPath = path_1.default.join(rootPath, '.tmp/');
const samplePath = path_1.default.join(rootPath, 'sample/');
const configPath = path_1.default.join(dataPath, 'config/');
const scriptPath = path_1.default.join(dataPath, 'scripts/');
const repoPath = path_1.default.join(dataPath, 'repo/');
const bakPath = path_1.default.join(dataPath, 'bak/');
const logPath = path_1.default.join(dataPath, 'log/');
const dbPath = path_1.default.join(dataPath, 'db/');
const uploadPath = path_1.default.join(dataPath, 'upload/');
const sshdPath = path_1.default.join(dataPath, 'ssh.d/');
const systemLogPath = path_1.default.join(dataPath, 'syslog/');
const dependenceCachePath = path_1.default.join(dataPath, 'dep_cache/');
const envFile = path_1.default.join(preloadPath, 'env.sh');
const jsEnvFile = path_1.default.join(preloadPath, 'env.js');
const pyEnvFile = path_1.default.join(preloadPath, 'env.py');
const jsNotifyFile = path_1.default.join(preloadPath, '__ql_notify__.js');
const pyNotifyFile = path_1.default.join(preloadPath, '__ql_notify__.py');
const confFile = path_1.default.join(configPath, 'config.sh');
const crontabFile = path_1.default.join(configPath, 'crontab.list');
const authConfigFile = path_1.default.join(configPath, 'auth.json');
const extraFile = path_1.default.join(configPath, 'extra.sh');
const confBakDir = path_1.default.join(dataPath, 'config/bak/');
const sampleFile = path_1.default.join(samplePath, 'config.sample.sh');
const sqliteFile = path_1.default.join(samplePath, 'database.sqlite');
const authError = '错误的用户名密码，请重试';
const loginFaild = '请先登录!';
const configString = 'config sample crontab shareCode diy';
const versionFile = path_1.default.join(rootPath, 'version.yaml');
const dataTgzFile = path_1.default.join(tmpPath, 'data.tgz');
const shareShellFile = path_1.default.join(shellPath, 'share.sh');
const dependenceProxyFile = path_1.default.join(configPath, 'dependence-proxy.sh');
if (envFound.error) {
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
exports.default = Object.assign(Object.assign({}, config), { jwt: config.jwt, rootPath,
    tmpPath,
    dataPath,
    dataTgzFile,
    shareShellFile,
    dependenceProxyFile,
    configString,
    loginFaild,
    authError,
    logPath,
    extraFile,
    authConfigFile,
    confBakDir,
    crontabFile,
    sampleFile,
    confFile,
    envFile,
    jsEnvFile,
    pyEnvFile,
    jsNotifyFile,
    pyNotifyFile,
    dbPath,
    uploadPath,
    configPath,
    scriptPath,
    repoPath,
    samplePath, blackFileList: [
        'auth.json',
        'config.sh.sample',
        'cookie.sh',
        'crontab.list',
        'dependence-proxy.sh',
        'env.sh',
        'env.js',
        'env.py',
        'token.json',
    ], writePathList: [configPath, scriptPath], bakPath, apiWhiteList: [
        '/api/user/login',
        '/api/health',
        '/open/auth/token',
        '/api/user/two-factor/login',
        '/api/system',
        '/api/user/init',
        '/api/user/notification/init',
        '/open/user/login',
        '/open/user/two-factor/login',
        '/open/system',
        '/open/user/init',
        '/open/user/notification/init',
    ], versionFile,
    lastVersionFile,
    sqliteFile,
    sshdPath,
    systemLogPath,
    dependenceCachePath });
//# sourceMappingURL=index.js.map