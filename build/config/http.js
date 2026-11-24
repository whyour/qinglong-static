"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpClient = void 0;
const undici_1 = require("undici");
async function request(url, options) {
    const _a = options || {}, { json, form, body, headers = {} } = _a, rest = __rest(_a, ["json", "form", "body", "headers"]);
    const finalHeaders = Object.assign({}, headers);
    let finalBody = body;
    if (json) {
        finalHeaders['content-type'] = 'application/json';
        finalBody = JSON.stringify(json);
    }
    else if (form) {
        finalBody = form;
        delete finalHeaders['content-type'];
    }
    const res = await (0, undici_1.request)(url, Object.assign({ method: 'POST', headers: finalHeaders, body: finalBody }, rest));
    return res;
}
async function post(url, options) {
    const resp = await request(url, Object.assign(Object.assign({}, options), { method: 'POST' }));
    const rawText = await resp.body.text();
    if ((options === null || options === void 0 ? void 0 : options.responseType) === 'text') {
        return rawText;
    }
    try {
        return JSON.parse(rawText);
    }
    catch (_a) {
        return rawText;
    }
}
exports.httpClient = {
    post,
    request,
};
//# sourceMappingURL=http.js.map