import { Response } from "express";
import { env } from "../config/env";
import { toMS } from "./time";
export function setAuthCookies(res:Response , accessToken:string , refreshToken:string){
    res.cookie("access_token",accessToken,{
        httpOnly: true,
        secure: env.isProduction,
        maxAge:toMS(1,'h')
    })

     res.cookie("refresh_token",refreshToken,{
        httpOnly: true,
        secure: env.isProduction,
        maxAge:toMS(7,'d'),
        path: '/api/auth/refresh'
    })
}