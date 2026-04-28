import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, matchesTable, problemsTable } from "@workspace/db/schema";
import { eq, sql, count } from "drizzle-orm";

const router = Router();

router.get("/active", async (_req, res) => {
  const [usersCount] = await db.select({ count: count() }).from(usersTable);
  const [matchesCount] = await db.select({ count: count() }).from(matchesTable);
  const [problemsCount] = await db.select({ count: count() }).from(problemsTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [matchesToday] = await db
    .select({ count: count() })
    .from(matchesTable)
    .where(sql`${matchesTable.createdAt} >= ${today}`);

  res.json({
    activePlayers: usersCount?.count ?? 0,
    totalMatches: matchesCount?.count ?? 0,
    totalProblems: problemsCount?.count ?? 0,
    matchesToday: matchesToday?.count ?? 0,
  });
});

export default router;
