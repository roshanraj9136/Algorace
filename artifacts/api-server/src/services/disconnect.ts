import { db } from "@workspace/db";
import {
  matchesTable,
  usersTable,
  eloHistoryTable,
} from "@workspace/db/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import { computeElo } from "../lib/elo";
import { getIo } from "../routes/socket-ref";

const DISCONNECT_GRACE_MS = 10_000;
const timers = new Map<string, NodeJS.Timeout>();

function key(matchId: number, userId: number): string {
  return `${matchId}:${userId}`;
}

export async function startDisconnectGrace(userId: number): Promise<void> {
  const io = getIo();
  if (!io) return;

  const activeMatches = await db
    .select({
      id: matchesTable.id,
      player1Id: matchesTable.player1Id,
      player2Id: matchesTable.player2Id,
    })
    .from(matchesTable)
    .where(
      and(
        eq(matchesTable.status, "active"),
        isNull(matchesTable.winnerId),
        or(
          eq(matchesTable.player1Id, userId),
          eq(matchesTable.player2Id, userId)
        )
      )
    );

  for (const match of activeMatches) {
    const opponentId =
      match.player1Id === userId ? match.player2Id : match.player1Id;
    if (!opponentId) continue;

    io.to(`match:${match.id}`).emit("match:opponent_disconnected", {
      matchId: match.id,
      disconnectedUserId: userId,
      graceMs: DISCONNECT_GRACE_MS,
    });

    const k = key(match.id, userId);
    const existing = timers.get(k);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      timers.delete(k);
      void awardOpponentWin(match.id, opponentId, userId);
    }, DISCONNECT_GRACE_MS);

    timers.set(k, timer);
  }
}

export function cancelDisconnectGrace(userId: number, matchId: number): void {
  const k = key(matchId, userId);
  const t = timers.get(k);
  if (!t) return;

  clearTimeout(t);
  timers.delete(k);

  const io = getIo();
  io?.to(`match:${matchId}`).emit("match:opponent_reconnected", {
    matchId,
    userId,
  });
}

async function awardOpponentWin(
  matchId: number,
  winnerId: number,
  loserId: number
): Promise<void> {
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(matchesTable)
      .set({
        winnerId,
        status: "finished",
        endedAt: new Date(),
      })
      .where(and(eq(matchesTable.id, matchId), isNull(matchesTable.winnerId)))
      .returning({ id: matchesTable.id });

    if (updated.length === 0) return;

    const [winnerUser] = await tx
      .select({ elo: usersTable.elo, wins: usersTable.wins })
      .from(usersTable)
      .where(eq(usersTable.id, winnerId))
      .limit(1);

    const [loserUser] = await tx
      .select({ elo: usersTable.elo, losses: usersTable.losses })
      .from(usersTable)
      .where(eq(usersTable.id, loserId))
      .limit(1);

    if (!winnerUser || !loserUser) return;

    const { winnerNewElo, loserNewElo } = computeElo(
      winnerUser.elo,
      loserUser.elo
    );

    await tx
      .update(usersTable)
      .set({ elo: winnerNewElo, wins: winnerUser.wins + 1 })
      .where(eq(usersTable.id, winnerId));

    await tx
      .update(usersTable)
      .set({ elo: loserNewElo, losses: loserUser.losses + 1 })
      .where(eq(usersTable.id, loserId));

    await tx.insert(eloHistoryTable).values([
      {
        userId: winnerId,
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

    const io = getIo();
    io?.to(`match:${matchId}`).emit("match:finished", {
      winnerId,
      reason: "opponent_disconnected",
    });
  });
}
