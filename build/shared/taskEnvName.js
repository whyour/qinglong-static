"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAllowedTaskEnvName = exports.isAllowedTaskEnvName = void 0;
const i18n_1 = require("./i18n");
// These names control the task runner or the interpreters it starts. Values
// managed through the environment API must remain task data, not executable
// configuration.
const reservedNames = new Set([
    'TASK_BEFORE',
    'TASK_AFTER',
    'WORK_DIR',
    'TASK_SHELL_PARAMS',
    'SCRIPT_PARAMS',
    'WHICH_PROGRAM',
    'ISJSORPYTHONFILE',
    'EXPORTED_VARIABLES',
    'FOUND_DOUBLE_DASH',
    'LOG_DIR',
    'LOG_PATH',
    'ID',
    'BEGIN_TIMESTAMP',
    'TIME_FORMAT',
    'MTIME_FORMAT',
    'IS_MACOS',
    'RANDOMDELAY',
    'RANDOMDELAYFILEEXTENSIONS',
    'RANDOMDELAYIGNOREDMINUTES',
    'COMMAND_TIMEOUT_TIME',
    'SET_U_ON',
    '_TASK_EXIT_CODE',
    'PATH',
    'HOME',
    'SHELL',
    'ENV',
    'BASH_ENV',
    'BASHOPTS',
    'SHELLOPTS',
    'IFS',
    'CDPATH',
    'GLOBIGNORE',
    'PROMPT_COMMAND',
    'PS4',
    'NODE_OPTIONS',
    'NODE_PATH',
    'PREV_NODE_OPTIONS',
    'PREV_NODE_PATH',
    'PREV_PYTHONPATH',
    'GIT_SSH',
    'GIT_SSH_COMMAND',
    'GIT_ASKPASS',
    'GIT_EXEC_PATH',
    'GIT_TEMPLATE_DIR',
    'SSH_ASKPASS',
]);
function isAllowedTaskEnvName(name) {
    if (typeof name !== 'string' || !/^[a-zA-Z_][0-9a-zA-Z_]*$/.test(name)) {
        return false;
    }
    const upper = name.toUpperCase();
    return (!reservedNames.has(upper) &&
        !upper.startsWith('BASH_') &&
        !upper.startsWith('QL') &&
        !upper.startsWith('FILE_') &&
        !upper.startsWith('DIR_') &&
        !upper.startsWith('LD_') &&
        !upper.startsWith('DYLD_') &&
        !upper.startsWith('PYTHON') &&
        !upper.startsWith('GIT_CONFIG_'));
}
exports.isAllowedTaskEnvName = isAllowedTaskEnvName;
function assertAllowedTaskEnvName(name) {
    if (!isAllowedTaskEnvName(name)) {
        throw Object.assign(new Error((0, i18n_1.t)('环境变量名称不可使用')), {
            status: 400,
        });
    }
}
exports.assertAllowedTaskEnvName = assertAllowedTaskEnvName;
//# sourceMappingURL=taskEnvName.js.map