import { db } from "@workspace/db";
import { problemsTable } from "@workspace/db/schema";
import { problems } from "./problems-data";

async function seed() {
  console.log(`Saving ${problems.length} problems...`);
  for (const problem of problems) {
    await db
      .insert(problemsTable)
      .values(problem)
      .onConflictDoUpdate({
        target: problemsTable.slug,
        set: problem,
      });
  }
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
