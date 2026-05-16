import { Router } from "express";
import { db } from "@workspace/db";
import {
  matchesTable,
  matchPlayersTable,
  usersTable,
  problemsTable,
} from "@workspace/db/schema";
import { eq, and, or } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { nanoid } from "nanoid";
import { getIo } from "./socket-ref";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const rows = await db
    .select({
      id: matchesTable.id,
      status: matchesTable.status,
      problemTitle: problemsTable.title,
      problemDifficulty: problemsTable.difficulty,
      player2Id: matchesTable.player2Id,
      winnerId: matchesTable.winnerId,
      createdAt: matchesTable.createdAt,
    })
    .from(matchesTable)
    .leftJoin(problemsTable, eq(matchesTable.problemId, problemsTable.id))
    .where(
      or(
        eq(matchesTable.player1Id, authReq.userId),
        eq(matchesTable.player2Id, authReq.userId)
      )
    )
    .orderBy(matchesTable.createdAt);

  const formatted = rows.map((row) => ({
    id: row.id,
    status: row.status,
    problemTitle: row.problemTitle ?? "",
    problemDifficulty: row.problemDifficulty ?? "",
    opponentName: null as string | null,
    opponentElo: null as number | null,
    won: row.winnerId ? row.winnerId === authReq.userId : null,
    eloChange: null as number | null,
    duration: null as number | null,
    createdAt: row.createdAt,
  }));

  res.json(formatted);
});

router.post("/", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const { problemId } = req.body as { problemId?: number };

  let finalProblemId = problemId;
  if (!finalProblemId) {
    const [rnd] = await db
      .select({ id: problemsTable.id })
      .from(problemsTable)
      .orderBy(problemsTable.id)
      .limit(1);
    if (!rnd) {
      res.status(400).json({ error: "No problems available" });
      return;
    }
    finalProblemId = rnd.id;
  }

  const inviteCode = nanoid(8).toUpperCase();

  const [match] = await db
    .insert(matchesTable)
    .values({
      problemId: finalProblemId,
      player1Id: authReq.userId,
      status: "waiting",
      inviteCode,
    })
    .returning();

  await db.insert(matchPlayersTable).values({
    matchId: match!.id,
    userId: authReq.userId,
  });

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, finalProblemId))
    .limit(1);

  const [p1] = await db
    .select({ userId: usersTable.id, name: usersTable.name, elo: usersTable.elo })
    .from(usersTable)
    .where(eq(usersTable.id, authReq.userId))
    .limit(1);

  res.status(201).json({
    id: match!.id,
    status: match!.status,
    inviteCode: match!.inviteCode,
    problemId: match!.problemId,
    problem: {
      id: problem!.id,
      title: problem!.title,
      slug: problem!.slug,
      description: problem!.description,
      difficulty: problem!.difficulty,
      tags: problem!.tags,
      constraints: problem!.constraints,
      examples: problem!.examples,
      starterCodeCpp: problem!.starterCodeCpp,
      starterCodeJava: problem!.starterCodeJava,
    },
    players: [{ userId: p1!.userId, name: p1!.name, elo: p1!.elo, testsPassedCount: null, totalTests: null, language: null, submittedAt: null }],
    winnerId: null,
    startedAt: null,
    endedAt: null,
    createdAt: match!.createdAt,
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const matchId = Number(req.params["id"]);
  if (isNaN(matchId)) {
    res.status(400).json({ error: "Invalid match id" });
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

  const authReq = req as AuthRequest;
  if (match.player1Id !== authReq.userId && match.player2Id !== authReq.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, match.problemId))
    .limit(1);

  const playerRows = await db
    .select({
      userId: matchPlayersTable.userId,
      name: usersTable.name,
      elo: usersTable.elo,
      language: matchPlayersTable.language,
      testsPassedCount: matchPlayersTable.testsPassedCount,
      totalTests: matchPlayersTable.totalTests,
      submittedAt: matchPlayersTable.submittedAt,
    })
    .from(matchPlayersTable)
    .leftJoin(usersTable, eq(matchPlayersTable.userId, usersTable.id))
    .where(eq(matchPlayersTable.matchId, matchId));

  res.json({
    id: match.id,
    status: match.status,
    inviteCode: match.inviteCode,
    problemId: match.problemId,
    problem: problem
      ? {
          id: problem.id,
          title: problem.title,
          slug: problem.slug,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
          constraints: problem.constraints,
          examples: problem.examples,
          starterCodeCpp: problem.starterCodeCpp,
          starterCodeJava: problem.starterCodeJava,
        }
      : null,
    players: playerRows.map((p) => ({
      userId: p.userId,
      name: p.name ?? "",
      elo: p.elo ?? 1200,
      testsPassedCount: p.testsPassedCount,
      totalTests: p.totalTests,
      language: p.language,
      submittedAt: p.submittedAt,
    })),
    winnerId: match.winnerId,
    startedAt: match.startedAt,
    endedAt: match.endedAt,
    createdAt: match.createdAt,
  });
});

router.post("/join/:code", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const code = String(req.params["code"] ?? "").toUpperCase();

  const [match] = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.inviteCode, code))
    .limit(1);

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  if (match.status !== "waiting") {
    res.status(409).json({ error: "Match is no longer open" });
    return;
  }
  if (match.player1Id === authReq.userId) {
    res.status(409).json({ error: "You created this match" });
    return;
  }

  const startedAt = new Date();
  const updated = await db
    .update(matchesTable)
    .set({ player2Id: authReq.userId, status: "active", startedAt })
    .where(and(eq(matchesTable.id, match.id), eq(matchesTable.status, "waiting")))
    .returning({ id: matchesTable.id });

  if (updated.length === 0) {
    res.status(409).json({ error: "Match is no longer open" });
    return;
  }

  await db.insert(matchPlayersTable).values({
    matchId: match.id,
    userId: authReq.userId,
  });

  const io = getIo();
  io?.to(`user:${match.player1Id}`).emit("match:player_joined", {
    matchId: match.id,
    userId: authReq.userId,
  });

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, match.problemId))
    .limit(1);

  const playerRows = await db
    .select({
      userId: matchPlayersTable.userId,
      name: usersTable.name,
      elo: usersTable.elo,
      language: matchPlayersTable.language,
      testsPassedCount: matchPlayersTable.testsPassedCount,
      totalTests: matchPlayersTable.totalTests,
      submittedAt: matchPlayersTable.submittedAt,
    })
    .from(matchPlayersTable)
    .leftJoin(usersTable, eq(matchPlayersTable.userId, usersTable.id))
    .where(eq(matchPlayersTable.matchId, match.id));

  res.json({
    id: match.id,
    status: "active",
    inviteCode: match.inviteCode,
    problemId: match.problemId,
    problem: problem
      ? {
          id: problem.id,
          title: problem.title,
          slug: problem.slug,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
          constraints: problem.constraints,
          examples: problem.examples,
          starterCodeCpp: problem.starterCodeCpp,
          starterCodeJava: problem.starterCodeJava,
        }
      : null,
    players: playerRows.map((p) => ({
      userId: p.userId,
      name: p.name ?? "",
      elo: p.elo ?? 1200,
      testsPassedCount: p.testsPassedCount,
      totalTests: p.totalTests,
      language: p.language,
      submittedAt: p.submittedAt,
    })),
    winnerId: match.winnerId,
    startedAt,
    endedAt: match.endedAt,
    createdAt: match.createdAt,
  });
});

export default router;
