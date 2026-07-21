import { Knex } from "knex";
import { Role } from "../entity/role.entity";
import { db } from "../../../lib/knex/knex";

export const ROLE_COLUMNS = [
    "id",
    "name",
    "display_name",
    "description",
    "created_at",
    "updated_at",
];
function toEntity(row: any): Role {
    return new Role({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function findRoleByName(name:string , trx? :Knex.Transaction):Promise<number|null> {
    const query = trx || db;
    const row = await query('roles').select('id')
    .where('name',name).first();
    if(!row) 
        return null;

    return row.id;
}