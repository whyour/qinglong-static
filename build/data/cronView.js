"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabViewModel = exports.CrontabView = exports.CronViewType = void 0;
const _1 = require(".");
const sequelize_1 = require("sequelize");
var CronViewType;
(function (CronViewType) {
    CronViewType[CronViewType["\u7CFB\u7EDF"] = 1] = "\u7CFB\u7EDF";
    CronViewType[CronViewType["\u4E2A\u4EBA"] = 2] = "\u4E2A\u4EBA";
})(CronViewType = exports.CronViewType || (exports.CronViewType = {}));
class CrontabView {
    constructor(options) {
        this.name = options.name;
        this.id = options.id;
        this.position = options.position;
        this.isDisabled = options.isDisabled || 0;
        this.filters = options.filters;
        this.sorts = options.sorts;
        this.filterRelation = options.filterRelation;
        this.type = options.type || CronViewType.个人;
    }
}
exports.CrontabView = CrontabView;
exports.CrontabViewModel = _1.sequelize.define('CrontabView', {
    name: {
        unique: 'name',
        type: sequelize_1.DataTypes.STRING,
    },
    position: sequelize_1.DataTypes.NUMBER,
    isDisabled: sequelize_1.DataTypes.NUMBER,
    filters: sequelize_1.DataTypes.JSON,
    sorts: sequelize_1.DataTypes.JSON,
    filterRelation: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    type: sequelize_1.DataTypes.NUMBER,
});
//# sourceMappingURL=cronView.js.map