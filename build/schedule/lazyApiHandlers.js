"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyApiHandlers = void 0;
const api_1 = require("../protos/api");
// Registration/health never need the script API's HTTP-oriented services.
// Keep their dependency graph out of an ordinary scheduler's resident heap.
// Dynamic import shares initialization across simultaneous first calls; the
// normal handlers retain validation, callback errors and service singletons.
function lazyApiHandlers() {
    return Object.fromEntries(Object.keys(api_1.ApiService).map((method) => [
        method,
        (call, callback) => {
            void Promise.resolve().then(() => __importStar(require('./api'))).then((handlers) => {
                const handler = handlers[method];
                return handler(call, callback);
            })
                .catch(callback);
        },
    ]));
}
exports.lazyApiHandlers = lazyApiHandlers;
//# sourceMappingURL=lazyApiHandlers.js.map