"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCommand = exports.formatUrl = void 0;
const isNil_1 = __importDefault(require("lodash/isNil"));
function formatUrl(doc) {
    let url = doc.url;
    let host = '';
    if (doc.type === 'private-repo') {
        if (doc.pull_type === 'ssh-key') {
            host = doc.url.replace(/.*\@([^\:]+)\:.*/, '$1');
            url = doc.url.replace(host, doc.alias);
        }
        else {
            host = doc.url.replace(/.*\:\/\/([^\/]+)\/.*/, '$1');
            const { username, password } = doc.pull_option;
            url = doc.url.replace(host, `${username}:${password}@${host}`);
        }
    }
    return { url, host };
}
exports.formatUrl = formatUrl;
function formatCommand(doc, url) {
    let command = `SUB_ID=${doc.id} ql `;
    let _url = url || formatUrl(doc).url;
    const { type, whitelist, blacklist, dependences, branch, extensions, proxy, autoAddCron, autoDelCron, } = doc;
    if (type === 'file') {
        command += `raw "${_url}"`;
    }
    else {
        command += `repo "${_url}" "${whitelist || ''}" "${blacklist || ''}" "${dependences || ''}" "${branch || ''}" "${extensions || ''}" "${proxy || ''}" "${(0, isNil_1.default)(autoAddCron) ? true : Boolean(autoAddCron)}" "${(0, isNil_1.default)(autoDelCron) ? true : Boolean(autoDelCron)}"`;
    }
    return command;
}
exports.formatCommand = formatCommand;
//# sourceMappingURL=subscription.js.map