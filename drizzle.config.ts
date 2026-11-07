import { defineConfig } from "drizzle-kit";

// `generate` and `check` work offline; DATABASE_URL is only used by `push`/`studio`.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/mnyala" },
});
