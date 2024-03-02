"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const sock_1 = __importDefault(require("./sock"));
exports.default = async ({ server }) => {
    await (0, sock_1.default)({ server });
    logger_1.default.info('✌️ Sock loaded');
    let exitTime = 0;
    let timer;
    process.on('SIGINT', (singal) => {
        logger_1.default.warn(`Server need close, singal ${singal}`);
        console.warn(`Server need close, singal ${singal}`);
        exitTime++;
        if (exitTime >= 3) {
            logger_1.default.warn('Forcing server close');
            console.warn('Forcing server close');
            clearTimeout(timer);
            process.exit(1);
        }
        server.close(() => {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                process.exit();
            }, 15000);
        });
    });
    process.on('uncaughtException', (error) => {
        logger_1.default.error('Uncaught exception:', error);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger_1.default.error('Unhandled rejection:', reason, promise);
    });
};
//# sourceMappingURL=server.js.map