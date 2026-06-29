import { UserNotFound } from "../error";
import { findUserById, updateUserInfo } from "../repository/users.repo";
import { UpdateUserDTO } from "../userDTO/user.DTO";

export class UserService{
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

export const userService =new UserService();