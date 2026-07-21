import { Knex } from "knex";
import { SystemRole } from "../enums";
import { UserNotFound } from "../error";
import { createUser as createUserRepo, findUserById, findUserExistByEmailOrPhone, updateUserInfo } from "../repository/users.repo";
import { UpdateUserDTO } from "../userDTO/user.DTO";
import { User } from "../entity/user_entity";
import { UserAlreadyExistError } from "../../auth/error";
import { hashPassword } from "../../auth/utils";
import { injectable } from "tsyringe";


export interface CreateUserData{
    email: string;
    phone: string;
    name: string;
    password: string;
    systemRole: SystemRole;
}

@injectable()
export class UserService{

    create = async(data:CreateUserData, trx?: Knex | Knex.Transaction):Promise<User>=>{
        const existing = await findUserExistByEmailOrPhone(data.email,data.phone);
        if (existing) {
            throw UserAlreadyExistError;
        }
        const hashedPassword = data.password? await hashPassword(data.password):'';
        const now = new Date();
        return await createUserRepo({
            email: data.email,
            phone: data.phone,
            name: data.name,
            passwordHash: hashedPassword,
            systemRole: data.systemRole,
            createdAt: now,
            updatedAt: now,
        }, trx
        )
    }
    getByUserId = async(userId:number)=>{
        const user = await findUserById(userId);

        if (!user) {
            throw UserNotFound;
        }

        return{
            id: user.id,
            email :user.email,
            name: user.name,
            phone: user.phone,
            systemRole: user.systemRole
        }
    }

    updateUser = async(data:UpdateUserDTO, userId:number)=>{
        const user = await findUserById(userId);
        console.log(user);
         if (!user) {
            throw UserNotFound;
        }
        
        const updated=  await updateUserInfo(userId , data);

        return{
                id:updated.id,
                email:updated.email,
                phone:updated.phone,
                name:updated.name,
                systemRole:updated.systemRole
        }

    }
}