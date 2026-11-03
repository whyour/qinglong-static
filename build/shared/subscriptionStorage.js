"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionStorageCandidates = exports.getSubscriptionStorageNames = exports.resolveSubscriptionStoragePath = exports.isSubscriptionStorageName = void 0;
const subscription_1 = require("../config/subscription");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fileAccess_1 = require("./fileAccess");
// Storage namespaces come from URLs and branches, not user aliases. In
// particular, a legal Git directory can exceed the alias's 200-character limit.
function isSubscriptionStorageName(name) {
    return (typeof name === 'string' &&
        !!name &&
        !path_1.default.isAbsolute(name) &&
        !/[\0\r\n\\]/.test(name) &&
        !name.split('/').some((part) => !part || part === '.' || part === '..'));
}
exports.isSubscriptionStorageName = isSubscriptionStorageName;
function resolveSubscriptionStoragePath(root, name) {
    const target = isSubscriptionStorageName(name)
        ? (0, fileAccess_1.resolveFileAccess)(root, [name])
        : '';
    if (!target) {
        if (isSubscriptionStorageName(name)) {
            try {
                fs_1.default.lstatSync(path_1.default.resolve(root, name));
            }
            catch (error) {
                // A long query can make the Shell candidate unrepresentable while
                // the CLI's pathname-based file exists. Use the actual filesystem
                // limit: macOS permits Unicode names exceeding 255 UTF-8 bytes.
                if (error.code === 'ENAMETOOLONG')
                    return undefined;
            }
        }
        throw Object.assign(new Error('Invalid subscription path'), {
            status: 400,
        });
    }
    return target;
}
exports.resolveSubscriptionStoragePath = resolveSubscriptionStoragePath;
/** Match shell/update.sh get_uniq_path and update_raw, including SCP URLs. */
function getSubscriptionStorageNames(doc, engine = 'shell') {
    // Old imported rows may only have an alias and no URL.
    if (!doc.url)
        return { script: doc.alias, repo: doc.alias };
    const url = (0, subscription_1.formatUrl)(doc).url;
    const trimmed = url.endsWith('/') ? url.slice(0, -1) : url;
    const basename = trimmed.slice(trimmed.lastIndexOf('/') + 1);
    const dot = basename.lastIndexOf('.');
    const repo = dot < 0 ? basename : basename.slice(0, dot);
    const parentUrl = engine === 'cli' ? trimmed : url;
    const slash = parentUrl.lastIndexOf('/');
    const parent = engine === 'shell' && slash < 0 ? url : parentUrl.slice(0, slash);
    const owner = parent.slice(parent.lastIndexOf('/') + 1);
    const author = owner.slice(owner.lastIndexOf(':') + 1);
    const stem = `${author.slice(author.lastIndexOf('.') + 1)}_${repo}`;
    if (doc.type === 'file') {
        const suffix = engine === 'cli'
            ? path_1.default.extname(new URL(url).pathname)
            : `.${url.slice(url.lastIndexOf('.') + 1)}`;
        const raw = `${stem}${suffix}`;
        return { script: `raw_${raw}`, raw };
    }
    const directory = doc.branch ? `${stem}_${doc.branch}` : stem;
    return { script: directory, repo: directory };
}
exports.getSubscriptionStorageNames = getSubscriptionStorageNames;
// A subscription may have run through either engine before being deleted.
function getSubscriptionStorageCandidates(doc) {
    const candidates = [];
    for (const engine of ['shell', 'cli']) {
        try {
            candidates.push(getSubscriptionStorageNames(doc, engine));
        }
        catch (_a) {
            // Historical rows may have an invalid SSH alias or missing credentials.
            // Retain their URL-derived storage without needing an executable SSH URL.
            try {
                candidates.push(getSubscriptionStorageNames({
                    url: doc.url,
                    alias: doc.alias,
                    branch: doc.branch,
                    type: doc.type === 'private-repo' ? 'public-repo' : doc.type,
                }, engine));
            }
            catch (_b) {
                // One engine's invalid URL must not hide the other engine's candidate.
            }
        }
    }
    return candidates;
}
exports.getSubscriptionStorageCandidates = getSubscriptionStorageCandidates;
//# sourceMappingURL=subscriptionStorage.js.map