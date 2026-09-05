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
    echo.on('connection', async (conn) => {
        if (!conn.headers || !conn.url || !conn.pathname) {
            conn.close('404');
            return;
        }
        const authInfo = await store_1.shareStore.getAuthInfo();
        const platform = (0, util_1.getPlatform)(conn.headers['user-agent'] || '') || 'desktop';
        const headerToken = conn.url.replace(`${conn.pathname}?token=`, '');
        if ((0, auth_1.isValidToken)(authInfo, headerToken, platform, config_1.default.jwt.secret)) {
            sockService.addClient(conn);
            const checkSession = setInterval(async () => {
                try {
                    const current = await store_1.shareStore.getAuthInfo();
                    if (!(0, auth_1.isValidToken)(current, headerToken, platform, config_1.default.jwt.secret)) {
                        conn.close('401');
                    }
                }
                catch (_a) {
                    conn.close('401');
                }
            }, 1000);
            checkSession.unref();
            conn.on('data', (message) => {
                conn.write(message);
            });
            conn.on('close', function () {
                clearInterval(checkSession);
                sockService.removeClient(conn);
            });
            return;
        }
        conn.close('404');
    });
    echo.installHandlers(server);
};
//# sourceMappingURL=sock.js.map