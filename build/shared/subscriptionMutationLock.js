"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSubscriptionMutation = void 0;
const proper_lockfile_1 = __importDefault(require("proper-lockfile"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
// Protect subscription storage ownership from the first database read through
// cleanup. Creation and URL/branch updates must use the same cross-process lock.
async function withSubscriptionMutation(operation) {
    const target = `${path_1.default.resolve(config_1.default.scriptPath)}.subscriptions`;
    let release;
    try {
        release = await proper_lockfile_1.default.lock(target, {
            realpath: false,
            stale: 30000,
            update: 10000,
            retries: { retries: 50, factor: 1, minTimeout: 100, maxTimeout: 100 },
        });
    }
    catch (cause) {
        throw Object.assign(new Error('Subscription configuration is busy', { cause }), { status: 503 });
    }
    try {
        return await operation();
    }
    finally {
        await release();
    }
}
exports.withSubscriptionMutation = withSubscriptionMutation;
//# sourceMappingURL=subscriptionMutationLock.js.map