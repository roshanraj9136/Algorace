import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyToken } from "../lib/jwt";
import { setIo } from "../routes/socket-ref";
import { removeUserFromQueue } from "./matchmaking";
import { startDisconnectGrace, cancelDisconnectGrace } from "./disconnect";
import { getCorsOrigin } from "../lib/env";

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

    socket.on("match:join", (data: { matchId: number }) => {
      socket.join(`match:${data.matchId}`);
      cancelDisconnectGrace(userId, data.matchId);
    });

    socket.on("match:leave", (data: { matchId: number }) => {
      socket.leave(`match:${data.matchId}`);
    });

    socket.on("disconnect", () => {
      removeUserFromQueue(userId);
      void startDisconnectGrace(userId);
    });
  });

  return io;
}
