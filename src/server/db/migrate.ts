import { getDatabaseUrl } from "@/lib/env";
import { runMigrations } from "./run-migrations";

// One-shot job: `pnpm db:migrate`. Needs only DATABASE_URL.
runMigrations(getDatabaseUrl())
  .then(() => {
    console.log("Migrations applied.");
  })
  .catch((error: unknown) => {
    console.error("Migration failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
