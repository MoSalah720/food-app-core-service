import { Knex } from "knex";
import { Permission } from "../entity/permission.entity";
import { db } from "../../../lib/knex/knex";
import { permission } from "node:process";

function toEntity(row: any): Permission {
    return new Permission({
        id: row.id,
        resource: row.resource,
        action: row.action,
        createdAt: row.created_at,
    });
}

export async function getPermissionsByRoleName(roleName:string,trx?:Knex.Transaction):Promise<string[]> {
    const query = trx || db;
    const rows = await query('permissions as p')
    .select('p.id' , 'p.resource' , 'p.action' , 'p.created_at')
    .join('role_permissions as rp', 'p.id' , 'rp.permission_id')
    .join('roles as r', 'rp.role_id' , 'r.id' ).where('r.name',roleName);

    return rows.map(row=>{
        const entity = toEntity(row);
        return `${entity.resource}:${entity.action}`;
    })
}

export async function getPermissionsDetailsByRoleName(roleName:string):Promise<{permission:string}[]> {
    const rows = await db('permissions as p')
    .select('p.resource' , 'p.action')
    .join('role_permissions as rp', 'p.id' , 'rp.permission_id')
    .join('roles as r','r.id', 'rp.role_id').where('r.name', roleName);

    return rows.map(row=>({
       permission: `${row.resource}:${row.action}`
    }))
}