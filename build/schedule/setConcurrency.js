"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConcurrency = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const os_1 = __importDefault(require("os"));
const pLimit_1 = __importDefault(require("../shared/pLimit"));
async function setConcurrency(call, callback) {
    const limit = call.request.concurrency;
    if (!Number.isInteger(limit) || limit < 0 || limit > 2147483647) {
        callback(Object.assign(new Error('Invalid concurrency'), {
            code: grpc_js_1.status.INVALID_ARGUMENT,
        }), null);
        return;
    }
    try {
        await pLimit_1.default.setCustomLimit(limit || Math.max(os_1.default.cpus().length, 4));
        callback(null, {});
    }
    catch (error) {
        callback(error, null);
    }
}
exports.setConcurrency = setConcurrency;
//# sourceMappingURL=setConcurrency.js.map