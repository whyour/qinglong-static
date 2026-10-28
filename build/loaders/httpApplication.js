"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpApplication = void 0;
const config_1 = __importDefault(require("../config"));
async function createHttpApplication() {
    // Only the HTTP worker needs an Express application and its middleware.
    const [{ default: createExpress }, { default: helmet }, { default: cors }, { default: compression }, { monitoringMiddleware },] = await Promise.all([
        Promise.resolve().then(() => __importStar(require('express'))),
        Promise.resolve().then(() => __importStar(require('helmet'))),
        Promise.resolve().then(() => __importStar(require('cors'))),
        Promise.resolve().then(() => __importStar(require('compression'))),
        Promise.resolve().then(() => __importStar(require('../middlewares/monitoring'))),
    ]);
    const app = createExpress();
    app.use((req, res, next) => {
        if (req.query.t)
            delete req.query.t;
        next();
    });
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    app.use(cors(config_1.default.cors));
    app.use(compression());
    app.use(monitoringMiddleware);
    return app;
}
exports.createHttpApplication = createHttpApplication;
//# sourceMappingURL=httpApplication.js.map