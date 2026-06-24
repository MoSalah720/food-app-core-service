import {Router} from "express";
import { healthRoute } from "./app/health/health.route";
import { authRouter } from "./app/auth/routes";
import { userRouter } from "./app/user/routes";
import { customerRouter } from "./app/addresses/routes";

export const routes = Router();

routes.use("/health",healthRoute);

//auth
routes.use('/auth',authRouter);
routes.use('/user',userRouter);
routes.use('/customer/addresses',customerRouter);