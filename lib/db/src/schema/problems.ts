import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type TestCase = {
  input: string;
  expectedOutput: string;
};

export type Example = {
  input: string;
  output: string;
  explanation: string | null;
};

export type Signature = {
  fn: string;
  ret: string;
  params: { name: string; type: string }[];
};

export const problemsTable = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  tags: text("tags").array().notNull().default([]),
  constraints: text("constraints").notNull(),
  examples: jsonb("examples").notNull().$type<Example[]>(),
  testCases: jsonb("test_cases").notNull().$type<TestCase[]>(),
  signature: jsonb("signature").notNull().$type<Signature>(),
  starterCodeCpp: text("starter_code_cpp").notNull(),
  starterCodeJava: text("starter_code_java").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProblemSchema = createInsertSchema(problemsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problemsTable.$inferSelect;
