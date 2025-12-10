"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModeStringMap = exports.PYTHON_INSTALL_DIR = exports.SAMPLE_FILES = exports.QL_PREFIX = exports.TASK_PREFIX = exports.QL_COMMAND = exports.TASK_COMMAND = exports.LOG_END_SYMBOL = void 0;
exports.LOG_END_SYMBOL = '　　　　　';
exports.TASK_COMMAND = 'task';
exports.QL_COMMAND = 'ql';
exports.TASK_PREFIX = `${exports.TASK_COMMAND} `;
exports.QL_PREFIX = `${exports.QL_COMMAND} `;
exports.SAMPLE_FILES = [
    {
        title: 'config.sample.sh',
        value: 'sample/config.sample.sh',
        target: 'config.sh',
    },
    {
        title: 'notify.js',
        value: 'sample/notify.js',
        target: 'data/scripts/sendNotify.js',
    },
    {
        title: 'notify.py',
        value: 'sample/notify.py',
        target: 'data/scripts/notify.py',
    },
];
exports.PYTHON_INSTALL_DIR = process.env.PYTHON_HOME;
exports.NotificationModeStringMap = {
    0: 'gotify',
    1: 'goCqHttpBot',
    2: 'serverChan',
    3: 'pushDeer',
    4: 'bark',
    5: 'chat',
    6: 'telegramBot',
    7: 'dingtalkBot',
    8: 'weWorkBot',
    9: 'weWorkApp',
    10: 'aibotk',
    11: 'iGot',
    12: 'pushPlus',
    13: 'wePlusBot',
    14: 'email',
    15: 'pushMe',
    16: 'feishu',
    17: 'webhook',
    18: 'chronocat',
    19: 'ntfy',
    20: 'wxPusherBot',
};
//# sourceMappingURL=const.js.map