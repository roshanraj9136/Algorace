import { Router } from "express";
import { db } from "@workspace/db";
import {
  friendshipsTable,
  usersTable,
  matchesTable,
  matchPlayersTable,
  problemsTable,
} from "@workspace/db/schema";
import { and, eq, ne, or, ilike, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { nanoid } from "nanoid";
import { getIo } from "./socket-ref";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const rows = await db
    .select({
      friendshipId: friendshipsTable.id,
      requesterId: friendshipsTable.requesterId,
      addresseeId: friendshipsTable.addresseeId,
      respondedAt: friendshipsTable.respondedAt,
      createdAt: friendshipsTable.createdAt,
      otherId: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      elo: usersTable.elo,
      wins: usersTable.wins,
      losses: usersTable.losses,
    })
    .from(friendshipsTable)
    .innerJoin(
      usersTable,
      or(
        and(
          eq(friendshipsTable.requesterId, authReq.userId),
          eq(usersTable.id, friendshipsTable.addresseeId)
        ),
        and(
          eq(friendshipsTable.addresseeId, authReq.userId),
          eq(usersTable.id, friendshipsTable.requesterId)
        )
      )
    )
    .where(
      and(
        eq(friendshipsTable.status, "accepted"),
        or(
          eq(friendshipsTable.requesterId, authReq.userId),
          eq(friendshipsTable.addresseeId, authReq.userId)
        )
      )
    )
    .orderBy(usersTable.name);

  res.json(
    rows.map((r) => ({
      userId: r.otherId,
      name: r.name,
      email: r.email,
      elo: r.elo,
      wins: r.wins,
      losses: r.losses,
      friendshipId: r.friendshipId,
      since: (r.respondedAt ?? r.createdAt).toISOString(),
    }))
  );
});

router.get("/requests", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const rows = await db
    .select({
      id: friendshipsTable.id,
      requesterId: usersTable.id,
      requesterName: usersTable.name,
      requesterEmail: usersTable.email,
      requesterElo: usersTable.elo,
      createdAt: friendshipsTable.createdAt,
    })
    .from(friendshipsTable)
    .innerJoin(usersTable, eq(usersTable.id, friendshipsTable.requesterId))
    .where(
      and(
        eq(friendshipsTable.addresseeId, authReq.userId),
        eq(friendshipsTable.status, "pending")
      )
    )
    .orderBy(friendshipsTable.createdAt);

  res.json(
    rows.map((r) => ({
      id: r.id,
      requesterId: r.requesterId,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      requesterElo: r.requesterElo,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/requests", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const { userId } = req.body as { userId?: number };

  if (typeof userId !== "number" || !Number.isInteger(userId)) {
    res.status(400).json({ error: "userId is required" });
    return;
  }
  if (userId === authReq.userId) {
    res.status(400).json({ error: "Cannot send a friend request to yourself" });
    return;
  }

  const [target] = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, elo: usersTable.elo })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(friendshipsTable)
    .where(
      or(
        and(
          eq(friendshipsTable.requesterId, authReq.userId),
          eq(friendshipsTable.addresseeId, userId)
        ),
        and(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.addresseeId, authReq.userId)
        )
      )
    )
    .limit(1);

  if (existing) {
    res
      .status(409)
      .json({ error: existing.status === "accepted" ? "Already friends" : "Friend request already pending" });
    return;
  }

  const [created] = await db
    .insert(friendshipsTable)
    .values({
      requesterId: authReq.userId,
      addresseeId: userId,
      status: "pending",
    })
    .returning();

  const [requester] = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, elo: usersTable.elo })
    .from(usersTable)
    .where(eq(usersTable.id, authReq.userId))
    .limit(1);

  const io = getIo();
  io?.to(`user:${userId}`).emit("friend:request", {
    id: created!.id,
    requesterId: requester!.id,
    requesterName: requester!.name,
    requesterEmail: requester!.email,
    requesterElo: requester!.elo,
    createdAt: created!.createdAt.toISOString(),
  });

  res.status(201).json({
    id: created!.id,
    requesterId: requester!.id,
    requesterName: requester!.name,
    requesterEmail: requester!.email,
    requesterElo: requester!.elo,
    createdAt: created!.createdAt.toISOString(),
  });
});

router.post("/requests/:id/accept", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid request id" });
    return;
  }

  const [request] = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.id, id),
        eq(friendshipsTable.addresseeId, authReq.userId),
        eq(friendshipsTable.status, "pending")
      )
    )
    .limit(1);

  if (!request) {
    res.status(404).json({ error: "Friend request not found" });
    return;
  }

  const respondedAt = new Date();
  await db
    .update(friendshipsTable)
    .set({ status: "accepted", respondedAt })
    .where(eq(friendshipsTable.id, id));

  const [requester] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      elo: usersTable.elo,
      wins: usersTable.wins,
      losses: usersTable.losses,
    })
    .from(usersTable)
    .where(eq(usersTable.id, request.requesterId))
    .limit(1);

  const io = getIo();
  io?.to(`user:${request.requesterId}`).emit("friend:accepted", {
    friendshipId: request.id,
    userId: authReq.userId,
  });

  res.json({
    userId: requester!.id,
    name: requester!.name,
    email: requester!.email,
    elo: requester!.elo,
    wins: requester!.wins,
    losses: requester!.losses,
    friendshipId: request.id,
    since: respondedAt.toISOString(),
  });
});

