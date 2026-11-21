"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oldestQueued = exports.recordQueueAdmission = exports.QueueOccupants = void 0;
const sequelize_1 = require("sequelize");
// Each object belongs to exactly one execution pool in its owning process.
class QueueOccupants {
    constructor(queue, limit, warn) {
        this.queue = queue;
        this.limit = limit;
        this.warn = warn;
        this.active = new Set();
        this.waiting = new Map();
        this.writing = false;
        this.changed = false;
    }
    watch(id, db) {
        this.waiting.set(id, db);
        this.refresh();
    }
    forget(id) {
        if (id)
            this.waiting.delete(id);
    }
    refresh() {
        if (!this.waiting.size)
            return;
        this.changed = true;
        if (this.writing)
            return;
        this.writing = true;
        // Coalesce synchronous PQueue handoffs and keep SQLite writes in observation order.
        void Promise.resolve().then(async () => {
            try {
                while (this.changed) {
                    this.changed = false;
                    const context = JSON.stringify(this.snapshot(this.limit()));
                    const groups = new Map();
                    for (const [id, db] of this.waiting) {
                        const ids = groups.get(db);
                        if (ids)
                            ids.push(id);
                        else
                            groups.set(db, [id]);
                    }
                    for (const [db, ids] of groups) {
                        await db
                            .query(`UPDATE CronTriggers SET queue_live_context=$context
              WHERE state='queued' AND dequeued_at IS NULL AND id IN (SELECT value FROM json_each($ids))`, { bind: { context, ids: JSON.stringify(ids) } })
                            .catch(this.warn);
                    }
                }
            }
            finally {
                this.writing = false;
            }
        });
    }
    admission(limit) {
        return this.active.size >= limit ? this.snapshot(limit) : undefined;
    }
    snapshot(limit) {
        return {
            queue: this.queue,
            limit,
            occupied: this.active.size,
            holders: [...this.active].slice(0, 8),
        };
    }
    track(job, occupant, db) {
        return async () => {
            this.forget(occupant.id);
            this.active.add(occupant);
            this.refresh();
            if (occupant.id && db) {
                void db
                    .query('UPDATE CronTriggers SET dequeued_at=$at,queue_live_context=NULL WHERE id=$id AND queued_at <= $at AND dequeued_at IS NULL', { bind: { id: occupant.id, at: Date.now() } })
                    .catch(this.warn);
            }
            try {
                return await job();
            }
            finally {
                this.active.delete(occupant);
                this.refresh();
            }
        };
    }
}
exports.QueueOccupants = QueueOccupants;
function recordQueueAdmission(db, id, admission) {
    return db.query('UPDATE CronTriggers SET queue_context=$context WHERE id=$id AND queued_at <= $at AND queue_context IS NULL', { bind: { id, at: Date.now(), context: JSON.stringify(admission) } });
}
exports.recordQueueAdmission = recordQueueAdmission;
function oldestQueued(db) {
    return db.query(`SELECT t.id, COALESCE(NULLIF(c.name,''), c.command, '#' || t.cron_id) AS name, t.source,t.queued_at,t.queue_context,t.queue_live_context
     FROM CronTriggers t LEFT JOIN Crontabs c ON c.id=t.cron_id
     WHERE t.state='queued' AND t.dequeued_at IS NULL AND t.queued_at IS NOT NULL ORDER BY t.queued_at,t.id LIMIT 25`, { type: sequelize_1.QueryTypes.SELECT });
}
exports.oldestQueued = oldestQueued;
//# sourceMappingURL=queueDiagnostics.js.map