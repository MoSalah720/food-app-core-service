import { NextFunction, Request, Response } from "express";
import { container } from "../di/container";
import { TOKENS } from "../di/tokens";
import { ICacheProvider } from "../../pkg/cache/cache.interface";

export function withCache(ttl = 3600 ,userScope= false ){
    return async(req:Request , res:Response , next: NextFunction)=>{
        try {
            const cacheProvider:ICacheProvider = container.resolve(TOKENS.CacheProvider);
            let key = `${req.method}:${req.originalUrl}`
            if (userScope) {
                key= `${key}:${req.user?.userId}`;
            }
            const cached = await cacheProvider.get(key); 
            if (cached) {
                res.setHeader("X-cache","HIT");
                return res.status(200).json(JSON.parse(cached));
            }
            const originalJson = res.json.bind(res);
            res.json =((body:any)=>{
                if (res.statusCode>=200  && res.statusCode <300) {
                    cacheProvider.set(key , JSON.stringify(body) ,ttl);
                }
                res.setHeader("X-cache", "MISS");
                return originalJson(body);
            });
            next();
        } catch (err) {
            next(err);
        }
    }
}