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
const dependence_2 = require("../data/dependence");
const sequelize_1 = require("sequelize");
const system_1 = __importDefault(require("../services/system"));
const schedule_1 = __importDefault(require("../services/schedule"));
const config_1 = __importDefault(require("../config"));
exports.default = async () => {
    const cronService = typedi_1.Container.get(cron_2.default);
    const envService = typedi_1.Container.get(env_1.default);
    const dependenceService = typedi_1.Container.get(dependence_1.default);
    const systemService = typedi_1.Container.get(system_1.default);
    const scheduleService = typedi_1.Container.get(schedule_1.default);
    // 初始化更新所有任务状态为空闲
    await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle }, { where: { status: [cron_1.CrontabStatus.running, cron_1.CrontabStatus.queued] } });
    // 初始化时安装所有处于安装中，安装成功，安装失败的依赖
    dependence_2.DependenceModel.findAll({ where: {} }).then(async (docs) => {
        const groups = lodash_1.default.groupBy(docs, 'type');
        for (const key in groups) {
            if (Object.prototype.hasOwnProperty.call(groups, key)) {
                const group = groups[key];
                const depIds = group.map((x) => x.id);
                for (const dep of depIds) {
                    if (dep) {
                        await dependenceService.reInstall([dep]);
                    }
                }
            }
        }
    });
    // 初始化时执行一次所有的ql repo 任务
    cron_1.CrontabModel.findAll({
        where: {
            isDisabled: { [sequelize_1.Op.ne]: 1 },
            command: {
                [sequelize_1.Op.or]: [{ [sequelize_1.Op.like]: `%ql repo%` }, { [sequelize_1.Op.like]: `%ql raw%` }],
            },
        },
    }).then((docs) => {
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            if (doc) {
                (0, child_process_1.exec)(doc.command);
            }
        }
    });
    // 更新2.11.3以前的脚本路径
    cron_1.CrontabModel.findAll({
        where: {
            command: {
                [sequelize_1.Op.or]: [
                    { [sequelize_1.Op.like]: `%\/${config_1.default.rootPath}\/scripts\/%` },
                    { [sequelize_1.Op.like]: `%\/${config_1.default.rootPath}\/config\/%` },
                    { [sequelize_1.Op.like]: `%\/${config_1.default.rootPath}\/log\/%` },
                    { [sequelize_1.Op.like]: `%\/${config_1.default.rootPath}\/db\/%` },
                ],
            },
        },
    }).then(async (docs) => {
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            if (doc) {
                if (doc.command.includes(`${config_1.default.rootPath}/scripts/`)) {
                    await cron_1.CrontabModel.update({ command: doc.command.replace(`${config_1.default.rootPath}/scripts/`, '') }, { where: { id: doc.id } });
                }
                if (doc.command.includes(`${config_1.default.rootPath}/log/`)) {
                    await cron_1.CrontabModel.update({
                        command: `${config_1.default.rootPath}/data/log/${doc.command.replace(`${config_1.default.rootPath}/log/`, '')}`,
                    }, { where: { id: doc.id } });
                }
                if (doc.command.includes(`${config_1.default.rootPath}/config/`)) {
                    await cron_1.CrontabModel.update({
                        command: `${config_1.default.rootPath}/data/config/${doc.command.replace(`${config_1.default.rootPath}/config/`, '')}`,
                    }, { where: { id: doc.id } });
                }
                if (doc.command.includes(`${config_1.default.rootPath}/db/`)) {
                    await cron_1.CrontabModel.update({
                        command: `${config_1.default.rootPath}/data/db/${doc.command.replace(`${config_1.default.rootPath}/db/`, '')}`,
                    }, { where: { id: doc.id } });
                }
            }
        }
    });
    // 初始化保存一次ck和定时任务数据
    await cronService.autosave_crontab();
    await envService.set_envs();
    // 运行删除日志任务
    const data = await systemService.getLogRemoveFrequency();
    if (data && data.info && data.info.frequency) {
        const cron = {
            id: data.id,
            name: '删除日志',
            command: `ql rmlog ${data.info.frequency}`,
        };
        await scheduleService.createIntervalTask(cron, {
            days: data.info.frequency,
            runImmediately: true,
        });
    }
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