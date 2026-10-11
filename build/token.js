"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const open_1 = __importDefault(require("./services/open"));
const typedi_1 = require("typedi");
const logger_1 = __importDefault(require("./loaders/logger"));
async function getToken() {
    try {
        typedi_1.Container.set('logger', logger_1.default);
        const openService = typedi_1.Container.get(open_1.default);
        const appToken = await openService.generateSystemToken(process.argv.includes('--renew'));
        console.log(appToken.value);
    }
    catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}
getToken();
//# sourceMappingURL=token.js.map