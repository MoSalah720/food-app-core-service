import { JwtPayload } from "jsonwebtoken";
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

    updateUser = async(data:UpdateUserDTO,currentUser:JwtPayload)=>{
        const user = await findUserById(currentUser.userId);
         if (!user) {
            throw UserNotFound;
        }
        
        const updatedUser=  await updateUserInfo({id: user.id,
        name: data.name,
        phone: data.phone,});

        return{
            "message":"User updated successfully",
            "user":{

                "id":updatedUser.id,
                "email":updatedUser.email,
                "phone":updatedUser.phone,
                "name":updatedUser.name,
                "systemRole":updatedUser.systemRole
            }
        }

    }
}

export const userService =new UserService();