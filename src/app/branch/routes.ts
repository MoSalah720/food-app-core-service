import { Router } from "express";
import { branchController } from "./controller/branch.controller";
import { authenticate } from "../../common/auth/guard";

export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearby);
branchRouter.post('/restaurants/:restaurantId/branches',authenticate,branchController.create);
branchRouter.get('/restaurants/:restaurantId/branches',branchController.findByRestaurant);
branchRouter.patch('/branches/:id',authenticate,branchController.update);
branchRouter.patch('/branches/:id/status',authenticate,branchController.updateStatus);

