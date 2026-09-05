"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLogChunk = exports.MAX_LOG_CHUNK_BYTES = exports.DEFAULT_LOG_CHUNK_BYTES = void 0;
const promises_1 = __importDefault(require("fs/promises"));
exports.DEFAULT_LOG_CHUNK_BYTES = 256 * 1024;
exports.MAX_LOG_CHUNK_BYTES = 1024 * 1024;
function normalizeLimit(limit) {
    if (!Number.isFinite(limit))
        return exports.DEFAULT_LOG_CHUNK_BYTES;
    return Math.min(Math.max(Math.trunc(limit), 4), exports.MAX_LOG_CHUNK_BYTES);
}
function isUtf8ContinuationByte(byte) {
    return (byte & 0xc0) === 0x80;
}
function completeUtf8End(buffer, start, end) {
    if (end <= start)
        return start;
    let sequenceStart = end - 1;
    while (sequenceStart > start &&
        isUtf8ContinuationByte(buffer[sequenceStart])) {
        sequenceStart--;
    }
    const firstByte = buffer[sequenceStart];
    const expectedLength = firstByte < 0x80
        ? 1
        : firstByte < 0xe0
            ? 2
            : firstByte < 0xf0
                ? 3
                : 4;
    return end - sequenceStart < expectedLength ? sequenceStart : end;
}
async function readLogChunk(filePath, options = {}) {
    let handle;
    try {
        handle = await promises_1.default.open(filePath, 'r');
        const { size: total } = await handle.stat();
        const limit = normalizeLimit(options.limit);
        const requestedOffset = Number.isFinite(options.offset)
            ? Math.trunc(options.offset)
            : undefined;
        const requestedStart = options.tail || requestedOffset === undefined
            ? Math.max(total - limit, 0)
            : Math.min(Math.max(requestedOffset, 0), total);
        const length = Math.min(limit + 3, total - requestedStart);
        const buffer = Buffer.allocUnsafe(length);
        const { bytesRead } = await handle.read(buffer, 0, length, requestedStart);
        let leadingBytes = 0;
        while (leadingBytes < bytesRead &&
            isUtf8ContinuationByte(buffer[leadingBytes])) {
            leadingBytes++;
        }
        const offset = requestedStart + leadingBytes;
        const candidateEnd = Math.min(leadingBytes + limit, bytesRead);
        const contentEnd = completeUtf8End(buffer, leadingBytes, candidateEnd);
        const nextOffset = requestedStart + contentEnd;
        return {
            content: buffer.subarray(leadingBytes, contentEnd).toString('utf8'),
            offset,
            nextOffset,
            total,
            truncated: offset > 0 || nextOffset < total,
        };
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 'ENOENT') {
            return {
                content: '',
                offset: 0,
                nextOffset: 0,
                total: 0,
                truncated: false,
            };
        }
        throw error;
    }
    finally {
        await (handle === null || handle === void 0 ? void 0 : handle.close());
    }
}
exports.readLogChunk = readLogChunk;
//# sourceMappingURL=logReader.js.map