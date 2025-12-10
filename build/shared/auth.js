"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidToken = void 0;
/**
 * Validates if a token exists in the authentication info.
 * Supports both legacy string tokens and new TokenInfo array format.
 *
 * @param authInfo - The authentication information
 * @param headerToken - The token to validate
 * @param platform - The platform (desktop, mobile)
 * @returns true if the token is valid, false otherwise
 */
function isValidToken(authInfo, headerToken, platform) {
    if (!authInfo || !headerToken) {
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
        return platformTokens.some((t) => t && t.value === headerToken);
    }
    // Unexpected type - log warning and reject
    return false;
}
exports.isValidToken = isValidToken;
//# sourceMappingURL=auth.js.map