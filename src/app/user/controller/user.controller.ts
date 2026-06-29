import { NextFunction, Request, Response } from "express";
import { UserService ,userService } from "../service/user.service";
import { validateBody } from "../../../common/validation/validate";
import { UpdateUserDTO } from "../userDTO/user.DTO";

export class UserController{
    constructor(private readonly userService:UserService){

    }

    getMe = async(req:Request, res:Response , next:NextFunction)=>{
        try {
            const user = await this.userService.getByUserId(req.user?.userId!)
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    updateMe =async(req:Request, res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(UpdateUserDTO ,req.body);
            const result = await this.userService.updateUser(data, req.user?.userId!);
            res.status(200).json({message:"profile updated",result});
        } catch (err) {
            next(err);
        }
    }
}

export const userController = new UserController(userService);