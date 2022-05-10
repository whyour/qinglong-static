"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModel = exports.SubscriptionStatus = exports.Subscription = void 0;
const _1 = require(".");
const sequelize_1 = require("sequelize");
class Subscription {
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
        this.type = options.type;
        this.schedule = options.schedule;
        this.url = options.url;
        this.whitelist = options.whitelist;
        this.blacklist = options.blacklist;
        this.dependences = options.dependences;
        this.branch = options.branch;
        this.status = options.status;
        this.pull_type = options.pull_type;
        this.pull_option = options.pull_option;
        this.pid = options.pid;
        this.isDisabled = options.isDisabled;
        this.log_path = options.log_path;
        this.schedule_type = options.schedule_type;
        this.alias = options.alias;
    }
}
exports.Subscription = Subscription;
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus[SubscriptionStatus["running"] = 0] = "running";
    SubscriptionStatus[SubscriptionStatus["idle"] = 1] = "idle";
    SubscriptionStatus[SubscriptionStatus["disabled"] = 2] = "disabled";
    SubscriptionStatus[SubscriptionStatus["queued"] = 3] = "queued";
})(SubscriptionStatus = exports.SubscriptionStatus || (exports.SubscriptionStatus = {}));
exports.SubscriptionModel = _1.sequelize.define('Subscription', {
    name: {
        unique: 'compositeIndex',
        type: sequelize_1.DataTypes.STRING,
    },
    url: {
        unique: 'compositeIndex',
        type: sequelize_1.DataTypes.STRING,
    },
    schedule: {
        unique: 'compositeIndex',
        type: sequelize_1.DataTypes.STRING,
    },
    whitelist: sequelize_1.DataTypes.STRING,
    blacklist: sequelize_1.DataTypes.STRING,
    status: sequelize_1.DataTypes.NUMBER,
    dependences: sequelize_1.DataTypes.STRING,
    branch: sequelize_1.DataTypes.STRING,
    pull_type: sequelize_1.DataTypes.STRING,
    pull_option: sequelize_1.DataTypes.JSON,
    pid: sequelize_1.DataTypes.NUMBER,
    isDisabled: sequelize_1.DataTypes.NUMBER,
    log_path: sequelize_1.DataTypes.STRING,
    schedule_type: sequelize_1.DataTypes.STRING,
    alias: sequelize_1.DataTypes.STRING,
});
//# sourceMappingURL=subscription.js.map