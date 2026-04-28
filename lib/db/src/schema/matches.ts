import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { problemsTable } from "./problems";

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id")
    .notNull()
    .references(() => problemsTable.id),
  player1Id: integer("player1_id")
    .notNull()
    .references(() => usersTable.id),
  player2Id: integer("player2_id").references(() => usersTable.id),
  winnerId: integer("winner_id").references(() => usersTable.id),
  status: text("status", {
    enum: ["waiting", "active", "finished", "abandoned"],
  })
    .notNull()
    .default("waiting"),
  inviteCode: text("invite_code").unique(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matchPlayersTable = pgTable("match_players", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matchesTable.id),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  language: text("language", { enum: ["javascript", "python"] }),
  finalCode: text("final_code"),
  testsPassedCount: integer("tests_passed_count"),
  totalTests: integer("total_tests"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;

export const insertMatchPlayerSchema = createInsertSchema(matchPlayersTable).omit({
  id: true,
});
export type InsertMatchPlayer = z.infer<typeof insertMatchPlayerSchema>;
export type MatchPlayer = typeof matchPlayersTable.$inferSelect;
