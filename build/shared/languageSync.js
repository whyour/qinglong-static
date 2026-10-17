"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeLanguageSync = void 0;
const cluster_1 = __importDefault(require("cluster"));
const i18n_1 = require("./i18n");
function languageMessage(message) {
    const value = message;
    return ((value === null || value === void 0 ? void 0 : value.type) === 'language-changed' && ['zh', 'en'].includes(value.lang));
}
// Each worker owns a translation cache. Relay saved settings to live workers;
// a replacement worker restores the persisted language before serving requests.
async function initializeLanguageSync() {
    if (cluster_1.default.isPrimary) {
        cluster_1.default.on('message', (_worker, message) => {
            if (!languageMessage(message))
                return;
            (0, i18n_1.setLang)(message.lang, false);
            for (const worker of Object.values(cluster_1.default.workers || {})) {
                if (worker === null || worker === void 0 ? void 0 : worker.isConnected())
                    worker.send(message, () => { });
            }
        });
        return;
    }
    else {
        process.on('message', (message) => {
            if (languageMessage(message))
                (0, i18n_1.setLang)(message.lang, false);
        });
    }
    const { shareStore } = await Promise.resolve().then(() => __importStar(require('./store')));
    (0, i18n_1.setLang)((await shareStore.getLang()) || (0, i18n_1.systemLang)(), false);
}
exports.initializeLanguageSync = initializeLanguageSync;
//# sourceMappingURL=languageSync.js.map