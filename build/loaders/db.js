"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbs = void 0;
const nedb_1 = __importDefault(require("nedb"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("../config/util");
const env_1 = require("../data/env");
const cron_1 = require("../data/cron");
const dependence_1 = require("../data/dependence");
const open_1 = require("../data/open");
const auth_1 = require("../data/auth");
const data_1 = require("../data");
const db = {};
async function truncateDb() {
    return new Promise(async (resolve) => {
        const files = [
            config_1.default.cronDbFile,
            config_1.default.dependenceDbFile,
            config_1.default.envDbFile,
            config_1.default.appDbFile,
            config_1.default.authDbFile,
        ];
        for (const file of files) {
            const _fileExist = await util_1.fileExist(file);
            if (_fileExist && fs_1.default.statSync(file).size >= 1024 * 1024 * 500) {
                fs_1.default.truncateSync(file, 1024 * 1024 * 500);
            }
        }
        resolve(null);
    });
}
exports.default = async () => {
    try {
        await truncateDb();
        db.cronDb = new nedb_1.default({ filename: config_1.default.cronDbFile, autoload: true });
        db.dependenceDb = new nedb_1.default({
            filename: config_1.default.dependenceDbFile,
            autoload: true,
        });
        db.envDb = new nedb_1.default({ filename: config_1.default.envDbFile, autoload: true });
        db.appDb = new nedb_1.default({ filename: config_1.default.appDbFile, autoload: true });
        db.authDb = new nedb_1.default({ filename: config_1.default.authDbFile, autoload: true });
        // compaction data file
        db.cronDb.persistence.compactDatafile();
        db.envDb.persistence.compactDatafile();
        db.dependenceDb.persistence.compactDatafile();
        db.appDb.persistence.compactDatafile();
        db.authDb.persistence.compactDatafile();
        try {
            await data_1.sequelize.sync({ alter: true });
        }
        catch (error) {
            console.log(error);
        }
        // migrate db to sqlite
        setTimeout(async () => {
            try {
                const count = await cron_1.CrontabModel.count();
                if (count !== 0) {
                    return;
                }
                db.cronDb.find({}).exec(async (err, docs) => {
                    await cron_1.CrontabModel.bulkCreate(docs);
                });
                db.dependenceDb.find({}).exec(async (err, docs) => {
                    await dependence_1.DependenceModel.bulkCreate(docs);
                });
                db.envDb.find({}).exec(async (err, docs) => {
                    await env_1.EnvModel.bulkCreate(docs);
                });
                db.appDb.find({}).exec(async (err, docs) => {
                    await open_1.AppModel.bulkCreate(docs);
                });
                db.authDb.find({}).exec(async (err, docs) => {
                    await auth_1.AuthModel.bulkCreate(docs);
                });
            }
            catch (error) {
                console.log(error);
            }
        }, 5000);
        logger_1.default.info('✌️ DB loaded');
    }
    catch (error) {
        logger_1.default.info('✌️ DB load failed');
        logger_1.default.info(error);
    }
};
exports.dbs = db;
//# sourceMappingURL=db.js.map