"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const dayjs_1 = __importDefault(require("dayjs"));
const sequelize_1 = require("sequelize");
const typedi_1 = require("typedi");
const config_1 = __importDefault(require("../config"));
const cronStats_1 = require("../data/cronStats");
const data_1 = require("../data");
const history_1 = require("../cron/history");
const schemaMigrations_1 = require("../data/schemaMigrations");
const runningInstance_1 = require("../data/runningInstance");
const system_1 = require("../data/system");
const retention_1 = require("../shared/retention");
function runningInstanceWhere(cutoffMs) {
    const cutoff = cutoffMs / 1000;
    return {
        status: { [sequelize_1.Op.ne]: runningInstance_1.InstanceStatus.running },
        id: {
            [sequelize_1.Op.notIn]: (0, sequelize_1.literal)(`(SELECT instance_id FROM CronTriggers WHERE instance_id IS NOT NULL
      AND (exit_pending=1 OR state IN ('queued','running') OR finished_at IS NULL OR observed_at >= ${cutoffMs} OR finished_at >= ${cutoffMs}))`),
        },
        [sequelize_1.Op.or]: [
            { finished_at: { [sequelize_1.Op.lt]: cutoff } },
            {
                finished_at: { [sequelize_1.Op.is]: null },
                started_at: { [sequelize_1.Op.lt]: cutoff },
            },
        ],
    };
}
function retentionCutoffs(policy) {
    const now = (0, dayjs_1.default)();
    return {
        history: now
            .subtract(policy.runningInstanceRetentionDays, 'day')
            .startOf('second')
            .valueOf(),
        firstDay: now
            .subtract(policy.cronStatRetentionDays, 'day')
            .format('YYYY-MM-DD'),
    };
}
let RetentionService = class RetentionService {
    async updatePolicy(policy) {
        const normalized = (0, retention_1.normalizeRetentionPolicy)(policy);
        const systemConfig = await system_1.SystemModel.findOne({
            where: { type: system_1.AuthDataType.systemConfig },
        });
        if (!systemConfig) {
            throw new Error('System config not found');
        }
        await system_1.SystemModel.update({
            info: Object.assign(Object.assign({}, systemConfig.info), normalized),
        }, { where: { id: systemConfig.id } });
        return normalized;
    }
    async preview(request, cutoffs = retentionCutoffs((0, retention_1.normalizeRetentionPolicy)(request))) {
        const policy = (0, retention_1.normalizeRetentionPolicy)(request);
        const dependenceCacheTypes = (request.dependenceCacheTypes || []).filter(retention_1.isDependenceCacheType);
        const [runningInstances, cronStats, dependenceCaches, triggers] = await Promise.all([
            policy.runningInstanceRetentionDays > 0
                ? runningInstance_1.RunningInstanceModel.count({
                    where: runningInstanceWhere(cutoffs.history),
                })
                : 0,
            policy.cronStatRetentionDays > 0
                ? cronStats_1.CrontabStatModel.count({
                    where: { date: { [sequelize_1.Op.lt]: cutoffs.firstDay } },
                })
                : 0,
            Promise.all(dependenceCacheTypes.map(async (type) => ({
                type,
                bytes: await (0, retention_1.getDirectorySize)(path_1.default.join(config_1.default.dependenceCachePath, type)),
            }))),
            policy.runningInstanceRetentionDays > 0
                ? new history_1.TriggerHistory(data_1.sequelize).countExpired(cutoffs.history)
                : 0,
        ]);
        return {
            policy,
            runningInstances,
            triggers,
            cronStats,
            dependenceCaches,
            dependenceCacheBytes: dependenceCaches.reduce((total, cache) => total + cache.bytes, 0),
            compactDatabase: Boolean(request.compactDatabase),
        };
    }
    async cleanup(request) {
        const cutoffs = retentionCutoffs((0, retention_1.normalizeRetentionPolicy)(request));
        const preview = await this.preview(request, cutoffs);
        const deleted = await data_1.sequelize.transaction(async (transaction) => {
            const history = new history_1.TriggerHistory(data_1.sequelize);
            if (preview.policy.runningInstanceRetentionDays ||
                preview.policy.cronStatRetentionDays) {
                await history.replayPublishedExits(transaction);
            }
            const runningInstances = preview.policy.runningInstanceRetentionDays > 0
                ? await runningInstance_1.RunningInstanceModel.destroy({
                    where: runningInstanceWhere(cutoffs.history),
                    transaction,
                })
                : 0;
            let cronStats = 0;
            if (preview.policy.cronStatRetentionDays > 0) {
                const firstDay = cutoffs.firstDay;
                cronStats = await cronStats_1.CrontabStatModel.destroy({
                    where: { date: { [sequelize_1.Op.lt]: firstDay } },
                    transaction,
                });
                await data_1.sequelize.query(`INSERT INTO CronStatRetention(id,first_day) VALUES (1,$firstDay)
          ON CONFLICT(id) DO UPDATE SET first_day=MAX(first_day,excluded.first_day)`, { bind: { firstDay }, transaction });
                await data_1.sequelize.query(`DELETE FROM CronPrunedUnknownRuns WHERE last_possible_day <
          (SELECT first_day FROM CronStatRetention WHERE id=1)`, { transaction });
            }
            const triggers = preview.policy.runningInstanceRetentionDays > 0
                ? await history.deleteExpired(cutoffs.history, transaction)
                : 0;
            if (preview.policy.runningInstanceRetentionDays ||
                preview.policy.cronStatRetentionDays) {
                // An unbound receipt's day can be wrong. A later bound receipt still
                // needs the execution-to-task link even after both visible histories expire.
                // A writer can also win the lock before an interrupted upgrade retries.
                // Keep its bound bookings until the proof-copy transaction has committed.
                await data_1.sequelize.query(`DELETE FROM CronLegacyExitBookings WHERE day <
          (SELECT first_day FROM CronStatRetention WHERE id=1)
          AND NOT EXISTS (SELECT 1 FROM CronTriggers WHERE id=CronLegacyExitBookings.trigger_id)
          AND ((bound=1 AND EXISTS (SELECT 1 FROM SchemaMigrations WHERE id=$proofMigration))
            OR (bound=0 AND NOT EXISTS (SELECT 1 FROM Crontabs WHERE id=CronLegacyExitBookings.cron_id)))`, { bind: { proofMigration: schemaMigrations_1.prunedExitMigrationId }, transaction });
            }
            return { runningInstances, cronStats, triggers };
        });
        const dependenceCaches = [];
        for (const cache of preview.dependenceCaches) {
            await promises_1.default.rm(path_1.default.join(config_1.default.dependenceCachePath, cache.type), {
                recursive: true,
                force: true,
            });
            dependenceCaches.push(cache);
        }
        if (request.compactDatabase &&
            (deleted.runningInstances || deleted.cronStats || deleted.triggers)) {
            await data_1.sequelize.query('VACUUM');
        }
        return {
            deleted: Object.assign(Object.assign({}, deleted), { dependenceCaches, dependenceCacheBytes: preview.dependenceCacheBytes }),
            compactedDatabase: Boolean(request.compactDatabase &&
                (deleted.runningInstances || deleted.cronStats || deleted.triggers)),
        };
    }
};
RetentionService = __decorate([
    (0, typedi_1.Service)()
], RetentionService);
exports.default = RetentionService;
//# sourceMappingURL=retention.js.map