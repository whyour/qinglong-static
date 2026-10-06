"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const open_1 = __importDefault(require("./services/open"));
const typedi_1 = require("typedi");
const logger_1 = __importDefault(require("./loaders/logger"));
const config_1 = __importDefault(require("./config"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const utils_1 = require("./shared/utils");
const tokenFile = path_1.default.join(config_1.default.configPath, 'token.json');
async function getToken() {
    try {
        typedi_1.Container.set('logger', logger_1.default);
        const openService = typedi_1.Container.get(open_1.default);
        const appToken = await openService.generateSystemToken();
        console.log(appToken.value);
        await writeFile({
            value: appToken.value,
            expiration: appToken.expiration,
        });
    }
    catch (error) {
        console.log(error);
    }
}
async function writeFile(data) {
    await (0, utils_1.writeFileWithLock)(tokenFile, `${JSON.stringify(data)}${os_1.default.EOL}`);
}
getToken();
//# sourceMappingURL=token.js.map