import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const friendshipsTable = pgTable(
  "friendships",
  {
    id: serial("id").primaryKey(),
    requesterId: integer("requester_id")
      .notNull()
      .references(() => usersTable.id),
    addresseeId: integer("addressee_id")
      .notNull()
      .references(() => usersTable.id),
    status: text("status", { enum: ["pending", "accepted"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => ({
    pairUnique: uniqueIndex("friendships_pair_unique").on(
      table.requesterId,
      table.addresseeId
    ),
  })
);

export const insertFriendshipSchema = createInsertSchema(friendshipsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendshipsTable.$inferSelect;
