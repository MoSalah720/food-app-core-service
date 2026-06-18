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

export async function findUserByEmailOrPhone(email: string, phone:string): Promise<Boolean> {

    //user paramitized statment to avoid aql injection
   const result = await db.raw(`
    SELECT EXISTS(SELECT 1 from users WHERE email = ? OR phone = ?) AS "exists"
    `,
    [email,phone]
    )

    return result.rows[0].exists;
}

export async function createUser(user:Partial<User>): Promise<User> {
    const [row] = await db('users')
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