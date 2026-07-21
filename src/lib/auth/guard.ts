import { NextFunction, Request, Response } from "express";
import { NotAuthenticated } from "./error";
import { varifyAccessToken } from "../../app/auth/utils";

export function authenticate(req:Request , res:Response ,next:NextFunction){
    const token = req.cookies.access_token;

    if (!token) {
        throw NotAuthenticated;
    }

    req.user= varifyAccessToken(token);

    next();
}