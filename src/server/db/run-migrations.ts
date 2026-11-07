import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import postgres from "postgres";

/** Applies every pending SQL migration. Safe to run repeatedly. */
export async function runMigrations(url: string, folder = path.resolve(process.cwd(), "drizzle")): Promise<void> {
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(sql), { migrationsFolder: folder });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
