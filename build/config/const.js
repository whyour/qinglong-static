"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LINUX_DEPENDENCE_COMMAND = exports.SAMPLE_FILES = exports.QL_PREFIX = exports.TASK_PREFIX = exports.QL_COMMAND = exports.TASK_COMMAND = exports.LOG_END_SYMBOL = void 0;
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
exports.LINUX_DEPENDENCE_COMMAND = {
    Debian: {
        install: 'apt-get install -y',
        uninstall: 'apt-get remove -y',
        info: 'dpkg-query -s',
        check(info) {
            return info.includes('install ok installed');
        },
    },
    Ubuntu: {
        install: 'apt-get install -y',
        uninstall: 'apt-get remove -y',
        info: 'dpkg-query -s',
        check(info) {
            return info.includes('install ok installed');
        },
    },
    Alpine: {
        install: 'apk add --no-check-certificate',
        uninstall: 'apk del',
        info: 'apk info -es',
        check(info) {
            return info.includes('installed');
        },
    },
};
//# sourceMappingURL=const.js.map