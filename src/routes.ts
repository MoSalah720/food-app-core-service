import {Router} from "express";
import { healthRoute } from "./app/health/health.route";
import { authRouter } from "./app/auth/routes";
import { userRouter } from "./app/user/routes";
import { customerRouter } from "./app/customer_address/routes";
import { restaurantRouter } from "./app/restaurant/routes";
import { branchRouter } from "./app/branch/routes";
import { productRouter } from "./app/product/routes";
import { rbacRouter } from "./app/rbac/routes";

export const routes = Router();

routes.use("/health",healthRoute);


routes.use('/auth',authRouter);
routes.use('/user',userRouter);
routes.use('/customer/customer_address',customerRouter);
routes.use('/restaurant',restaurantRouter);
routes.use('/',branchRouter);
routes.use('/',productRouter);
routes.use('/',rbacRouter)