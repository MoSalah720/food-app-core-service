import { NextFunction ,Request , Response } from "express";
import { authService, AuthService } from "../service/auth.service";
import { validateBody } from "../../../common/validation/validate";
import { RegisterDTO } from "../dto/auth.dto";


export class AuthController{
    constructor(private readonly authService:AuthService){

    }

    register = async(req:Request, res:Response , next:NextFunction)=>
    {
        try{
        //1. Validate request body
        const data = await validateBody(RegisterDTO ,req.body);
        //2. Call service
        const result = await this.authService.register(data);
        //3. Response
        res.status(201).json(result);
        }
        catch(err){
            next(err);
        }

    }   
}

export const authController = new AuthController(authService)