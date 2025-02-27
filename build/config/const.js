"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLE_FILES = exports.QL_PREFIX = exports.TASK_PREFIX = exports.QL_COMMAND = exports.TASK_COMMAND = exports.LOG_END_SYMBOL = void 0;
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
//# sourceMappingURL=const.js.map