"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LarkNotification = exports.WebhookNotification = exports.ChronocatNotification = exports.PushMeNotification = exports.EmailNotification = exports.WePlusBotNotification = exports.PushPlusNotification = exports.IGotNotification = exports.AibotkNotification = exports.WeWorkAppNotification = exports.WeWorkBotNotification = exports.DingtalkBotNotification = exports.TelegramBotNotification = exports.BarkNotification = exports.ChatNotification = exports.PushDeerNotification = exports.ServerChanNotification = exports.GoCqHttpBotNotification = exports.GotifyNotification = exports.NotificationMode = void 0;
var NotificationMode;
(function (NotificationMode) {
    NotificationMode["gotify"] = "gotify";
    NotificationMode["goCqHttpBot"] = "goCqHttpBot";
    NotificationMode["serverChan"] = "serverChan";
    NotificationMode["pushDeer"] = "pushDeer";
    NotificationMode["bark"] = "bark";
    NotificationMode["chat"] = "chat";
    NotificationMode["telegramBot"] = "telegramBot";
    NotificationMode["dingtalkBot"] = "dingtalkBot";
    NotificationMode["weWorkBot"] = "weWorkBot";
    NotificationMode["weWorkApp"] = "weWorkApp";
    NotificationMode["aibotk"] = "aibotk";
    NotificationMode["iGot"] = "iGot";
    NotificationMode["pushPlus"] = "pushPlus";
    NotificationMode["wePlusBot"] = "wePlusBot";
    NotificationMode["email"] = "email";
    NotificationMode["pushMe"] = "pushMe";
    NotificationMode["feishu"] = "feishu";
    NotificationMode["webhook"] = "webhook";
    NotificationMode["chronocat"] = "Chronocat";
})(NotificationMode || (exports.NotificationMode = NotificationMode = {}));
class NotificationBaseInfo {
}
class GotifyNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.gotifyUrl = '';
        this.gotifyToken = '';
        this.gotifyPriority = 0;
    }
}
exports.GotifyNotification = GotifyNotification;
class GoCqHttpBotNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.goCqHttpBotUrl = '';
        this.goCqHttpBotToken = '';
        this.goCqHttpBotQq = '';
    }
}
exports.GoCqHttpBotNotification = GoCqHttpBotNotification;
class ServerChanNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.serverChanKey = '';
    }
}
exports.ServerChanNotification = ServerChanNotification;
class PushDeerNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.pushDeerKey = '';
        this.pushDeerUrl = '';
    }
}
exports.PushDeerNotification = PushDeerNotification;
class ChatNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.chatUrl = '';
        this.chatToken = '';
    }
}
exports.ChatNotification = ChatNotification;
class BarkNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.barkPush = '';
        this.barkIcon = 'https://qn.whyour.cn/logo.png';
        this.barkSound = '';
        this.barkGroup = 'qinglong';
        this.barkLevel = 'active';
        this.barkUrl = '';
        this.barkArchive = "";
    }
}
exports.BarkNotification = BarkNotification;
class TelegramBotNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.telegramBotToken = '';
        this.telegramBotUserId = '';
        this.telegramBotProxyHost = '';
        this.telegramBotProxyPort = '';
        this.telegramBotProxyAuth = '';
        this.telegramBotApiHost = 'https://api.telegram.org';
    }
}
exports.TelegramBotNotification = TelegramBotNotification;
class DingtalkBotNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.dingtalkBotToken = '';
        this.dingtalkBotSecret = '';
    }
}
exports.DingtalkBotNotification = DingtalkBotNotification;
class WeWorkBotNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.weWorkBotKey = '';
        this.weWorkOrigin = '';
    }
}
exports.WeWorkBotNotification = WeWorkBotNotification;
class WeWorkAppNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.weWorkAppKey = '';
        this.weWorkOrigin = '';
    }
}
exports.WeWorkAppNotification = WeWorkAppNotification;
class AibotkNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.aibotkKey = '';
        this.aibotkType = 'room';
        this.aibotkName = '';
    }
}
exports.AibotkNotification = AibotkNotification;
class IGotNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.iGotPushKey = '';
    }
}
exports.IGotNotification = IGotNotification;
class PushPlusNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.pushPlusToken = '';
        this.pushPlusUser = '';
    }
}
exports.PushPlusNotification = PushPlusNotification;
class WePlusBotNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.wePlusBotToken = '';
        this.wePlusBotReceiver = '';
        this.wePlusBotVersion = '';
    }
}
exports.WePlusBotNotification = WePlusBotNotification;
class EmailNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.emailService = '';
        this.emailUser = '';
        this.emailPass = '';
    }
}
exports.EmailNotification = EmailNotification;
class PushMeNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.pushMeKey = '';
        this.pushMeUrl = '';
    }
}
exports.PushMeNotification = PushMeNotification;
class ChronocatNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.chronocatURL = '';
        this.chronocatQQ = '';
        this.chronocatToken = '';
    }
}
exports.ChronocatNotification = ChronocatNotification;
class WebhookNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.webhookHeaders = '';
        this.webhookBody = '';
        this.webhookUrl = '';
        this.webhookMethod = 'GET';
        this.webhookContentType = 'application/json';
    }
}
exports.WebhookNotification = WebhookNotification;
class LarkNotification extends NotificationBaseInfo {
    constructor() {
        super(...arguments);
        this.larkKey = '';
    }
}
exports.LarkNotification = LarkNotification;
//# sourceMappingURL=notify.js.map