"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerRegistrationError = exports.withSchedulerMutation = void 0;
const proper_lockfile_1 = __importDefault(require("proper-lockfile"));
const config_1 = __importDefault(require("../config"));
// HTTP and gRPC both mutate cron definitions. Hold one shared lock from the
// initial DB read/write through scheduler registration (including rollback).
// Recovery takes the same lock before reading its replacement snapshot.
async function withSchedulerMutation(operation) {
    let release;
    try {
        // proper-lockfile indexes held locks by target, not lockfilePath. Keep
        // this identity separate from nested writeFileWithLock(crontabFile).
        release = await proper_lockfile_1.default.lock(`${config_1.default.crontabFile}.scheduler`, {
            realpath: false,
            lockfilePath: `${config_1.default.crontabFile}.scheduler.lock`,
            stale: 30000,
            update: 10000,
            retries: { retries: 50, factor: 1, minTimeout: 100, maxTimeout: 100 },
        });
    }
    catch (cause) {
        throw Object.assign(new Error('Scheduler configuration is busy', { cause }), {
            status: 503,
        });
    }
    try {
        return await operation();
    }
    finally {
        await release();
    }
}
exports.withSchedulerMutation = withSchedulerMutation;
function schedulerRegistrationError(message, cause) {
    return Object.assign(new Error(message, { cause }), {
        status: (cause === null || cause === void 0 ? void 0 : cause.status) === 503 ? 503 : 500,
    });
}
exports.schedulerRegistrationError = schedulerRegistrationError;
//# sourceMappingURL=schedulerMutationLock.js.map