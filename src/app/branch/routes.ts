import { Router } from "express";
import { branchController } from "./controller/branch.controller";
import { authenticate } from "../../common/auth/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../common/auth/rbac";

export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearby);
branchRouter.post('/restaurants/:restaurantId/branches',authenticate,requireRestaurantMember('restaurantId')
,rbac({resource:'core:branch', action:'create'}),branchController.create);
branchRouter.get('/restaurants/:restaurantId/branches',branchController.findByRestaurant);
branchRouter.patch('/branches/:id',authenticate,requireBranchAccess('id'),
rbac({resource:'core:branch',action:'update'}),branchController.update);
branchRouter.patch('/branches/:id/status',authenticate,branchController.updateStatus);

