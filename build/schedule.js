"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = __importDefault(require("node-schedule"));
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const logger_1 = __importDefault(require("./loaders/logger"));
const typedi_1 = require("typedi");
const cron_1 = __importDefault(require("./services/cron"));
const cron_2 = require("./data/cron");
const config_1 = __importDefault(require("./config"));
const app = express_1.default();
const run = async () => {
    const cronService = typedi_1.Container.get(cron_1.default);
    const cronDb = cronService.getDb();
    cronDb
        .find({})
        .sort({ created: 1 })
        .exec((err, docs) => {
        if (err) {
            logger_1.default.error(err);
            process.exit(1);
        }
        if (docs && docs.length > 0) {
            for (let i = 0; i < docs.length; i++) {
                const task = docs[i];
                const _schedule = task.schedule && task.schedule.split(' ');
                if (_schedule &&
                    _schedule.length > 5 &&
                    task.status !== cron_2.CrontabStatus.disabled &&
                    !task.isDisabled) {
                    node_schedule_1.default.scheduleJob(task.schedule, function () {
                        let command = task.command;
                        if (!command.includes('task ') && !command.includes('ql ')) {
                            command = `task ${command}`;
                        }
                        child_process_1.exec(command);
                    });
                }
            }
        }
    });
};
app
    .listen(config_1.default.cronPort, () => {
    run();
    logger_1.default.info(`
      ################################################
      🛡️  Schedule listening on port: ${config_1.default.cronPort} 🛡️
      ################################################
    `);
})
    .on('error', (err) => {
    logger_1.default.error(err);
    process.exit(1);
});
//# sourceMappingURL=schedule.js.map