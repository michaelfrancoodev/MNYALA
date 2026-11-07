import postgres from "postgres";
import { createDb } from "@/server/db/client";
import { runMigrations } from "@/server/db/run-migrations";
import { normalizeDatabaseUrl } from "@/lib/env";

/** Refuses to touch any database whose name does not end in _test. */
export function testDatabaseUrl(): string {
  const raw = process.env.TEST_DATABASE_URL;
  if (!raw) throw new Error("TEST_DATABASE_URL is not set (see .env.example)");
  const name = new URL(normalizeDatabaseUrl(raw)).pathname.slice(1);
  if (!name.endsWith("_test")) {
    throw new Error(`Refusing to run tests against "${name}": the database name must end with _test`);
  }
  return normalizeDatabaseUrl(raw);
}

/** Drops everything and re-applies all migrations from scratch. */
export async function resetDatabase(url = testDatabaseUrl()): Promise<void> {
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE");
    await sql.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE");
    await sql.unsafe("CREATE SCHEMA public");
  } finally {
    await sql.end({ timeout: 5 });
  }
  await runMigrations(url);
}

export async function openTestDb() {
  const url = testDatabaseUrl();
  await resetDatabase(url);
  return createDb(url, { max: 10 });
}

const TABLES = [
  "order_items", "orders", "customers", "messages", "gallery_items", "products", "media",
  "activity_logs", "auth_tokens", "sessions", "rate_limits", "users", "counters", "site_settings",
];

export async function truncateAll(sql: postgres.Sql): Promise<void> {
  await sql.unsafe(`TRUNCATE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`);
}
