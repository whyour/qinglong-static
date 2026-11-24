"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingCronInstall = exports.errStack = void 0;
// Keep error formatting independent of database, HTTP and gRPC dependencies.
function errStack(error) {
    return error instanceof Error && error.stack ? error.stack : String(error);
}
exports.errStack = errStack;
class PendingCronInstall extends Error {
    constructor(cronId, message) {
        super(message);
        this.cronId = cronId;
        this.status = 503;
    }
}
exports.PendingCronInstall = PendingCronInstall;
//# sourceMappingURL=errors.js.map