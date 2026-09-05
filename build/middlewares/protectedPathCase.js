"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function protectedPathCase(req, res, next) {
    const originalPath = req.path;
    const normalizedPath = originalPath.toLowerCase();
    if (originalPath !== normalizedPath &&
        (normalizedPath.startsWith('/api/') ||
            normalizedPath.startsWith('/open/'))) {
        return res.status(400).json({
            code: 400,
            message: 'Invalid path format',
        });
    }
    return next();
}
exports.default = protectedPathCase;
//# sourceMappingURL=protectedPathCase.js.map