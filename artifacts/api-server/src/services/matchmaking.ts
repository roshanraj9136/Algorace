import { db } from "@workspace/db";
import {
  matchesTable,
  matchPlayersTable,
  problemsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

type QueueEntry = {
  userId: number;
  elo: number;
  joinedAt: Date;
};

const queue: QueueEntry[] = [];

export function getQueueSize(): number {
  return queue.length;
}

export function isInQueue(userId: number): boolean {
  return queue.some((e) => e.userId === userId);
}

export async function joinQueue(userId: number): Promise<void> {
  if (isInQueue(userId)) return;
  const [user] = await db
    .select({ elo: usersTable.elo })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  queue.push({ userId, elo: user?.elo ?? 1200, joinedAt: new Date() });
}

export function leaveQueue(userId: number): void {
  const idx = queue.findIndex((e) => e.userId === userId);
  if (idx !== -1) queue.splice(idx, 1);
}

async function getRandomProblem(): Promise<number> {
  const rows = await db
    .select({ id: problemsTable.id })
    .from(problemsTable)
    .orderBy(sql`random()`)
    .limit(1);
  if (rows.length === 0) throw new Error("No problems in database");
  return rows[0]!.id;
}

function pickClosestPair(): [QueueEntry, QueueEntry] | null {
  if (queue.length < 2) return null;
  const sorted = [...queue].sort((a, b) => a.elo - b.elo);
  let bestI = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = Math.abs(sorted[i]!.elo - sorted[i + 1]!.elo);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestI = i;
    }
  }
  return [sorted[bestI]!, sorted[bestI + 1]!];
}

export async function tryMatchPlayers(): Promise<{
  matchId: number;
  playerIds: [number, number];
} | null> {
  const pair = pickClosestPair();
  if (!pair) return null;
  const [first, second] = pair;

  leaveQueue(first.userId);
  leaveQueue(second.userId);

  const problemId = await getRandomProblem();

  const [match] = await db
    .insert(matchesTable)
    .values({
      problemId,
      player1Id: first.userId,
      player2Id: second.userId,
      status: "active",
      startedAt: new Date(),
    })
    .returning();

  await db.insert(matchPlayersTable).values([
    { matchId: match!.id, userId: first.userId },
    { matchId: match!.id, userId: second.userId },
  ]);

  return { matchId: match!.id, playerIds: [first.userId, second.userId] };
}

export function removeUserFromQueue(userId: number): void {
  leaveQueue(userId);
}
