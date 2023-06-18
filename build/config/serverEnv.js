"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveEnv = void 0;
const lodash_1 = require("lodash");
let pickedEnv;
function getPickedEnv() {
    if (pickedEnv)
        return pickedEnv;
    const picked = (0, lodash_1.pick)(process.env, ['QlBaseUrl', 'DeployEnv']);
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