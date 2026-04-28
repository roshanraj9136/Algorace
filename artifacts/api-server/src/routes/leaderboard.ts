import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      elo: usersTable.elo,
      wins: usersTable.wins,
      losses: usersTable.losses,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.elo))
    .limit(50);

  const formatted = rows.map((u, idx) => ({
    rank: idx + 1,
    userId: u.id,
    name: u.name,
    elo: u.elo,
    wins: u.wins,
    losses: u.losses,
    totalMatches: u.wins + u.losses,
    winRate:
      u.wins + u.losses === 0
        ? 0
        : Math.round((u.wins / (u.wins + u.losses)) * 100),
  }));

  res.json(formatted);
});

export default router;
