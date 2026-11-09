"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginThrottle = void 0;
const RETRY_TTL = 15 * 60 * 1000;
const MAX_SOURCES = 10000;
const MAX_RETRY_SECONDS = 5 * 60;
/** Source-specific, bounded backoff; persisted account history is not a lock. */
class LoginThrottle {
    constructor() {
        this.sources = new Map();
    }
    get(source, now) {
        const state = this.sources.get(source);
        if (state && now - state.lastFailure >= RETRY_TTL) {
            this.sources.delete(source);
            return undefined;
        }
        return state;
    }
    retryAfter(source, now) {
        const state = this.get(source, now);
        if (!state || state.failures < 3)
            return 0;
        const seconds = Math.min(3 ** state.failures, MAX_RETRY_SECONDS);
        return Math.max(0, Math.ceil((seconds * 1000 - (now - state.lastFailure)) / 1000));
    }
    fail(source, now) {
        var _a;
        const failures = Math.min((((_a = this.get(source, now)) === null || _a === void 0 ? void 0 : _a.failures) || 0) + 1, 6);
        this.sources.delete(source);
        if (this.sources.size >= MAX_SOURCES) {
            this.sources.delete(this.sources.keys().next().value);
        }
        this.sources.set(source, { failures, lastFailure: now });
        return failures;
    }
    reset(source) {
        this.sources.delete(source);
    }
    clear() {
        this.sources.clear();
    }
}
exports.LoginThrottle = LoginThrottle;
//# sourceMappingURL=loginThrottle.js.map