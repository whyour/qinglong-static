"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const managedExit_cjs_1 = require("../shared/managedExit.cjs");
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const data_1 = require("../data");
const triggerHistory_1 = require("../shared/triggerHistory");
async function receipt() {
    const [action, task, pid, id, status, end] = process.argv.slice(2);
    const history = new triggerHistory_1.TriggerHistory(data_1.sequelize);
    if (action === 'start') {
        await history.recoverSystemOwners(Number(task));
        const triggerId = id || `system-${task}-${(0, crypto_1.randomUUID)()}`;
        const owner = (0, triggerHistory_1.systemOwner)(Number(pid));
        const command = status ? (0, triggerHistory_1.systemOwner)(Number(status)) : owner;
        const at = Number(process.env.QL_SYSTEM_ENTERED);
        const rule = process.env.QL_SYSTEM_RULE;
        const dispatched = Number(process.env.QL_SYSTEM_DISPATCHED) * 1000;
        const dispatch = Number.isSafeInteger(dispatched) && dispatched > 0 && dispatched <= at ? dispatched : undefined;
        const wrapper = rule && Number.isSafeInteger(at) && at > 0 && at <= Date.now() ? { rule, at, dispatch } : undefined;
        const acquired = await history.startSystem(triggerId, Number(task), owner, command, wrapper);
        if (!acquired)
            process.exitCode = 75;
        else if (!id)
            process.stdout.write(triggerId);
    }
    else if (action === 'finish') {
        // The live wrapper inherited both IDs from the start it just claimed. A
        // standalone retry must match the registered system task before writing.
        const fromWrapper = process.env.QL_TRIGGER_ID === id && process.env.ID === task;
        if (!fromWrapper || !(id === null || id === void 0 ? void 0 : id.startsWith(`system-${Number(task)}-`))) {
            const [registered] = await data_1.sequelize.query(`SELECT 1 FROM CronTriggers WHERE id=$id AND cron_id=$task AND source='system' AND owner LIKE 'crond:%'
         UNION ALL SELECT 1 FROM CronLegacyExitBookings WHERE trigger_id=$id AND cron_id=$task AND source='system' LIMIT 1`, { bind: { id, task: Number(task) }, type: sequelize_1.QueryTypes.SELECT });
            if (!registered)
                return;
        }
        const code = Number(status);
        const finishedAt = end && /^\d{13}$/.test(end) && Number(end) <= Date.now() ? Number(end) : undefined;
        const bound = fromWrapper && finishedAt !== undefined;
        let journaled = false;
        if (bound) {
            try {
                (0, managedExit_cjs_1.writeExit)(id, code, null, finishedAt);
                journaled = true;
            }
            catch (error) {
                if (!(0, managedExit_cjs_1.storageFull)(error))
                    throw error;
                console.error('[crond] Receipt storage full; settling the observed exit in SQLite:', error);
            }
        }
        try {
            await history.complete(id, code === 0 ? 'finished' : 'failed', null, code, finishedAt, bound ? { version: 1, code, signal: null, time: finishedAt } : finishedAt === undefined ? undefined : 'legacy');
        }
        catch (error) {
            if (!journaled || !(0, managedExit_cjs_1.storageFull)(error))
                throw error;
            // The regular recovery pass will settle the receipt after space returns.
        }
    }
    else {
        throw new Error('Unknown crond receipt action');
    }
}
receipt().catch((error) => {
    console.error('[crond] Failed to persist execution receipt:', error);
    // At start, 75 means that another execution already owns the slot.
    process.exitCode = process.argv[2] === 'finish' && (0, managedExit_cjs_1.storageFull)(error) ? 75 : 1;
}).finally(() => data_1.sequelize.close());
//# sourceMappingURL=systemCron.js.map