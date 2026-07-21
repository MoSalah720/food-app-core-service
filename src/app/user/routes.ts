import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { UserController } from "./controller/user.controller";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";

export const userRouter = Router();

const userController = container.resolve<UserController>(TOKENS.UserController);

//protection
userRouter.get('/me',authenticate,userController.getMe);
userRouter.patch('/me',authenticate,userController.updateMe);