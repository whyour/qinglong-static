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
const dependence_2 = require("../data/dependence");
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const cronView_1 = require("../data/cronView");
const env_2 = require("../data/env");
exports.default = async () => {
    const cronService = typedi_1.Container.get(cron_2.default);
    const envService = typedi_1.Container.get(env_1.default);
    const dependenceService = typedi_1.Container.get(dependence_1.default);
    // 初始化新增默认全部任务视图
    cronView_1.CrontabViewModel.findAll({
        where: { type: cronView_1.CronViewType.系统, name: '全部任务' },
        raw: true,
    }).then((docs) => {
        if (docs.length === 0) {
            cronView_1.CrontabViewModel.create({
                name: '全部任务',
                type: cronView_1.CronViewType.系统,
                position: env_2.initPosition / 2,
            });
        }
    });
    // 初始化更新所有任务状态为空闲
    await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle }, { where: { status: [cron_1.CrontabStatus.running, cron_1.CrontabStatus.queued] } });
    // 初始化时安装所有处于安装中，安装成功，安装失败的依赖
    dependence_2.DependenceModel.findAll({
        where: {},
        order: [['type', 'DESC']],
        raw: true,
    }).then(async (docs) => {
        await dependence_2.DependenceModel.update({ status: dependence_2.DependenceStatus.queued, log: [] }, { where: { id: docs.map((x) => x.id) } });
        dependenceService.installDependenceOneByOne(docs);
    });
    // 初始化时执行一次所有的 ql repo 任务
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
};
//# sourceMappingURL=initData.js.map