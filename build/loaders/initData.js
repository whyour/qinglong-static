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
const system_1 = require("../data/system");
const system_2 = __importDefault(require("../services/system"));
const user_1 = __importDefault(require("../services/user"));
const promises_1 = require("fs/promises");
const util_1 = require("../config/util");
const open_1 = __importDefault(require("../services/open"));
const store_1 = require("../shared/store");
const logger_1 = __importDefault(require("./logger"));
const open_2 = require("../data/open");
exports.default = async () => {
    var _a, _b, _c, _d, _e, _f, _g;
    const cronService = typedi_1.Container.get(cron_2.default);
    const envService = typedi_1.Container.get(env_1.default);
    const dependenceService = typedi_1.Container.get(dependence_1.default);
    const systemService = typedi_1.Container.get(system_2.default);
    const userService = typedi_1.Container.get(user_1.default);
    const openService = typedi_1.Container.get(open_1.default);
    // 初始化增加系统配置
    let systemApp = (_a = (await open_2.AppModel.findOne({
        where: { name: 'system' },
    }))) === null || _a === void 0 ? void 0 : _a.get({ plain: true });
    if (!systemApp) {
        systemApp = await open_2.AppModel.create({
            name: 'system',
            scopes: ['crons', 'system'],
            client_id: (0, util_1.createRandomString)(12, 12),
            client_secret: (0, util_1.createRandomString)(24, 24),
        });
    }
    const [systemConfig] = await system_1.SystemModel.findOrCreate({
        where: { type: system_1.AuthDataType.systemConfig },
    });
    await system_1.SystemModel.findOrCreate({
        where: { type: system_1.AuthDataType.notification },
    });
    const [authConfig] = await system_1.SystemModel.findOrCreate({
        where: { type: system_1.AuthDataType.authConfig },
    });
    if (!(authConfig === null || authConfig === void 0 ? void 0 : authConfig.info)) {
        let authInfo = {
            username: 'admin',
            password: 'admin',
        };
        try {
            const content = await (0, promises_1.readFile)(config_1.default.authConfigFile, 'utf8');
            authInfo = (0, util_1.safeJSONParse)(content);
        }
        catch (error) {
            logger_1.default.warn('Failed to read auth config file, using default credentials');
        }
        await system_1.SystemModel.upsert({
            id: authConfig === null || authConfig === void 0 ? void 0 : authConfig.id,
            info: authInfo,
            type: system_1.AuthDataType.authConfig,
        });
    }
    const installDependencies = () => {
        // 初始化时安装所有处于安装中，安装成功，安装失败的依赖
        dependence_2.DependenceModel.findAll({
            where: {},
            order: [
                ['type', 'DESC'],
                ['createdAt', 'DESC'],
            ],
            raw: true,
        }).then(async (docs) => {
            await dependence_2.DependenceModel.update({ status: dependence_2.DependenceStatus.queued, log: [] }, { where: { id: docs.map((x) => x.id) } });
            setTimeout(() => {
                dependenceService.installDependenceOneByOne(docs);
            }, 5000);
        });
    };
    // 初始化更新 linux/python/nodejs 镜像源配置
    if ((_b = systemConfig.info) === null || _b === void 0 ? void 0 : _b.pythonMirror) {
        systemService.updatePythonMirror({
            pythonMirror: (_c = systemConfig.info) === null || _c === void 0 ? void 0 : _c.pythonMirror,
        });
    }
    if ((_d = systemConfig.info) === null || _d === void 0 ? void 0 : _d.linuxMirror) {
        systemService.updateLinuxMirror({
            linuxMirror: (_e = systemConfig.info) === null || _e === void 0 ? void 0 : _e.linuxMirror,
        }, undefined, () => installDependencies());
    }
    else {
        installDependencies();
    }
    if ((_f = systemConfig.info) === null || _f === void 0 ? void 0 : _f.nodeMirror) {
        systemService.updateNodeMirror({
            nodeMirror: (_g = systemConfig.info) === null || _g === void 0 ? void 0 : _g.nodeMirror,
        });
    }
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
    await cron_1.CrontabModel.update({ status: cron_1.CrontabStatus.idle }, { where: {} });
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
                        command: `${config_1.default.dataPath}/log/${doc.command.replace(`${config_1.default.rootPath}/log/`, '')}`,
                    }, { where: { id: doc.id } });
                }
                if (doc.command.includes(`${config_1.default.rootPath}/config/`)) {
                    await cron_1.CrontabModel.update({
                        command: `${config_1.default.dataPath}/config/${doc.command.replace(`${config_1.default.rootPath}/config/`, '')}`,
                    }, { where: { id: doc.id } });
                }
                if (doc.command.includes(`${config_1.default.rootPath}/db/`)) {
                    await cron_1.CrontabModel.update({
                        command: `${config_1.default.dataPath}/db/${doc.command.replace(`${config_1.default.rootPath}/db/`, '')}`,
                    }, { where: { id: doc.id } });
                }
            }
        }
    });
    // 初始化保存一次ck和定时任务数据
    await cronService.autosave_crontab();
    await envService.set_envs();
    const authInfo = await userService.getAuthInfo();
    const apps = await openService.findApps();
    await store_1.shareStore.updateAuthInfo(authInfo);
    if (apps === null || apps === void 0 ? void 0 : apps.length) {
        await store_1.shareStore.updateApps(apps);
    }
};
//# sourceMappingURL=initData.js.map