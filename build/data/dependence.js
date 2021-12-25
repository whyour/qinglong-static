"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unInstallDependenceCommandTypes = exports.InstallDependenceCommandTypes = exports.DependenceTypes = exports.DependenceStatus = exports.Dependence = void 0;
class Dependence {
    constructor(options) {
        this._id = options._id;
        this.created = options.created || new Date().valueOf();
        this.status = options.status || DependenceStatus.installing;
        this.type = options.type || DependenceTypes.nodejs;
        this.timestamp = new Date().toString();
        this.name = options.name;
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
})(DependenceStatus = exports.DependenceStatus || (exports.DependenceStatus = {}));
var DependenceTypes;
(function (DependenceTypes) {
    DependenceTypes[DependenceTypes["nodejs"] = 0] = "nodejs";
    DependenceTypes[DependenceTypes["python3"] = 1] = "python3";
    DependenceTypes[DependenceTypes["linux"] = 2] = "linux";
})(DependenceTypes = exports.DependenceTypes || (exports.DependenceTypes = {}));
var InstallDependenceCommandTypes;
(function (InstallDependenceCommandTypes) {
    InstallDependenceCommandTypes[InstallDependenceCommandTypes["npm i -g --force"] = 0] = "npm i -g --force";
    InstallDependenceCommandTypes[InstallDependenceCommandTypes["pip3 install"] = 1] = "pip3 install";
    InstallDependenceCommandTypes[InstallDependenceCommandTypes["apk add --no-cache -f"] = 2] = "apk add --no-cache -f";
})(InstallDependenceCommandTypes = exports.InstallDependenceCommandTypes || (exports.InstallDependenceCommandTypes = {}));
var unInstallDependenceCommandTypes;
(function (unInstallDependenceCommandTypes) {
    unInstallDependenceCommandTypes[unInstallDependenceCommandTypes["npm uninstall -g --force"] = 0] = "npm uninstall -g --force";
    unInstallDependenceCommandTypes[unInstallDependenceCommandTypes["pip3 uninstall -y"] = 1] = "pip3 uninstall -y";
    unInstallDependenceCommandTypes[unInstallDependenceCommandTypes["apk del -f"] = 2] = "apk del -f";
})(unInstallDependenceCommandTypes = exports.unInstallDependenceCommandTypes || (exports.unInstallDependenceCommandTypes = {}));
//# sourceMappingURL=dependence.js.map