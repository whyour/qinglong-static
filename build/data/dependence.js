"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependenceModel = exports.versionDependenceCommandTypes = exports.DependenceTypes = exports.DependenceStatus = exports.Dependence = void 0;
const _1 = require(".");
const sequelize_1 = require("sequelize");
class Dependence {
    constructor(options) {
        this.id = options.id;
        this.status =
            typeof options.status === 'number' && DependenceStatus[options.status]
                ? options.status
                : DependenceStatus.queued;
        this.type = options.type || DependenceTypes.nodejs;
        this.timestamp = new Date().toString();
        this.name = options.name.trim();
        this.log = options.log || [];
        this.remark = options.remark || '';
    }
}
exports.Dependence = Dependence;
var DependenceStatus;
(function (DependenceStatus) {
    DependenceStatus[DependenceStatus["installing"] = 0] = "installing";
    DependenceStatus[DependenceStatus["installed"] = 1] = "installed";
    DependenceStatus[DependenceStatus["installFailed"] = 2] = "installFailed";
    DependenceStatus[DependenceStatus["removing"] = 3] = "removing";
    DependenceStatus[DependenceStatus["removed"] = 4] = "removed";
    DependenceStatus[DependenceStatus["removeFailed"] = 5] = "removeFailed";
    DependenceStatus[DependenceStatus["queued"] = 6] = "queued";
    DependenceStatus[DependenceStatus["cancelled"] = 7] = "cancelled";
})(DependenceStatus || (exports.DependenceStatus = DependenceStatus = {}));
var DependenceTypes;
(function (DependenceTypes) {
    DependenceTypes[DependenceTypes["nodejs"] = 0] = "nodejs";
    DependenceTypes[DependenceTypes["python3"] = 1] = "python3";
    DependenceTypes[DependenceTypes["linux"] = 2] = "linux";
})(DependenceTypes || (exports.DependenceTypes = DependenceTypes = {}));
var versionDependenceCommandTypes;
(function (versionDependenceCommandTypes) {
    versionDependenceCommandTypes[versionDependenceCommandTypes["@"] = 0] = "@";
    versionDependenceCommandTypes[versionDependenceCommandTypes["=="] = 1] = "==";
    versionDependenceCommandTypes[versionDependenceCommandTypes["="] = 2] = "=";
})(versionDependenceCommandTypes || (exports.versionDependenceCommandTypes = versionDependenceCommandTypes = {}));
exports.DependenceModel = _1.sequelize.define('Dependence', {
    name: sequelize_1.DataTypes.STRING,
    type: sequelize_1.DataTypes.NUMBER,
    timestamp: sequelize_1.DataTypes.STRING,
    status: sequelize_1.DataTypes.NUMBER,
    log: sequelize_1.DataTypes.JSON,
    remark: sequelize_1.DataTypes.STRING,
});
//# sourceMappingURL=dependence.js.map