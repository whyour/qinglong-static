"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStartupProcess = void 0;
const child_process_1 = require("child_process");
// Keep one-off startup dependencies out of the long-lived cluster primary.
function runStartupProcess(entrypoint) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.fork)(entrypoint, [], { stdio: 'inherit' });
        let interrupted;
        let killTimer;
        const terminate = (signal) => {
            if (interrupted)
                return;
            interrupted = signal;
            child.kill(signal);
            killTimer = setTimeout(() => child.kill('SIGKILL'), 8000);
            killTimer.unref();
        };
        const onSigterm = () => terminate('SIGTERM');
        const onSigint = () => terminate('SIGINT');
        const onExit = () => child.kill('SIGKILL');
        const cleanup = () => {
            if (killTimer)
                clearTimeout(killTimer);
            process.removeListener('SIGTERM', onSigterm);
            process.removeListener('SIGINT', onSigint);
            process.removeListener('exit', onExit);
        };
        process.once('SIGTERM', onSigterm);
        process.once('SIGINT', onSigint);
        process.once('exit', onExit);
        child.once('error', (error) => {
            cleanup();
            reject(error);
        });
        child.once('close', (code, signal) => {
            cleanup();
            if (code === 0 && !interrupted) {
                resolve();
            }
            else {
                reject(new Error(`Startup process failed (${interrupted || signal || code})`));
            }
        });
    });
}
exports.runStartupProcess = runStartupProcess;
//# sourceMappingURL=startupProcess.js.map