"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardSnapshot = void 0;
const perf_hooks_1 = require("perf_hooks");
// Per database and day: concurrent viewers share one computation. Rejections
// are never cached; a new day cannot reuse yesterday's summary. Runtime/task
// control endpoints remain live and never read this display-only snapshot.
const snapshots = new WeakMap();
function dashboardSnapshot(db, key, compute) {
    const existing = snapshots.get(db);
    if ((existing === null || existing === void 0 ? void 0 : existing.key) === key && perf_hooks_1.performance.now() < existing.until)
        return existing.value;
    const entry = {
        key,
        until: Infinity,
        value: Promise.resolve().then(compute),
    };
    snapshots.set(db, entry);
    entry.value.then(() => {
        // Wall-clock corrections must not stretch a one-second cache for minutes.
        entry.until = perf_hooks_1.performance.now() + 1000;
    }, () => {
        if (snapshots.get(db) === entry)
            snapshots.delete(db);
    });
    return entry.value;
}
exports.dashboardSnapshot = dashboardSnapshot;
//# sourceMappingURL=dashboardSnapshot.js.map