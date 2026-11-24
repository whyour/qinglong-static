"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalQueueDiagnostics = exports.oldestQueued = exports.recordQueueAdmission = exports.QueueOccupants = void 0;
const sequelize_1 = require("sequelize");
const executionModels_1 = require("../../data/executionModels");
const LIVE_SAMPLE_INTERVAL_MS = 250;
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
        this.waiting.set(id, { db });
        this.refresh();
    }
    forget(id) {
        if (id)
            this.waiting.delete(id);
        if (!this.waiting.size) {
            clearTimeout(this.timer);
            this.timer = undefined;
            this.changed = false;
        }
    }
    refresh() {
        if (!this.waiting.size)
            return;
        this.changed = true;
        if (this.writing || this.timer)
            return;
        // Bound diagnostic write frequency across asynchronous admissions/handoffs.
        // Execution and its durable admission/dequeue records never wait for this timer.
        this.timer = setTimeout(() => {
            this.timer = undefined;
            void this.flush();
        }, LIVE_SAMPLE_INTERVAL_MS);
        this.timer.unref();
    }
    async flush() {
        this.writing = true;
        this.changed = false;
        try {
            const context = JSON.stringify(this.snapshot(this.limit()));
            const groups = new Map();
            for (const [id, sample] of this.waiting) {
                if (sample.context === context)
                    continue;
                let group = groups.get(sample.db);
                if (!group)
                    groups.set(sample.db, (group = new Map()));
                group.set(id, sample);
            }
            for (const [db, samples] of groups) {
                try {
                    await (0, executionModels_1.executionModel)(db, 'CronTriggers').update({ queue_live_context: context }, {
                        where: {
                            state: 'queued',
                            dequeued_at: null,
                            [sequelize_1.Op.or]: [
                                { queue_live_context: null },
                                { queue_live_context: { [sequelize_1.Op.ne]: context } },
                            ],
                            id: { [sequelize_1.Op.in]: [...samples.keys()] },
                        },
                        hooks: false,
                        validate: false,
                    });
                    for (const [id, sample] of samples) {
                        // A removed/re-admitted ID belongs to a different observation.
                        if (this.waiting.get(id) === sample)
                            sample.context = context;
                    }
                }
                catch (error) {
                    this.warn(error);
                }
            }
        }
        finally {
            this.writing = false;
            if (this.changed)
                this.refresh();
        }
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
    return (0, executionModels_1.executionModel)(db, 'CronTriggers').update({ queue_context: JSON.stringify(admission) }, {
        where: { id, queued_at: { [sequelize_1.Op.lte]: Date.now() }, queue_context: null },
        silent: true,
        hooks: false,
        validate: false,
    });
}
exports.recordQueueAdmission = recordQueueAdmission;
function oldestQueued(db) {
    return (0, executionModels_1.executionModel)(db, 'CronTriggers').findAll({
        attributes: [
            'id',
            [
                (0, sequelize_1.fn)('COALESCE', (0, sequelize_1.fn)('NULLIF', (0, sequelize_1.col)('task.name'), ''), (0, sequelize_1.col)('task.command'), (0, sequelize_1.fn)('printf', '#%s', (0, sequelize_1.col)('CronTriggers.cron_id'))),
                'name',
            ],
            'source',
            'queued_at',
            'queue_context',
            'queue_live_context',
        ],
        where: {
            state: 'queued',
            dequeued_at: null,
            queued_at: { [sequelize_1.Op.not]: null },
        },
        include: [
            {
                association: (0, executionModels_1.executionAssociation)(db, 'triggerTask'),
                attributes: [],
                required: false,
            },
        ],
        order: [
            ['queued_at', 'ASC'],
            ['id', 'ASC'],
        ],
        limit: 25,
        raw: true,
    });
}
exports.oldestQueued = oldestQueued;
// The shared budget supplies its existing occupancy snapshot, including foreign
// workers. Diagnostics never open a transaction on the admission critical path.
class GlobalQueueDiagnostics {
    constructor(db) {
        this.db = db;
        this.pending = new Map();
        this.sampled = new Map();
        this.writing = false;
    }
    observe(ids, admission) {
        const context = admission && JSON.stringify(admission);
        this.pending = new Map(ids.map((id) => { var _a; return [id, (_a = context !== null && context !== void 0 ? context : this.pending.get(id)) !== null && _a !== void 0 ? _a : '']; }));
        for (const id of this.sampled.keys())
            if (!this.pending.has(id))
                this.sampled.delete(id);
        if (!ids.length) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        else
            this.schedule();
    }
    schedule() {
        if (this.timer ||
            this.writing ||
            ![...this.pending].some(([id, value]) => value && this.sampled.get(id) !== value))
            return;
        this.timer = setTimeout(() => {
            this.timer = undefined;
            void this.flush();
        }, LIVE_SAMPLE_INTERVAL_MS);
        this.timer.unref();
    }
    async flush() {
        var _a;
        this.writing = true;
        const groups = new Map();
        for (const [id, context] of this.pending) {
            if (!context || this.sampled.get(id) === context)
                continue;
            const group = (_a = groups.get(context)) !== null && _a !== void 0 ? _a : [];
            group.push(id);
            groups.set(context, group);
        }
        try {
            for (const [context, ids] of groups) {
                await (0, executionModels_1.executionModel)(this.db, 'CronTriggers').update({
                    queue_context: (0, sequelize_1.fn)('COALESCE', (0, sequelize_1.col)('queue_context'), context),
                    queue_live_context: context,
                }, {
                    where: {
                        id: { [sequelize_1.Op.in]: ids },
                        state: 'queued',
                        dequeued_at: null,
                        [sequelize_1.Op.or]: [
                            { queue_live_context: null },
                            { queue_live_context: { [sequelize_1.Op.ne]: context } },
                        ],
                    },
                    hooks: false,
                    validate: false,
                });
                for (const id of ids)
                    if (this.pending.get(id) === context)
                        this.sampled.set(id, context);
            }
        }
        catch (error) {
            console.warn('[queue] Could not save global occupancy:', error);
            // A later observation retries a failed sample, without a timer that can
            // outlive the budget/database after the last waiter has left.
            return;
        }
        finally {
            this.writing = false;
        }
        this.schedule();
    }
}
exports.GlobalQueueDiagnostics = GlobalQueueDiagnostics;
//# sourceMappingURL=queueDiagnostics.js.map