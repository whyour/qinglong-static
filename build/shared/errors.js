"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errStack = void 0;
// Keep error formatting independent of database, HTTP and gRPC dependencies.
function errStack(error) {
    return error instanceof Error && error.stack ? error.stack : String(error);
}
exports.errStack = errStack;
//# sourceMappingURL=errors.js.map