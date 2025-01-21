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
        try {
            await data_1.sequelize.query('alter table CrontabViews add column filterRelation VARCHAR(255)');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table Subscriptions add column proxy VARCHAR(255)');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table CrontabViews add column type NUMBER');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table Subscriptions add column autoAddCron NUMBER');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table Subscriptions add column autoDelCron NUMBER');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table Crontabs add column sub_id NUMBER');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table Crontabs add column extra_schedules JSON');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table Crontabs add column task_before TEXT');
        }
        catch (error) { }
        try {
            await data_1.sequelize.query('alter table Crontabs add column task_after TEXT');
        }
        catch (error) { }
        console.log('✌️ DB loaded');
        logger_1.default.info('✌️ DB loaded');
    }
    catch (error) {
        console.error('✌️ DB load failed');
        logger_1.default.error(error);
    }
};
//# sourceMappingURL=db.js.map