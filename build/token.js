"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const open_1 = __importDefault(require("./services/open"));
const typedi_1 = require("typedi");
const logger_1 = __importDefault(require("./loaders/logger"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("./config"));
const path_1 = __importDefault(require("path"));
const tokenFile = path_1.default.join(config_1.default.configPath, 'token.json');
async function getToken() {
    try {
        const data = await readFile();
        const nowTime = Math.round(Date.now() / 1000);
        if (data.value && data.expiration > nowTime) {
            console.log(data.value);
        }
        else {
            typedi_1.Container.set('logger', logger_1.default);
            const openService = typedi_1.Container.get(open_1.default);
            const appToken = await openService.findSystemToken();
            console.log(appToken.value);
            await writeFile({
                value: appToken.value,
                expiration: appToken.expiration,
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}
async function readFile() {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(path_1.default.join(config_1.default.configPath, 'token.json'), { encoding: 'utf8' }, (err, data) => {
            if (err) {
                resolve({});
            }
            else {
                resolve(JSON.parse(data));
            }
        });
    });
}
async function writeFile(data) {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(tokenFile, JSON.stringify(data), { encoding: 'utf8' }, () => {
            resolve();
        });
    });
}
getToken();
//# sourceMappingURL=token.js.map