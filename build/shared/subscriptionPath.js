"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSubscriptionPath = exports.getSubscriptionSshAlias = exports.assertSubscriptionAlias = void 0;
const fileAccess_1 = require("./fileAccess");
const crypto_1 = require("crypto");
function assertSubscriptionAlias(alias) {
    if (typeof alias !== 'string' ||
        alias.length > 200 ||
        !/^[^\s\\\p{C}]+$/u.test(alias) ||
        alias.startsWith('~') ||
        alias.split('/').some((part) => !part || part === '.' || part === '..')) {
        throw Object.assign(new Error('Invalid subscription alias'), {
            status: 400,
        });
    }
}
exports.assertSubscriptionAlias = assertSubscriptionAlias;
/** Keep ordinary SSH names and use a reserved namespace for path-like aliases.
 * The database alias and its script/log directories remain unchanged. */
function getSubscriptionSshAlias(alias) {
    assertSubscriptionAlias(alias);
    if (/^[\p{L}\p{N}_.+-]+$/u.test(alias) && !alias.endsWith('.config')) {
        return alias;
    }
    return `~sub_${(0, crypto_1.createHash)('sha256').update(alias).digest('hex')}`;
}
exports.getSubscriptionSshAlias = getSubscriptionSshAlias;
function resolveSubscriptionPath(root, alias, suffix = '') {
    // Internal SSH filenames cannot collide with user-supplied aliases.
    if (!/^~sub_[a-f0-9]{64}$/.test(alias)) {
        assertSubscriptionAlias(alias.startsWith('~global_') ? alias.slice(8) : alias);
    }
    const target = (0, fileAccess_1.resolveFileAccess)(root, [alias + suffix]);
    if (!target)
        throw Object.assign(new Error('Invalid subscription path'), {
            status: 400,
        });
    return target;
}
exports.resolveSubscriptionPath = resolveSubscriptionPath;
//# sourceMappingURL=subscriptionPath.js.map