"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareStore = exports.keyvStore = exports.EKeyv = void 0;
const keyv_1 = __importDefault(require("keyv"));
const sqlite_1 = __importDefault(require("@keyv/sqlite"));
const config_1 = __importDefault(require("../config"));
const path_1 = __importDefault(require("path"));
var EKeyv;
(function (EKeyv) {
    EKeyv["apps"] = "apps";
    EKeyv["authInfo"] = "authInfo";
})(EKeyv || (exports.EKeyv = EKeyv = {}));
const keyvSqlite = new sqlite_1.default(path_1.default.join(config_1.default.dbPath, 'keyv.sqlite'));
exports.keyvStore = new keyv_1.default({ store: keyvSqlite });
exports.shareStore = {
    getAuthInfo() {
        return exports.keyvStore.get(EKeyv.authInfo);
    },
    updateAuthInfo(value) {
        return exports.keyvStore.set(EKeyv.authInfo, value);
    },
    getApps() {
        return exports.keyvStore.get(EKeyv.apps);
    },
    updateApps(apps) {
        return exports.keyvStore.set(EKeyv.apps, apps);
    },
};
//# sourceMappingURL=store.js.map