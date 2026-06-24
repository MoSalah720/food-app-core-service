import { Router } from "express";
import { authenticate } from "../../common/auth/guard";
import { userController } from "./controller/user.controller";

export const userRouter = Router();


//protection
userRouter.get('/me',authenticate,userController.getMe);
userRouter.patch('/me',authenticate,userController.updateMe);