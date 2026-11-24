"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readNotificationMode = void 0;
const system_1 = require("./system");
// Keep the same lookup and missing-row semantics as UserService.getDb.
async function readNotificationMode() {
    const query = { type: system_1.AuthDataType.notification };
    const doc = await system_1.SystemModel.findOne({ where: Object.assign({}, query) });
    if (!doc) {
        throw new Error(`${JSON.stringify(query)} not found`);
    }
    return (doc.get({ plain: true }).info || {});
}
exports.readNotificationMode = readNotificationMode;
//# sourceMappingURL=notificationSettings.js.map