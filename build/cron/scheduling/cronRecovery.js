"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestMissedSlot = void 0;
const cronScheduler_1 = require("./cronScheduler");
// Find only the latest eligible slot even for a second-level rule after hours
// offline. Search by time, so cost is logarithmic in the configured window.
function latestMissedSlot(schedule, since, until) {
    let low = Math.floor(since / 1000);
    let high = Math.floor(until / 1000);
    let latest = null;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        const [next] = (0, cronScheduler_1.upcomingSlots)(schedule, middle * 1000);
        if (next > until)
            high = middle;
        else {
            latest = next;
            low = next / 1000;
        }
    }
    return latest;
}
exports.latestMissedSlot = latestMissedSlot;
//# sourceMappingURL=cronRecovery.js.map