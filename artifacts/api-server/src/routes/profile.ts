import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  eloHistoryTable,
  matchesTable,
  problemsTable,
} from "@workspace/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:userId", requireAuth, async (req, res) => {
  const userId = Number(req.params["userId"]);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const totalMatches = user.wins + user.losses;
  const winRate =
    totalMatches === 0
      ? 0
      : Math.round((user.wins / totalMatches) * 100);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    elo: user.elo,
    wins: user.wins,
    losses: user.losses,
    totalMatches,
    winRate,
    createdAt: user.createdAt,
  });
});

router.get("/:userId/elo-history", requireAuth, async (req, res) => {
  const userId = Number(req.params["userId"]);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const rows = await db
    .select({
      matchId: eloHistoryTable.matchId,
      oldElo: eloHistoryTable.oldElo,
      newElo: eloHistoryTable.newElo,
      createdAt: eloHistoryTable.createdAt,
    })
    .from(eloHistoryTable)
    .where(eq(eloHistoryTable.userId, userId))
    .orderBy(eloHistoryTable.createdAt);

  res.json(rows);
});

router.get("/:userId/matches", requireAuth, async (req, res) => {
  const userId = Number(req.params["userId"]);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const rows = await db
    .select({
      id: matchesTable.id,
      status: matchesTable.status,
      problemTitle: problemsTable.title,
      problemDifficulty: problemsTable.difficulty,
      player1Id: matchesTable.player1Id,
      player2Id: matchesTable.player2Id,
      winnerId: matchesTable.winnerId,
      createdAt: matchesTable.createdAt,
    })
    .from(matchesTable)
    .leftJoin(problemsTable, eq(matchesTable.problemId, problemsTable.id))
    .where(
      or(eq(matchesTable.player1Id, userId), eq(matchesTable.player2Id, userId))
    )
    .orderBy(desc(matchesTable.createdAt))
    .limit(20);

  const formatted = rows.map((row) => ({
    id: row.id,
    status: row.status,
    problemTitle: row.problemTitle ?? "",
    problemDifficulty: row.problemDifficulty ?? "",
    opponentName: null as string | null,
    opponentElo: null as number | null,
    won: row.winnerId !== null ? row.winnerId === userId : null,
    eloChange: null as number | null,
    duration: null as number | null,
    createdAt: row.createdAt,
  }));

  res.json(formatted);
});

export default router;
