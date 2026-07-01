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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGrpcCerts = exports.initGrpcCerts = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./index"));
const util_1 = require("./util");
const logger_1 = __importDefault(require("../loaders/logger"));
const certDir = path_1.default.join(index_1.default.configPath, 'grpc');
const caKeyPath = path_1.default.join(certDir, 'ca.key');
const caCertPath = path_1.default.join(certDir, 'ca.crt');
const serverKeyPath = path_1.default.join(certDir, 'server.key');
const serverCertPath = path_1.default.join(certDir, 'server.crt');
const clientKeyPath = path_1.default.join(certDir, 'client.key');
const clientCertPath = path_1.default.join(certDir, 'client.crt');
let cachedConfig = null;
function run(cmd, execOpts) {
    const opts = Object.assign({ stdio: 'pipe', timeout: 30000, encoding: 'utf-8' }, execOpts);
    return (0, child_process_1.execSync)(cmd, opts).trim();
}
async function tmpFile(prefix) {
    const dir = (await (0, util_1.fileExist)(certDir)) ? certDir : os.tmpdir();
    await fs.mkdir(dir, { recursive: true });
    return path_1.default.join(dir, `.${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.pem`);
}
async function generateAllCerts() {
    logger_1.default.info('[boot] Generating gRPC mTLS certificates...');
    const caKeyTmp = await tmpFile('ca_key');
    const caCertTmp = await tmpFile('ca_cert');
    const serverKeyTmp = await tmpFile('server_key');
    const serverCsrTmp = await tmpFile('server_csr');
    const serverExtTmp = await tmpFile('server_ext');
    const clientKeyTmp = await tmpFile('client_key');
    const clientCsrTmp = await tmpFile('client_csr');
    const clientExtTmp = await tmpFile('client_ext');
    const srlTmp = path_1.default.join(path_1.default.dirname(caKeyTmp), '.grpc_ca.srl');
    const cleanup = async () => {
        for (const f of [caKeyTmp, caCertTmp, serverKeyTmp, serverCsrTmp, serverExtTmp,
            clientKeyTmp, clientCsrTmp, clientExtTmp, srlTmp]) {
            try {
                await fs.unlink(f);
            }
            catch (_a) { }
        }
    };
    try {
        // 1. CA（私钥直接存盘，证书写入临时文件供签发使用）
        run(`openssl genrsa -out '${caKeyTmp}' 2048 2>/dev/null`);
        run(`openssl req -new -x509 -days 3650 -key '${caKeyTmp}' -out '${caCertTmp}' -subj '/CN=qinglong-ca/O=qinglong/C=CN' 2>/dev/null`);
        const caKey = await fs.readFile(caKeyTmp, 'utf-8');
        const caCert = await fs.readFile(caCertTmp, 'utf-8');
        await fs.mkdir(certDir, { recursive: true });
        await fs.writeFile(caKeyPath, caKey, { mode: 0o600 });
        // 2. 服务端
        run(`openssl genrsa -out '${serverKeyTmp}' 2048 2>/dev/null`);
        run(`openssl req -new -key '${serverKeyTmp}' -out '${serverCsrTmp}' -subj '/CN=grpc-server' 2>/dev/null`);
        await fs.writeFile(serverExtTmp, 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1\n');
        const serverCert = run(`openssl x509 -req -days 3650 -in '${serverCsrTmp}' -CA '${caCertTmp}' -CAkey '${caKeyTmp}' -CAcreateserial -extfile '${serverExtTmp}' 2>/dev/null`);
        const serverKey = await fs.readFile(serverKeyTmp, 'utf-8');
        // 3. 客户端
        run(`openssl genrsa -out '${clientKeyTmp}' 2048 2>/dev/null`);
        run(`openssl req -new -key '${clientKeyTmp}' -out '${clientCsrTmp}' -subj '/CN=grpc-client' 2>/dev/null`);
        await fs.writeFile(clientExtTmp, 'extendedKeyUsage=clientAuth\n');
        const clientCert = run(`openssl x509 -req -days 3650 -in '${clientCsrTmp}' -CA '${caCertTmp}' -CAkey '${caKeyTmp}' -CAcreateserial -extfile '${clientExtTmp}' 2>/dev/null`);
        const clientKey = await fs.readFile(clientKeyTmp, 'utf-8');
        await cleanup();
        logger_1.default.info('[boot] gRPC mTLS certificates generated successfully');
        return { caCert, serverCert, serverKey, clientCert, clientKey };
    }
    catch (e) {
        await cleanup();
        throw e;
    }
}
async function saveCerts(tlsConfig) {
    await fs.mkdir(certDir, { recursive: true });
    await fs.writeFile(caCertPath, tlsConfig.caCert, { mode: 0o644 });
    await fs.writeFile(serverCertPath, tlsConfig.serverCert, { mode: 0o644 });
    await fs.writeFile(serverKeyPath, tlsConfig.serverKey, { mode: 0o600 });
    await fs.writeFile(clientCertPath, tlsConfig.clientCert, { mode: 0o644 });
    await fs.writeFile(clientKeyPath, tlsConfig.clientKey, { mode: 0o600 });
    logger_1.default.info(`[boot] gRPC mTLS certificates saved to ${certDir}`);
}
async function loadExistingCerts() {
    const exists = await Promise.all([
        (0, util_1.fileExist)(caCertPath),
        (0, util_1.fileExist)(serverCertPath),
        (0, util_1.fileExist)(serverKeyPath),
        (0, util_1.fileExist)(clientCertPath),
        (0, util_1.fileExist)(clientKeyPath),
    ]);
    if (exists.some((e) => !e)) {
        return null;
    }
    const [caCert, serverCert, serverKey, clientCert, clientKey] = await Promise.all([
        fs.readFile(caCertPath, 'utf-8'),
        fs.readFile(serverCertPath, 'utf-8'),
        fs.readFile(serverKeyPath, 'utf-8'),
        fs.readFile(clientCertPath, 'utf-8'),
        fs.readFile(clientKeyPath, 'utf-8'),
    ]);
    logger_1.default.info('[boot] Loaded existing gRPC mTLS certificates from disk');
    return { caCert, serverCert, serverKey, clientCert, clientKey };
}
async function initGrpcCerts() {
    if (cachedConfig) {
        return cachedConfig;
    }
    let tlsConfig = await loadExistingCerts();
    if (!tlsConfig) {
        tlsConfig = await generateAllCerts();
        await saveCerts(tlsConfig);
    }
    cachedConfig = tlsConfig;
    return tlsConfig;
}
exports.initGrpcCerts = initGrpcCerts;
function getGrpcCerts() {
    return cachedConfig;
}
exports.getGrpcCerts = getGrpcCerts;
//# sourceMappingURL=grpcCerts.js.map