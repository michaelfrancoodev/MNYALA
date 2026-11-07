import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { activityLogs, sessions, users } from "@/server/db/schema";
import { needsRehash } from "@/server/auth/password";
import { hashToken } from "@/server/auth/tokens";
import { LIMITS, login } from "@/server/services/auth-service";
import { MemoryMailer } from "@/server/services/mail";
import { openTestDb, truncateAll } from "../helpers/db";
import { GOOD_PASSWORD, makeUser, weakParamsHash } from "../helpers/users";

let ctx: Awaited<ReturnType<typeof openTestDb>>;
const mailer = new MemoryMailer();
const deps = () => ({ db: ctx.db, mailer, appUrl: "https://mnyala.test" });

beforeAll(async () => {
  ctx = await openTestDb();
});
afterAll(async () => {
  await ctx.close();
});
beforeEach(async () => {
  await truncateAll(ctx.sql);
});

describe("login: success", () => {
  it("signs in, stores only a hash of the session token, records the sign-in", async () => {
    const u = await makeUser(ctx.db, { email: "asha@mnyala.test", role: "admin" });
    const r = await login(deps(), { email: "asha@mnyala.test", password: GOOD_PASSWORD, ip: "203.0.113.7", userAgent: "TestAgent/1" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.user).toEqual({ id: u.id, email: "asha@mnyala.test", name: "Test User", role: "admin" });

    const [s] = await ctx.db.select().from(sessions);
    expect(s?.tokenHash).toBe(hashToken(r.token));
    expect(JSON.stringify(s)).not.toContain(r.token);
    expect(s?.ip).toBe("203.0.113.7");
    expect(s!.expiresAt.getTime() - Date.now()).toBeGreaterThan(13 * 86_400_000);

    const [fresh] = await ctx.db.select().from(users).where(eq(users.id, u.id));
    expect(fresh?.lastLoginAt).not.toBeNull();
    const logs = await ctx.db.select().from(activityLogs);
    expect(logs.map((l) => l.action)).toContain("user.login");
  });

  it("ignores letter case and surrounding spaces in the email", async () => {
    await makeUser(ctx.db, { email: "Asha@Mnyala.test" });
    expect((await login(deps(), { email: "  ASHA@mnyala.TEST ", password: GOOD_PASSWORD })).ok).toBe(true);
  });

  it("does not judge password strength: an older, weaker password still signs in (the old app locked admins out)", async () => {
    await makeUser(ctx.db, { email: "old@mnyala.test", password: "abc123" });
    expect((await login(deps(), { email: "old@mnyala.test", password: "abc123" })).ok).toBe(true);
  });

  it("upgrades a hash made with weaker parameters", async () => {
    const weak = await weakParamsHash("some-password-77");
    const u = await makeUser(ctx.db, { email: "w@mnyala.test", rawHash: weak });
    expect(needsRehash(weak)).toBe(true);
    expect((await login(deps(), { email: "w@mnyala.test", password: "some-password-77" })).ok).toBe(true);
    const [fresh] = await ctx.db.select().from(users).where(eq(users.id, u.id));
    expect(needsRehash(fresh!.passwordHash!)).toBe(false);
  });
});

describe("login: failures all look identical", () => {
  it("wrong password, unknown email, deactivated account and not-yet-invited account", async () => {
    await makeUser(ctx.db, { email: "a@mnyala.test" });
    await makeUser(ctx.db, { email: "off@mnyala.test", active: false });
    await makeUser(ctx.db, { email: "invited@mnyala.test", password: null });
    const results = await Promise.all([
      login(deps(), { email: "a@mnyala.test", password: "wrong-password-1" }),
      login(deps(), { email: "nobody@mnyala.test", password: GOOD_PASSWORD }),
      login(deps(), { email: "off@mnyala.test", password: GOOD_PASSWORD }),
      login(deps(), { email: "invited@mnyala.test", password: GOOD_PASSWORD }),
    ]);
    for (const r of results) expect(r).toEqual({ ok: false, reason: "invalid" });
    expect(await ctx.db.select().from(sessions)).toHaveLength(0);
  });

  it("does comparable work whether or not the email exists (no timing hint)", async () => {
    await makeUser(ctx.db, { email: "t@mnyala.test" });
    const time = async (email: string) => {
      const t0 = performance.now();
      await login(deps(), { email, password: "wrong-password-1", ip: null });
      return performance.now() - t0;
    };
    await time("t@mnyala.test"); // warm up the hash
    let known = 0, unknown = 0;
    for (let i = 0; i < 3; i++) {
      known += await time("t@mnyala.test");
      unknown += await time(`nobody${i}@mnyala.test`);
    }
    expect(unknown / known).toBeGreaterThan(0.4);
    expect(unknown / known).toBeLessThan(2.5);
  });

  it("refuses absurdly long passwords without hashing them", async () => {
    await makeUser(ctx.db, { email: "long@mnyala.test" });
    const t0 = performance.now();
    expect(await login(deps(), { email: "long@mnyala.test", password: "x".repeat(5000) })).toEqual({ ok: false, reason: "invalid" });
    expect(performance.now() - t0).toBeLessThan(500);
  });

  it("never writes the attempted password into the audit log", async () => {
    await makeUser(ctx.db, { email: "a@mnyala.test" });
    await login(deps(), { email: "a@mnyala.test", password: "my-secret-guess-9" });
    expect(JSON.stringify(await ctx.db.select().from(activityLogs))).not.toContain("my-secret-guess-9");
  });
});

describe("login: rate limiting", () => {
  it(`locks an email after ${LIMITS.loginEmail.limit} failures, even for the correct password`, async () => {
    await makeUser(ctx.db, { email: "victim@mnyala.test" });
    for (let i = 0; i < LIMITS.loginEmail.limit; i++) {
      expect((await login(deps(), { email: "victim@mnyala.test", password: `wrong-guess-${i}` })).ok).toBe(false);
    }
    const blocked = await login(deps(), { email: "victim@mnyala.test", password: GOOD_PASSWORD });
    expect(blocked).toMatchObject({ ok: false, reason: "rate_limited" });
    if (!blocked.ok && blocked.reason === "rate_limited") {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
      expect(blocked.retryAfterSec).toBeLessThanOrEqual(900);
    }
  });

  it("does not lock other accounts", async () => {
    await makeUser(ctx.db, { email: "victim@mnyala.test" });
    await makeUser(ctx.db, { email: "other@mnyala.test" });
    for (let i = 0; i < 6; i++) await login(deps(), { email: "victim@mnyala.test", password: `wrong-${i}-xx` });
    expect((await login(deps(), { email: "other@mnyala.test", password: GOOD_PASSWORD })).ok).toBe(true);
  });

  it("a successful sign-in clears the failure count", async () => {
    await makeUser(ctx.db, { email: "a@mnyala.test" });
    for (let i = 0; i < 4; i++) await login(deps(), { email: "a@mnyala.test", password: `wrong-${i}-xx` });
    expect((await login(deps(), { email: "a@mnyala.test", password: GOOD_PASSWORD })).ok).toBe(true);
    for (let i = 0; i < 4; i++) await login(deps(), { email: "a@mnyala.test", password: `wrong-${i}-xx` });
    expect((await login(deps(), { email: "a@mnyala.test", password: GOOD_PASSWORD })).ok).toBe(true);
  });

  it("unlocks after the window passes", async () => {
    await makeUser(ctx.db, { email: "a@mnyala.test" });
    for (let i = 0; i < 5; i++) await login(deps(), { email: "a@mnyala.test", password: `wrong-${i}-xx` });
    await ctx.sql`update rate_limits set window_start = now() - interval '16 minutes'`;
    expect((await login(deps(), { email: "a@mnyala.test", password: GOOD_PASSWORD })).ok).toBe(true);
  });

  it(`locks an address after ${LIMITS.loginIp.limit} failures spread over many emails`, async () => {
    for (let i = 0; i < LIMITS.loginIp.limit; i++) {
      await login(deps(), { email: `spray${i}@mnyala.test`, password: "guess-guess-1", ip: "198.51.100.9" });
    }
    await makeUser(ctx.db, { email: "real@mnyala.test" });
    expect(await login(deps(), { email: "real@mnyala.test", password: GOOD_PASSWORD, ip: "198.51.100.9" })).toMatchObject({ reason: "rate_limited" });
    expect((await login(deps(), { email: "real@mnyala.test", password: GOOD_PASSWORD, ip: "198.51.100.10" })).ok).toBe(true);
  });

  it("without a known address, only the per-email limit applies (nobody is locked out by strangers)", async () => {
    await makeUser(ctx.db, { email: "real@mnyala.test" });
    for (let i = 0; i < 30; i++) await login(deps(), { email: `spray${i}@mnyala.test`, password: "guess-guess-1", ip: null });
    expect((await login(deps(), { email: "real@mnyala.test", password: GOOD_PASSWORD, ip: null })).ok).toBe(true);
  });

  it("records blocked attempts in the audit log", async () => {
    await makeUser(ctx.db, { email: "a@mnyala.test" });
    for (let i = 0; i < 6; i++) await login(deps(), { email: "a@mnyala.test", password: `wrong-${i}-xx` });
    expect((await ctx.db.select().from(activityLogs)).map((l) => l.action)).toContain("user.login_blocked");
  });
});
