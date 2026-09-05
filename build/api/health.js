"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = __importDefault(require("../loaders/logger"));
const health_1 = require("../services/health");
const typedi_1 = __importDefault(require("typedi"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/', route);
    route.get('/health', async (req, res) => {
        try {
            const healthService = typedi_1.default.get(health_1.HealthService);
            const health = await healthService.check();
            res.status(200).send({
                code: 200,
                data: health,
            });
        }
        catch (err) {
            logger_1.default.error('Health check failed:', err);
            res.status(500).send({
                code: 500,
                message: 'Health check failed',
                error: err.message,
            });
        }
    });
};
//# sourceMappingURL=health.js.map