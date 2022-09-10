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
const cronView_1 = require("../data/cronView");
const env_1 = require("../data/env");
let CronViewService = class CronViewService {
    constructor(logger) {
        this.logger = logger;
    }
    async create(payload) {
        let position = env_1.initEnvPosition;
        const views = await this.list();
        if (views && views.length > 0 && views[views.length - 1].position) {
            position = views[views.length - 1].position;
        }
        position = position / 2;
        const tab = new cronView_1.CrontabView(Object.assign(Object.assign({}, payload), { position }));
        const doc = await this.insert(tab);
        return doc;
    }
    async insert(payload) {
        return await cronView_1.CrontabViewModel.create(payload, { returning: true });
    }
    async update(payload) {
        const newDoc = await this.updateDb(payload);
        return newDoc;
    }
    async updateDb(payload) {
        await cronView_1.CrontabViewModel.update(payload, { where: { id: payload.id } });
        return await this.getDb({ id: payload.id });
    }
    async remove(ids) {
        await cronView_1.CrontabViewModel.destroy({ where: { id: ids } });
    }
    async list() {
        try {
            const result = await cronView_1.CrontabViewModel.findAll({
                where: {},
                order: [['position', 'DESC']],
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getDb(query) {
        const doc = await cronView_1.CrontabViewModel.findOne({ where: Object.assign({}, query) });
        return doc && doc.get({ plain: true });
    }
    async disabled(ids) {
        await cronView_1.CrontabViewModel.update({ isDisabled: 1 }, { where: { id: ids } });
    }
    async enabled(ids) {
        await cronView_1.CrontabViewModel.update({ isDisabled: 0 }, { where: { id: ids } });
    }
    async move({ id, fromIndex, toIndex, }) {
        let targetPosition;
        const isUpward = fromIndex > toIndex;
        const views = await this.list();
        if (toIndex === 0 || toIndex === views.length - 1) {
            targetPosition = isUpward
                ? views[0].position * 2
                : views[toIndex].position / 2;
        }
        else {
            targetPosition = isUpward
                ? (views[toIndex].position + views[toIndex - 1].position) / 2
                : (views[toIndex].position + views[toIndex + 1].position) / 2;
        }
        const newDoc = await this.update({
            id,
            position: targetPosition,
        });
        return newDoc;
    }
};
CronViewService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], CronViewService);
exports.default = CronViewService;
//# sourceMappingURL=cronView.js.map