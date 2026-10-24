"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.isPasswordHash = exports.hashPassword = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const deriveKey = (0, util_1.promisify)(crypto_1.scrypt);
const HASH_PREFIX = 'scrypt$';
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const key = (await deriveKey(password, salt, 64));
    return `${HASH_PREFIX}${salt}$${key.toString('hex')}`;
}
exports.hashPassword = hashPassword;
function isPasswordHash(password) {
    return /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(password);
}
exports.isPasswordHash = isPasswordHash;
async function verifyPassword(password, stored) {
    if (!isPasswordHash(stored)) {
        // Existing installations migrate after a successful password check.
        const input = Buffer.from(password);
        const expected = Buffer.from(stored);
        return input.length === expected.length && (0, crypto_1.timingSafeEqual)(input, expected);
    }
    const [, salt, hash] = stored.split('$');
    const key = (await deriveKey(password, salt, 64));
    return (0, crypto_1.timingSafeEqual)(key, Buffer.from(hash, 'hex'));
}
exports.verifyPassword = verifyPassword;
//# sourceMappingURL=password.js.map