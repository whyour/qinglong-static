"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const util_1 = require("../config/util");
const open_1 = require("../data/open");
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const store_1 = require("../shared/store");
const i18n_1 = require("../shared/i18n");
const proper_lockfile_1 = require("proper-lockfile");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const promises_1 = require("fs/promises");
const config_1 = __importDefault(require("../config"));
let OpenService = class OpenService {
    constructor(logger) {
        this.logger = logger;
    }
    // Every database mutation and full authentication-cache publication shares
    // this cross-process lock. Lock a separate marker, not token.json itself.
    async withAppsLock(operation) {
        const target = path_1.default.join(config_1.default.configPath, '.apps-state');
        const release = await (0, proper_lockfile_1.lock)(target, {
            realpath: false,
            stale: 10000,
            retries: { retries: 10, factor: 2, minTimeout: 100, maxTimeout: 3000 },
        });
        try {
            return await operation();
        }
        finally {
            await release();
        }
    }
    async initializeSystemApp() {
        await this.withAppsLock(async () => {
            const doc = await open_1.AppModel.findOne({ where: { name: 'system' } });
            const app = doc === null || doc === void 0 ? void 0 : doc.get({ plain: true });
            if (!app) {
                await this.insert({
                    name: 'system',
                    scopes: ['crons', 'system', 'dashboard'],
                    client_id: (0, util_1.createRandomString)(12, 12),
                    client_secret: (0, util_1.createRandomString)(24, 24),
                });
            }
            else if (!app.scopes.includes('dashboard')) {
                await open_1.AppModel.update({ scopes: [...app.scopes, 'dashboard'] }, { where: { id: app.id } });
            }
            await store_1.shareStore.updateApps(await this.find({}));
        });
    }
    async refreshApps() {
        await this.withAppsLock(async () => {
            await store_1.shareStore.updateApps(await this.find({}));
        });
    }
    async findApps() {
        const docs = await this.find({});
        return docs;
    }
    async create(payload) {
        return this.withAppsLock(async () => {
            const tab = Object.assign({}, payload);
            tab.client_id = (0, util_1.createRandomString)(12, 12);
            tab.client_secret = (0, util_1.createRandomString)(24, 24);
            const doc = await this.insert(tab);
            const apps = await this.find({});
            await store_1.shareStore.updateApps(apps);
            return Object.assign(Object.assign({}, doc), { tokens: [] });
        });
    }
    async insert(payload) {
        const doc = await open_1.AppModel.create(payload, { returning: true });
        return doc.get({ plain: true });
    }
    async update(payload) {
        const newDoc = await this.updateDb({
            name: payload.name,
            scopes: payload.scopes,
            id: payload.id,
        });
        return Object.assign(Object.assign({}, newDoc), { tokens: [] });
    }
    async updateDb(payload) {
        return this.withAppsLock(async () => {
            await open_1.AppModel.update(payload, { where: { id: payload.id } });
            const apps = await this.find({});
            await store_1.shareStore.updateApps(apps);
            return apps === null || apps === void 0 ? void 0 : apps.find((x) => x.id === payload.id);
        });
    }
    async getDb(query) {
        const doc = await open_1.AppModel.findOne({ where: query });
        if (!doc) {
            throw new Error(`App ${JSON.stringify(query)} not found`);
        }
        return doc.get({ plain: true });
    }
    async remove(ids) {
        return this.withAppsLock(async () => {
            await open_1.AppModel.destroy({ where: { id: ids } });
            const apps = await this.find({});
            await store_1.shareStore.updateApps(apps);
        });
    }
    async resetSecret(id) {
        const tab = {
            client_secret: (0, util_1.createRandomString)(24, 24),
            tokens: [],
            id,
        };
        // const doc = await this.get(id);
        // const tab = new App({ ...doc });
        // tab.client_secret = createRandomString(24, 24);
        // tab.tokens = [];
        // const newDoc = await this.updateDb(tab);
        // return newDoc;
        const newDoc = await this.updateDb(tab);
        return newDoc;
    }
    async list(searchText = '', sort = {}, query = {}) {
        let condition = Object.assign({}, query);
        if (searchText) {
            const encodeText = encodeURI(searchText);
            const reg = {
                [sequelize_1.Op.or]: [
                    { [sequelize_1.Op.like]: `%${searchText}%` },
                    { [sequelize_1.Op.like]: `%${encodeText}%` },
                ],
            };
            condition = Object.assign(Object.assign({}, condition), { name: reg });
        }
        try {
            const result = await this.find(condition);
            return result
                .filter((x) => x.name !== 'system')
                .map((x) => (Object.assign(Object.assign({}, x), { tokens: [] })));
        }
        catch (error) {
            throw error;
        }
    }
    async find(query, sort) {
        const docs = await open_1.AppModel.findAll({ where: Object.assign({}, query) });
        return docs.map((x) => x.get({ plain: true }));
    }
    async authToken(credentials) {
        return this.withAppsLock(() => this.issueToken(credentials));
    }
    // Caller holds withAppsLock through database update and cache publication.
    async issueToken({ client_id, client_secret, }) {
        let token = (0, uuid_1.v4)();
        const expiration = Math.round(Date.now() / 1000) + 2592000; // 2592000 30天
        const doc = await open_1.AppModel.findOne({ where: { client_id, client_secret } });
        if (doc) {
            const timestamp = Math.round(Date.now() / 1000);
            const invalidTokens = (doc.tokens || []).filter((x) => x.expiration >= timestamp);
            let tokens = invalidTokens;
            if (invalidTokens.length >= 5) {
                tokens = [
                    ...invalidTokens.slice(0, 4),
                    Object.assign(Object.assign({}, invalidTokens[4]), { expiration }),
                ];
                token = invalidTokens[4].value;
            }
            else {
                tokens = [...invalidTokens, { value: token, expiration }];
            }
            await open_1.AppModel.update({ tokens }, { where: { client_id, client_secret } });
            const apps = await this.find({});
            await store_1.shareStore.updateApps(apps);
            return {
                code: 200,
                data: {
                    token,
                    token_type: 'Bearer',
                    expiration,
                },
            };
        }
        else {
            return { code: 400, message: (0, i18n_1.t)('client_id 或 client_seret 有误') };
        }
    }
    async generateSystemToken(renew = false) {
        return this.withAppsLock(async () => {
            var _a;
            // Read after acquiring the lock; a concurrent issuer may have renewed.
            const systemApp = await this.getDb({ name: 'system' });
            const now = Math.round(Date.now() / 1000);
            let appToken = (_a = systemApp.tokens) === null || _a === void 0 ? void 0 : _a.filter((token) => token.expiration > now).sort((left, right) => right.expiration - left.expiration)[0];
            if (renew || !appToken) {
                const { data } = await this.issueToken({
                    client_id: systemApp.client_id,
                    client_secret: systemApp.client_secret,
                });
                appToken = { value: data.token, expiration: data.expiration };
            }
            else {
                // Recover a prior database commit whose cache publication failed.
                await store_1.shareStore.updateApps(await this.find({}));
            }
            const tokenFile = path_1.default.join(config_1.default.configPath, 'token.json');
            const temporaryFile = `${tokenFile}.${process.pid}.tmp`;
            const mode = await (0, promises_1.stat)(tokenFile).then((file) => file.mode & 0o777, (error) => {
                if (error.code === 'ENOENT')
                    return 0o600;
                throw error;
            });
            try {
                await (0, promises_1.writeFile)(temporaryFile, `${JSON.stringify(appToken)}${os_1.default.EOL}`, {
                    mode,
                });
                await (0, promises_1.chmod)(temporaryFile, mode);
                // Shell readers see a complete old or new document, never a partial one.
                await (0, promises_1.rename)(temporaryFile, tokenFile);
            }
            finally {
                await (0, promises_1.rm)(temporaryFile, { force: true });
            }
            return appToken;
        });
    }
};
OpenService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], OpenService);
exports.default = OpenService;
//# sourceMappingURL=open.js.map