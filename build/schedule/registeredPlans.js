"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registeredDelete = exports.registeredAdd = void 0;
const addCron_1 = require("./addCron");
const delCron_1 = require("./delCron");
const crypto_1 = require("crypto");
const scheduleAudit_1 = require("../shared/scheduleAudit");
// Keep acknowledgement, publication and timer replacement in request order,
// even if the client times out and sends a replacement snapshot.
let pending = Promise.resolve();
function serialize(action) {
    pending = pending.then(action, action);
    return pending;
}
function registeredAdd(call, callback) {
    return serialize(async () => {
        const db = require('../data').sequelize;
        const token = (0, crypto_1.randomUUID)();
        let first = 0;
        const last = await new Promise((resolve, reject) => {
            (0, addCron_1.addCron)(call, (error) => (error ? reject(error) : resolve(Date.now())), async () => {
                await (0, scheduleAudit_1.saveSchedulePlan)(db, call.request, undefined, token);
                first = Date.now();
            });
        });
        await (0, scheduleAudit_1.confirmSchedulePlan)(db, token, first, last, call.request.replace);
        callback(null, null);
    }).catch((error) => callback(error));
}
exports.registeredAdd = registeredAdd;
function registeredDelete(call, callback) {
    return serialize(async () => {
        const db = require('../data').sequelize;
        const token = (0, crypto_1.randomUUID)();
        await (0, scheduleAudit_1.saveSchedulePlan)(db, call.request, undefined, token);
        const first = Date.now();
        (0, delCron_1.delCron)(call, (error) => {
            if (error)
                throw error;
        });
        await (0, scheduleAudit_1.confirmSchedulePlan)(db, token, first, Date.now(), false);
        callback(null, null);
    }).catch((error) => callback(error));
}
exports.registeredDelete = registeredDelete;
//# sourceMappingURL=registeredPlans.js.map