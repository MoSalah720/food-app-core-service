import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../lib/config/env';
import crypto from "crypto";


export async function hashPassword(password:string):Promise<string>{

    return bcrypt.hash(password,10);
}

export  function comparePassword(passwordInput:string,passwordHashed:string):Promise<boolean>{
    return bcrypt.compare(passwordInput,passwordHashed);
}

export interface JwtPayload{
    userId :number;
    email:string;
    role:string;
    //for restaurant users only
    restaurantId?: number;
    restaurantRole?: string;
    branchIds?: number[];
}

export function createAccessToken(payload:JwtPayload):string{
    const option :SignOptions = {expiresIn: Number(env.jwt.accessExpiredIn)};
    return jwt.sign(payload,env.jwt.accessSecret,option);
}

export function createRefreshToken(payload:JwtPayload):string{
    const option:SignOptions = {expiresIn:Number(env.jwt.refreshExpiredIn)};
    return jwt.sign(payload,env.jwt.refreshSecret,option);
}

export function varifyAccessToken(token:string):JwtPayload{
    return jwt.verify(token,env.jwt.accessSecret) as JwtPayload;
}

export function varifyRefreshToken(token:string):JwtPayload{
    return jwt.verify(token,env.jwt.refreshSecret) as JwtPayload;
}

export function generateOTP():string{
    return crypto.randomInt(100000,999999).toString();
}

export function hashOTP(otp:string):string{
    return crypto.createHash("sha256").update(otp).digest("hex")
}