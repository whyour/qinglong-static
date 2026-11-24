"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../config/index"));
const path_1 = require("path");
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: (0, path_1.join)(index_1.default.dbPath, 'database.sqlite'),
    logging: false,
    retry: {
        // Keep a bounded 15-second wait in JS. Constant delays let a burst of
        // writers make progress without exponential retries stretching the queue.
        max: 301,
        backoffBase: 50,
        backoffExponent: 1,
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
// In DELETE journal mode, EXTRA flushes the unlink that makes a transaction
// final. Sequelize opens a separate SQLite handle for each transaction.
const initialized = new WeakMap();
exports.sequelize.addHook('beforeQuery', async (_options, query) => {
    const connection = query.connection;
    let ready = initialized.get(connection);
    if (!ready) {
        ready = new Promise((resolve, reject) => {
            // Native busy waits occupy libuv workers. Concurrent BEGINs can exhaust
            // that pool and prevent the lock holder's next query or COMMIT from
            // running. Let Sequelize's asynchronous SQLITE_BUSY retries wait instead.
            connection.configure('busyTimeout', 0);
            connection.run('PRAGMA synchronous=EXTRA', (error) => error ? reject(error) : resolve());
        }).catch((error) => {
            initialized.delete(connection);
            throw error;
        });
        initialized.set(connection, ready);
    }
    await ready;
});
// SQLite transactions use dedicated file handles outside Sequelize 6's pool.
// Its default destroyConnection targets the pool on COMMIT/ROLLBACK errors,
// leaving the native writer open. The SQLite release path closes that handle.
exports.sequelize.connectionManager.destroyConnection = async (connection) => {
    exports.sequelize.connectionManager.releaseConnection(connection);
};
//# sourceMappingURL=index.js.map