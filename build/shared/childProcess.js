"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeChildProcess = exports.asError = void 0;
function asError(error) {
    return error instanceof Error ? error : new Error(String(error));
}
exports.asError = asError;
/** Attach immediately after spawn, before awaiting database or user callbacks. */
function observeChildProcess(child, callbacks = {}) {
    let failure;
    const recordError = (error) => {
        failure !== null && failure !== void 0 ? failure : (failure = asError(error));
    };
    const spawned = new Promise((resolve, reject) => {
        child.once('spawn', resolve);
        // Keep the listener through close: errors can occur after a successful spawn.
        child.on('error', (error) => {
            recordError(error);
            reject(error);
        });
    });
    const closed = new Promise((resolve) => {
        child.once('close', (code, signal) => resolve({ code, signal }));
    });
    const started = spawned.then(async () => {
        var _a;
        await ((_a = callbacks.onStart) === null || _a === void 0 ? void 0 : _a.call(callbacks));
        return child.pid;
    });
    // The caller can ask only for completion, without an unhandled start rejection.
    const ready = started.catch(recordError);
    const consume = async (stream, callback) => {
        var _a, e_1, _b, _c;
        // StringDecoder in Readable preserves UTF-8 characters split across chunks.
        stream.setEncoding('utf8');
        let callbackFailed = false;
        try {
            try {
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const chunk = _c;
                    await ready;
                    if (!callbackFailed && callback) {
                        try {
                            await callback(String(chunk));
                        }
                        catch (error) {
                            recordError(error);
                            callbackFailed = true;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (error) {
            recordError(error);
        }
    };
    const output = Promise.all([
        consume(child.stdout, callbacks.onStdout),
        consume(child.stderr, callbacks.onStderr),
    ]);
    const completed = Promise.all([closed, ready, output]).then(([result]) => (Object.assign(Object.assign({}, result), { error: failure })));
    return { started, completed };
}
exports.observeChildProcess = observeChildProcess;
//# sourceMappingURL=childProcess.js.map