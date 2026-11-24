"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAttributes = exports.visibleAttributes = exports.visibleStatus = void 0;
const sequelize_1 = require("sequelize");
// Queue membership belongs to the trigger. Expose it for list/detail reads
// without writing it into the manual-run reservation used by the scheduler.
exports.visibleStatus = (0, sequelize_1.literal)(`CASE
  WHEN EXISTS (SELECT 1 FROM CronTriggers WHERE cron_id = "Crontab"."id" AND state = 'running') THEN 0
  WHEN "Crontab"."status" = 1 AND EXISTS (
    SELECT 1 FROM CronTriggers WHERE cron_id = "Crontab"."id" AND state = 'queued'
  ) THEN 3
  ELSE "Crontab"."status" END`);
exports.visibleAttributes = {
    exclude: ['status'],
    include: [[exports.visibleStatus, 'status']],
};
// Resolve status and log ownership in one SQLite snapshot. A running trigger
// can be visible before its shell has published the file for this execution.
const activeLogTrigger = `FROM CronTriggers WHERE cron_id = "Crontab"."id"
  AND state = 'running' ORDER BY started_at DESC, rowid DESC LIMIT 1`;
exports.logAttributes = [
    'log_name',
    [exports.visibleStatus, 'status'],
    [
        (0, sequelize_1.literal)(`CASE WHEN EXISTS (SELECT 1 ${activeLogTrigger})
    THEN (SELECT log_path ${activeLogTrigger}) ELSE "Crontab"."log_path" END`),
        'log_path',
    ],
    [
        (0, sequelize_1.literal)(`CASE WHEN allow_multiple_instances = 1 THEN COALESCE(
    (SELECT id ${activeLogTrigger}),
    (SELECT id FROM CronTriggers WHERE cron_id = "Crontab"."id" AND state = 'queued'
      ORDER BY observed_at DESC, rowid DESC LIMIT 1)
  ) END`),
        'logTriggerId',
    ],
];
//# sourceMappingURL=cronViews.js.map