import {Router} from "express";
import { healthRoute } from "./app/health/health.route.js";

export const routes = Router();

routes.use("/health",healthRoute);

