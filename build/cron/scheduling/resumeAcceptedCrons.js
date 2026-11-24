"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeAcceptedCrons = void 0;
const executionModels_1 = require("../../data/executionModels");
const sequelize_1 = require("sequelize");
const cron_1 = require("../../data/cron");
const identity_1 = require("../identity");
const runCron_1 = require("../execution/runCron");
// Accepted work is distinct from catching up timers missed while offline.
// Keep its identity and original queue deadline; never replay a bound command.
async function resumeAcceptedCrons(item, current) {
    const rows = await (0, executionModels_1.executionModel)(cron_1.CrontabModel.sequelize, 'CronTriggers').findAll({
        attributes: ['id', 'scheduled_at', 'queued_at'],
        where: {
            cron_id: Number(item.id),
            source: { [sequelize_1.Op.in]: ['node', 'recovery'] },
            state: 'skipped',
            reason: 'restart',
            resume_pending: 1,
            started_at: null,
            queued_at: { [sequelize_1.Op.gte]: item.recovery_from || 0 },
        },
        order: [
            ['queued_at', 'ASC'],
            ['id', 'ASC'],
        ],
        raw: true,
    });
    const rules = [
        item.schedule,
        ...(item.extra_schedules || []).map((s) => s.schedule),
    ];
    await Promise.all(rows
        .filter((row) => rules.some((rule, i) => (0, identity_1.slotId)(item.id, i, rule, row.scheduled_at) === row.id))
        .map((row) => (0, runCron_1.runCron)(item.command, item, current, {
        id: row.id,
        time: row.scheduled_at,
        queuedAt: row.queued_at,
        source: 'recovery',
    })));
}
exports.resumeAcceptedCrons = resumeAcceptedCrons;
//# sourceMappingURL=resumeAcceptedCrons.js.map