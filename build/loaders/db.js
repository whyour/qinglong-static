"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const env_1 = require("../data/env");
const cron_1 = require("../data/cron");
const dependence_1 = require("../data/dependence");
const open_1 = require("../data/open");
const system_1 = require("../data/system");
const subscription_1 = require("../data/subscription");
const cronView_1 = require("../data/cronView");
const data_1 = require("../data");
exports.default = async () => {
    try {
        await cron_1.CrontabModel.sync();
        await dependence_1.DependenceModel.sync();
        await open_1.AppModel.sync();
        await system_1.SystemModel.sync();
        await env_1.EnvModel.sync();
        await subscription_1.SubscriptionModel.sync();
        await cronView_1.CrontabViewModel.sync();
        // 初始化新增字段
        const migrations = [
            {
                table: 'CrontabViews',
                column: 'filterRelation',
                type: 'VARCHAR(255)',
            },
            { table: 'Subscriptions', column: 'proxy', type: 'VARCHAR(255)' },
            { table: 'CrontabViews', column: 'type', type: 'NUMBER' },
            { table: 'Subscriptions', column: 'autoAddCron', type: 'NUMBER' },
            { table: 'Subscriptions', column: 'autoDelCron', type: 'NUMBER' },
            { table: 'Crontabs', column: 'sub_id', type: 'NUMBER' },
            { table: 'Crontabs', column: 'extra_schedules', type: 'JSON' },
            { table: 'Crontabs', column: 'task_before', type: 'TEXT' },
            { table: 'Crontabs', column: 'task_after', type: 'TEXT' },
            { table: 'Crontabs', column: 'log_name', type: 'VARCHAR(255)' },
            {
                table: 'Crontabs',
                column: 'allow_multiple_instances',
                type: 'NUMBER',
            },
            { table: 'Envs', column: 'isPinned', type: 'NUMBER' },
        ];
        for (const migration of migrations) {
            try {
                await data_1.sequelize.query(`alter table ${migration.table} add column ${migration.column} ${migration.type}`);
            }
            catch (error) {
                // Column already exists or other error, continue
            }
        }
        logger_1.default.info('✌️ DB loaded');
    }
    catch (error) {
        logger_1.default.error('✌️ DB load failed', error);
    }
};
//# sourceMappingURL=db.js.map