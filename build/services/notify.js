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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const got_1 = __importDefault(require("got"));
const hpagent_1 = require("hpagent");
const nodemailer_1 = __importDefault(require("nodemailer"));
const typedi_1 = require("typedi");
const winston_1 = __importDefault(require("winston"));
const util_1 = require("../config/util");
const user_1 = __importDefault(require("./user"));
let NotificationService = class NotificationService {
    constructor(logger) {
        this.logger = logger;
        this.modeMap = new Map([
            ['gotify', this.gotify],
            ['goCqHttpBot', this.goCqHttpBot],
            ['serverChan', this.serverChan],
            ['pushDeer', this.pushDeer],
            ['chat', this.chat],
            ['bark', this.bark],
            ['telegramBot', this.telegramBot],
            ['dingtalkBot', this.dingtalkBot],
            ['weWorkBot', this.weWorkBot],
            ['weWorkApp', this.weWorkApp],
            ['aibotk', this.aibotk],
            ['iGot', this.iGot],
            ['pushPlus', this.pushPlus],
            ['wePlusBot', this.wePlusBot],
            ['email', this.email],
            ['pushMe', this.pushMe],
            ['webhook', this.webhook],
            ['lark', this.lark],
            ['chronocat', this.chronocat],
        ]);
        this.title = '';
        this.content = '';
        this.gotOption = {
            timeout: 10000,
            retry: 1,
        };
    }
    async notify(title, content) {
        const _a = await this.userService.getNotificationMode(), { type } = _a, rest = __rest(_a, ["type"]);
        if (type) {
            this.title = title;
            this.content = content;
            this.params = rest;
            const notificationModeAction = this.modeMap.get(type);
            try {
                return await (notificationModeAction === null || notificationModeAction === void 0 ? void 0 : notificationModeAction.call(this));
            }
            catch (error) {
                throw error;
            }
        }
        return false;
    }
    async testNotify(info, title, content) {
        const { type } = info, rest = __rest(info, ["type"]);
        if (type) {
            this.title = title;
            this.content = content;
            this.params = rest;
            const notificationModeAction = this.modeMap.get(type);
            return await (notificationModeAction === null || notificationModeAction === void 0 ? void 0 : notificationModeAction.call(this));
        }
        return true;
    }
    async gotify() {
        const { gotifyUrl, gotifyToken, gotifyPriority = 1 } = this.params;
        try {
            const res = await got_1.default
                .post(`${gotifyUrl}/message?token=${gotifyToken}`, Object.assign(Object.assign({}, this.gotOption), { body: `title=${encodeURIComponent(this.title)}&message=${encodeURIComponent(this.content)}&priority=${gotifyPriority}`, headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                } }))
                .json();
            if (typeof res.id === 'number') {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async goCqHttpBot() {
        const { goCqHttpBotQq, goCqHttpBotToken, goCqHttpBotUrl } = this.params;
        try {
            const res = await got_1.default
                .post(`${goCqHttpBotUrl}?${goCqHttpBotQq}`, Object.assign(Object.assign({}, this.gotOption), { json: { message: `${this.title}\n${this.content}` }, headers: { Authorization: 'Bearer ' + goCqHttpBotToken } }))
                .json();
            if (res.retcode === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async serverChan() {
        const { serverChanKey } = this.params;
        const url = serverChanKey.startsWith('SCT')
            ? `https://sctapi.ftqq.com/${serverChanKey}.send`
            : `https://sc.ftqq.com/${serverChanKey}.send`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { body: `title=${this.title}&desp=${this.content}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }))
                .json();
            if (res.errno === 0 || res.data.errno === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async pushDeer() {
        const { pushDeerKey, pushDeerUrl } = this.params;
        const url = pushDeerUrl || `https://api2.pushdeer.com/message/push`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { body: `pushkey=${pushDeerKey}&text=${encodeURIComponent(this.title)}&desp=${encodeURIComponent(this.content)}&type=markdown`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }))
                .json();
            if (res.content.result.length !== undefined &&
                res.content.result.length > 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async chat() {
        const { chatUrl, chatToken } = this.params;
        const url = `${chatUrl}${chatToken}`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { body: `payload={"text":"${this.title}\n${this.content}"}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }))
                .json();
            if (res.success) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async bark() {
        let { barkPush, barkIcon = '', barkSound = '', barkGroup = '', barkLevel = '', barkUrl = '', barkArchive = '', } = this.params;
        if (!barkPush.startsWith('http')) {
            barkPush = `https://api.day.app/${barkPush}`;
        }
        const url = `${barkPush}/${encodeURIComponent(this.title)}/${encodeURIComponent(this.content)}?icon=${barkIcon}&sound=${barkSound}&group=${barkGroup}&level=${barkLevel}&url=${barkUrl}&isArchive=${barkArchive}`;
        try {
            const res = await got_1.default
                .get(url, Object.assign(Object.assign({}, this.gotOption), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }))
                .json();
            if (res.code === 200) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async telegramBot() {
        const { telegramBotApiHost, telegramBotProxyAuth, telegramBotProxyHost, telegramBotProxyPort, telegramBotToken, telegramBotUserId, } = this.params;
        const authStr = telegramBotProxyAuth ? `${telegramBotProxyAuth}@` : '';
        const url = `${telegramBotApiHost ? telegramBotApiHost : 'https://api.telegram.org'}/bot${telegramBotToken}/sendMessage`;
        let agent;
        if (telegramBotProxyHost && telegramBotProxyPort) {
            const options = {
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                proxy: `http://${authStr}${telegramBotProxyHost}:${telegramBotProxyPort}`,
            };
            const httpAgent = new hpagent_1.HttpProxyAgent(options);
            const httpsAgent = new hpagent_1.HttpsProxyAgent(options);
            agent = {
                http: httpAgent,
                https: httpsAgent,
            };
        }
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { body: `chat_id=${telegramBotUserId}&text=${this.title}\n\n${this.content}&disable_web_page_preview=true`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, agent }))
                .json();
            if (res.ok) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async dingtalkBot() {
        const { dingtalkBotSecret, dingtalkBotToken } = this.params;
        let secretParam = '';
        if (dingtalkBotSecret) {
            const dateNow = Date.now();
            const hmac = crypto_1.default.createHmac('sha256', dingtalkBotSecret);
            hmac.update(`${dateNow}\n${dingtalkBotSecret}`);
            const result = encodeURIComponent(hmac.digest('base64'));
            secretParam = `&timestamp=${dateNow}&sign=${result}`;
        }
        const url = `https://oapi.dingtalk.com/robot/send?access_token=${dingtalkBotToken}${secretParam}`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { json: {
                    msgtype: 'text',
                    text: {
                        content: ` ${this.title}\n\n${this.content}`,
                    },
                } }))
                .json();
            if (res.errcode === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async weWorkBot() {
        const { weWorkBotKey, weWorkOrigin = 'https://qyapi.weixin.qq.com' } = this.params;
        const url = `${weWorkOrigin}/cgi-bin/webhook/send?key=${weWorkBotKey}`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { json: {
                    msgtype: 'text',
                    text: {
                        content: ` ${this.title}\n\n${this.content}`,
                    },
                } }))
                .json();
            if (res.errcode === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async weWorkApp() {
        const { weWorkAppKey, weWorkOrigin = 'https://qyapi.weixin.qq.com' } = this.params;
        const [corpid, corpsecret, touser, agentid, thumb_media_id = '1'] = weWorkAppKey.split(',');
        const url = `${weWorkOrigin}/cgi-bin/gettoken`;
        const tokenRes = await got_1.default
            .post(url, Object.assign(Object.assign({}, this.gotOption), { json: {
                corpid,
                corpsecret,
            } }))
            .json();
        let options = {
            msgtype: 'mpnews',
            mpnews: {
                articles: [
                    {
                        title: `${this.title}`,
                        thumb_media_id,
                        author: `智能助手`,
                        content_source_url: ``,
                        content: `${this.content.replace(/\n/g, '<br/>')}`,
                        digest: `${this.content}`,
                    },
                ],
            },
        };
        switch (thumb_media_id) {
            case '0':
                options = {
                    msgtype: 'textcard',
                    textcard: {
                        title: `${this.title}`,
                        description: `${this.content}`,
                        url: 'https://github.com/whyour/qinglong',
                        btntxt: '更多',
                    },
                };
                break;
            case '1':
                options = {
                    msgtype: 'text',
                    text: {
                        content: `${this.title}\n\n${this.content}`,
                    },
                };
                break;
        }
        try {
            const res = await got_1.default
                .post(`${weWorkOrigin}/cgi-bin/message/send?access_token=${tokenRes.access_token}`, Object.assign(Object.assign({}, this.gotOption), { json: Object.assign({ touser,
                    agentid, safe: '0' }, options) }))
                .json();
            if (res.errcode === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async aibotk() {
        const { aibotkKey, aibotkType, aibotkName } = this.params;
        let url = '';
        let json = {};
        switch (aibotkType) {
            case 'room':
                url = 'https://api-bot.aibotk.com/openapi/v1/chat/room';
                json = {
                    apiKey: `${aibotkKey}`,
                    roomName: `${aibotkName}`,
                    message: {
                        type: 1,
                        content: `【青龙快讯】\n\n${this.title}\n${this.content}`,
                    },
                };
                break;
            case 'contact':
                url = 'https://api-bot.aibotk.com/openapi/v1/chat/contact';
                json = {
                    apiKey: `${aibotkKey}`,
                    name: `${aibotkName}`,
                    message: {
                        type: 1,
                        content: `【青龙快讯】\n\n${this.title}\n${this.content}`,
                    },
                };
                break;
        }
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { json: Object.assign({}, json) }))
                .json();
            if (res.code === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async iGot() {
        const { iGotPushKey } = this.params;
        const url = `https://push.hellyw.com/${iGotPushKey.toLowerCase()}`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { body: `title=${this.title}&content=${this.content}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }))
                .json();
            if (res.ret === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async pushPlus() {
        const { pushPlusToken, pushPlusUser } = this.params;
        const url = `https://www.pushplus.plus/send`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { json: {
                    token: `${pushPlusToken}`,
                    title: `${this.title}`,
                    content: `${this.content.replace(/[\n\r]/g, '<br>')}`,
                    topic: `${pushPlusUser || ''}`,
                } }))
                .json();
            if (res.code === 200) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async wePlusBot() {
        const { wePlusBotToken, wePlusBotReceiver, wePlusBotVersion } = this.params;
        let content = this.content;
        let template = 'txt';
        if (this.content.length > 800) {
            template = 'html';
            content = content.replace(/[\n\r]/g, '<br>');
        }
        const url = `https://www.weplusbot.com/send`;
        try {
            const res = await got_1.default
                .post(url, Object.assign(Object.assign({}, this.gotOption), { json: {
                    token: `${wePlusBotToken}`,
                    title: `${this.title}`,
                    template: `${template}`,
                    content: `${content}`,
                    receiver: `${wePlusBotReceiver || ''}`,
                    version: `${wePlusBotVersion || 'pro'}`,
                } }))
                .json();
            if (res.code === 200) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async lark() {
        let { larkKey } = this.params;
        if (!larkKey.startsWith('http')) {
            larkKey = `https://open.feishu.cn/open-apis/bot/v2/hook/${larkKey}`;
        }
        try {
            const res = await got_1.default
                .post(larkKey, Object.assign(Object.assign({}, this.gotOption), { json: {
                    msg_type: 'text',
                    content: { text: `${this.title}\n\n${this.content}` },
                }, headers: { 'Content-Type': 'application/json' } }))
                .json();
            if (res.StatusCode === 0 || res.code === 0) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async email() {
        const { emailPass, emailService, emailUser } = this.params;
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: emailService,
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });
            const info = await transporter.sendMail({
                from: `"青龙快讯" <${emailUser}>`,
                to: `${emailUser}`,
                subject: `${this.title}`,
                html: `${this.content.replace(/\n/g, '<br/>')}`,
            });
            transporter.close();
            if (info.messageId) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(info));
            }
        }
        catch (error) {
            throw error;
        }
    }
    async pushMe() {
        const { pushMeKey, pushMeUrl } = this.params;
        try {
            const res = await got_1.default.post(pushMeUrl || 'https://push.i-i.me/', Object.assign(Object.assign({}, this.gotOption), { json: {
                    push_key: pushMeKey,
                    title: this.title,
                    content: this.content,
                }, headers: { 'Content-Type': 'application/json' } }));
            if (res.body === 'success') {
                return true;
            }
            else {
                throw new Error(res.body);
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async chronocat() {
        var _a, _b;
        const { chronocatURL, chronocatQQ, chronocatToken } = this.params;
        try {
            const user_ids = (_a = chronocatQQ
                .match(/user_id=(\d+)/g)) === null || _a === void 0 ? void 0 : _a.map((match) => match.split('=')[1]);
            const group_ids = (_b = chronocatQQ
                .match(/group_id=(\d+)/g)) === null || _b === void 0 ? void 0 : _b.map((match) => match.split('=')[1]);
            const url = `${chronocatURL}/api/message/send`;
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${chronocatToken}`,
            };
            for (const [chat_type, ids] of [
                [1, user_ids],
                [2, group_ids],
            ]) {
                if (!ids) {
                    continue;
                }
                let _ids = ids;
                for (const chat_id of _ids) {
                    const data = {
                        peer: {
                            chatType: chat_type,
                            peerUin: chat_id,
                        },
                        elements: [
                            {
                                elementType: 1,
                                textElement: {
                                    content: `${this.title}\n\n${this.content}`,
                                },
                            },
                        ],
                    };
                    const res = await got_1.default.post(url, Object.assign(Object.assign({}, this.gotOption), { json: data, headers }));
                    if (res.statusCode === 200) {
                        return true;
                    }
                    else {
                        throw new Error(res.body);
                    }
                }
            }
            return false;
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    async webhook() {
        var _a;
        const { webhookUrl, webhookBody, webhookHeaders, webhookMethod, webhookContentType, } = this.params;
        if (!webhookUrl.includes('$title') && !webhookBody.includes('$title')) {
            throw new Error('Url 或者 Body 中必须包含 $title');
        }
        const headers = (0, util_1.parseHeaders)(webhookHeaders);
        const body = (0, util_1.parseBody)(webhookBody, webhookContentType, (v) => { var _a; return (_a = v === null || v === void 0 ? void 0 : v.replaceAll('$title', this.title)) === null || _a === void 0 ? void 0 : _a.replaceAll('$content', this.content); });
        const bodyParam = this.formatBody(webhookContentType, body);
        const options = Object.assign(Object.assign(Object.assign({ method: webhookMethod, headers }, this.gotOption), { allowGetBody: true }), bodyParam);
        try {
            const formatUrl = (_a = webhookUrl === null || webhookUrl === void 0 ? void 0 : webhookUrl.replaceAll('$title', encodeURIComponent(this.title))) === null || _a === void 0 ? void 0 : _a.replaceAll('$content', encodeURIComponent(this.content));
            const res = await (0, got_1.default)(formatUrl, options);
            if (String(res.statusCode).startsWith('20')) {
                return true;
            }
            else {
                throw new Error(JSON.stringify(res));
            }
        }
        catch (error) {
            throw new Error(error.response ? error.response.body : error);
        }
    }
    formatBody(contentType, body) {
        if (!body)
            return {};
        switch (contentType) {
            case 'application/json':
                return { json: body };
            case 'multipart/form-data':
                return { form: body };
            case 'application/x-www-form-urlencoded':
            case 'text/plain':
                return { body };
        }
        return {};
    }
};
__decorate([
    (0, typedi_1.Inject)((type) => user_1.default),
    __metadata("design:type", user_1.default)
], NotificationService.prototype, "userService", void 0);
NotificationService = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)('logger')),
    __metadata("design:paramtypes", [winston_1.default.Logger])
], NotificationService);
exports.default = NotificationService;
//# sourceMappingURL=notify.js.map