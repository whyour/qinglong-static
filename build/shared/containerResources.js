"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.containerResources = void 0;
const os_1 = __importDefault(require("os"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function read(file) {
    try {
        return (0, fs_1.readFileSync)(file, 'utf8').trim();
    }
    catch (_a) {
        return '';
    }
}
// Walk ancestors too: a nested cgroup can inherit a tighter parent quota.
function containerResources(readValue = read, platform = process.platform) {
    const hostCpus = os_1.default.cpus().length;
    const hostMemory = os_1.default.totalmem();
    let cpus = hostCpus;
    let memTotal = hostMemory;
    let memFree = os_1.default.freemem();
    if (platform === 'linux') {
        const groups = readValue('/proc/self/cgroup').split('\n');
        for (const line of groups) {
            const match = /^\d+:([^:]*):(\/.*)$/.exec(line);
            if (!match)
                continue;
            const controllers = match[1].split(',');
            const unified = !match[1];
            for (const kind of ['cpu', 'memory', 'cpuset']) {
                if (!unified && !controllers.includes(kind))
                    continue;
                const roots = unified ? ['/sys/fs/cgroup'] : [...new Set([kind, match[1]].map(k => '/sys/fs/cgroup/' + k))];
                for (const root of roots) {
                    let dir = path_1.default.join(root, path_1.default.normalize(match[2]));
                    while (dir === root || dir.startsWith(root + '/')) {
                        const value = (file) => readValue(path_1.default.join(dir, file));
                        if (kind === 'cpu') {
                            const [quota, period] = (unified ? value('cpu.max').split(/\s+/) :
                                [value('cpu.cfs_quota_us'), value('cpu.cfs_period_us')]).map(Number);
                            if (quota > 0 && period > 0)
                                cpus = Math.min(cpus, quota / period);
                        }
                        else if (kind === 'cpuset') {
                            const set = value(unified ? 'cpuset.cpus.effective' : 'cpuset.cpus');
                            if (/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(set)) {
                                const count = set.split(',').reduce((n, range) => {
                                    const [lo, hi] = range.split('-').map(Number);
                                    return n + (hi !== null && hi !== void 0 ? hi : lo) - lo + 1;
                                }, 0);
                                if (count > 0)
                                    cpus = Math.min(cpus, count);
                            }
                        }
                        else {
                            const limit = Number(value(unified ? 'memory.max' : 'memory.limit_in_bytes'));
                            if (limit > 0 && limit <= memTotal) {
                                const usage = value(unified ? 'memory.current' : 'memory.usage_in_bytes');
                                if (usage && Number.isFinite(Number(usage))) {
                                    memTotal = limit;
                                    memFree = Math.max(0, limit - Number(usage));
                                }
                            }
                        }
                        if (dir === root)
                            break;
                        dir = path_1.default.dirname(dir);
                    }
                }
            }
        }
    }
    return { cpus, memTotal, memFree, hostCpus, hostMemory,
        memUsagePercent: ((1 - memFree / memTotal) * 100).toFixed(1) };
}
exports.containerResources = containerResources;
//# sourceMappingURL=containerResources.js.map