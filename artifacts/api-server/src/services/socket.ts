import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyToken } from "../lib/jwt";
import { setIo } from "../routes/socket-ref";
import { removeUserFromQueue } from "./matchmaking";
import { startDisconnectGrace, cancelDisconnectGrace } from "./disconnect";
import { getCorsOrigin } from "../lib/env";
import { db } from "@workspace/db";
import { matchesTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";
import { logger } from "../lib/logger";

const corsOrigin = getCorsOrigin();

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    path: "/ws",
    cors: { origin: corsOrigin, credentials: true },
  });

  setIo(io);

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as { token?: string }).token ??
      (socket.handshake.query as { token?: string }).token;

    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const payload = verifyToken(token);
      socket.data = { userId: payload.userId, email: payload.email };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId: number = (socket.data as { userId: number }).userId;

    socket.join(`user:${userId}`);

    // Socket.IO does not catch errors thrown by handlers, so each one handles its own.
    socket.on("match:join", async (data: { matchId: number }) => {
      if (!data?.matchId || typeof data.matchId !== "number") return;
      try {
        const [match] = await db
          .select({ player1Id: matchesTable.player1Id, player2Id: matchesTable.player2Id })
          .from(matchesTable)
          .where(eq(matchesTable.id, data.matchId))
          .limit(1);
        if (!match || (match.player1Id !== userId && match.player2Id !== userId)) return;
        socket.join(`match:${data.matchId}`);
        cancelDisconnectGrace(userId, data.matchId);
      } catch (err) {
        logger.error({ err, userId, matchId: data.matchId }, "match:join failed");
      }
    });

    socket.on("match:leave", (data: { matchId: number }) => {
      if (typeof data?.matchId !== "number") return;
      socket.leave(`match:${data.matchId}`);
    });

    socket.on("disconnect", () => {
      removeUserFromQueue(userId);
      startDisconnectGrace(userId).catch((err) => {
        logger.error({ err, userId }, "Failed to start disconnect grace period");
      });
    });
  });

  return io;
}
