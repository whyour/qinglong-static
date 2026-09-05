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
const runningInstance_1 = require("../data/runningInstance");
const system_1 = require("../data/system");
const retention_1 = require("../shared/retention");
function runningInstanceWhere(days) {
    const cutoff = (0, dayjs_1.default)().subtract(days, 'day').unix();
    return {
        status: { [sequelize_1.Op.ne]: runningInstance_1.InstanceStatus.running },
        [sequelize_1.Op.or]: [
            { finished_at: { [sequelize_1.Op.lt]: cutoff } },
            {
                finished_at: { [sequelize_1.Op.is]: null },
                started_at: { [sequelize_1.Op.lt]: cutoff },
            },
        ],
    };
}
function cronStatWhere(days) {
    return {
        date: { [sequelize_1.Op.lt]: (0, dayjs_1.default)().subtract(days, 'day').format('YYYY-MM-DD') },
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
    async preview(request) {
        const policy = (0, retention_1.normalizeRetentionPolicy)(request);
        const dependenceCacheTypes = (request.dependenceCacheTypes || []).filter(retention_1.isDependenceCacheType);
        const [runningInstances, cronStats, dependenceCaches] = await Promise.all([
            policy.runningInstanceRetentionDays > 0
                ? runningInstance_1.RunningInstanceModel.count({
                    where: runningInstanceWhere(policy.runningInstanceRetentionDays),
                })
                : 0,
            policy.cronStatRetentionDays > 0
                ? cronStats_1.CrontabStatModel.count({
                    where: cronStatWhere(policy.cronStatRetentionDays),
                })
                : 0,
            Promise.all(dependenceCacheTypes.map(async (type) => ({
                type,
                bytes: await (0, retention_1.getDirectorySize)(path_1.default.join(config_1.default.dependenceCachePath, type)),
            }))),
        ]);
        return {
            policy,
            runningInstances,
            cronStats,
            dependenceCaches,
            dependenceCacheBytes: dependenceCaches.reduce((total, cache) => total + cache.bytes, 0),
            compactDatabase: Boolean(request.compactDatabase),
        };
    }
    async cleanup(request) {
        const preview = await this.preview(request);
        const deleted = await data_1.sequelize.transaction(async (transaction) => {
            const runningInstances = preview.policy.runningInstanceRetentionDays > 0
                ? await runningInstance_1.RunningInstanceModel.destroy({
                    where: runningInstanceWhere(preview.policy.runningInstanceRetentionDays),
                    transaction,
                })
                : 0;
            const cronStats = preview.policy.cronStatRetentionDays > 0
                ? await cronStats_1.CrontabStatModel.destroy({
                    where: cronStatWhere(preview.policy.cronStatRetentionDays),
                    transaction,
                })
                : 0;
            return { runningInstances, cronStats };
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
            (deleted.runningInstances || deleted.cronStats)) {
            await data_1.sequelize.query('VACUUM');
        }
        return {
            deleted: Object.assign(Object.assign({}, deleted), { dependenceCaches, dependenceCacheBytes: preview.dependenceCacheBytes }),
            compactedDatabase: Boolean(request.compactDatabase &&
                (deleted.runningInstances || deleted.cronStats)),
        };
    }
};
RetentionService = __decorate([
    (0, typedi_1.Service)()
], RetentionService);
exports.default = RetentionService;
//# sourceMappingURL=retention.js.map