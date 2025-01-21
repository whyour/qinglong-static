"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemNotify = exports.getEnvById = exports.updateEnvNames = exports.enableEnvs = exports.disableEnvs = exports.moveEnv = exports.deleteEnvs = exports.updateEnv = exports.createEnv = exports.getEnvs = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const env_1 = __importDefault(require("../services/env"));
const logger_1 = __importDefault(require("../loaders/logger"));
const pick_1 = __importDefault(require("lodash/pick"));
const system_1 = __importDefault(require("../services/system"));
typedi_1.Container.set('logger', logger_1.default);
const getEnvs = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        const data = await envService.envs(call.request.searchValue);
        callback(null, {
            code: 200,
            data: data.map((x) => (Object.assign(Object.assign({}, x), { remarks: x.remarks || '' }))),
        });
    }
    catch (e) {
        callback(null, {
            code: 500,
            data: [],
            message: e.message,
        });
    }
};
exports.getEnvs = getEnvs;
const createEnv = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        const data = await envService.create(call.request.envs);
        callback(null, { code: 200, data });
    }
    catch (e) {
        callback(e);
    }
};
exports.createEnv = createEnv;
const updateEnv = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        const data = await envService.update((0, pick_1.default)(call.request.env, ['id', 'name', 'value', 'remark']));
        callback(null, { code: 200, data });
    }
    catch (e) {
        callback(e);
    }
};
exports.updateEnv = updateEnv;
const deleteEnvs = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        await envService.remove(call.request.ids);
        callback(null, { code: 200 });
    }
    catch (e) {
        callback(e);
    }
};
exports.deleteEnvs = deleteEnvs;
const moveEnv = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        const data = await envService.move(call.request.id, {
            fromIndex: call.request.fromIndex,
            toIndex: call.request.toIndex,
        });
        callback(null, { code: 200, data });
    }
    catch (e) {
        callback(e);
    }
};
exports.moveEnv = moveEnv;
const disableEnvs = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        await envService.disabled(call.request.ids);
        callback(null, { code: 200 });
    }
    catch (e) {
        callback(e);
    }
};
exports.disableEnvs = disableEnvs;
const enableEnvs = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        await envService.enabled(call.request.ids);
        callback(null, { code: 200 });
    }
    catch (e) {
        callback(e);
    }
};
exports.enableEnvs = enableEnvs;
const updateEnvNames = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        await envService.updateNames({
            ids: call.request.ids,
            name: call.request.name,
        });
        callback(null, { code: 200 });
    }
    catch (e) {
        callback(e);
    }
};
exports.updateEnvNames = updateEnvNames;
const getEnvById = async (call, callback) => {
    try {
        const envService = typedi_1.Container.get(env_1.default);
        const data = await envService.getDb({ id: call.request.id });
        callback(null, {
            code: 200,
            data: Object.assign(Object.assign({}, data), { remarks: data.remarks || '' }),
        });
    }
    catch (e) {
        callback(e);
    }
};
exports.getEnvById = getEnvById;
const systemNotify = async (call, callback) => {
    try {
        const systemService = typedi_1.Container.get(system_1.default);
        const data = await systemService.notify(call.request);
        callback(null, data);
    }
    catch (e) {
        callback(e);
    }
};
exports.systemNotify = systemNotify;
//# sourceMappingURL=api.js.map