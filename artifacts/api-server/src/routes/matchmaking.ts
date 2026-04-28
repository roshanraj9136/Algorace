import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import {
  joinQueue,
  leaveQueue,
  isInQueue,
  getQueueSize,
  tryMatchPlayers,
} from "../services/matchmaking";
import { getIo } from "./socket-ref";

const router = Router();

router.post("/join", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  await joinQueue(authReq.userId);

  const result = await tryMatchPlayers();
  if (result) {
    const io = getIo();
    for (const playerId of result.playerIds) {
      io?.to(`user:${playerId}`).emit("queue:matched", { matchId: result.matchId });
    }
    res.json({ inQueue: false, queueSize: getQueueSize(), matchId: result.matchId });
    return;
  }

  res.json({ inQueue: true, queueSize: getQueueSize(), matchId: null });
});

router.post("/leave", requireAuth, (req, res) => {
  const authReq = req as AuthRequest;
  leaveQueue(authReq.userId);
  res.json({ inQueue: false, queueSize: getQueueSize(), matchId: null });
});

router.get("/status", requireAuth, (req, res) => {
  const authReq = req as AuthRequest;
  res.json({
    inQueue: isInQueue(authReq.userId),
    queueSize: getQueueSize(),
    matchId: null,
  });
});

export default router;
