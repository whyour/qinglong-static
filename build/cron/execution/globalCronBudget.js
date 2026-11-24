"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalCronBudget = exports.globalCronBudget = exports.budgetOwnerAlive = void 0;
const crypto_1 = require("crypto");
const os_1 = __importDefault(require("os"));
const sequelize_1 = require("sequelize");
const cronProcess_1 = require("./cronProcess");
const queueDiagnostics_1 = require("../queries/queueDiagnostics");
const leaseQuery = `SELECT l.*,s.targets,COALESCE(NULLIF(c.name,''),c.command,l.trigger_id) AS name,
 COALESCE(t.started_at,t.queued_at,t.observed_at) AS at FROM CronConcurrencyLeases l
 LEFT JOIN CronTriggers t ON t.id=l.trigger_id LEFT JOIN CronStopRequests s ON s.instance_id=t.instance_id
 LEFT JOIN Crontabs c ON c.id=t.cron_id`;
function liveLease(lease) {
    return (budgetOwnerAlive(lease.command_identity || lease.owner) ||
        Boolean(lease.targets &&
            JSON.parse(lease.targets).some(budgetOwnerAlive)));
}
// Birth identities include the boot ID and start ticks; a reused PID is not a
// surviving execution. Permission/I/O failures fail closed, never free a slot.
function budgetOwnerAlive(identity) {
    try {
        return (0, cronProcess_1.systemOwner)(Number(identity.split(':')[1])) === identity;
    }
    catch (error) {
        if (['ENOENT', 'ESRCH'].includes(error.code))
            return false;
        throw error;
    }
}
exports.budgetOwnerAlive = budgetOwnerAlive;
const budgets = new WeakMap();
function globalCronBudget(db) {
    let budget = budgets.get(db);
    if (!budget)
        budgets.set(db, (budget = new GlobalCronBudget(db)));
    return budget;
}
exports.globalCronBudget = globalCronBudget;
// Admission polling and handoff use bound SQL: model query construction here
// repeats for each ready task and extends the single-writer critical section.
// Ordinary management queries remain ORM; see docs/SQL_ORM_AUDIT.txt.
// Only admissions use a write transaction. A saturated queue shares one read
// poll per worker, independent of its backlog size; idle workers do no polling.
class GlobalCronBudget {
    constructor(db) {
        this.db = db;
        this.waiting = new Set();
        this.pumping = false;
        this.scheduled = false;
        this.wakePending = false;
        this.heldTokens = new Set();
        this.diagnostics = new queueDiagnostics_1.GlobalQueueDiagnostics(this.db);
    }
    async acquire(id, options = {}) {
        var _a, _b;
        let expired = false;
        const expire = () => {
            expired = true;
            this.wake();
        };
        (_a = options.signal) === null || _a === void 0 ? void 0 : _a.once('expired', expire);
        const token = (0, crypto_1.randomUUID)();
        let acquired = false;
        try {
            acquired = await new Promise((resolve, reject) => {
                var _a;
                this.waiting.add({
                    id,
                    token,
                    owner: (_a = options.owner) !== null && _a !== void 0 ? _a : (0, cronProcess_1.systemOwner)(process.pid),
                    commandIdentity: options.commandIdentity,
                    current: () => { var _a, _b; return !expired && ((_b = (_a = options.current) === null || _a === void 0 ? void 0 : _a.call(options)) !== null && _b !== void 0 ? _b : true); },
                    resolve,
                    reject,
                });
                this.wake();
            });
            if (acquired)
                this.heldTokens.add(token);
            return acquired ? token : undefined;
        }
        finally {
            (_b = options.signal) === null || _b === void 0 ? void 0 : _b.off('expired', expire);
            // Successful admission removes the wait in the same transaction as its
            // lease. A later cleanup error must never hide an acquired permit.
            if (!acquired)
                await this.db.query('DELETE FROM CronConcurrencyWaiters WHERE trigger_id=$id AND token=$token', { bind: { id, token } });
        }
    }
    async run(id, fn, current, signal) {
        const token = await this.acquire(id, { current, signal });
        if (!token)
            return;
        try {
            return await fn();
        }
        finally {
            await this.release(id, token);
        }
    }
    async release(id, token) {
        // Once the callback returns, a still-live command needs normal recovery
        // polling: there is no longer a local completion that can wake us.
        this.heldTokens.delete(token);
        const [lease] = await this.db.query(leaseQuery + ' WHERE l.trigger_id=$id AND l.token=$token', { bind: { id, token }, type: sequelize_1.QueryTypes.SELECT });
        // A failed callback or a stop request is not proof that its child exited.
        if (lease && (!lease.command_identity || !liveLease(lease))) {
            await this.db.query('DELETE FROM CronConcurrencyLeases WHERE trigger_id=$id AND token=$token', { bind: { id, token } });
        }
        this.wake();
    }
    wake() {
        if (!this.waiting.size)
            return;
        if (this.pumping) {
            this.wakePending = true;
            return;
        }
        clearTimeout(this.timer);
        this.timer = undefined;
        if (this.scheduled)
            return;
        // A batch submission calls acquire synchronously for each accepted task.
        // Publish the whole batch before choosing its first permit, so the first
        // long task cannot bypass the same batch's shorter ready tasks.
        this.scheduled = true;
        queueMicrotask(() => {
            this.scheduled = false;
            if (this.waiting.size)
                void this.pump();
        });
    }
    async snapshot(transaction) {
        // An upgrade can restart workers while supervisors from the previous
        // version are still alive. Their existing birth identities also consume
        // capacity, even though that version did not create budget reservations.
        const leases = await this.db.query(leaseQuery +
            `
      UNION ALL SELECT t.id,'inherited',COALESCE(t.command_identity,t.process_identity),
        COALESCE(t.command_identity,t.process_identity),s.targets,
        COALESCE(NULLIF(c.name,''),c.command,t.id),COALESCE(t.started_at,t.queued_at,t.observed_at)
      FROM CronTriggers t LEFT JOIN CronStopRequests s ON s.instance_id=t.instance_id
      LEFT JOIN Crontabs c ON c.id=t.cron_id
      WHERE t.state='running' AND COALESCE(t.command_identity,t.process_identity) IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM CronConcurrencyLeases l WHERE l.trigger_id=t.id)`, {
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        const [config] = await this.db.query("SELECT info FROM Auths WHERE type='systemConfig' LIMIT 1", { type: sequelize_1.QueryTypes.SELECT, transaction });
        const configured = (config === null || config === void 0 ? void 0 : config.info) && JSON.parse(config.info).cronConcurrency;
        const limit = Number.isSafeInteger(configured) && configured > 0
            ? configured
            : Math.max(os_1.default.cpus().length, 4);
        const stale = leases.filter((lease) => !liveLease(lease));
        return {
            leases,
            stale,
            limit,
            free: Math.max(0, limit - leases.length + stale.length),
        };
    }
    async pump() {
        this.pumping = true;
        this.wakePending = false;
        const batch = [...this.waiting];
        const results = new Map();
        let pollInterval = 100;
        try {
            // Publish all ready requests, including those behind long local jobs.
            // Tokens prevent a duplicate submitter from deleting the original wait.
            const fresh = batch.filter((waiter) => !waiter.registered);
            if (fresh.length) {
                await this.db.transaction({ type: sequelize_1.Transaction.TYPES.IMMEDIATE }, async (transaction) => {
                    const owners = await this.db.query('SELECT * FROM CronConcurrencyWaiters WHERE trigger_id IN (:ids)', {
                        replacements: { ids: fresh.map((w) => w.id) },
                        transaction,
                        type: sequelize_1.QueryTypes.SELECT,
                    });
                    for (const owner of owners)
                        if (!budgetOwnerAlive(owner.owner)) {
                            await this.db.query('DELETE FROM CronConcurrencyWaiters WHERE trigger_id=$id AND token=$token', {
                                bind: { id: owner.trigger_id, token: owner.token },
                                transaction,
                            });
                        }
                    // Keep a burst in the same transaction, but avoid one SQLite
                    // round trip per waiter. Three binds per row stay below even
                    // SQLite's older 999-variable limit; values never enter SQL text.
                    for (let offset = 0; offset < fresh.length; offset += 200) {
                        const chunk = fresh.slice(offset, offset + 200);
                        const bind = [];
                        const values = chunk.map((waiter) => {
                            const start = bind.length;
                            bind.push(waiter.id, waiter.token, waiter.owner);
                            return `($${start + 1},$${start + 2},$${start + 3})`;
                        });
                        await this.db.query(`WITH incoming(trigger_id,token,owner) AS (VALUES ${values.join(',')})
              INSERT INTO CronConcurrencyWaiters(trigger_id,token,owner)
              SELECT i.trigger_id,i.token,i.owner FROM incoming i
              JOIN CronTriggers t ON t.id=i.trigger_id WHERE t.state='queued'
              ON CONFLICT(trigger_id) DO NOTHING`, {
                            bind,
                            transaction,
                        });
                    }
                });
                for (const waiter of fresh)
                    waiter.registered = true;
            }
            const queued = await this.db.query("SELECT t.id,w.token FROM CronTriggers t JOIN CronConcurrencyWaiters w ON w.trigger_id=t.id WHERE t.id IN (:ids) AND t.state='queued' AND COALESCE(t.stop_requested,0)=0", {
                replacements: { ids: batch.map((w) => w.id) },
                type: sequelize_1.QueryTypes.SELECT,
            });
            const ids = new Set(queued.map((row) => row.token));
            for (const waiter of batch)
                if (!waiter.current() || !ids.has(waiter.token))
                    results.set(waiter, false);
            const view = await this.snapshot();
            // Local callbacks wake the budget immediately on completion. While all
            // slots are held by this exact budget instance, avoid scanning SQLite
            // ten times per second for changes those callbacks will report anyway.
            // Foreign/inherited permits and released-but-live descendants retain
            // the short recovery poll; runtime limit changes remain bounded at 500 ms.
            if (!view.free &&
                !view.stale.length &&
                view.leases.length &&
                view.leases.every((lease) => this.heldTokens.has(lease.token)))
                pollInterval = 500;
            for (const waiter of batch) {
                if (view.leases.some((lease) => lease.trigger_id === waiter.id && !view.stale.includes(lease)))
                    results.set(waiter, false);
            }
            if (view.free || view.stale.length) {
                await this.db.transaction({ type: sequelize_1.Transaction.TYPES.IMMEDIATE }, async (transaction) => {
                    var _a;
                    const { leases, stale, free } = await this.snapshot(transaction);
                    for (const lease of stale)
                        await this.db.query('DELETE FROM CronConcurrencyLeases WHERE trigger_id=$id AND token=$token', {
                            bind: { id: lease.trigger_id, token: lease.token },
                            transaction,
                        });
                    // Only live, ready owners take part in ordering. A dead worker's
                    // request must not block recovery or unrelated tasks.
                    const ready = await this.db.query(`
              SELECT w.* FROM CronConcurrencyWaiters w JOIN CronTriggers t ON t.id=w.trigger_id
              LEFT JOIN Crontabs c ON c.id=t.cron_id
              WHERE t.state='queued' AND COALESCE(t.stop_requested,0)=0
                AND NOT EXISTS(SELECT 1 FROM CronConcurrencyLeases l WHERE l.trigger_id=w.trigger_id)
              ORDER BY CASE WHEN t.queued_at <= $aged THEN 0 ELSE 1 END,
                CASE WHEN t.queued_at <= $aged THEN t.queued_at
                  ELSE CASE WHEN c.last_execution_time > 0 AND c.last_running_time IS NOT NULL
                    THEN MAX(0,c.last_running_time)*1000 ELSE 10000 END END,
                t.queued_at,t.observed_at,t.id`, {
                        bind: { aged: Date.now() - 30000 },
                        transaction,
                        type: sequelize_1.QueryTypes.SELECT,
                    });
                    const selected = new Set();
                    for (const request of ready) {
                        if (!budgetOwnerAlive(request.owner)) {
                            await this.db.query('DELETE FROM CronConcurrencyWaiters WHERE trigger_id=$id AND token=$token', {
                                bind: { id: request.trigger_id, token: request.token },
                                transaction,
                            });
                        }
                        else if (selected.size < free)
                            selected.add(request.token);
                    }
                    // Resolve local permits in the same order as the shared ranking.
                    // Set membership alone would start a long task first again when
                    // both it and a short task fit into the remaining free slots.
                    const priority = new Map([...selected].map((token, index) => [token, index]));
                    batch.sort((a, b) => {
                        var _a, _b;
                        return ((_a = priority.get(a.token)) !== null && _a !== void 0 ? _a : selected.size) -
                            ((_b = priority.get(b.token)) !== null && _b !== void 0 ? _b : selected.size);
                    });
                    let available = free;
                    for (const waiter of batch) {
                        if (results.has(waiter))
                            continue;
                        if (!waiter.current() ||
                            leases.some((lease) => lease.trigger_id === waiter.id && !stale.includes(lease))) {
                            results.set(waiter, false);
                            continue;
                        }
                        if (!available)
                            break;
                        if (!selected.has(waiter.token))
                            continue;
                        const inserted = await this.db.query(`INSERT INTO CronConcurrencyLeases(trigger_id,token,owner,command_identity)
               SELECT $id,$token,$owner,$command FROM CronTriggers WHERE id=$id AND state='queued' AND COALESCE(stop_requested,0)=0
               ON CONFLICT(trigger_id) DO NOTHING`, {
                            bind: {
                                id: waiter.id,
                                token: waiter.token,
                                owner: waiter.owner,
                                command: (_a = waiter.commandIdentity) !== null && _a !== void 0 ? _a : null,
                            },
                            transaction,
                            type: sequelize_1.QueryTypes.BULKUPDATE,
                        });
                        results.set(waiter, inserted === 1);
                        if (inserted) {
                            await this.db.query('DELETE FROM CronConcurrencyWaiters WHERE trigger_id=$id AND token=$token', {
                                bind: { id: waiter.id, token: waiter.token },
                                transaction,
                            });
                            available--;
                        }
                    }
                });
            }
            const occupied = view.leases.filter((lease) => !view.stale.includes(lease));
            this.diagnostics.observe(batch
                .filter((waiter) => !results.has(waiter))
                .map((waiter) => waiter.id), !view.free && occupied.length
                ? {
                    queue: 'global',
                    limit: view.limit,
                    occupied: occupied.length,
                    holders: occupied
                        .sort((a, b) => {
                        var _a, _b;
                        return ((_a = a.at) !== null && _a !== void 0 ? _a : 0) - ((_b = b.at) !== null && _b !== void 0 ? _b : 0) ||
                            a.trigger_id.localeCompare(b.trigger_id);
                    })
                        .slice(0, 8)
                        .map((lease) => ({
                        id: lease.trigger_id,
                        name: lease.name || lease.trigger_id,
                    })),
                }
                : undefined);
            for (const [waiter, acquired] of results) {
                this.waiting.delete(waiter);
                waiter.resolve(acquired);
            }
        }
        catch (error) {
            this.diagnostics.observe([]);
            for (const waiter of batch) {
                this.waiting.delete(waiter);
                waiter.reject(error);
            }
        }
        finally {
            this.pumping = false;
            if (this.waiting.size) {
                // An arrival, expiration or release while a query was pending must not
                // lose its wakeup and wait for the saturated-queue polling interval.
                if (this.wakePending)
                    this.wake();
                else
                    this.timer = setTimeout(() => {
                        this.timer = undefined;
                        this.wake();
                    }, pollInterval);
            }
        }
    }
}
exports.GlobalCronBudget = GlobalCronBudget;
//# sourceMappingURL=globalCronBudget.js.map