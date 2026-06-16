import knex from "knex";
import { Knex } from "knex";
import {env} from "../config/env.js";

const config:Knex.Config ={
    client: "pg",
    connection: {
        host: env.db.host,
        port: env.db.port,
        user: env.db.username,
        password: env.db.password,
        database: env.db.name,
    },
    pool: {
        max: env.db.poolMax
    },

    migrations: {
        directory: "./src/migrations",
        extension: "ts",
    },
}

export const db = knex(config);

export async function pingDB(): Promise<void> {
    await db.raw("SELECT 1");
}