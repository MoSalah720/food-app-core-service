import express from "express";
import { routes } from "./routes.js";

//localhost :3000/api/

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", routes);

  return app;
}
