import { env } from "../config/env";
import { db } from "../knex/knex";
import { messageBroker } from "./init";
import { claimBatch, markDispatched, markFailed } from "./outbox.repo";
import { logger } from "../logger/logger";

export async function drainOutBox():Promise<void> {
    await messageBroker.connect().catch(()=>{});
    const trx = await db.transaction()
   try {
     const rows = await claimBatch(trx,env.rabbit.batchSize);
    if (rows.length === 0) {
        trx.commit();
        return;
    }
    for (const row of rows) {
        const envelope = {
            eventId:row.event_id,
            eventType: row.event_type,
            occuredAt: new Date().toISOString(),
            aggregateType: row.aggregate_type,
            aggregateId: row.aggregate_id,
            payload: row.payload
        };
        try {
            await messageBroker.publishConfirmed(env.rabbit.exchange,
                row.event_type,
                Buffer.from(JSON.stringify(envelope),"utf-8")
            );
            await markDispatched(trx,row.id)
            
        } catch (err) {
            const msg = describeError(err);
            await markFailed(trx,row.id,msg);
            logger.error("outbox publish failed",{id: row.id, error: msg});
            break;
        }
    }
    await trx.commit();
   } catch (err) {
    await trx.rollback();
    throw err;
   }
}
function describeError(err: unknown): string{
    if(err instanceof Error && err.message) return err.message;
    if (err && typeof err === "object" &&"errors" in err) {
        const inner = (err as {errors:unknown[]}).errors;
        if (Array.isArray(inner) && inner.length > 0) {
            return inner.map(describeError).filter(Boolean).join("; ");
        }
    }
    try {
        return JSON.stringify(err);
    } catch (error) {
        return String(err);
    }
}