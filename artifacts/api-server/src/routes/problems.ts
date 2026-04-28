import { Router } from "express";
import { db } from "@workspace/db";
import { problemsTable } from "@workspace/db/schema";
import { eq, ilike, sql, and, type SQL } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { runTestCases } from "../services/piston";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const { difficulty, tag, search } = req.query as {
    difficulty?: string;
    tag?: string;
    search?: string;
  };

  const conditions: SQL[] = [];

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    conditions.push(
      eq(problemsTable.difficulty, difficulty as "easy" | "medium" | "hard")
    );
  }

  if (search) {
    conditions.push(ilike(problemsTable.title, `%${search}%`));
  }

  const baseQuery = db
    .select({
      id: problemsTable.id,
      title: problemsTable.title,
      slug: problemsTable.slug,
      difficulty: problemsTable.difficulty,
      tags: problemsTable.tags,
    })
    .from(problemsTable);

  const results = conditions.length
    ? await baseQuery.where(and(...conditions))
    : await baseQuery;

  const filtered =
    tag
      ? results.filter((p) => p.tags.includes(tag))
      : results;

  res.json(filtered);
});

router.get("/featured", requireAuth, async (_req, res) => {
  const rows = await db
    .select({
      id: problemsTable.id,
      title: problemsTable.title,
      slug: problemsTable.slug,
      difficulty: problemsTable.difficulty,
      tags: problemsTable.tags,
    })
    .from(problemsTable)
    .orderBy(sql`random()`)
    .limit(6);

  res.json(rows);
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid problem id" });
    return;
  }

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, id))
    .limit(1);

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  res.json({
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: problem.tags,
    constraints: problem.constraints,
    examples: problem.examples,
    starterCodeJs: problem.starterCodeJs,
    starterCodePy: problem.starterCodePy,
  });
});

router.post("/:id/run", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid problem id" });
    return;
  }

  const { language, code } = req.body as {
    language?: string;
    code?: string;
  };

  if (!language || !["javascript", "python"].includes(language)) {
    res.status(400).json({ error: "language must be javascript or python" });
    return;
  }

  if (!code) {
    res.status(400).json({ error: "code is required" });
    return;
  }

  const [problem] = await db
    .select({ testCases: problemsTable.testCases })
    .from(problemsTable)
    .where(eq(problemsTable.id, id))
    .limit(1);

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  const visibleCases = problem.testCases.slice(0, 3);
  const results = await runTestCases(
    language as "javascript" | "python",
    code,
    visibleCases
  );

  const passed = results.filter((r) => r.passed).length;
  res.json({ passed, total: results.length, results });
});

export default router;
