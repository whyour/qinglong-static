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
    try {
        (0, depInjector_1.default)();
        logger_1.default.info('✌️ Dependency Injector loaded');
        console.log('✌️ Dependency Injector loaded');
        (0, express_1.default)({ app: expressApp });
        logger_1.default.info('✌️ Express loaded');
        console.log('✌️ Express loaded');
        await (0, initData_1.default)();
        logger_1.default.info('✌️ init data loaded');
        console.log('✌️ init data loaded');
        await (0, deps_1.default)();
        logger_1.default.info('✌️ link deps loaded');
        console.log('✌️ link deps loaded');
        (0, initTask_1.default)();
        logger_1.default.info('✌️ init task loaded');
        console.log('✌️ init task loaded');
    }
    catch (error) {
        logger_1.default.error(`✌️ depInjectorLoader expressLoader initData linkDeps failed, ${error}`);
        console.error(`✌️ depInjectorLoader expressLoader initData linkDeps failed ${error}`);
    }
};
//# sourceMappingURL=app.js.map