"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerReadiness = void 0;
// Recovery is single-flight and retried only while unavailable, never at idle.
class SchedulerReadiness {
    constructor(probe, retryMs = 1000) {
        this.probe = probe;
        this.retryMs = retryMs;
        this.ready = false;
        this.generation = 0;
    }
    configure(restore) {
        this.restore = restore;
    }
    invalidate() {
        this.ready = false;
        this.generation++;
        void this.recover();
    }
    recover() {
        if (this.pending)
            return this.pending;
        if (!this.restore)
            return Promise.resolve(false);
        clearTimeout(this.retry);
        const generation = this.generation;
        this.ready = false;
        this.pending = (async () => {
            try {
                await this.probe();
                await this.restore();
                await this.probe();
                this.ready = generation === this.generation;
            }
            catch (_a) {
                this.ready = false;
            }
            return this.ready;
        })().finally(() => {
            this.pending = undefined;
            if (!this.ready) {
                this.retry = setTimeout(() => void this.recover(), this.retryMs);
                this.retry.unref();
            }
        });
        return this.pending;
    }
    async check() {
        if (!this.ready)
            return false;
        const generation = this.generation;
        try {
            await this.probe();
            return this.ready && generation === this.generation;
        }
        catch (_a) {
            this.invalidate();
            return false;
        }
    }
    async ensureReady(timeoutMs = 2000) {
        let timer;
        try {
            const available = await Promise.race([
                (async () => (await this.check()) || (await this.recover()))(),
                new Promise((resolve) => {
                    timer = setTimeout(() => resolve(false), timeoutMs);
                }),
            ]);
            if (!available) {
                throw Object.assign(new Error('Scheduler is recovering; try again later'), {
                    status: 503,
                });
            }
        }
        finally {
            clearTimeout(timer);
        }
    }
}
exports.SchedulerReadiness = SchedulerReadiness;
//# sourceMappingURL=schedulerReadiness.js.map