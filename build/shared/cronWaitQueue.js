"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronWaitQueue = void 0;
// p-queue checks its signal only after dequeue. Remove expired waits while the
// execution slots are still occupied, without aborting a running child.
class CronWaitQueue {
    constructor() {
        this.entries = [];
    }
    get size() { return this.entries.length; }
    enqueue(run, options = {}) {
        const { priority = 0, waitingSignal, onRemoved } = options;
        const remove = () => {
            const index = this.entries.indexOf(entry);
            if (index < 0)
                return;
            this.entries.splice(index, 1);
            onRemoved === null || onRemoved === void 0 ? void 0 : onRemoved();
        };
        const entry = { run, priority, detach: () => waitingSignal === null || waitingSignal === void 0 ? void 0 : waitingSignal.off('expired', remove) };
        const last = this.entries[this.size - 1];
        if (!last || last.priority >= priority)
            this.entries.push(entry);
        else
            this.entries.splice(this.entries.findIndex((job) => job.priority < priority), 0, entry);
        waitingSignal === null || waitingSignal === void 0 ? void 0 : waitingSignal.once('expired', remove);
    }
    dequeue() {
        const next = this.entries.shift();
        next === null || next === void 0 ? void 0 : next.detach();
        return next === null || next === void 0 ? void 0 : next.run;
    }
    filter(options) {
        return this.entries.filter((entry) => entry.priority === options.priority).map((entry) => entry.run);
    }
}
exports.CronWaitQueue = CronWaitQueue;
//# sourceMappingURL=cronWaitQueue.js.map