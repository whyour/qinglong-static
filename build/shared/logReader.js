"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLogChunk = exports.MAX_LOG_CHUNK_BYTES = exports.DEFAULT_LOG_CHUNK_BYTES = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = require("crypto");
exports.DEFAULT_LOG_CHUNK_BYTES = 256 * 1024;
exports.MAX_LOG_CHUNK_BYTES = 1024 * 1024;
// The viewer retains at most one Mi UTF-16 code units.
const CURSOR_WINDOW_BYTES = 4 * exports.MAX_LOG_CHUNK_BYTES;
// Cache only a server-verified EOF, never client-supplied file metadata or log
// contents. Bound both the number of viewers retained and verification lifetime.
const EOF_CACHE_LIMIT = 256;
const EOF_CACHE_TTL_MS = 30000;
const EOF_CACHE_SETTLE_MS = 2000;
const verifiedEnds = new Map();
function fileVersion(stat) {
    return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}:${stat.birthtimeNs}`;
}
function rememberEnd(filePath, version, cursor, offset) {
    verifiedEnds.delete(filePath);
    verifiedEnds.set(filePath, {
        version,
        cursor,
        offset,
        verifiedAt: Date.now(),
    });
    if (verifiedEnds.size > EOF_CACHE_LIMIT)
        verifiedEnds.delete(verifiedEnds.keys().next().value);
}
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
    const expectedLength = firstByte < 0x80 ? 1 : firstByte < 0xe0 ? 2 : firstByte < 0xf0 ? 3 : 4;
    return end - sequenceStart < expectedLength ? sequenceStart : end;
}
function logDigest(identity, from, bytes) {
    return (0, crypto_1.createHash)('sha256')
        .update(`${identity}:${from}:`)
        .update(bytes)
        .digest('hex');
}
async function readLogChunk(filePath, options = {}) {
    let handle;
    try {
        handle = await promises_1.default.open(filePath, 'r');
        const stat = await handle.stat({ bigint: true });
        const total = Number(stat.size);
        const identity = `${stat.dev}:${stat.ino}`;
        const version = fileVersion(stat);
        const observedAt = Date.now();
        // Even nanosecond stat fields can repeat across writes within a filesystem
        // clock tick. Never cache content read while that timestamp is still fresh.
        const metadataSettled = Number(stat.mtimeMs) > 0 &&
            Number(stat.ctimeMs) > 0 &&
            observedAt - Number(stat.mtimeMs) >= EOF_CACHE_SETTLE_MS &&
            observedAt - Number(stat.ctimeMs) >= EOF_CACHE_SETTLE_MS;
        const limit = normalizeLimit(options.limit);
        const requestedOffset = Number.isFinite(options.offset)
            ? Math.max(0, Math.trunc(options.offset))
            : undefined;
        let start = options.tail || requestedOffset === undefined
            ? Math.max(total - limit, 0)
            : Math.min(requestedOffset, total);
        const resume = options.cursor && !options.tail && requestedOffset !== undefined;
        const verified = verifiedEnds.get(filePath);
        if (resume &&
            (verified === null || verified === void 0 ? void 0 : verified.version) === version &&
            verified.cursor === options.cursor &&
            verified.offset === requestedOffset &&
            requestedOffset === total &&
            observedAt >= verified.verifiedAt &&
            observedAt - verified.verifiedAt < EOF_CACHE_TTL_MS) {
            // A cache hit does not extend the deadline: even an unchanged file is
            // periodically verified again. Keep the entry recent without retaining bytes.
            verifiedEnds.delete(filePath);
            verifiedEnds.set(filePath, verified);
            return {
                content: '',
                offset: total,
                nextOffset: total,
                total,
                truncated: total > 0,
                cursor: options.cursor,
                reset: false,
            };
        }
        const [fromText, digest] = resume ? options.cursor.split('.') : [];
        let from = resume ? Number(fromText) : start;
        let reset = Boolean(resume &&
            (requestedOffset !== start ||
                !Number.isSafeInteger(from) ||
                from < 0 ||
                from > start ||
                start - from > CURSOR_WINDOW_BYTES));
        if (reset)
            from = start = 0;
        // Read the previously displayed bytes and their continuation together.
        // A truncate followed by regrowth can leave both size and inode unchanged.
        const readWindow = async (position, end) => {
            const data = Buffer.allocUnsafe(Math.min(end, total) - position);
            const { bytesRead } = await handle.read(data, 0, data.length, position);
            return data.subarray(0, bytesRead);
        };
        let window = await readWindow(from, start + limit + 3);
        if (resume && !reset) {
            const prefix = window.subarray(0, start - from);
            if (prefix.length !== start - from ||
                logDigest(identity, from, prefix) !== digest) {
                reset = true;
                start = from = 0;
                window = await readWindow(0, limit + 3);
            }
        }
        const buffer = window.subarray(start - from);
        const bytesRead = buffer.length;
        let leadingBytes = 0;
        while (leadingBytes < bytesRead &&
            isUtf8ContinuationByte(buffer[leadingBytes])) {
            leadingBytes++;
        }
        const offset = start + leadingBytes;
        const candidateEnd = Math.min(leadingBytes + limit, bytesRead);
        const contentEnd = completeUtf8End(buffer, leadingBytes, candidateEnd);
        const nextOffset = start + contentEnd;
        let cursor;
        if (options.follow || options.cursor) {
            const retainedFrom = Math.max(from, nextOffset - CURSOR_WINDOW_BYTES);
            cursor =
                resume && !reset && nextOffset === start
                    ? options.cursor
                    : `${retainedFrom}.${logDigest(identity, retainedFrom, window.subarray(retainedFrom - from, nextOffset - from))}`;
        }
        if (cursor && nextOffset === total && metadataSettled) {
            // Do not trust an EOF read that raced with append, truncate or overwrite.
            // ctime also detects rewrites that restore mtime; inode detects replacement.
            if (fileVersion(await handle.stat({ bigint: true })) === version)
                rememberEnd(filePath, version, cursor, nextOffset);
        }
        return Object.assign(Object.assign({}, (cursor && { cursor, reset })), { content: buffer.subarray(leadingBytes, contentEnd).toString('utf8'), offset,
            nextOffset,
            total, truncated: offset > 0 || nextOffset < total });
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 'ENOENT') {
            verifiedEnds.delete(filePath);
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