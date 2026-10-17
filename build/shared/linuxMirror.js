"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mirrorWriteCommand = exports.rewriteMirrorSources = exports.replaceMirrorUrl = exports.normalizeMirror = void 0;
const shellQuote_1 = require("./shellQuote");
const repositoryNames = /^(debian(?:-security)?|ubuntu(?:-ports)?|alpine|armbian)$/;
function normalizeMirror(mirror) {
    if (/\s/.test(mirror))
        throw new Error('Invalid Linux mirror URL');
    const url = new URL(mirror);
    if (!['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash) {
        throw new Error('Linux mirror must be an HTTP(S) URL without credentials, query or fragment');
    }
    return url;
}
exports.normalizeMirror = normalizeMirror;
function replaceMirrorUrl(current, mirror) {
    const target = normalizeMirror(mirror);
    const previous = new URL(current);
    const oldSegments = previous.pathname.split('/').filter(Boolean);
    const newSegments = target.pathname.split('/').filter(Boolean);
    const repositoryIndex = oldSegments.findIndex((part) => repositoryNames.test(part));
    const targetIndex = newSegments.findIndex((part) => repositoryNames.test(part));
    const prefix = targetIndex >= 0 ? newSegments.slice(0, targetIndex) : newSegments;
    if (repositoryIndex >= 0) {
        const repository = oldSegments[repositoryIndex];
        let suffix = oldSegments.slice(repositoryIndex + 1);
        // Repair paths already corrupted by repeated authority-only replacement.
        while (suffix[0] === repository)
            suffix.shift();
        return `${target.origin}/${[...prefix, repository, ...suffix].join('/')}`;
    }
    // Unknown repository paths: a full URL replaces the old root, a hostname
    // preserves it. Never append the newly entered root to the existing root.
    return `${target.origin}/${(newSegments.length
        ? newSegments
        : oldSegments).join('/')}`;
}
exports.replaceMirrorUrl = replaceMirrorUrl;
function rewriteMirrorSources(content, mirror) {
    normalizeMirror(mirror);
    return content
        .split(/(\r?\n[ \t]*\r?\n)/)
        .map((stanza) => {
        var _a;
        const signedBy = (_a = stanza.match(/^Signed-By:\s*([^\r\n]*)/im)) === null || _a === void 0 ? void 0 : _a[1];
        return stanza
            .split('\n')
            .map((line) => {
            var _a;
            if (!/^\s*(?:URIs:|deb(?:-src)?\s|https?:\/\/)/.test(line))
                return line;
            const legacy = /^\s*deb(?:-src)?\s/.test(line);
            const key = legacy
                ? (_a = line.match(/\bsigned-by=([^\]\s]+)/i)) === null || _a === void 0 ? void 0 : _a[1]
                : signedBy;
            // In .list files a # starts an inline comment; its URLs are metadata.
            const comment = legacy ? line.indexOf('#') : -1;
            const source = comment < 0 ? line : line.slice(0, comment);
            const rewritten = source.replace(/https?:\/\/[^\s#]+/g, (url) => isSystemRepository(url, key) ? replaceMirrorUrl(url, mirror) : url);
            return rewritten + (comment < 0 ? '' : line.slice(comment));
        })
            .join('\n');
    })
        .join('');
}
exports.rewriteMirrorSources = rewriteMirrorSources;
function isSystemRepository(url, signedBy) {
    const keys = (signedBy === null || signedBy === void 0 ? void 0 : signedBy.trim().split(/[\s,]+/).filter(Boolean)) || [];
    const archiveKeyring = keys.length > 0 &&
        keys.every((key) => /\/(?:debian|ubuntu|armbian)-archive-keyring\.(?:gpg|asc)$/.test(key));
    // A separate signing key identifies a third-party archive, even if its
    // repository happens to be called /debian or /ubuntu.
    if (keys.length > 0 && !archiveKeyring)
        return false;
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const repositoryIndex = segments.findIndex((part) => repositoryNames.test(part));
    if (repositoryIndex < 0)
        return false;
    // Without archive metadata, accept only conventional archive roots. A
    // vendor path such as Docker's /linux/debian is not the Debian archive.
    return (archiveKeyring ||
        repositoryIndex === 0 ||
        segments
            .slice(0, repositoryIndex)
            .every((part) => /^mirrors?$/.test(part)) ||
        segments[repositoryIndex] === 'alpine');
}
function mirrorWriteCommand(file, content, prefix, update) {
    return `${prefix}mkdir -p ${(0, shellQuote_1.shellQuote)(file.slice(0, file.lastIndexOf('/')))} && printf '%s' ${(0, shellQuote_1.shellQuote)(content)} | ${prefix}tee ${(0, shellQuote_1.shellQuote)(file)} >/dev/null && ${update}`;
}
exports.mirrorWriteCommand = mirrorWriteCommand;
//# sourceMappingURL=linuxMirror.js.map