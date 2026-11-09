"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shellQuote = void 0;
/** Quote one literal POSIX shell argument, including quotes and substitutions. */
function shellQuote(value) {
    if (value.includes('\0'))
        throw new Error('Invalid shell argument');
    return "'" + value.replace(/'/g, "'\\''") + "'";
}
exports.shellQuote = shellQuote;
//# sourceMappingURL=shellQuote.js.map