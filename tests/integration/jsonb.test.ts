import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { activityLogs, siteSettings } from "@/server/db/schema";
import { openTestDb, truncateAll } from "../helpers/db";

let ctx: Awaited<ReturnType<typeof openTestDb>>;
beforeAll(async () => {
  ctx = await openTestDb();
  await truncateAll(ctx.sql);
});
afterAll(async () => {
  await ctx.close();
});

// Regression: a digits-only string (the WhatsApp number) used to come back as a number, so the
// WhatsApp button silently vanished. Every value must come back exactly as it was stored.
describe("jsonb values round-trip exactly", () => {
  const values: Array<[string, unknown]> = [
    ["digits only", "255758730108"],
    ["small number as text", "123"],
    ["leading zero", "0758730108"],
    ["the word true", "true"],
    ["the word null", "null"],
    ["text with quotes", '"quoted"'],
    ["ordinary text", "Mbeya, Tanzania"],
    ["a real number", 5],
    ["a real boolean", false],
    ["an object", { a: 1, b: ["x", "y"] }],
    ["an array", [1, "2", null]],
    ["empty string", ""],
  ];

  it.each(values)("%s", async (_name, value) => {
    const key = `test.${Math.random().toString(36).slice(2)}`;
    await ctx.db.insert(siteSettings).values({ key, value });
    const [row] = await ctx.db.select().from(siteSettings).where(eq(siteSettings.key, key));
    expect(row?.value).toStrictEqual(value);
    expect(typeof row?.value).toBe(typeof value);
  });

  it("also holds for jsonb written by one statement and read by another (activity details)", async () => {
    await ctx.db.insert(activityLogs).values({ action: "x", details: { code: "0012", ok: "true", n: 3 } });
    const [row] = await ctx.db.select().from(activityLogs);
    expect(row?.details).toStrictEqual({ code: "0012", ok: "true", n: 3 });
  });
});
