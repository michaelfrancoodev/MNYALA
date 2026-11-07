import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(url: string, options: { max?: number } = {}) {
  const sql = postgres(url, {
    max: options.max ?? 10,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  const db = drizzle(sql, { schema });
  // Drizzle parses jsonb itself, but postgres.js has already parsed it by then, so a string such as "255758730108"
  // would be parsed a second time into a number. Hand Drizzle the raw text so JSON is decoded exactly once.
  const rawText = (value: string) => value;
  sql.options.parsers[114] = rawText;
  sql.options.parsers[3802] = rawText;
  return { db, sql, close: () => sql.end({ timeout: 5 }) };
}

export type Db = ReturnType<typeof createDb>["db"];
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// Reuse one pool across hot reloads in development.
const globalForDb = globalThis as unknown as { __mnyalaDb?: ReturnType<typeof createDb> };

export function getDb(): Db {
  globalForDb.__mnyalaDb ??= createDb(getEnv().DATABASE_URL);
  return globalForDb.__mnyalaDb.db;
}
