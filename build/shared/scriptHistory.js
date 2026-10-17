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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptHistory = exports.HistoryUnavailableError = exports.ScriptHistoryError = exports.SCRIPT_HISTORY_LIMITS = void 0;
const fs = __importStar(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const zlib_1 = require("zlib");
const proper_lockfile_1 = require("proper-lockfile");
const fileAccess_1 = require("./fileAccess");
const utils_1 = require("./utils");
const compress = (0, util_1.promisify)(zlib_1.brotliCompress);
const decompress = (0, util_1.promisify)(zlib_1.brotliDecompress);
const hash = (content) => (0, crypto_1.createHash)('sha256').update(content).digest('hex');
exports.SCRIPT_HISTORY_LIMITS = {
    versions: 20,
    fileBytes: 1024 * 1024,
    unpackedBytes: 8 * 1024 * 1024,
    archiveBytes: 2 * 1024 * 1024,
    totalBytes: 32 * 1024 * 1024,
    files: 1000,
};
class ScriptHistoryError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.ScriptHistoryError = ScriptHistoryError;
class HistoryUnavailableError extends ScriptHistoryError {
    constructor(currentHash) {
        super(413, '历史版本仅支持不超过 1 MiB 的 UTF-8 文本脚本');
        this.currentHash = currentHash;
    }
}
exports.HistoryUnavailableError = HistoryUnavailableError;
/** Lazy, bounded storage: no watcher, database, daemon, or in-memory cache.
 * Full snapshots share a Brotli window, so similar revisions compress together
 * without a patch chain. All mutations use the existing script lock and a
 * cross-process archive lock. History is durable before overwriting the script. */
class ScriptHistory {
    constructor(scriptRoot, historyRoot, blacklist = [], limits = exports.SCRIPT_HISTORY_LIMITS) {
        this.scriptRoot = scriptRoot;
        this.historyRoot = historyRoot;
        this.blacklist = blacklist;
        this.limits = limits;
    }
    async target(directory, filename) {
        const candidate = (0, fileAccess_1.resolveFileAccess)(this.scriptRoot, [directory, filename], this.blacklist);
        if (!candidate)
            throw new ScriptHistoryError(403, '暂无权限');
        try {
            const file = await fs.realpath(candidate);
            const root = await fs.realpath(this.scriptRoot);
            const relative = path_1.default.relative(root, file);
            const key = hash(relative);
            return {
                file,
                relative,
                archive: path_1.default.join(this.historyRoot, key + '.br'),
            };
        }
        catch (error) {
            if (error.code === 'ENOENT')
                throw new ScriptHistoryError(404, '脚本不存在');
            throw error;
        }
    }
    async readText(file) {
        const handle = await fs.open(file, 'r');
        try {
            const stat = await handle.stat();
            if (!stat.isFile())
                throw new ScriptHistoryError(400, '请选择脚本文件');
            if (stat.size > this.limits.fileBytes)
                throw new ScriptHistoryError(413, '历史版本仅支持不超过 1 MiB 的 UTF-8 文本脚本');
            // Bounded read even if an external process grows the file after stat.
            const bytes = Buffer.alloc(this.limits.fileBytes + 1);
            let size = 0;
            while (size < bytes.length) {
                const { bytesRead } = await handle.read(bytes, size, bytes.length - size, null);
                if (!bytesRead)
                    break;
                size += bytesRead;
            }
            const buffer = bytes.subarray(0, size);
            const content = buffer.toString('utf8');
            if (size > this.limits.fileBytes ||
                content.includes('\0') ||
                !Buffer.from(content).equals(buffer)) {
                throw new ScriptHistoryError(413, '历史版本仅支持不超过 1 MiB 的 UTF-8 文本脚本');
            }
            return content;
        }
        finally {
            await handle.close();
        }
    }
    async readArchive(file, relative) {
        try {
            const stat = await fs.lstat(file);
            if (!stat.isFile() || stat.size > this.limits.archiveBytes)
                throw new Error('Invalid archive');
            const bytes = await decompress(await fs.readFile(file), {
                maxOutputLength: this.limits.unpackedBytes,
            });
            const archive = JSON.parse(bytes.toString('utf8'));
            if (archive.format !== 1 ||
                archive.path !== relative ||
                !Array.isArray(archive.versions) ||
                archive.versions.length > this.limits.versions ||
                archive.versions.some((v) => typeof v.content !== 'string' ||
                    typeof v.id !== 'string' ||
                    typeof v.createdAt !== 'string' ||
                    !['baseline', 'save', 'restore', 'external'].includes(v.source) ||
                    Buffer.byteLength(v.content) > this.limits.fileBytes ||
                    hash(v.content) !== v.hash)) {
                throw new Error('Invalid archive');
            }
            return archive;
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return { format: 1, path: relative, versions: [] };
            throw new ScriptHistoryError(500, '历史版本读取失败，请检查历史文件');
        }
    }
    async list(directory, filename) {
        const target = await this.target(directory, filename);
        const [current, archive] = await Promise.all([
            this.readText(target.file),
            this.readArchive(target.archive, target.relative),
        ]);
        const currentHash = hash(current);
        const versions = archive.versions
            .slice()
            .reverse()
            .map((_a) => {
            var { content } = _a, v = __rest(_a, ["content"]);
            return (Object.assign(Object.assign({}, v), { size: Buffer.byteLength(content), identical: v.hash === currentHash }));
        });
        return { versions, currentHash, limit: this.limits.versions };
    }
    async detail(directory, filename, id) {
        const target = await this.target(directory, filename);
        const [current, archive] = await Promise.all([
            this.readText(target.file),
            this.readArchive(target.archive, target.relative),
        ]);
        const version = archive.versions.find((v) => v.id === id);
        if (!version)
            throw new ScriptHistoryError(404, '历史版本不存在或已清理');
        return { version, current, currentHash: hash(current) };
    }
    async save(directory, filename, content, options = {}) {
        return this.mutate(directory, filename, Object.assign({ content }, options));
    }
    async restore(directory, filename, id, expectedHash) {
        return this.mutate(directory, filename, { id, expectedHash });
    }
    async mutate(directory, filename, change) {
        var _a, e_1, _b, _c;
        var _d, _e;
        const target = await this.target(directory, filename);
        const releaseFile = await (0, proper_lockfile_1.lock)(target.file, {
            lockfilePath: (0, utils_1.getUniqueLockPath)(target.file),
            retries: { retries: 20, minTimeout: 50, maxTimeout: 250 },
        });
        try {
            let current;
            try {
                current = await this.readText(target.file);
                if ('content' in change &&
                    (Buffer.byteLength(change.content) > this.limits.fileBytes ||
                        change.content.includes('\0'))) {
                    throw new ScriptHistoryError(413, '历史版本仅支持不超过 1 MiB 的 UTF-8 文本脚本');
                }
            }
            catch (error) {
                if (!('content' in change) ||
                    !(error instanceof ScriptHistoryError) ||
                    error.status !== 413)
                    throw error;
                // Hash oversized or non-UTF-8 files without reading them all into memory.
                const digest = (0, crypto_1.createHash)('sha256');
                try {
                    for (var _f = true, _g = __asyncValues((0, fs_1.createReadStream)(target.file)), _h; _h = await _g.next(), _a = _h.done, !_a; _f = true) {
                        _c = _h.value;
                        _f = false;
                        const chunk = _c;
                        digest.update(chunk);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_f && !_a && (_b = _g.return)) await _b.call(_g);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                const currentHash = digest.digest('hex');
                if (!change.skipHistory)
                    throw new HistoryUnavailableError(currentHash);
                if (change.expectedHash !== currentHash)
                    throw new ScriptHistoryError(409, '文件已变化，请刷新历史版本后重试');
                await this.preparedWrite(target.file, change.content, (commit) => commit());
                return {
                    content: change.content,
                    changed: true,
                    historyRecorded: false,
                };
            }
            if (('id' in change || change.skipHistory) &&
                hash(current) !== change.expectedHash) {
                throw new ScriptHistoryError(409, '文件已变化，请刷新历史版本后重试');
            }
            if ('content' in change && change.content === current)
                return { content: current, changed: false };
            await fs.mkdir(this.historyRoot, { recursive: true, mode: 0o700 });
            const releaseHistory = await (0, proper_lockfile_1.lock)(this.historyRoot, {
                retries: { retries: 20, minTimeout: 50, maxTimeout: 250 },
            });
            try {
                const archive = await this.readArchive(target.archive, target.relative);
                const restored = 'id' in change
                    ? archive.versions.find((v) => v.id === change.id)
                    : undefined;
                if ('id' in change && !restored)
                    throw new ScriptHistoryError(404, '历史版本不存在或已清理');
                const content = 'content' in change ? change.content : restored.content;
                if (content === current)
                    return { content, changed: false };
                if (Buffer.byteLength(content) > this.limits.fileBytes ||
                    content.includes('\0')) {
                    throw new ScriptHistoryError(413, '历史版本仅支持不超过 1 MiB 的 UTF-8 文本脚本');
                }
                const currentHash = hash(current);
                if (((_d = archive.versions[archive.versions.length - 1]) === null || _d === void 0 ? void 0 : _d.hash) !== currentHash) {
                    const head = ((_e = archive.head) === null || _e === void 0 ? void 0 : _e.hash) === currentHash ? archive.head : undefined;
                    archive.versions.push({
                        id: (0, crypto_1.randomUUID)(),
                        createdAt: (head === null || head === void 0 ? void 0 : head.createdAt) || new Date().toISOString(),
                        source: (head === null || head === void 0 ? void 0 : head.source) ||
                            (archive.versions.length ? 'external' : 'baseline'),
                        hash: currentHash,
                        content: current,
                    });
                }
                // Only prior contents are stored. Head metadata labels the next snapshot,
                // but is used only if its hash matches the file. A failed file write can
                // never introduce a phantom content version or lose the old snapshot.
                archive.head = {
                    hash: hash(content),
                    createdAt: new Date().toISOString(),
                    source: 'id' in change ? 'restore' : 'save',
                };
                const packed = await this.pack(archive);
                const cleanupPending = await this.preparedWrite(target.file, content, (commit) => this.store(target.archive, packed, commit));
                return {
                    content,
                    changed: true,
                    historyRecorded: true,
                    cleanupPending,
                };
            }
            finally {
                await releaseHistory();
            }
        }
        finally {
            await releaseFile();
        }
    }
    async pack(archive) {
        archive.versions = archive.versions.slice(-this.limits.versions);
        while (true) {
            const serialized = Buffer.from(JSON.stringify(archive));
            if (serialized.length <= this.limits.unpackedBytes) {
                const compressed = await compress(serialized, {
                    params: {
                        [zlib_1.constants.BROTLI_PARAM_QUALITY]: 4,
                        [zlib_1.constants.BROTLI_PARAM_LGWIN]: 22,
                    },
                });
                if (compressed.length <= this.limits.archiveBytes)
                    return compressed;
            }
            if (archive.versions.length <= 1)
                throw new ScriptHistoryError(413, '历史版本容量不足，无法安全保存');
            archive.versions.shift();
        }
    }
    /** Stage the script before publishing history. A failed write/fsync never
     * truncates the original. Preserve the existing file's ownership and mode. */
    async preparedWrite(file, content, run) {
        const stat = await fs.stat(file);
        const temporary = path_1.default.join(path_1.default.dirname(file), `.ql-save-${(0, crypto_1.randomUUID)()}.tmp`);
        try {
            await fs.writeFile(temporary, content, {
                encoding: 'utf8',
                mode: 0o600,
                flag: 'wx',
            });
            if (typeof process.getuid === 'function' &&
                typeof process.getgid === 'function' &&
                (stat.uid !== process.getuid() || stat.gid !== process.getgid())) {
                await fs.chown(temporary, stat.uid, stat.gid);
            }
            await fs.chmod(temporary, stat.mode & 0o7777);
            const handle = await fs.open(temporary, 'r');
            try {
                await handle.sync();
            }
            finally {
                await handle.close();
            }
            return await run(() => fs.rename(temporary, file));
        }
        finally {
            await fs.unlink(temporary).catch(() => undefined);
        }
    }
    async store(file, content, commit) {
        const entries = [];
        for (const name of await fs.readdir(this.historyRoot)) {
            if (!/^[a-f0-9]{64}\.br$/.test(name))
                continue;
            const fullPath = path_1.default.join(this.historyRoot, name);
            if (fullPath === file)
                continue;
            const stat = await fs.lstat(fullPath);
            entries.push({ file: fullPath, size: stat.size, time: stat.mtimeMs });
        }
        entries.sort((a, b) => a.time - b.time);
        let total = entries.reduce((sum, v) => sum + v.size, content.length);
        const victims = [];
        while (entries.length &&
            (total > this.limits.totalBytes || entries.length >= this.limits.files)) {
            const oldest = entries.shift();
            victims.push(oldest.file);
            total -= oldest.size;
        }
        if (total > this.limits.totalBytes)
            throw new ScriptHistoryError(413, '历史版本容量不足，无法安全保存');
        const previous = await fs.readFile(file).catch((error) => {
            if (error.code === 'ENOENT')
                return undefined;
            throw error;
        });
        const temporary = path_1.default.join(this.historyRoot, '.pending.tmp');
        const publish = async (bytes) => {
            await fs.unlink(temporary).catch((error) => {
                if (error.code !== 'ENOENT')
                    throw error;
            });
            await fs.writeFile(temporary, bytes, { mode: 0o600, flag: 'wx' });
            const handle = await fs.open(temporary, 'r');
            try {
                await handle.sync();
            }
            finally {
                await handle.close();
            }
            await fs.rename(temporary, file);
        };
        try {
            await publish(content);
            try {
                await commit();
            }
            catch (error) {
                // The original script is still intact. Restore its exact history before
                // returning an error; no unrelated archive has been removed yet.
                if (previous)
                    await publish(previous);
                else
                    await fs.unlink(file);
                throw error;
            }
            // Quota eviction is post-commit maintenance. Report cleanup failures as a
            // warning, not a failed save (which would encourage a misleading retry).
            let cleanupPending = false;
            for (const victim of victims) {
                try {
                    await fs.unlink(victim);
                }
                catch (error) {
                    if (error.code !== 'ENOENT')
                        cleanupPending = true;
                }
            }
            return cleanupPending;
        }
        finally {
            await fs.unlink(temporary).catch(() => undefined);
        }
    }
}
exports.ScriptHistory = ScriptHistory;
//# sourceMappingURL=scriptHistory.js.map