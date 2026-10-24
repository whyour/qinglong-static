"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabStatModel = exports.CrontabStat = void 0;
const sequelize_1 = require("sequelize");
const _1 = require(".");
class CrontabStat {
    constructor(options) {
        this.id = options.id;
        this.ref_id = options.ref_id;
        this.date = options.date;
        this.run_count = options.run_count || 0;
        this.success_count = options.success_count || 0;
        this.fail_count = options.fail_count || 0;
        this.total_time = options.total_time || 0;
        this.max_time = options.max_time || 0;
    }
}
exports.CrontabStat = CrontabStat;
exports.CrontabStatModel = _1.sequelize.define('CrontabStat', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ref_id: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    run_count: {
        type: sequelize_1.DataTypes.NUMBER,
        defaultValue: 0,
    },
    success_count: {
        type: sequelize_1.DataTypes.NUMBER,
        defaultValue: 0,
    },
    fail_count: {
        type: sequelize_1.DataTypes.NUMBER,
        defaultValue: 0,
    },
    total_time: {
        type: sequelize_1.DataTypes.NUMBER,
        defaultValue: 0,
    },
    max_time: {
        type: sequelize_1.DataTypes.NUMBER,
        defaultValue: 0,
    },
}, {
    indexes: [
        { unique: true, fields: ['ref_id', 'date'] },
        { fields: ['date'] },
    ],
});
//# sourceMappingURL=cronStats.js.map