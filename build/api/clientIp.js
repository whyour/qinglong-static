"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const trustProxy_1 = require("../shared/trustProxy");
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/system/client-ip', route);
    route.get('/config', async (req, res, next) => {
        try {
            res.send({ code: 200, data: await (0, trustProxy_1.getTrustProxyConfig)() });
        }
        catch (error) {
            next(error);
        }
    });
    route.put('/config', (0, celebrate_1.celebrate)({
        body: celebrate_1.Joi.object({
            trustProxy: celebrate_1.Joi.string().max(500).required(),
        }),
    }), async (req, res) => {
        try {
            const data = await (0, trustProxy_1.updateTrustProxy)(req.body.trustProxy);
            res.send({ code: 200, data });
        }
        catch (error) {
            res.send({
                code: 400,
                message: error instanceof Error ? error.message : '配置更新失败',
            });
        }
    });
    route.get('/diagnose', async (req, res, next) => {
        try {
            res.send({ code: 200, data: await (0, trustProxy_1.diagnoseClientIp)(req) });
        }
        catch (error) {
            next(error);
        }
    });
};
//# sourceMappingURL=clientIp.js.map