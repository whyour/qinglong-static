"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config"));
const env_1 = require("../data/env");
const groupBy_1 = __importDefault(require("lodash/groupBy"));
const sequelize_1 = require("sequelize");
const utils_1 = require("../shared/utils");
let EnvService = class EnvService {
    constructor(logger) {
        this.logger = logger;
    }
    async create(payloads) {
        const envs = await this.envs();
        let position = env_1.initPosition;
        if (envs &&
            envs.length > 0 &&
            typeof envs[envs.length - 1].position === 'number') {
            position = envs[envs.length - 1].position;
        }
        const tabs = payloads.map((x) => {
            position = position - env_1.stepPosition;
            const tab = new env_1.Env(Object.assign(Object.assign({}, x), { position }));
            return tab;
        });
        const docs = await this.insert(tabs);
        await this.set_envs();
        await this.checkPosition(tabs[tabs.length - 1].position);
        return docs;
    }
    async insert(payloads) {
        const result = [];
        for (const env of payloads) {
            const doc = await env_1.EnvModel.create(env, { returning: true });
            result.push(doc);
        }
        return result;
    }
    async update(payload) {
        const doc = await this.getDb({ id: payload.id });
        const tab = new env_1.Env(Object.assign(Object.assign({}, doc), payload));
        const newDoc = await this.updateDb(tab);
        await this.set_envs();
        return newDoc;
    }
    async updateDb(payload) {
        await env_1.EnvModel.update(Object.assign({}, payload), { where: { id: payload.id } });
        return await this.getDb({ id: payload.id });
    }
    async remove(ids) {
        await env_1.EnvModel.destroy({ where: { id: ids } });
        await this.set_envs();
    }
    async move(id, { fromIndex, toIndex, }) {
        let targetPosition;
        const isUpward = fromIndex > toIndex;
        const envs = await this.envs();
        if (toIndex === 0 || toIndex === envs.length - 1) {
            targetPosition = isUpward
                ? envs[0].position + env_1.stepPosition
                : envs[toIndex].position - env_1.stepPosition;
        }
        else {
            targetPosition = isUpward
                ? (envs[toIndex].position + envs[toIndex - 1].position) / 2
                : (envs[toIndex].position + envs[toIndex + 1].position) / 2;
        }
        const newDoc = await this.update({
            id,
            position: this.getPrecisionPosition(targetPosition),
        });
        await this.checkPosition(targetPosition, envs[toIndex].position);
        return newDoc;
    }
    async checkPosition(position, edge = 0) {
        const precisionPosition = parseFloat(position.toPrecision(16));
        if (precisionPosition < env_1.minPosition ||
            precisionPosition > env_1.maxPosition ||
            Math.abs(precisionPosition - edge) < env_1.minPosition) {
            const envs = await this.envs();
            let position = env_1.initPosition;
            for (const env of envs) {
                position = position - env_1.stepPosition;
                await this.updateDb({ id: env.id, position });
            }
        }
    }
    getPrecisionPosition(position) {
        return parseFloat(position.toPrecision(16));
    }
    async envs(searchText = '', query = {}) {
        let condition = Object.assign({}, query);
        if (searchText) {
            const encodeText = encodeURI(searchText);
            const reg = {
                [sequelize_1.Op.or]: [
                    { [sequelize_1.Op.like]: `%${searchText}%` },
                    { [sequelize_1.Op.like]: `%${encodeText}%` },
                ],
            };
            condition = Object.assign(Object.assign({}, condition), { [sequelize_1.Op.or]: [
                    {
                        name: reg,
                    },
                    {
                        value: reg,
                    },
                    {
                        remarks: reg,
                    },
                ] });
        }
        try {
            const result = await this.find(condition, [
                ['position', 'DESC'],
                ['createdAt', 'ASC'],
            ]);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async find(query, sort = []) {
        const docs = await env_1.EnvModel.findAll({
            where: Object.assign({}, query),
            order: [...sort],
        });
        return docs.map((x) => x.get({ plain: true }));
    }
    async getDb(query) {
        const doc = await env_1.EnvModel.findOne({ where: Object.assign({}, query) });
        if (!doc) {
            throw new Error(`Env ${JSON.stringify(query)} not found`);
        }
        return doc.get({ plain: true });
    }
    async disabled(ids) {
        await env_1.EnvModel.update({ status: env_1.EnvStatus.disabled }, { where: { id: ids } });
        await this.set_envs();
    }
    async enabled(ids) {
        await env_1.EnvModel.update({ status: env_1.EnvStatus.normal }, { where: { id: ids } });
        await this.set_envs();
    }
    async updateNames({ ids, name }) {
        await env_1.EnvModel.update({ name }, { where: { id: ids } });
        await this.set_envs();
    }
    async set_envs() {
        const envs = await this.envs('', {
            name: { [sequelize_1.Op.not]: null },
            status: env_1.EnvStatus.normal,
        });
        const groups = (0, groupBy_1.default)(envs, 'name');
        let env_string = '';
        let js_env_string = '';
        let py_env_string = 'import os\n';
        for (const key in groups) {
            if (Object.prototype.hasOwnProperty.call(groups, key)) {
                const group = groups[key];
                // 忽略不符合bash要求的环境变量名称
                if (/^[a-zA-Z_][0-9a-zA-Z_]*$/.test(key)) {
                    let value = group
                        .map((x) => x.value)
                        .join('&')
                        .replace(/'/g, "'\\''")
                        .trim();
                    env_string += `export ${key}='${value}'\n`;
                    const _env_value = `${group
                        .map((x) => x.value)
                        .join('&')
                        .replace(/\\/g, '\\\\')}`;
                    js_env_string += `process.env.${key}=\`${_env_value.replace(/\`/g, '\\`')}\`;\n`;
                    py_env_string += `os.environ['${key}']='''${_env_value.replace(/\'/g, "\\'")}'''\n`;
                }
            }
        }
        await (0, utils_1.writeFileWithLock)(config_1.default.envFile, env_string);
        await (0, utils_1.writeFileWithLock)(config_1.default.jsEnvFile, js_env_string);
        await (0, utils_1.writeFileWithLock)(config_1.default.pyEnvFile, py_env_string);
    }
};
EnvService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], EnvService);
exports.default = EnvService;
//# sourceMappingURL=env.js.map