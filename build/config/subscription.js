"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCommand = exports.formatUrl = void 0;
const isNil_1 = __importDefault(require("lodash/isNil"));
const shellQuote_1 = require("../shared/shellQuote");
const subscriptionPath_1 = require("../shared/subscriptionPath");
function formatUrl(doc) {
    let url = doc.url;
    let host = '';
    if (doc.type === 'private-repo') {
        if (doc.pull_type === 'ssh-key') {
            host = doc.url.replace(/.*\@([^\:]+)\:.*/, '$1');
            url = doc.url.replace(host, (0, subscriptionPath_1.getSubscriptionSshAlias)(doc.alias));
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
    const args = doc.type === 'file'
        ? ['raw', url || formatUrl(doc).url, doc.proxy || '']
        : [
            'repo',
            url || formatUrl(doc).url,
            doc.whitelist || '',
            doc.blacklist || '',
            doc.dependences || '',
            doc.branch || '',
            doc.extensions || '',
            doc.proxy || '',
        ];
    args.push(String((0, isNil_1.default)(doc.autoAddCron) ? true : Boolean(doc.autoAddCron)), String((0, isNil_1.default)(doc.autoDelCron) ? true : Boolean(doc.autoDelCron)));
    return `SUB_ID=${(0, shellQuote_1.shellQuote)(String(doc.id))} ql ${args
        .map((arg) => (0, shellQuote_1.shellQuote)(arg))
        .join(' ')}`;
}
exports.formatCommand = formatCommand;
//# sourceMappingURL=subscription.js.map