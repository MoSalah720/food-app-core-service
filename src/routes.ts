import {Router} from "express";
import { healthRoute } from "./app/health/health.route";
import { authRouter } from "./app/auth/routes";

export const routes = Router();

routes.use("/health",healthRoute);

//auth
routes.use('/auth',authRouter);