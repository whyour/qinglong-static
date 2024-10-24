"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("./express"));
const depInjector_1 = __importDefault(require("./depInjector"));
const logger_1 = __importDefault(require("./logger"));
const initData_1 = __importDefault(require("./initData"));
const deps_1 = __importDefault(require("./deps"));
const initTask_1 = __importDefault(require("./initTask"));
exports.default = async ({ expressApp }) => {
    (0, depInjector_1.default)();
    logger_1.default.info('✌️ Dependency loaded');
    console.log('✌️ Dependency loaded');
    await (0, initData_1.default)();
    logger_1.default.info('✌️ Init data loaded');
    console.log('✌️ Init data loaded');
    await (0, deps_1.default)();
    logger_1.default.info('✌️ Link deps loaded');
    console.log('✌️ Link deps loaded');
    (0, initTask_1.default)();
    logger_1.default.info('✌️ Init task loaded');
    console.log('✌️ Init task loaded');
    (0, express_1.default)({ app: expressApp });
    logger_1.default.info('✌️ Express loaded');
    console.log('✌️ Express loaded');
};
//# sourceMappingURL=app.js.map