"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dependence_1 = __importDefault(require("../services/dependence"));
const child_process_1 = require("child_process");
const typedi_1 = require("typedi");
const cron_1 = require("../data/cron");
const cron_2 = __importDefault(require("../services/cron"));
const env_1 = __importDefault(require("../services/env"));
const lodash_1 = __importDefault(require("lodash"));
const db_1 = require("../loaders/db");
exports.default = async () => {
    const cronService = typedi_1.Container.get(cron_2.default);
    const envService = typedi_1.Container.get(env_1.default);
    const dependenceService = typedi_1.Container.get(dependence_1.default);
    const cronDb = db_1.dbs.cronDb;
    const dependenceDb = db_1.dbs.dependenceDb;
    // 初始化更新所有任务状态为空闲
    cronDb.update({ status: { $in: [cron_1.CrontabStatus.running, cron_1.CrontabStatus.queued] } }, { $set: { status: cron_1.CrontabStatus.idle } }, { multi: true });
    // 初始化时安装所有处于安装中，安装成功，安装失败的依赖
    dependenceDb.find({ status: { $in: [0, 1, 2] } }).exec((err, docs) => {
        const groups = lodash_1.default.groupBy(docs, 'type');
        for (const key in groups) {
            if (Object.prototype.hasOwnProperty.call(groups, key)) {
                const group = groups[key];
                const depIds = group.map((x) => x._id);
                for (const dep of depIds) {
                    dependenceService.reInstall([dep]);
                }
            }
        }
    });
    // 初始化时执行一次所有的ql repo 任务
    cronDb
        .find({
        command: /ql (repo|raw)/,
        isDisabled: { $ne: 1 },
    })
        .exec((err, docs) => {
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            if (doc) {
                child_process_1.exec(doc.command);
            }
        }
    });
    // patch 禁用状态字段改变
    cronDb
        .find({
        status: cron_1.CrontabStatus.disabled,
    })
        .exec((err, docs) => {
        if (docs.length > 0) {
            const ids = docs.map((x) => x._id);
            cronDb.update({ _id: { $in: ids } }, { $set: { status: cron_1.CrontabStatus.idle, isDisabled: 1 } }, { multi: true }, (err) => {
                cronService.autosave_crontab();
            });
        }
    });
    // 初始化保存一次ck和定时任务数据
    await cronService.autosave_crontab();
    await envService.set_envs();
};
function randomSchedule(from, to) {
    const result = [];
    const arr = [...Array(from).keys()];
    let count = arr.length;
    for (let i = 0; i < to; i++) {
        const index = ~~(Math.random() * count) + i;
        if (result.includes(arr[index])) {
            continue;
        }
        result[i] = arr[index];
        arr[index] = arr[i];
        count--;
    }
    return result;
}
//# sourceMappingURL=initData.js.map