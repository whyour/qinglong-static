"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStreamManager = exports.LogStreamManager = void 0;
const fs_1 = require("fs");
const events_1 = require("events");
/**
 * Manages write streams for log files to improve performance by avoiding repeated file opens
 */
class LogStreamManager extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.streams = new Map();
        this.pendingWrites = new Map();
    }
    /**
     * Write data to a log file using a managed stream
     * @param filePath - Absolute path to the log file
     * @param data - Data to write to the log file
     */
    async write(filePath, data) {
        // Wait for any pending writes to this file to complete
        const pending = this.pendingWrites.get(filePath);
        if (pending) {
            await pending;
        }
        // Create a new promise for this write operation
        const writePromise = new Promise((resolve, reject) => {
            let stream = this.streams.get(filePath);
            if (!stream) {
                // Create a new write stream if one doesn't exist
                stream = (0, fs_1.createWriteStream)(filePath, { flags: 'a' });
                this.streams.set(filePath, stream);
                // Handle stream errors
                stream.on('error', (error) => {
                    this.emit('error', { filePath, error });
                    // Remove the stream from the map on error
                    this.streams.delete(filePath);
                    reject(error);
                });
            }
            // Write the data
            const canContinue = stream.write(data, 'utf8', (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
            // Handle backpressure
            if (!canContinue) {
                stream.once('drain', () => {
                    // Stream is ready for more data
                });
            }
        });
        this.pendingWrites.set(filePath, writePromise);
        try {
            await writePromise;
        }
        finally {
            this.pendingWrites.delete(filePath);
        }
    }
    /**
     * Close the stream for a specific file path
     * @param filePath - Absolute path to the log file
     */
    async closeStream(filePath) {
        // Wait for any pending writes to complete
        const pending = this.pendingWrites.get(filePath);
        if (pending) {
            await pending.catch(() => {
                // Ignore errors on pending writes during close
            });
        }
        const stream = this.streams.get(filePath);
        if (stream) {
            return new Promise((resolve) => {
                stream.end(() => {
                    this.streams.delete(filePath);
                    resolve();
                });
            });
        }
    }
    /**
     * Close all open streams
     */
    async closeAll() {
        const closePromises = Array.from(this.streams.keys()).map((filePath) => this.closeStream(filePath));
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