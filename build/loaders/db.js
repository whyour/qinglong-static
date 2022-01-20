"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nedb_1 = __importDefault(require("nedb"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
const util_1 = require("../config/util");
const env_1 = require("../data/env");
const cron_1 = require("../data/cron");
const dependence_1 = require("../data/dependence");
const open_1 = require("../data/open");
const auth_1 = require("../data/auth");
const data_1 = require("../data");
exports.default = async () => {
    try {
        await data_1.sequelize.sync({ alter: true });
        const crondbExist = await util_1.fileExist(config_1.default.cronDbFile);
        const dependenceDbExist = await util_1.fileExist(config_1.default.dependenceDbFile);
        const envDbExist = await util_1.fileExist(config_1.default.envDbFile);
        const appDbExist = await util_1.fileExist(config_1.default.appDbFile);
        const authDbExist = await util_1.fileExist(config_1.default.authDbFile);
        const cronCount = await cron_1.CrontabModel.count();
        const dependenceCount = await dependence_1.DependenceModel.count();
        const envCount = await env_1.EnvModel.count();
        const appCount = await open_1.AppModel.count();
        const authCount = await auth_1.AuthModel.count();
        if (crondbExist && cronCount === 0) {
            const cronDb = new nedb_1.default({
                filename: config_1.default.cronDbFile,
                autoload: true,
            });
            cronDb.persistence.compactDatafile();
            cronDb.find({}).exec(async (err, docs) => {
                await cron_1.CrontabModel.bulkCreate(docs, { ignoreDuplicates: true });
            });
        }
        if (dependenceDbExist && dependenceCount === 0) {
            const dependenceDb = new nedb_1.default({
                filename: config_1.default.dependenceDbFile,
                autoload: true,
            });
            dependenceDb.persistence.compactDatafile();
            dependenceDb.find({}).exec(async (err, docs) => {
                await dependence_1.DependenceModel.bulkCreate(docs, { ignoreDuplicates: true });
            });
        }
        if (envDbExist && envCount === 0) {
            const envDb = new nedb_1.default({
                filename: config_1.default.envDbFile,
                autoload: true,
            });
            envDb.persistence.compactDatafile();
            envDb.find({}).exec(async (err, docs) => {
                await env_1.EnvModel.bulkCreate(docs, { ignoreDuplicates: true });
            });
        }
        if (appDbExist && appCount === 0) {
            const appDb = new nedb_1.default({
                filename: config_1.default.appDbFile,
                autoload: true,
            });
            appDb.persistence.compactDatafile();
            appDb.find({}).exec(async (err, docs) => {
                await open_1.AppModel.bulkCreate(docs, { ignoreDuplicates: true });
            });
        }
        if (authDbExist && authCount === 0) {
            const authDb = new nedb_1.default({
                filename: config_1.default.authDbFile,
                autoload: true,
            });
            authDb.persistence.compactDatafile();
            authDb.find({}).exec(async (err, docs) => {
                await auth_1.AuthModel.bulkCreate(docs, { ignoreDuplicates: true });
            });
        }
        logger_1.default.info('✌️ DB loaded');
    }
    catch (error) {
        logger_1.default.info('✌️ DB load failed');
        logger_1.default.info(error);
    }
};
//# sourceMappingURL=db.js.map