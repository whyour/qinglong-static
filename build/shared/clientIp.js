"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = exports.normalizeClientIp = void 0;
const IPV4_MAPPED_PREFIX = '::ffff:';
function normalizeClientIp(value) {
    let ip = (value || '').trim().toLowerCase();
    if (!ip) {
        return '';
    }
    if (ip.startsWith('[') && ip.endsWith(']')) {
        ip = ip.slice(1, -1);
    }
    const zoneIndex = ip.indexOf('%');
    if (zoneIndex !== -1) {
        ip = ip.slice(0, zoneIndex);
    }
    if (ip.startsWith(IPV4_MAPPED_PREFIX)) {
        return ip.slice(IPV4_MAPPED_PREFIX.length);
    }
    return ip;
}
exports.normalizeClientIp = normalizeClientIp;
function getClientIp(req) {
    return normalizeClientIp(req.ip || req.socket.remoteAddress);
}
exports.getClientIp = getClientIp;
//# sourceMappingURL=clientIp.js.map