import { NextFunction, Request, Response } from "express";
import { authService, AuthService } from "../service/auth.service";
import { validateBody } from "../../../common/validation/validate";
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { setAuthCookies } from "../../../common/utils/Cookies";
import { env } from "../../../common/config/env";
import { toMS } from "../../../common/utils/time";


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
       setAuthCookies(res,result.accessToken,result.refreshToken)

        res.status(201).json(result);
        }
        catch(err){
            next(err);
        }

    }  
    
    login = async(req:Request ,res:Response, next:NextFunction)=>
    {
        try {
            const data = await validateBody(LoginDTO,req.body);
            const result = await this.authService.login(data);
            setAuthCookies(res , result.accessToken,result.refreshToken)
            res.status(200).json(result);
            
        } catch (err) {
            next(err);
        }
    }

    forgetPassword = async(req:Request ,res:Response, next:NextFunction)=>{
        try {
            const data = await validateBody(ForgetPasswordDTO,req.body);
            await this.authService.forgetPassword(data);
            res.status(201).json({
                "message":"email sent with OTP"
            })
            
        } catch (err) {
            next(err);
        }
    }
    resetPassword = async(req:Request ,res:Response, next:NextFunction)=>{
        try {
            const data = await validateBody(ResetPasswordDTO,req.body);
            await this.authService.resetPassword(data);
            res.status(201).json({
                "message":"Password resets successfully, please login again"
            })
            
        } catch (err) {
            next(err);
        }
    }
    acceptInvite = async(req:Request ,res:Response, next:NextFunction)=>{
        try {
            const data = await validateBody(ResetPasswordDTO,req.body);
            await this.authService.acceptInvite(data);
            res.status(200).json({
                "message":"Invitation accepted successfully , please login again"
            })
            
        } catch (err) {
            next(err);
        }
    }
    refresh = async(req:Request ,res:Response, next:NextFunction)=>{
        
           try {
            const result = await this.authService.refresh(req.cookies.refresh_token);
            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: env.isProduction,
                maxAge: toMS(1, 'h'),
            });
         res.status(200).json({message: "success"});
        } catch(err) {
            next(err);
        }
    
    }
}
export const authController = new AuthController(authService)
