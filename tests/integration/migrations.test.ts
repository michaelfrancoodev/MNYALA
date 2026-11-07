import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";
import { runMigrations } from "@/server/db/run-migrations";
import { testDatabaseUrl } from "../helpers/db";

const EXPECTED_TABLES = [
  "activity_logs", "auth_tokens", "counters", "customers", "gallery_items", "media", "messages",
  "order_items", "orders", "products", "rate_limits", "sessions", "site_settings", "users",
];

const base = new URL(testDatabaseUrl());
const dbName = `mnyala_empty_${randomBytes(4).toString("hex")}_test`;

function urlFor(name: string) {
  const u = new URL(base);
  u.pathname = `/${name}`;
  return u.toString();
}

const admin = postgres(urlFor("postgres"), { max: 1, onnotice: () => {} });

afterAll(async () => {
  await admin.unsafe(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  await admin.end({ timeout: 5 });
});

describe("migrations on a brand new, empty database", () => {
  it("apply cleanly (the old Flask migrations failed exactly here)", async () => {
    await admin.unsafe(`CREATE DATABASE "${dbName}"`);
    await expect(runMigrations(urlFor(dbName))).resolves.toBeUndefined();

    const sql = postgres(urlFor(dbName), { max: 1, onnotice: () => {} });
    try {
      const rows = await sql<{ table_name: string }[]>`
        select table_name from information_schema.tables
        where table_schema = 'public' order by table_name`;
      expect(rows.map((r) => r.table_name)).toEqual(EXPECTED_TABLES);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  it("can be run a second time without changing anything", async () => {
    await expect(runMigrations(urlFor(dbName))).resolves.toBeUndefined();
    const sql = postgres(urlFor(dbName), { max: 1, onnotice: () => {} });
    try {
      const [row] = await sql<{ n: number }[]>`select count(*)::int as n from drizzle.__drizzle_migrations`;
      expect(row?.n).toBe(1);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
});
