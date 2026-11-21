"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseCronCommand = exports.spawnCronCommand = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const managedExit_cjs_1 = require("./managedExit.cjs");
const cross_spawn_1 = require("cross-spawn");
// A managed command waits on its parent's pipe. EOF before authorization exits
// without interpreting the command, even when the worker is killed by SIGKILL.
function spawnCronCommand(command, triggerId, onCommandStart, outputPath) {
    if (!triggerId)
        return (0, cross_spawn_1.spawn)(command, { shell: '/bin/bash' });
    const sourceScript = (0, path_1.join)(__dirname, '../../shell/cron-command.py');
    const supervisor = (0, fs_1.existsSync)(sourceScript) ? sourceScript : (0, path_1.join)(process.env.QL_DIR, 'shell/cron-command.py');
    const args = ['-I', '-S', supervisor, command, String(process.pid),
        (0, managedExit_cjs_1.receiptPath)(triggerId) || '', process.execPath, (0, path_1.join)(__dirname, 'managedExit.cjs'),
    ];
    if (onCommandStart)
        args.push('report-start');
    if (outputPath)
        args.push('log-output', outputPath);
    const child = (0, cross_spawn_1.spawn)('python3', args, { env: Object.assign(Object.assign({}, process.env), { QL_TRIGGER_ID: triggerId }),
        stdio: onCommandStart ? ['pipe', 'pipe', 'pipe', 'pipe'] : 'pipe' });
    if (onCommandStart && child.stdio[3]) {
        const timing = child.stdio[3];
        let stamp = '';
        timing.setEncoding('ascii').on('data', chunk => { stamp += chunk; });
        timing.once('end', () => { if (/^\d{13}$/.test(stamp))
            onCommandStart(Number(stamp)); });
        timing.on('error', () => { }); // Missing telemetry must not change the command result.
    }
    // A concurrent stop can close the pipe before the authorization write.
    child.stdin.on('error', () => { });
    return child;
}
exports.spawnCronCommand = spawnCronCommand;
function releaseCronCommand(child) {
    return new Promise((resolve, reject) => child.stdin.end('run\n', (error) => error ? reject(error) : resolve()));
}
exports.releaseCronCommand = releaseCronCommand;
//# sourceMappingURL=cronCommandProcess.js.map