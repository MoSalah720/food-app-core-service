import { Knex } from "knex";
import { InsertOutBoxInput, OutBoxRow } from "./types";
import { randomUUID } from "crypto";
import { db } from "../knex/knex";

export async function insertOutBoxEvent(conn:Knex , input: InsertOutBoxInput):Promise<void> {
    await conn("events_outbox").insert({
        aggregate_type: input.aggregateType,
        aggregate_id: String(input.aggregateId),
        event_type: input.eventType,
        event_id: randomUUID(),
        payload:JSON.stringify(input.payload),
    });
}
export async function insertOutboxEventsBatch(conn: Knex, inputs: InsertOutBoxInput[]): Promise<void> {
    const records = inputs.map(input => ({
        aggregate_type: input.aggregateType,
        aggregate_id: String(input.aggregateId),
        event_type: input.eventType,
        event_id: randomUUID(),
        payload: JSON.stringify(input.payload),
    }));

    // Knex بينفذ سطر INSERT واحد فيه كل القيمة دي كـ Batch
    await conn("events_outbox").insert(records);
}

export async function claimBatch(conn:Knex, limit: number): Promise<OutBoxRow[]> {
    const rows = await conn("events_outbox").select("id", "aggregate_type", "aggregate_id", "event_type","event_id", "payload", "attempts")
    .whereNull("dispatched_at").
    orderBy("id","desc").
    limit(limit).
    forUpdate().
    skipLocked();

    return rows as OutBoxRow[];
}

export async function markDispatched(conn: Knex , id:string):Promise<void> {
    await conn("events_outbox").where({id}).update({dispatched_at: new Date()});
}

export async function markFailed(conn: Knex , id:string ,err: string):Promise<void> {
    await conn("events_outbox").where({id}).update({
        attempts: db.raw("attempts + 1"),
        last_error: err.slice(0,2000)
    });
}
