"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabStatModel = exports.CrontabStat = void 0;
const executionModelDefinitions_1 = require("./executionModelDefinitions");
const _1 = require(".");
class CrontabStat {
    constructor(options) {
        this.id = options.id;
        this.ref_id = options.ref_id;
        this.date = options.date;
        this.run_count = options.run_count || 0;
        this.success_count = options.success_count || 0;
        this.fail_count = options.fail_count || 0;
        this.untimed_count = options.untimed_count || 0;
        this.total_time = options.total_time || 0;
        this.max_time = options.max_time || 0;
    }
}
exports.CrontabStat = CrontabStat;
exports.CrontabStatModel = (0, executionModelDefinitions_1.defineCrontabStatModel)(_1.sequelize);
//# sourceMappingURL=cronStats.js.map