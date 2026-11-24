"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p_queue_cjs_1 = __importDefault(require("p-queue-cjs"));
const os_1 = __importDefault(require("os"));
class TaskLimit {
    constructor() {
        this.dependenyLimit = new p_queue_cjs_1.default({ concurrency: 1 });
        this.queuedDependencyIds = new Set([]);
        this.updateLogLimit = new p_queue_cjs_1.default({ concurrency: 1 });
        this.subscriptionLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
        this.scriptLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
        this.systemLimit = new p_queue_cjs_1.default({
            concurrency: Math.max(os_1.default.cpus().length, 4),
        });
    }
    get firstDependencyId() {
        return [...this.queuedDependencyIds.values()][0];
    }
    removeQueuedDependency(dependency) {
        if (this.queuedDependencyIds.has(dependency.id)) {
            this.queuedDependencyIds.delete(dependency.id);
        }
    }
    async runWithSubscriptionLimit(schedule, fn, options) {
        fn.schedule = schedule;
        return this.subscriptionLimit.add(fn, options);
    }
    async runWithSystemLimit(schedule, fn, options) {
        fn.schedule = schedule;
        return this.systemLimit.add(fn, options);
    }
    async runWithScriptLimit(schedule, fn, options) {
        fn.schedule = schedule;
        return this.scriptLimit.add(fn, options);
    }
    async waitDependencyQueueDone() {
        if (this.dependenyLimit.size === 0 && this.dependenyLimit.pending === 0) {
            return;
        }
        return new Promise((resolve) => {
            const onIdle = () => {
                this.dependenyLimit.removeListener('idle', onIdle);
                resolve();
            };
            this.dependenyLimit.on('idle', onIdle);
        });
    }
    runDependeny(dependency, fn, options) {
        this.queuedDependencyIds.add(dependency.id);
        fn.dependency = dependency;
        return this.dependenyLimit.add(fn, options);
    }
    updateDepLog(fn, options) {
        return this.updateLogLimit.add(fn, options);
    }
}
exports.default = new TaskLimit();
//# sourceMappingURL=pLimit.js.map