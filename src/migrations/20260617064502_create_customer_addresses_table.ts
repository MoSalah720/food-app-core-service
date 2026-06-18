import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(` CREATE TABLE customer_addresses(
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        label TEXT NOT NULL,
        country TEXT NOT NULL,
        city TEXT NOT NULL,
        street TEXT NOT NULL,
        building TEXT,
        apartment_number TEXT,
        type TEXT NOT NULL CHECK(type IN ('office', 'home', 'public_place', 'other')),
        lat DECIMAL(10, 7) NOT NULL,
        lng DECIMAL(10, 7) NOT NULL,
        is_default BOOLEAN NOT NULL,
    

        constraint fk_customer_addresses_user_id FOREIGN KEY (user_id) REFERENCES users(id) on DELETE CASCADE
    );
    CREATE INDEX idx_customer_addresses_user_id on customer_addresses(user_id);`)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE customer_addresses;`)
}

