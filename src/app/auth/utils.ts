import bcrypt from 'bcrypt';
import jwt , { SignOptions } from 'jsonwebtoken';
import { env } from '../../common/config/env';
import { number } from 'zod';

export async function hashPassword(password:string):Promise<string>{

    return bcrypt.hash(password,10);
}

export interface JwtPayload{
    userId :number,
    email:string,
    role:string
}

export function createAccessToken(payload:JwtPayload):string{
    const option :SignOptions = {expiresIn: Number(env.jwt.accessExpiredIn)};
    return jwt.sign(payload,env.jwt.accessSecret,option);
}

export function createRefreshToken(payload:JwtPayload):string{
    const option:SignOptions = {expiresIn:Number(env.jwt.refreshExpiredIn)};
    return jwt.sign(payload,env.jwt.refreshSecret,option);
}