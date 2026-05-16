import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function migrate() {
  await db.execute(sql`ALTER TABLE problems ADD COLUMN IF NOT EXISTS signature JSONB NOT NULL DEFAULT '{"fn":"solve","ret":"int","params":[{"name":"n","type":"int"}]}'`);
  console.log("Signature column added.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
