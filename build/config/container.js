"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeSudo = exports.isInContainer = void 0;
function isInContainer() {
    return process.env.QL_CONTAINER === 'true';
}
exports.isInContainer = isInContainer;
function maybeSudo(cmd) {
    return isInContainer() ? `sudo ${cmd}` : cmd;
}
exports.maybeSudo = maybeSudo;
//# sourceMappingURL=container.js.map