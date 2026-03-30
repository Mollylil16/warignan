import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { json, urlencoded } from "body-parser";

import { registerRoutes } from "./routes";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(morgan("dev"));

  registerRoutes(app);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "warignan-backend" });
  });

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  });

  return app;
}

