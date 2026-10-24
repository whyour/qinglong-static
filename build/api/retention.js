"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const typedi_1 = require("typedi");
const retention_1 = __importDefault(require("../services/retention"));
const retention_2 = require("../shared/retention");
const route = (0, express_1.Router)();
const policySchema = {
    runningInstanceRetentionDays: celebrate_1.Joi.number()
        .integer()
        .min(0)
        .max(retention_2.MAX_RETENTION_DAYS)
        .required(),
    cronStatRetentionDays: celebrate_1.Joi.number()
        .integer()
        .min(0)
        .max(retention_2.MAX_RETENTION_DAYS)
        .required(),
};
const cleanupSchema = Object.assign(Object.assign({}, policySchema), { dependenceCacheTypes: celebrate_1.Joi.array()
        .items(celebrate_1.Joi.string().valid('node', 'python3'))
        .unique()
        .default([]), compactDatabase: celebrate_1.Joi.boolean().default(false) });
exports.default = (app) => {
    app.use('/system/storage-retention', route);
    route.put('/config', (0, celebrate_1.celebrate)({ body: celebrate_1.Joi.object(policySchema) }), async (req, res, next) => {
        try {
            const service = typedi_1.Container.get(retention_1.default);
            const data = await service.updatePolicy(req.body);
            res.send({ code: 200, data });
        }
        catch (error) {
            next(error);
        }
    });
    route.post('/preview', (0, celebrate_1.celebrate)({ body: celebrate_1.Joi.object(cleanupSchema) }), async (req, res, next) => {
        try {
            const service = typedi_1.Container.get(retention_1.default);
            const data = await service.preview(req.body);
            res.send({ code: 200, data });
        }
        catch (error) {
            next(error);
        }
    });
    route.post('/cleanup', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object(Object.assign(Object.assign({}, cleanupSchema), { confirmation: celebrate_1.Joi.string().valid('CLEAN').required() })),
    }), async (req, res, next) => {
        try {
            const service = typedi_1.Container.get(retention_1.default);
            const data = await service.cleanup(req.body);
            res.send({ code: 200, data });
        }
        catch (error) {
            next(error);
        }
    });
};
//# sourceMappingURL=retention.js.map