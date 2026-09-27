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
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../shared/errors");
// Also terminate if the primary disappears without forwarding a signal.
const onParentDisconnect = () => process.exit(1);
process.once('disconnect', onParentDisconnect);
async function initializeDatabase() {
    const { sequelize } = await Promise.resolve().then(() => __importStar(require('../data')));
    try {
        const { default: loadDatabase } = await Promise.resolve().then(() => __importStar(require('../loaders/db')));
        await loadDatabase();
    }
    finally {
        await sequelize.close();
    }
}
initializeDatabase()
    .catch((error) => {
    console.error(`[boot] Database initialization failed:\n${(0, errors_1.errStack)(error)}`);
    process.exitCode = 1;
})
    .finally(() => {
    process.removeListener('disconnect', onParentDisconnect);
    // Let pending log writes drain and exit naturally after closing SQLite.
    if (process.connected)
        process.disconnect();
});
//# sourceMappingURL=database.js.map