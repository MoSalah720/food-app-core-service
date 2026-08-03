import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { BranchController } from "./controller/branch.controller";
import { withCache } from "../../lib/cache/withCache";
import { requireInternalApiKey } from "../../lib/auth/api-key";

export const branchRouter = Router();

const branchController = container.resolve<BranchController>(TOKENS.BranchController);

branchRouter.get('/branches/nearby',withCache(), branchController.findNearby);

branchRouter.post('/restaurants/:restaurantId/branches',authenticate,requireRestaurantMember('restaurantId')
,rbac({resource:'core:branch', action:'create'}),branchController.create);

branchRouter.get('/restaurants/:restaurantId/branches',branchController.findByRestaurant);

branchRouter.patch('/branches/:id',authenticate,requireBranchAccess('id'),
rbac({resource:'core:branch',action:'update'}),branchController.update);

branchRouter.patch('/branches/:id/status',authenticate,branchController.updateStatus);

// Internal (service-to-service)
branchRouter.get('/internal/branches/:id', requireInternalApiKey, branchController.findByIdWithRestaurant);
