import { Knex } from "knex";
import { db } from "../../../common/knex/knex";
import { User } from "../entity/user_entity";


const USER_COLUMNS = [
    'id',
    'email',
    'phone',
    'password_hash',
    'name',
    'system_role',
    'created_at',
    'updated_at',
    'deleted_at'
]

function toEntity(row: any): User {
    return new User({
        id: row.id,
        email: row.email,
        phone: row.phone,
        passwordHash: row.password_hash,
        name: row.name,
        systemRole: row.system_role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at
    });
}

export async function findUserByEmail(email: string): Promise<User | undefined> {

    const row = await db('users')
        .select(USER_COLUMNS)
        .where("email", email).whereNull("deleted_at")
        .first();

        return row? toEntity(row): undefined;
}

export async function findUserById(Id: number): Promise<User | undefined> {

    const row = await db('users')
        .select(USER_COLUMNS)
        .where("id", Id).whereNull("deleted_at")
        .first();

        return row? toEntity(row): undefined;
}

export async function findUserExistByEmailOrPhone(email: string, phone:string): Promise<Boolean> {

    //user paramitized statment to avoid aql injection
   const result = await db.raw(`
    SELECT EXISTS(SELECT 1 from users WHERE email = ? OR phone = ?) AS "exists"
    `,
    [email,phone]
    )

    return result.rows[0].exists;
}

export async function findUserExistByEmail(email: string): Promise<Boolean> {

    //user paramitized statment to avoid aql injection
   const result = await db.raw(`
    SELECT EXISTS(SELECT 1 from users WHERE email = ? ) AS "exists"
    `,
    [email]
    )

    return result.rows[0].exists;
}

export async function isUserIsACustomer(userId:number):Promise<boolean>{
    const result = await db.raw(`SELECT 1 from users where id=? AND 
        system_role ='customer'`,
    [userId]);

    return result.rows.length > 0;
}

export async function createUser(user:Partial<User> ,conn:Knex = db): Promise<User> {
    const [row] = await conn('users')
        .insert({
            email: user.email,
            phone: user.phone,
            password_hash: user.passwordHash,
            name: user.name,
            system_role: user.systemRole,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        })
        .returning(USER_COLUMNS);
    return toEntity(row);
}

export async function updateUserPassword(id:number ,password:string){
    await db("users").where('id',id)
    .update({password_hash:password});
}

export async function updateUserInfo(id:number , data:Partial<{name:string,phone:string}>):Promise<User>{
    const [row] =await db('users').where('id',id).update({
       ...data,
       updated_at: new Date()
    }).returning(USER_COLUMNS);
    return toEntity(row);
}