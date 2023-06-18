"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOneByOne = exports.runWithCpuLimit = void 0;
const p_limit_1 = __importDefault(require("p-limit"));
const os_1 = __importDefault(require("os"));
const cpuLimit = (0, p_limit_1.default)(os_1.default.cpus().length);
const oneLimit = (0, p_limit_1.default)(1);
function runWithCpuLimit(fn) {
    return cpuLimit(() => {
        return fn();
    });
}
exports.runWithCpuLimit = runWithCpuLimit;
function runOneByOne(fn) {
    return oneLimit(() => {
        return fn();
    });
}
exports.runOneByOne = runOneByOne;
//# sourceMappingURL=pLimit.js.map