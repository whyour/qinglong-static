"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveEnv = void 0;
const pick_1 = __importDefault(require("lodash/pick"));
let pickedEnv;
function getPickedEnv() {
    if (pickedEnv)
        return pickedEnv;
    const picked = (0, pick_1.default)(process.env, ['QlBaseUrl', 'DeployEnv']);
    if (picked.QlBaseUrl) {
        if (!picked.QlBaseUrl.startsWith('/')) {
            picked.QlBaseUrl = `/${picked.QlBaseUrl}`;
        }
        if (!picked.QlBaseUrl.endsWith('/')) {
            picked.QlBaseUrl = `${picked.QlBaseUrl}/`;
        }
    }
    pickedEnv = picked;
    return picked;
}
function serveEnv(_req, res) {
    res.type('.js');
    res.send(Object.entries(getPickedEnv())
        .map(([k, v]) => `window.__ENV__${k}=${JSON.stringify(v)};`)
        .join('\n'));
}
exports.serveEnv = serveEnv;
//# sourceMappingURL=serverEnv.js.map