"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvModel = exports.minPosition = exports.stepPosition = exports.initPosition = exports.maxPosition = exports.EnvStatus = exports.Env = void 0;
const _1 = require(".");
const sequelize_1 = require("sequelize");
class Env {
    constructor(options) {
        this.value = options.value;
        this.id = options.id;
        this.status = options.status || EnvStatus.normal;
        this.timestamp = new Date().toString();
        this.position = options.position;
        this.name = options.name;
        this.remarks = options.remarks;
    }
}
exports.Env = Env;
var EnvStatus;
(function (EnvStatus) {
    EnvStatus[EnvStatus["normal"] = 0] = "normal";
    EnvStatus[EnvStatus["disabled"] = 1] = "disabled";
})(EnvStatus = exports.EnvStatus || (exports.EnvStatus = {}));
exports.maxPosition = 9000000000000000;
exports.initPosition = 4500000000000000;
exports.stepPosition = 10000000000;
exports.minPosition = 100;
exports.EnvModel = _1.sequelize.define('Env', {
    value: { type: sequelize_1.DataTypes.STRING, unique: 'compositeIndex' },
    timestamp: sequelize_1.DataTypes.STRING,
    status: sequelize_1.DataTypes.NUMBER,
    position: sequelize_1.DataTypes.NUMBER,
    name: { type: sequelize_1.DataTypes.STRING, unique: 'compositeIndex' },
    remarks: sequelize_1.DataTypes.STRING,
});
//# sourceMappingURL=env.js.map