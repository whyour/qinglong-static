"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeCron = exports.makeCommand = exports.shellValue = exports.isSpecialSchedule = exports.isBootSchedule = exports.isOnceSchedule = exports.shouldUseCronClient = exports.schedulerMode = exports.isNodeCron = void 0;
const child_process_1 = require("child_process");
const schedule_1 = require("../../interface/schedule");
const const_1 = require("../../config/const");
const shellQuote_1 = require("../../shared/shellQuote");
// Adapt persisted task definitions without reserving or starting an execution.
function isNodeCron(cron) {
    const { schedule, extra_schedules } = cron;
    const fields = (schedule === null || schedule === void 0 ? void 0 : schedule.trim().split(/\s+/)) || [];
    // System crontab only receives portable numeric five-field expressions.
    // Extended syntax, macros and legacy shorthand use the Node scheduler.
    return (Boolean(cron.max_queue_wait || cron.catchup_seconds || cron.skip_if_pending) ||
        fields.length !== 5 ||
        /[^\d\s*,/\-]/.test(schedule || '') ||
        Boolean(extra_schedules === null || extra_schedules === void 0 ? void 0 : extra_schedules.length) ||
        // BusyBox treats N/step as a single value and doesn't support Sunday=7.
        fields.some((field) => field.split(',').some((part) => /^\d+\//.test(part))) ||
        fields[4].includes('7') ||
        // BusyBox steps DOM from zero; its full-range day/week wildcard
        // handling also differs from the legacy Node parser's OR semantics.
        fields[2].includes('/') ||
        (fields[2] !== '*' && fields[4] !== '*'));
}
exports.isNodeCron = isNodeCron;
function schedulerMode() {
    const env = process.env.QL_SCHEDULER;
    if (env === 'system')
        return 'system';
    if (env === 'node')
        return 'node';
    try {
        (0, child_process_1.execSync)('which crond', { stdio: 'ignore' });
        return 'system';
    }
    catch (_a) {
        return 'node';
    }
}
exports.schedulerMode = schedulerMode;
function shouldUseCronClient(cron, mode) {
    if (mode === 'node') {
        return !isSpecialSchedule(cron.schedule);
    }
    return isNodeCron(cron) && !isSpecialSchedule(cron.schedule);
}
exports.shouldUseCronClient = shouldUseCronClient;
function isOnceSchedule(schedule) {
    return schedule === null || schedule === void 0 ? void 0 : schedule.startsWith(schedule_1.ScheduleType.ONCE);
}
exports.isOnceSchedule = isOnceSchedule;
function isBootSchedule(schedule) {
    return schedule === null || schedule === void 0 ? void 0 : schedule.startsWith(schedule_1.ScheduleType.BOOT);
}
exports.isBootSchedule = isBootSchedule;
function isSpecialSchedule(schedule) {
    return isOnceSchedule(schedule) || isBootSchedule(schedule);
}
exports.isSpecialSchedule = isSpecialSchedule;
function shellValue(value) {
    return /^[a-zA-Z0-9_./-]+$/.test(value) ? value : (0, shellQuote_1.shellQuote)(value);
}
exports.shellValue = shellValue;
// Manual, Node and system-crond launches share the existing shell wire format.
function makeCommand(tab, realTime) {
    let command = tab.command.trim();
    if (!command.startsWith(const_1.TASK_PREFIX) && !command.startsWith(const_1.QL_PREFIX)) {
        command = `${const_1.TASK_PREFIX}${tab.command}`;
    }
    let commandVariable = `${tab.recovery_from ? `QL_CRON_REVISION=${Number(tab.recovery_from)} ` : ''}real_time=${Boolean(realTime)} no_tee=true ID=${tab.id} `;
    // Only include log_name if it has a truthy value to avoid passing null/undefined to shell
    if (tab.log_name) {
        commandVariable += `log_name=${shellValue(tab.log_name)} `;
    }
    if (tab.task_before) {
        commandVariable += `task_before='${tab.task_before
            .replace(/'/g, "'\\''")
            .replace(/;? *\n/g, ';')
            .trim()}' `;
    }
    if (tab.task_after) {
        commandVariable += `task_after='${tab.task_after
            .replace(/'/g, "'\\''")
            .replace(/;? *\n/g, ';')
            .trim()}' `;
    }
    if (tab.work_dir) {
        commandVariable += `work_dir='${tab.work_dir.replace(/'/g, "'\\''")}' `;
    }
    const crontab_job_string = `${commandVariable}${command}`;
    return crontab_job_string;
}
exports.makeCommand = makeCommand;
function nodeCron(doc, command) {
    return {
        name: doc.name || '',
        id: String(doc.id),
        schedule: doc.schedule,
        command,
        extra_schedules: doc.extra_schedules || [],
        max_queue_wait: doc.max_queue_wait,
        skip_if_pending: Boolean(doc.skip_if_pending),
        catchup_seconds: doc.catchup_seconds,
        recovery_from: doc.recovery_from,
    };
}
exports.nodeCron = nodeCron;
//# sourceMappingURL=cronScheduling.js.map