import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { consume, isLocked, purgeRateLimits, recordFailure, resetLimit } from "@/server/auth/rate-limit";
import { openTestDb, truncateAll } from "../helpers/db";

let ctx: Awaited<ReturnType<typeof openTestDb>>;
beforeAll(async () => {
  ctx = await openTestDb();
});
afterAll(async () => {
  await ctx.close();
});
beforeEach(async () => {
  await truncateAll(ctx.sql);
});

const cfg = { limit: 3, windowSec: 60 };

describe("consume (every call counts)", () => {
  it("allows up to the limit, then blocks and reports when to retry", async () => {
    for (let i = 1; i <= 3; i++) {
      const r = await consume(ctx.db, "contact:ip:1.2.3.4", cfg);
      expect(r.allowed, `call ${i}`).toBe(true);
      expect(r.remaining).toBe(3 - i);
    }
    const blocked = await consume(ctx.db, "contact:ip:1.2.3.4", cfg);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it("keeps separate counters per key", async () => {
    for (let i = 0; i < 4; i++) await consume(ctx.db, "a", cfg);
    expect((await consume(ctx.db, "b", cfg)).allowed).toBe(true);
  });

  it("starts a fresh window once the old one has expired", async () => {
    for (let i = 0; i < 4; i++) await consume(ctx.db, "k", cfg);
    expect((await consume(ctx.db, "k", cfg)).allowed).toBe(false);
    await ctx.sql`update rate_limits set window_start = now() - interval '61 seconds' where key = 'k'`;
    const r = await consume(ctx.db, "k", cfg);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("is atomic: 20 simultaneous calls allow exactly the limit", async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => consume(ctx.db, "race", cfg)));
    expect(results.filter((r) => r.allowed)).toHaveLength(3);
  });
});

describe("recordFailure and isLocked (only failures count)", () => {
  it("locks after the limit of failures and not before", async () => {
    expect((await isLocked(ctx.db, "login:email:x", cfg)).locked).toBe(false);
    await recordFailure(ctx.db, "login:email:x", cfg);
    await recordFailure(ctx.db, "login:email:x", cfg);
    expect((await isLocked(ctx.db, "login:email:x", cfg)).locked).toBe(false);
    await recordFailure(ctx.db, "login:email:x", cfg);
    const state = await isLocked(ctx.db, "login:email:x", cfg);
    expect(state.locked).toBe(true);
    expect(state.retryAfterSec).toBeGreaterThan(0);
  });

  it("checking does not itself count as an attempt", async () => {
    for (let i = 0; i < 10; i++) await isLocked(ctx.db, "peek", cfg);
    expect((await ctx.sql`select 1 from rate_limits where key = 'peek'`).length).toBe(0);
  });

  it("unlocks when the window passes and when reset (successful sign-in)", async () => {
    for (let i = 0; i < 3; i++) await recordFailure(ctx.db, "k", cfg);
    expect((await isLocked(ctx.db, "k", cfg)).locked).toBe(true);
    await resetLimit(ctx.db, "k");
    expect((await isLocked(ctx.db, "k", cfg)).locked).toBe(false);

    for (let i = 0; i < 3; i++) await recordFailure(ctx.db, "k", cfg);
    await ctx.sql`update rate_limits set window_start = now() - interval '2 minutes' where key = 'k'`;
    expect((await isLocked(ctx.db, "k", cfg)).locked).toBe(false);
  });
});

describe("purgeRateLimits", () => {
  it("removes only windows that ended long ago", async () => {
    await consume(ctx.db, "old", cfg);
    await consume(ctx.db, "new", cfg);
    await ctx.sql`update rate_limits set window_start = now() - interval '3 days' where key = 'old'`;
    await purgeRateLimits(ctx.db);
    const keys = (await ctx.sql<{ key: string }[]>`select key from rate_limits`).map((r) => r.key);
    expect(keys).toEqual(["new"]);
  });
});
