"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependenceModel = exports.unInstallDependenceCommandTypes = exports.versionDependenceCommandTypes = exports.GetDependenceCommandTypes = exports.InstallDependenceCommandTypes = exports.DependenceTypes = exports.DependenceStatus = exports.Dependence = void 0;
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
var InstallDependenceCommandTypes;
(function (InstallDependenceCommandTypes) {
    InstallDependenceCommandTypes[InstallDependenceCommandTypes["pnpm add -g"] = 0] = "pnpm add -g";
    InstallDependenceCommandTypes[InstallDependenceCommandTypes["pip3 install --disable-pip-version-check --root-user-action=ignore"] = 1] = "pip3 install --disable-pip-version-check --root-user-action=ignore";
    InstallDependenceCommandTypes[InstallDependenceCommandTypes["apt install -y"] = 2] = "apt install -y";
})(InstallDependenceCommandTypes || (exports.InstallDependenceCommandTypes = InstallDependenceCommandTypes = {}));
var GetDependenceCommandTypes;
(function (GetDependenceCommandTypes) {
    GetDependenceCommandTypes[GetDependenceCommandTypes["pnpm ls -g "] = 0] = "pnpm ls -g ";
    GetDependenceCommandTypes[GetDependenceCommandTypes["pip3 show --disable-pip-version-check"] = 1] = "pip3 show --disable-pip-version-check";
    GetDependenceCommandTypes[GetDependenceCommandTypes["apt info"] = 2] = "apt info";
})(GetDependenceCommandTypes || (exports.GetDependenceCommandTypes = GetDependenceCommandTypes = {}));
var versionDependenceCommandTypes;
(function (versionDependenceCommandTypes) {
    versionDependenceCommandTypes[versionDependenceCommandTypes["@"] = 0] = "@";
    versionDependenceCommandTypes[versionDependenceCommandTypes["=="] = 1] = "==";
    versionDependenceCommandTypes[versionDependenceCommandTypes["="] = 2] = "=";
})(versionDependenceCommandTypes || (exports.versionDependenceCommandTypes = versionDependenceCommandTypes = {}));
var unInstallDependenceCommandTypes;
(function (unInstallDependenceCommandTypes) {
    unInstallDependenceCommandTypes[unInstallDependenceCommandTypes["pnpm remove -g"] = 0] = "pnpm remove -g";
    unInstallDependenceCommandTypes[unInstallDependenceCommandTypes["pip3 uninstall --disable-pip-version-check --root-user-action=ignore -y"] = 1] = "pip3 uninstall --disable-pip-version-check --root-user-action=ignore -y";
    unInstallDependenceCommandTypes[unInstallDependenceCommandTypes["apt remove -y"] = 2] = "apt remove -y";
})(unInstallDependenceCommandTypes || (exports.unInstallDependenceCommandTypes = unInstallDependenceCommandTypes = {}));
exports.DependenceModel = _1.sequelize.define('Dependence', {
    name: sequelize_1.DataTypes.STRING,
    type: sequelize_1.DataTypes.NUMBER,
    timestamp: sequelize_1.DataTypes.STRING,
    status: sequelize_1.DataTypes.NUMBER,
    log: sequelize_1.DataTypes.JSON,
    remark: sequelize_1.DataTypes.STRING,
});
//# sourceMappingURL=dependence.js.map