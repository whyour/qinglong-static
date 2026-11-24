"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemCronAdapter = void 0;
const cron_1 = require("../../data/cron");
const index_1 = __importDefault(require("../../config/index"));
const child_process_1 = require("child_process");
const client_1 = __importDefault(require("../../schedule/client"));
const systemScheduleAudit_1 = require("./systemScheduleAudit");
const cronScheduling_1 = require("./cronScheduling");
const shellQuote_1 = require("../../shared/shellQuote");
const utils_1 = require("../../shared/utils");
const childProcess_1 = require("../../shared/childProcess");
const i18n_1 = require("../../shared/i18n");
// Publication is called under the service's scheduler mutation lock. Staging,
// installation and confirmation keep their existing order and failure semantics.
class SystemCronAdapter {
    constructor(logger) {
        this.logger = logger;
    }
    async publish(crons, mode = cronScheduling_1.schedulerMode, command = cronScheduling_1.makeCommand) {
        var _a;
        const rules = [];
        var crontab_string = '';
        crons.forEach((tab) => {
            if (tab.isDisabled === 1 ||
                (0, cronScheduling_1.isNodeCron)(tab) ||
                (0, cronScheduling_1.isSpecialSchedule)(tab.schedule)) {
                crontab_string += '# ';
                crontab_string += tab.schedule;
                crontab_string += ' ';
                crontab_string += command(tab);
                crontab_string += '\n';
            }
            else {
                crontab_string += tab.schedule;
                crontab_string += ' ';
                rules.push({
                    id: tab.id,
                    schedule: tab.schedule,
                    name: tab.name || tab.command,
                });
                crontab_string += `QL_SYSTEM_DISPATCHED=$(date +\\%s) QL_SYSTEM_RULE=${(0, shellQuote_1.shellQuote)(tab.schedule)} ID=${tab.id} QL_TRIGGER_SOURCE=system bash "$QL_DIR/shell/system-cron.sh" ${(0, shellQuote_1.shellQuote)(command(tab))}`;
                crontab_string += '\n';
            }
        });
        try {
            const system = mode() === 'system';
            const db = cron_1.CrontabModel.sequelize;
            const plan = system ? await (0, systemScheduleAudit_1.stageSystemPlan)(db, rules) : undefined;
            if (!system)
                await (0, systemScheduleAudit_1.suspendSystemPlan)(db);
            await (0, utils_1.writeFileWithLock)(index_1.default.crontabFile, crontab_string);
            if (plan !== undefined) {
                (0, child_process_1.execFileSync)('crontab', [index_1.default.crontabFile]);
                await (0, systemScheduleAudit_1.confirmSystemPlan)(db, plan);
            }
        }
        catch (error) {
            this.logger.error('[crontab] Failed to publish crontab:', (0, childProcess_1.asError)(error).message);
            client_1.default.readiness.invalidate();
            if (process.env.SERVICE_TYPE === 'grpc')
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'crontab-install-failed');
            // A fresh host may have no installed crontab at all. A previous boot's
            // saved flag does not confirm any portable rule in the failed snapshot.
            if (mode() === 'system') {
                const ids = crons
                    .filter((row) => !(0, cronScheduling_1.isNodeCron)(row) && !(0, cronScheduling_1.isSpecialSchedule)(row.schedule))
                    .map((row) => row.id);
                if (ids.length)
                    await cron_1.CrontabModel.update({ saved: false }, { where: { id: ids } });
            }
            throw Object.assign(new Error((0, i18n_1.t)('系统定时规则安装失败，旧规则可能仍在运行，正在重试')), { status: 503 });
        }
    }
}
exports.SystemCronAdapter = SystemCronAdapter;
//# sourceMappingURL=systemCron.js.map