import { Request , Response , NextFunction } from "express";
import { NotAuthenticated } from "./error";
import { SystemRole } from "../../app/user/enums";
import { permissionCacheService } from "../../app/rbac/service/permisision_cache.service";

export interface RBACOptions{
    resource: string;
    action: string;
    allowSystemAdmin?: boolean; // by default true
}

// check for permissions
// system admin bypass this
// restaurant users must have permissions for their role

// router.post('/products', authenticate, rbac({resource:"product",action:"create"}), productController.create)

export function rbac(options:RBACOptions){
    return async(req: Request , res:Response, next:NextFunction)=>{
         // req.user is there , if not we will bail
       try {
         if (!req.user) {
            throw NotAuthenticated;
        }

        const {resource, action , allowSystemAdmin= true} = options;
         // if he is a system admin -> bypass

        if (allowSystemAdmin && req.user.role == SystemRole.SYSTEM_ADMIN) {
           return  next();
        }
             // if restaurant user
            // 1. fetch permissions
            // 2. check if the permissions has the action for this resource
            if (req.user.role == SystemRole.RESTAURANT_USER) {
                const permissions = await permissionCacheService.getPermissions(req.user.restaurantRole!);
                if (!permissionCacheService.hasPermissions(permissions,resource,action)) {
                   return res.status(403).json({error:"Permission denied"});
                }
                 // pass
                return next()
            }
           

             // if not restaurant ser -> throw err
            return res.status(403).
            json({error:"Permission denied"});

       } catch (error) {
         next(error)
       }
    }
}

export function requireRestaurantMember(paraName: string="restaurantId"){
     return async(req: Request , res:Response, next:NextFunction)=>{
        const restaurantId = parseInt(req.params[paraName] as string);
        if (!restaurantId) {
           return res.status(500).json({message:"something went wrong"});
        }
        if (req.user?.restaurantRole == SystemRole.SYSTEM_ADMIN) {
            return next();
        }
        if (Number(req.user?.restaurantId) !== Number(restaurantId)) {
            return res.status(403).
            json({error:"Permission denied"});
        }
         next();
     }
}

export  function requireBranchAccess(paraName: string = "branchId"){
    return async(req: Request , res:Response, next:NextFunction)=>{
        if (req.user?.role == SystemRole.SYSTEM_ADMIN) {
            return next();
        }
        if (req.user?.restaurantRole == 'owner') {
            return next();
        }
        const branchId = parseInt(req.params[paraName] as string) || parseInt(req.query[paraName] as string); 
        if (!branchId) {
          // some endpoint dont need branch check
           return next();
        }
        const userBranchIds = req.user?.branchIds;
        if (!userBranchIds?.includes(branchId)) {
            return res.status(403).json({
                message: "you don't have access to this branch"
            })
        }
         next();
    }
}