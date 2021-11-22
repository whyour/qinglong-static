"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEnvPosition = exports.EnvStatus = exports.Env = void 0;
class Env {
    constructor(options) {
        this.value = options.value;
        this._id = options._id;
        this.created = options.created || new Date().valueOf();
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
exports.initEnvPosition = 9999999999;
//# sourceMappingURL=env.js.map