"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStreamManager = exports.LogStreamManager = void 0;
const fs_1 = require("fs");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const fileAccess_1 = require("./fileAccess");
/**
 * Manages write streams for log files to improve performance by avoiding repeated file opens
 */
class LogStreamManager extends events_1.EventEmitter {
    constructor(logRoot = config_1.default.logPath) {
        super();
        this.logRoot = logRoot;
        this.streams = new Map();
        this.pendingWrites = new Map();
        this.closingStreams = new Map();
        this.closedStreams = new WeakSet();
        this.streamErrors = new Map();
    }
    /** Register each write synchronously, so concurrent callers cannot lose the tail. */
    async write(filePath, data) {
        if (this.closingStreams.has(filePath)) {
            throw new Error(`Log stream is closing: ${filePath}`);
        }
        const previous = this.pendingWrites.get(filePath) || Promise.resolve();
        const pending = previous.then(() => new Promise((resolve, reject) => {
            const failure = this.streamErrors.get(filePath);
            if (failure)
                return reject(failure);
            let stream = this.streams.get(filePath);
            if (!stream) {
                // Validate only when opening: subsequent chunks reuse the same descriptor.
                const root = path_1.default.resolve(this.logRoot);
                const target = path_1.default.resolve(filePath);
                if (!target.startsWith(root + path_1.default.sep) ||
                    !(0, fileAccess_1.resolveFileAccess)(root, [target])) {
                    return reject(new Error('Log path is outside the log directory'));
                }
                stream = (0, fs_1.createWriteStream)(target, { flags: 'a' });
                this.streams.set(filePath, stream);
                const current = stream;
                stream.once('close', () => this.closedStreams.add(current));
                stream.on('error', (error) => {
                    this.streamErrors.set(filePath, error);
                    // EventEmitter's unobserved "error" event would crash the caller.
                    if (this.listenerCount('error') > 0)
                        this.emit('error', { filePath, error });
                });
            }
            stream.write(data, 'utf8', (error) => error ? reject(error) : resolve());
        }));
        this.pendingWrites.set(filePath, pending);
        // Keep the tail until close, including failures; never reopen a failed log mid-run.
        return pending;
    }
    async closeStream(filePath) {
        const closing = this.closingStreams.get(filePath);
        if (closing)
            return closing;
        const pending = this.pendingWrites.get(filePath);
        const result = (async () => {
            let failure;
            try {
                await pending;
            }
            catch (error) {
                failure = error;
            }
            const stream = this.streams.get(filePath);
            try {
                if (stream && !this.closedStreams.has(stream)) {
                    await new Promise((resolve) => {
                        stream.once('close', resolve);
                        if (failure || stream.destroyed)
                            stream.destroy();
                        else
                            stream.end();
                    });
                }
                failure || (failure = this.streamErrors.get(filePath));
                if (failure)
                    throw failure;
            }
            finally {
                this.streams.delete(filePath);
                this.pendingWrites.delete(filePath);
                this.streamErrors.delete(filePath);
            }
        })();
        this.closingStreams.set(filePath, result);
        try {
            await result;
        }
        finally {
            this.closingStreams.delete(filePath);
        }
    }
    /**
     * Close all open streams
     */
    async closeAll() {
        const paths = new Set([
            ...this.streams.keys(),
            ...this.pendingWrites.keys(),
        ]);
        const closePromises = Array.from(paths).map((filePath) => this.closeStream(filePath));
        await Promise.all(closePromises);
    }
    /**
     * Get the number of open streams
     */
    getOpenStreamCount() {
        return this.streams.size;
    }
}
exports.LogStreamManager = LogStreamManager;
// Export a singleton instance for shared use
exports.logStreamManager = new LogStreamManager();
//# sourceMappingURL=logStreamManager.js.map