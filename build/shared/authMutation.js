"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeAuthMutation = void 0;
// All account mutations in the HTTP service share one queue. In particular,
// a login that read old credentials must finish before a password reset revokes
// its session, and two initialization requests must not both claim the account.
let pending = Promise.resolve();
function serializeAuthMutation(_target, _key, descriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args) {
        const result = pending.then(() => method.apply(this, args));
        pending = result.catch(() => undefined);
        return result;
    };
}
exports.serializeAuthMutation = serializeAuthMutation;
//# sourceMappingURL=authMutation.js.map