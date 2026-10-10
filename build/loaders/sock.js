"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sockjs_1 = __importDefault(require("sockjs"));
const typedi_1 = require("typedi");
const sock_1 = __importDefault(require("../services/sock"));
const util_1 = require("../config/util");
const store_1 = require("../shared/store");
const auth_1 = require("../shared/auth");
const config_1 = __importDefault(require("../config"));
exports.default = async ({ server }) => {
    const echo = sockjs_1.default.createServer({
        prefix: `${config_1.default.baseUrl}/api/ws`,
        log: () => { },
    });
    const sockService = typedi_1.Container.get(sock_1.default);
    const sessions = new Map();
    let sessionTimer;
    let checking = false;
    const checkSessions = async () => {
        if (checking || sessions.size === 0)
            return;
        checking = true;
        // Connections accepted during this read must not use an older snapshot.
        const batch = [...sessions];
        try {
            const current = await store_1.shareStore.getAuthInfo();
            // Reuse validation only within this synchronous check of one auth snapshot.
            const validated = new Map();
            for (const [conn, { token, platform }] of batch) {
                if (!sessions.has(conn))
                    continue;
                let platforms = validated.get(token);
                if (!platforms) {
                    platforms = new Map();
                    validated.set(token, platforms);
                }
                let valid = platforms.get(platform);
                if (valid === undefined) {
                    valid = (0, auth_1.isValidToken)(current, token, platform, config_1.default.jwt.secret);
                    platforms.set(platform, valid);
                }
                if (!valid)
                    conn.close('401');
            }
        }
        catch (_a) {
            for (const [conn] of batch) {
                if (sessions.has(conn))
                    conn.close('401');
            }
        }
        finally {
            checking = false;
        }
    };
    echo.on('connection', async (conn) => {
        if (!conn.headers || !conn.url || !conn.pathname) {
            conn.close('404');
            return;
        }
        let closed = false;
        conn.on('close', () => {
            closed = true;
            sessions.delete(conn);
            sockService.removeClient(conn);
            if (sessions.size === 0 && sessionTimer) {
                clearInterval(sessionTimer);
                sessionTimer = undefined;
            }
        });
        let authInfo;
        try {
            authInfo = await store_1.shareStore.getAuthInfo();
        }
        catch (_a) {
            if (!closed)
                conn.close('401');
            return;
        }
        if (closed)
            return;
        const platform = (0, util_1.getPlatform)(conn.headers['user-agent'] || '') || 'desktop';
        const headerToken = conn.url.replace(`${conn.pathname}?token=`, '');
        if ((0, auth_1.isValidToken)(authInfo, headerToken, platform, config_1.default.jwt.secret)) {
            sockService.addClient(conn);
            sessions.set(conn, { token: headerToken, platform });
            if (!sessionTimer) {
                sessionTimer = setInterval(checkSessions, 1000);
                sessionTimer.unref();
            }
            conn.on('data', (message) => {
                conn.write(message);
            });
            return;
        }
        conn.close('404');
    });
    echo.installHandlers(server);
};
//# sourceMappingURL=sock.js.map