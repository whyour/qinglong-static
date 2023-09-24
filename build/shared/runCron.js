"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCron = void 0;
const cross_spawn_1 = require("cross-spawn");
const pLimit_1 = __importDefault(require("./pLimit"));
const logger_1 = __importDefault(require("../loaders/logger"));
function runCron(cmd) {
    return pLimit_1.default.runWithCpuLimit(() => {
        return new Promise(async (resolve) => {
            logger_1.default.info(`[schedule][开始执行任务] 运行命令: ${cmd}`);
            const cp = (0, cross_spawn_1.spawn)(cmd, { shell: '/bin/bash' });
            cp.stderr.on('data', (data) => {
                logger_1.default.info('[schedule][执行任务失败] 命令: %s, 错误信息: %j', cmd, data.toString());
            });
            cp.on('error', (err) => {
                logger_1.default.error('[schedule][创建任务失败] 命令: %s, 错误信息: %j', cmd, err);
            });
            cp.on('close', async (code) => {
                logger_1.default.info(`[schedule][任务退出] ${cmd} 进程id: ${cp.pid} 退出, 退出码 ${code}`);
                resolve();
            });
        });
    });
}
exports.runCron = runCron;
//# sourceMappingURL=runCron.js.map