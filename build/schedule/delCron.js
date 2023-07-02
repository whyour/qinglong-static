"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delCron = void 0;
const data_1 = require("./data");
const delCron = (call, callback) => {
    var _a;
    for (const id of call.request.ids) {
        if (data_1.scheduleStacks.has(id)) {
            (_a = data_1.scheduleStacks.get(id)) === null || _a === void 0 ? void 0 : _a.cancel();
            data_1.scheduleStacks.delete(id);
        }
    }
    callback(null, null);
};
exports.delCron = delCron;
//# sourceMappingURL=delCron.js.map