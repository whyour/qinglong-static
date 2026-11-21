"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDirectoryPage = exports.checkDirectoryVersions = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const fileAccess_1 = require("./fileAccess");
function isGone(error) {
    const code = error.code;
    return code === 'ENOENT' || code === 'ENOTDIR';
}
async function directoryVersion(root, parent, blacklist) {
    const dir = parent ? (0, fileAccess_1.resolveFileAccess)(root, [parent], blacklist) : root;
    const denied = () => Object.assign(new Error('Invalid directory'), { status: 403 });
    if (!dir)
        throw denied();
    try {
        if (await fs_1.promises.realpath(dir) !== path_1.default.join(root, parent))
            throw denied();
        const stat = await fs_1.promises.lstat(dir, { bigint: true });
        return stat.isDirectory() ? [stat.dev, stat.ino, stat.mtimeNs, stat.ctimeNs].join(':') : null;
    }
    catch (error) {
        if (isGone(error))
            return null;
        throw error;
    }
}
async function checkDirectoryVersions(root, blacklist, versions) {
    const realRoot = await fs_1.promises.realpath(root);
    const matches = await Promise.all(versions.map(async ([parent, expected]) => {
        try {
            return await directoryVersion(realRoot, parent, blacklist) === expected;
        }
        catch (error) {
            // A formerly accessible directory may now be a symlink outside the root.
            if (error.status === 403)
                return false;
            throw error;
        }
    }));
    return matches.every(Boolean);
}
exports.checkDirectoryVersions = checkDirectoryVersions;
async function readDirectoryPage(root, blacklist, directory, after, search, foldersOnly, newestFirst, limit = 50) {
    var _a, e_1, _b, _c;
    const blocked = new Set(blacklist.map(name => name.toLowerCase()));
    const realRoot = await fs_1.promises.realpath(root);
    const versions = [];
    async function entries(parent) {
        const version = await directoryVersion(realRoot, parent, blacklist);
        versions.push([parent, version]);
        if (version === null)
            return [];
        try {
            return (await fs_1.promises.readdir(path_1.default.join(realRoot, parent), { withFileTypes: true })).filter(e => !blocked.has(e.name.toLowerCase()) && (e.isDirectory() || (!foldersOnly && e.isFile())));
        }
        catch (error) {
            if (isGone(error))
                return [];
            throw error;
        }
    }
    const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
    const rows = [];
    let next = null;
    async function row(parent, title, directory) {
        const key = path_1.default.join(parent, title);
        if (directory)
            return { title, parent, key, type: 'directory', isLeaf: false };
        try {
            const stat = await fs_1.promises.lstat(path_1.default.join(root, key));
            if (stat.isFile())
                return { title, parent, key, type: 'file', isLeaf: true, size: stat.size };
        }
        catch (error) {
            if (!isGone(error))
                throw error;
        }
    }
    if (!search) {
        const sorted = (await entries(directory)).sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) ||
            compare(a.name, b.name) * (newestFirst && !a.isDirectory() ? -1 : 1));
        const selected = sorted.filter(e => {
            if (!after)
                return true;
            const group = e.isDirectory() ? '0' : '1';
            return group > after[0] || (group === after[0] &&
                compare(e.name, after.slice(1)) * (newestFirst && !e.isDirectory() ? -1 : 1) > 0);
        });
        const page = selected.slice(0, limit);
        const data = (await Promise.all(page.map(e => row(directory, e.name, e.isDirectory())))).filter(Boolean);
        if (selected.length > limit) {
            const last = page[page.length - 1];
            next = (last.isDirectory() ? '0' : '1') + last.name;
        }
        return { data, next, versions };
    }
    // Resume a depth-first search at the last visited entry, including on pages with zero matches.
    function walk(parent, resume) {
        return __asyncGenerator(this, arguments, function* walk_1() {
            const items = (yield __await(entries(parent))).sort((a, b) => compare(a.name, b.name));
            for (const item of items) {
                if (resume.length && item.name < resume[0])
                    continue;
                const same = item.name === resume[0];
                if (!same)
                    yield yield __await({ parent, name: item.name, dir: item.isDirectory() });
                if (item.isDirectory()) {
                    try {
                        yield __await(yield* __asyncDelegator(__asyncValues(walk(path_1.default.join(parent, item.name), same ? resume.slice(1) : []))));
                    }
                    catch (error) {
                        if (!isGone(error) && error.status !== 403)
                            throw error;
                    }
                }
            }
        });
    }
    let visited = 0;
    try {
        for (var _d = true, _e = __asyncValues(walk('', after ? after.split('/') : [])), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const entry = _c;
            const key = path_1.default.join(entry.parent, entry.name);
            if (key.toLowerCase().includes(search.toLowerCase())) {
                const item = await row(entry.parent, entry.name, entry.dir);
                if (item)
                    rows.push(item);
            }
            if (++visited >= 512 || rows.length === limit) {
                next = key;
                break;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return { data: rows, next, versions };
}
exports.readDirectoryPage = readDirectoryPage;
//# sourceMappingURL=directoryPage.js.map