router.post("/requests/:id/decline", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid request id" });
    return;
  }

  const deleted = await db
    .delete(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.id, id),
        eq(friendshipsTable.addresseeId, authReq.userId),
        eq(friendshipsTable.status, "pending")
      )
    )
    .returning({ id: friendshipsTable.id });

  if (deleted.length === 0) {
    res.status(404).json({ error: "Friend request not found" });
    return;
  }

  res.status(204).end();
});

router.get("/search", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const q = String(req.query["q"] ?? "").trim();

  if (q.length === 0) {
    res.json([]);
    return;
  }

  const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      elo: usersTable.elo,
    })
    .from(usersTable)
    .where(or(ilike(usersTable.name, pattern), ilike(usersTable.email, pattern)))
    .orderBy(usersTable.name)
    .limit(20);

  const otherIds = users.map((u) => u.id).filter((id) => id !== authReq.userId);
  const friendships = otherIds.length
    ? await db
        .select()
        .from(friendshipsTable)
        .where(
          or(
            and(
              eq(friendshipsTable.requesterId, authReq.userId),
              sql`${friendshipsTable.addresseeId} IN ${otherIds}`
            ),
            and(
              eq(friendshipsTable.addresseeId, authReq.userId),
              sql`${friendshipsTable.requesterId} IN ${otherIds}`
            )
          )
        )
    : [];

  const relationshipFor = (otherId: number): string => {
    if (otherId === authReq.userId) return "self";
    const f = friendships.find(
      (x) =>
        (x.requesterId === authReq.userId && x.addresseeId === otherId) ||
        (x.addresseeId === authReq.userId && x.requesterId === otherId)
    );
    if (!f) return "none";
    if (f.status === "accepted") return "friends";
    if (f.requesterId === authReq.userId) return "pending_outgoing";
    return "pending_incoming";
  };

  res.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      elo: u.elo,
      relationship: relationshipFor(u.id),
    }))
  );
});

router.delete("/:userId", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const otherId = Number(req.params["userId"]);
  if (!Number.isFinite(otherId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const deleted = await db
    .delete(friendshipsTable)
    .where(
      or(
        and(
          eq(friendshipsTable.requesterId, authReq.userId),
          eq(friendshipsTable.addresseeId, otherId)
        ),
        and(
          eq(friendshipsTable.requesterId, otherId),
          eq(friendshipsTable.addresseeId, authReq.userId)
        )
      )
    )
    .returning({ id: friendshipsTable.id });

  if (deleted.length === 0) {
    res.status(404).json({ error: "Friendship not found" });
    return;
  }

  res.status(204).end();
});

router.post("/:userId/challenge", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const otherId = Number(req.params["userId"]);
  const { problemId } = req.body as { problemId?: number | null };

  if (!Number.isFinite(otherId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }
  if (otherId === authReq.userId) {
    res.status(400).json({ error: "Cannot challenge yourself" });
    return;
  }

  const [friendship] = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        eq(friendshipsTable.status, "accepted"),
        or(
          and(
            eq(friendshipsTable.requesterId, authReq.userId),
            eq(friendshipsTable.addresseeId, otherId)
          ),
          and(
            eq(friendshipsTable.requesterId, otherId),
            eq(friendshipsTable.addresseeId, authReq.userId)
          )
        )
      )
    )
    .limit(1);

  if (!friendship) {
    res.status(403).json({ error: "You are not friends with this user" });
    return;
  }

  const [target] = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, otherId))
    .limit(1);

  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  let finalProblemId = problemId ?? null;
  if (!finalProblemId) {
    const [rnd] = await db
      .select({ id: problemsTable.id })
      .from(problemsTable)
      .orderBy(sql`random()`)
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

  const [challenger] = await db
    .select({ id: usersTable.id, name: usersTable.name, elo: usersTable.elo })
    .from(usersTable)
    .where(eq(usersTable.id, authReq.userId))
    .limit(1);

  const io = getIo();
  io?.to(`user:${otherId}`).emit("friend:challenge", {
    matchId: match!.id,
    inviteCode: match!.inviteCode,
    fromUserId: challenger!.id,
    fromName: challenger!.name,
    fromElo: challenger!.elo,
    problemTitle: problem!.title,
    problemDifficulty: problem!.difficulty,
  });

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
      starterCodeJs: problem!.starterCodeJs,
      starterCodePy: problem!.starterCodePy,
    },
    players: [
      {
        userId: challenger!.id,
        name: challenger!.name,
        elo: challenger!.elo,
        testsPassedCount: null,
        totalTests: null,
        language: null,
        submittedAt: null,
      },
    ],
    winnerId: null,
    startedAt: null,
    endedAt: null,
    createdAt: match!.createdAt,
  });
});

export default router;
