"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidToken = exports.isDefaultAuthInfo = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function isDefaultAuthInfo(authInfo) {
    return authInfo.username === 'admin' && authInfo.password === 'admin';
}
exports.isDefaultAuthInfo = isDefaultAuthInfo;
/**
 * Validates if a token exists in the authentication info.
 * Supports both legacy string tokens and new TokenInfo array format.
 *
 * @param authInfo - The authentication information
 * @param headerToken - The token to validate
 * @param platform - The platform (desktop, mobile)
 * @returns true if the token is valid, false otherwise
 */
function isValidToken(authInfo, headerToken, platform, secret) {
    if (!authInfo || !headerToken) {
        return false;
    }
    try {
        const claims = jsonwebtoken_1.default.verify(headerToken, secret, { algorithms: ['HS384'] });
        if (typeof claims === 'string' || typeof claims.exp !== 'number') {
            return false;
        }
    }
    catch (_a) {
        return false;
    }
    const { token = '', tokens = {} } = authInfo;
    // Check legacy token field
    if (headerToken === token) {
        return true;
    }
    // Check platform-specific tokens (support both legacy string and new TokenInfo[] format)
    const platformTokens = tokens[platform];
    // Handle null/undefined platformTokens
    if (platformTokens === null || platformTokens === undefined) {
        return false;
    }
    if (typeof platformTokens === 'string') {
        // Legacy format: single string token
        return headerToken === platformTokens;
    }
    else if (Array.isArray(platformTokens)) {
        // New format: array of TokenInfo objects
        return platformTokens.some((t) => t &&
            t.value === headerToken &&
            (t.expiration === undefined || t.expiration > Date.now() / 1000));
    }
    // Unexpected type - log warning and reject
    return false;
}
exports.isValidToken = isValidToken;
//# sourceMappingURL=auth.js.map