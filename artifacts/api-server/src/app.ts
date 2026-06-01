import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getCorsOrigin } from "./lib/env";

const app: Express = express();

app.set("trust proxy", 1);

const corsOrigin = getCorsOrigin();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    name: "AlgoRace API",
    status: "ok",
    health: "/api/healthz",
    app: "https://algorace-omega.vercel.app",
  });
});

app.use("/api", router);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, reqId: req.id }, "Unhandled API Error");
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
