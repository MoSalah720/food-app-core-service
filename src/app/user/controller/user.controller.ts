import { NextFunction, Request, Response } from "express";
import { UserService } from "../service/user.service";
import { validateBody } from "../../../lib/validation/validate";
import { UpdateUserDTO } from "../userDTO/user.DTO";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";

@injectable()
export class UserController{
    constructor(@inject(TOKENS.UserService) private readonly userService:UserService){

    }

    getMe = async(req:Request, res:Response , next:NextFunction)=>{
        try {
            const user = await this.userService.getByUserId(req.user?.userId!)
            sendSuccess(res,user);
        } catch (err) {
            next(err);
        }
    }

    updateMe =async(req:Request, res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(UpdateUserDTO ,req.body);
            const result = await this.userService.updateUser(data, req.user?.userId!);
             sendSuccess(res,{message:"profile updated",result});
        } catch (err) {
            next(err);
        }
    }
}