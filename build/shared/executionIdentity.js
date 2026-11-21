"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptFinishTime = exports.executionTriggerId = exports.executionIdPattern = void 0;
// The original scheduled CLI wire format maps to its existing persisted trigger ID.
exports.executionIdPattern = /^(?:client-|legacy-system:\d{1,12}:)[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
function executionTriggerId(id) {
    return id.replace('legacy-system:', 'system-cli-').replace(':', '-');
}
exports.executionTriggerId = executionTriggerId;
// A header lets upgraded clients keep the same identified body on older panels.
function receiptFinishTime(header) {
    if (header && /^\d{1,13}$/.test(header)) {
        const time = Number(header);
        if (time > 0 && time <= Date.now())
            return time;
    }
}
exports.receiptFinishTime = receiptFinishTime;
//# sourceMappingURL=executionIdentity.js.map