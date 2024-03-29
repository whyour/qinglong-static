"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sockjs_1 = __importDefault(require("sockjs"));
const typedi_1 = require("typedi");
const sock_1 = __importDefault(require("../services/sock"));
const index_1 = __importDefault(require("../config/index"));
const promises_1 = __importDefault(require("fs/promises"));
const util_1 = require("../config/util");
exports.default = async ({ server }) => {
    const echo = sockjs_1.default.createServer({ prefix: '/api/ws', log: () => { } });
    const sockService = typedi_1.Container.get(sock_1.default);
    echo.on('connection', async (conn) => {
        if (!conn.headers || !conn.url || !conn.pathname) {
            conn.close('404');
        }
        const data = await promises_1.default.readFile(index_1.default.authConfigFile, 'utf8');
        const platform = (0, util_1.getPlatform)(conn.headers['user-agent'] || '') || 'desktop';
        const headerToken = conn.url.replace(`${conn.pathname}?token=`, '');
        if (data) {
            const { token = '', tokens = {} } = (0, util_1.safeJSONParse)(data);
            if (headerToken === token || tokens[platform] === headerToken) {
                conn.write(JSON.stringify({ type: 'ping', message: 'hanhh' }));
                sockService.addClient(conn);
                conn.on('data', (message) => {
                    conn.write(message);
                });
                conn.on('close', function () {
                    sockService.removeClient(conn);
                });
                return;
            }
            else {
                conn.write(JSON.stringify({ type: 'ping', message: 'whyour' }));
            }
        }
        conn.close('404');
    });
    echo.installHandlers(server);
};
//# sourceMappingURL=sock.js.map