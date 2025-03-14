"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCrons = exports.updateCron = exports.createCron = exports.getCronDetail = exports.systemNotify = exports.getEnvById = exports.updateEnvNames = exports.enableEnvs = exports.disableEnvs = exports.moveEnv = exports.deleteEnvs = exports.updateEnv = exports.createEnv = exports.getEnvs = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const env_1 = __importDefault(require("../services/env"));
const logger_1 = __importDefault(require("../loaders/logger"));
const pick_1 = __importDefault(require("lodash/pick"));
const system_1 = __importDefault(require("../services/system"));
const cron_1 = __importDefault(require("../services/cron"));
typedi_1.Container.set('logger', logger_1.default);
const getEnvs = async (call, callback) => {
    try {
        if (!call.request.searchValue) {
            return callback(null, {
                code: 400,
                data: [],
                message: 'searchValue is required',
            });
        }
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
const normalizeCronData = (data) => {
    var _a, _b, _c, _d, _e;
    if (!data)
        return undefined;
    return Object.assign(Object.assign({}, data), { sub_id: (_a = data.sub_id) !== null && _a !== void 0 ? _a : undefined, extra_schedules: (_b = data.extra_schedules) !== null && _b !== void 0 ? _b : undefined, pid: (_c = data.pid) !== null && _c !== void 0 ? _c : undefined, task_before: (_d = data.task_before) !== null && _d !== void 0 ? _d : undefined, task_after: (_e = data.task_after) !== null && _e !== void 0 ? _e : undefined });
};
const getCronDetail = async (call, callback) => {
    try {
        if (!call.request.log_path) {
            return callback(null, {
                code: 400,
                data: undefined,
                message: 'log_path is required',
            });
        }
        const cronService = typedi_1.Container.get(cron_1.default);
        const data = (await cronService.find({
            log_path: call.request.log_path,
        }));
        callback(null, { code: 200, data: normalizeCronData(data) });
    }
    catch (e) {
        callback(e);
    }
};
exports.getCronDetail = getCronDetail;
const createCron = async (call, callback) => {
    try {
        const cronService = typedi_1.Container.get(cron_1.default);
        const data = (await cronService.create(call.request));
        callback(null, { code: 200, data: normalizeCronData(data) });
    }
    catch (e) {
        callback(e);
    }
};
exports.createCron = createCron;
const updateCron = async (call, callback) => {
    try {
        const cronService = typedi_1.Container.get(cron_1.default);
        const _a = call.request, { id } = _a, fields = __rest(_a, ["id"]);
        const updateRequest = Object.assign({ id }, Object.entries(fields).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {}));
        const data = (await cronService.update(updateRequest));
        callback(null, { code: 200, data: normalizeCronData(data) });
    }
    catch (e) {
        callback(e);
    }
};
exports.updateCron = updateCron;
const deleteCrons = async (call, callback) => {
    try {
        const cronService = typedi_1.Container.get(cron_1.default);
        await cronService.remove(call.request.ids);
        callback(null, { code: 200 });
    }
    catch (e) {
        callback(e);
    }
};
exports.deleteCrons = deleteCrons;
//# sourceMappingURL=api.js.map