import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { createSocketServer } from "./services/socket";

const port = Number(process.env["PORT"]) || 8080;

const httpServer = createServer(app);
createSocketServer(httpServer);

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});

httpServer.on("error", (err) => {
  logger.error({ err }, "Server error");
  process.exit(1);
});
