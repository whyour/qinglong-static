"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const typedi_1 = require("typedi");
const cron_1 = require("../data/cron");
const cron_2 = __importDefault(require("../services/cron"));
const cookie_1 = __importDefault(require("../services/cookie"));
const initData = [
    {
        name: '更新面板',
        command: `ql update`,
        schedule: `${randomSchedule(60, 1)} ${randomSchedule(6, 1).toString()} * * *`,
        status: cron_1.CrontabStatus.disabled,
    },
    {
        name: '删除日志',
        command: 'ql rmlog 7',
        schedule: '30 7 */7 * *',
        status: cron_1.CrontabStatus.idle,
    },
    {
        name: '互助码',
        command: 'ql code',
        schedule: '30 7 * * *',
        status: cron_1.CrontabStatus.idle,
    },
];
exports.default = async () => {
    const cronService = typedi_1.Container.get(cron_2.default);
    const cookieService = typedi_1.Container.get(cookie_1.default);
    const cronDb = cronService.getDb();
    cronDb.count({}, async (err, count) => {
        if (count === 0) {
            const data = initData.map((x) => {
                const tab = new cron_1.Crontab(x);
                tab.created = new Date().valueOf();
                tab.saved = false;
                if (tab.name === '更新面板') {
                    tab.isSystem = 1;
                }
                else {
                    tab.isSystem = 0;
                }
                return tab;
            });
            cronDb.insert(data);
            await cronService.autosave_crontab();
        }
    });
    // patch更新面板任务状态
    cronDb.find({ name: '更新面板' }).exec((err, docs) => {
        const doc = docs[0];
        if (doc && doc.status === cron_1.CrontabStatus.running) {
            cronDb.update({ name: '更新面板' }, { $set: { status: cron_1.CrontabStatus.idle } });
        }
    });
    // 初始化时执行一次所有的ql repo 任务
    cronDb
        .find({
        command: /ql (repo|raw)/,
    })
        .exec((err, docs) => {
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            if (doc && doc.isDisabled !== 1) {
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
    await cookieService.set_cookies();
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