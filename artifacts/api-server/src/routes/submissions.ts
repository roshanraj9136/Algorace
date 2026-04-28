import { Router } from "express";
import { db } from "@workspace/db";
import {
  matchesTable,
  matchPlayersTable,
  usersTable,
  problemsTable,
  eloHistoryTable,
} from "@workspace/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { runTestCases } from "../services/piston";
import { computeElo } from "../lib/elo";
import { getIo } from "./socket-ref";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const { matchId, language, code } = req.body as {
    matchId?: number;
    language?: string;
    code?: string;
  };

  if (!matchId || !language || !code) {
    res.status(400).json({ error: "matchId, language, and code are required" });
    return;
  }

  if (!["javascript", "python"].includes(language)) {
    res.status(400).json({ error: "language must be javascript or python" });
    return;
  }

  const [match] = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1);

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const isParticipant =
    match.player1Id === authReq.userId || match.player2Id === authReq.userId;

  if (!isParticipant) {
    res.status(403).json({ error: "You are not a participant in this match" });
    return;
  }

  if (match.status !== "active") {
    res.status(409).json({ error: "Match is not active" });
    return;
  }

  const [problem] = await db
    .select({ testCases: problemsTable.testCases })
    .from(problemsTable)
    .where(eq(problemsTable.id, match.problemId))
    .limit(1);

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  const results = await runTestCases(
    language as "javascript" | "python",
    code,
    problem.testCases
  );

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  await db
    .update(matchPlayersTable)
    .set({
      language: language as "javascript" | "python",
      finalCode: code,
      testsPassedCount: passed,
      totalTests: total,
      submittedAt: new Date(),
    })
    .where(
      and(
        eq(matchPlayersTable.matchId, matchId),
        eq(matchPlayersTable.userId, authReq.userId)
      )
    );

  const io = getIo();
  io?.to(`match:${matchId}`).emit("match:progress", {
    userId: authReq.userId,
    testsPassedCount: passed,
    totalTests: total,
  });

  let won = false;
  let eloChange: number | null = null;

  if (allPassed && match.winnerId === null) {
    won = true;

    const loserId =
      match.player1Id === authReq.userId ? match.player2Id : match.player1Id;

    await db.transaction(async (tx) => {
      await tx
        .update(matchesTable)
        .set({
          winnerId: authReq.userId,
          status: "finished",
          endedAt: new Date(),
        })
        .where(
          and(eq(matchesTable.id, matchId), isNull(matchesTable.winnerId))
        );

      const [winnerUser] = await tx
        .select({ elo: usersTable.elo, wins: usersTable.wins })
        .from(usersTable)
        .where(eq(usersTable.id, authReq.userId))
        .limit(1);

      if (loserId && winnerUser) {
        const [loserUser] = await tx
          .select({ elo: usersTable.elo, losses: usersTable.losses })
          .from(usersTable)
          .where(eq(usersTable.id, loserId))
          .limit(1);

        if (loserUser) {
          const { winnerNewElo, loserNewElo } = computeElo(
            winnerUser.elo,
            loserUser.elo
          );
          eloChange = winnerNewElo - winnerUser.elo;

          await tx
            .update(usersTable)
            .set({ elo: winnerNewElo, wins: winnerUser.wins + 1 })
            .where(eq(usersTable.id, authReq.userId));

          await tx
            .update(usersTable)
            .set({ elo: loserNewElo, losses: loserUser.losses + 1 })
            .where(eq(usersTable.id, loserId));

          await tx.insert(eloHistoryTable).values([
            {
              userId: authReq.userId,
              matchId,
              oldElo: winnerUser.elo,
              newElo: winnerNewElo,
            },
            {
              userId: loserId,
              matchId,
              oldElo: loserUser.elo,
              newElo: loserNewElo,
            },
          ]);
        }
      } else if (winnerUser) {
        await tx
          .update(usersTable)
          .set({ wins: winnerUser.wins + 1 })
          .where(eq(usersTable.id, authReq.userId));
      }
    });

    io?.to(`match:${matchId}`).emit("match:finished", {
      winnerId: authReq.userId,
      eloChange,
    });
  }

  res.json({ passed, total, allPassed, won, eloChange, results });
});

export default router;
