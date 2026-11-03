"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistNotificationAudit = void 0;
const sequelize_1 = require("sequelize");
const system_1 = require("../data/system");
// Both backend sends and script reports use the same bounded, best-effort sink.
async function persistNotificationAudit(info) {
    var _a;
    try {
        await system_1.SystemModel.create({
            type: system_1.AuthDataType.notifyLog,
            info: {
                timestamp: Date.now(),
                title: String(info.title || '').slice(0, 512),
                content: String(info.content || '').slice(0, 8192),
                status: info.status === system_1.NotifyStatus.success
                    ? system_1.NotifyStatus.success
                    : system_1.NotifyStatus.fail,
                notifyType: String(info.notifyType || '').slice(0, 64),
                source: info.source === 'script' ? 'script' : 'system',
                scriptName: String(info.scriptName || '').slice(0, 512),
                taskId: /^\d+$/.test(info.taskId || '') ? info.taskId : undefined,
            },
        });
        const oldest = await system_1.SystemModel.findAll({
            where: { type: system_1.AuthDataType.notifyLog },
            attributes: ['id'],
            order: [['id', 'DESC']],
            offset: 200,
            limit: 1,
        });
        if ((_a = oldest[0]) === null || _a === void 0 ? void 0 : _a.id) {
            await system_1.SystemModel.destroy({
                where: {
                    type: system_1.AuthDataType.notifyLog,
                    id: { [sequelize_1.Op.lte]: oldest[0].id },
                },
            });
        }
    }
    catch (error) {
        console.error('Failed to persist notification audit log');
    }
}
exports.persistNotificationAudit = persistNotificationAudit;
//# sourceMappingURL=notificationAudit.js.map