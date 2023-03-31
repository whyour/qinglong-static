"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../config/index"));
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: `${index_1.default.dbPath}database.sqlite`,
    logging: false,
    retry: {
        max: 10,
        match: ['SQLITE_BUSY: database is locked'],
    },
    pool: {
        max: 5,
        min: 2,
        idle: 30000,
        acquire: 30000,
        evict: 10000,
    },
    transactionType: sequelize_1.Transaction.TYPES.IMMEDIATE,
});
//# sourceMappingURL=index.js.map