"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCronId = void 0;
// Match command text literally: looking up a task must never execute its input.
function findCronId(crontab, command) {
    if (!command)
        return '';
    for (const line of crontab.split('\n')) {
        const id = /\bID=(\d+)\s/.exec(line);
        if (id && line.includes(command, id.index + id[0].length)) {
            return id[1];
        }
    }
    return '';
}
exports.findCronId = findCronId;
//# sourceMappingURL=cronCommand.js.map