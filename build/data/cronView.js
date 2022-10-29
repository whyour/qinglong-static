"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrontabViewModel = exports.CrontabView = void 0;
const _1 = require(".");
const sequelize_1 = require("sequelize");
class CrontabView {
    constructor(options) {
        this.name = options.name;
        this.id = options.id;
        this.position = options.position;
        this.isDisabled = options.isDisabled || 0;
        this.filters = options.filters;
        this.sorts = options.sorts;
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
});
//# sourceMappingURL=cronView.js.map