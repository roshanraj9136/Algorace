import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { matchesTable } from "./matches";

export const eloHistoryTable = pgTable("elo_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  matchId: integer("match_id")
    .notNull()
    .references(() => matchesTable.id),
  oldElo: integer("old_elo").notNull(),
  newElo: integer("new_elo").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEloHistorySchema = createInsertSchema(eloHistoryTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEloHistory = z.infer<typeof insertEloHistorySchema>;
export type EloHistory = typeof eloHistoryTable.$inferSelect;
