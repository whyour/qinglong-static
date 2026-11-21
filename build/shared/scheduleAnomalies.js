"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyPage = void 0;
const crypto_1 = require("crypto");
// Keep only the requested page and the first page. If late evidence changes
// the result between requests, return the new first page instead of mixing scans.
class AnomalyPage {
    constructor(kind, page, previous) {
        this.kind = kind;
        this.page = page;
        this.previous = previous;
        this.hash = (0, crypto_1.createHash)('sha256');
        this.total = 0;
        this.first = [];
        this.selected = [];
    }
    add(row) {
        this.hash.update(JSON.stringify(row)).update('\n');
        const page = Math.floor(this.total++ / AnomalyPage.size) + 1;
        if (page === 1)
            this.first.push(row);
        if (page === this.page)
            this.selected.push(row);
    }
    result() {
        const revision = this.hash.digest('hex');
        const changed = !!this.previous && revision !== this.previous;
        const reset = changed || (this.page > 1 && !this.selected.length);
        return { rows: reset ? this.first : this.selected, total: this.total,
            page: reset ? 1 : this.page, pageSize: AnomalyPage.size, revision, changed };
    }
}
exports.AnomalyPage = AnomalyPage;
AnomalyPage.size = 25;
//# sourceMappingURL=scheduleAnomalies.js.map