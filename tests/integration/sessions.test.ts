import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sessions, users } from "@/server/db/schema";
import {
  SESSION_IDLE_MS, SESSION_MAX_AGE_MS, createSession, listUserSessions, purgeExpiredSessions, revokeSession,
  revokeSessionById, revokeUserSessions, validateSession,
} from "@/server/auth/session";
import { hashToken } from "@/server/auth/tokens";
import { openTestDb, truncateAll } from "../helpers/db";
import { makeUser } from "../helpers/users";

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

describe("sessions", () => {
  it("validates a fresh token and returns the user from the database", async () => {
    const u = await makeUser(ctx.db, { email: "a@mnyala.test", role: "admin", name: "Asha" });
    const { token } = await createSession(ctx.db, u.id);
    const v = await validateSession(ctx.db, token);
    expect(v?.user).toEqual({ id: u.id, email: "a@mnyala.test", name: "Asha", role: "admin" });
  });

  it("stores only the hash", async () => {
    const u = await makeUser(ctx.db);
    const { token } = await createSession(ctx.db, u.id, { ip: "203.0.113.1", userAgent: "UA" });
    const [row] = await ctx.db.select().from(sessions);
    expect(row?.tokenHash).toBe(hashToken(token));
    expect(JSON.stringify(row)).not.toContain(token);
  });

  it("rejects unknown, empty and oversized tokens", async () => {
    expect(await validateSession(ctx.db, "nope")).toBeNull();
    expect(await validateSession(ctx.db, "")).toBeNull();
    expect(await validateSession(ctx.db, "x".repeat(500))).toBeNull();
  });

  it("expires after the absolute lifetime of 14 days", async () => {
    const u = await makeUser(ctx.db);
    const t0 = new Date("2026-01-01T00:00:00Z");
    const { token } = await createSession(ctx.db, u.id, {}, t0);
    // keep it "recently used" so only the absolute limit is being tested
    const justBefore = new Date(t0.getTime() + SESSION_MAX_AGE_MS - 1000);
    await ctx.db.update(sessions).set({ lastUsedAt: new Date(justBefore.getTime() - 1000) });
    expect(await validateSession(ctx.db, token, justBefore)).not.toBeNull();
    await ctx.db.update(sessions).set({ lastUsedAt: new Date(t0.getTime() + SESSION_MAX_AGE_MS) });
    expect(await validateSession(ctx.db, token, new Date(t0.getTime() + SESSION_MAX_AGE_MS + 1000))).toBeNull();
  });

  it("ends after 7 days without use and deletes the row", async () => {
    const u = await makeUser(ctx.db);
    const t0 = new Date("2026-01-01T00:00:00Z");
    // Two separate sessions: a successful check refreshes last_used_at, so each case needs its own.
    const stillIdleOk = await createSession(ctx.db, u.id, {}, t0);
    const tooIdle = await createSession(ctx.db, u.id, {}, t0);
    expect(await validateSession(ctx.db, stillIdleOk.token, new Date(t0.getTime() + SESSION_IDLE_MS - 1000))).not.toBeNull();
    expect(await validateSession(ctx.db, tooIdle.token, new Date(t0.getTime() + SESSION_IDLE_MS + 1000))).toBeNull();
    const left = await ctx.db.select().from(sessions);
    expect(left).toHaveLength(1);
    expect(left[0]?.tokenHash).toBe(hashToken(stillIdleOk.token));
  });

  it("refreshes last_used_at, but not on every request", async () => {
    const u = await makeUser(ctx.db);
    const t0 = new Date("2026-01-01T00:00:00Z");
    const { token } = await createSession(ctx.db, u.id, {}, t0);
    await validateSession(ctx.db, token, new Date(t0.getTime() + 60_000));
    expect((await ctx.db.select().from(sessions))[0]?.lastUsedAt.getTime()).toBe(t0.getTime());
    await validateSession(ctx.db, token, new Date(t0.getTime() + 6 * 60_000));
    expect((await ctx.db.select().from(sessions))[0]?.lastUsedAt.getTime()).toBe(t0.getTime() + 6 * 60_000);
  });

  it("stops working immediately when the user is deactivated or deleted", async () => {
    const u = await makeUser(ctx.db);
    const { token } = await createSession(ctx.db, u.id);
    await ctx.db.update(users).set({ isActive: false }).where(eq(users.id, u.id));
    expect(await validateSession(ctx.db, token)).toBeNull();
    await ctx.db.update(users).set({ isActive: true }).where(eq(users.id, u.id));
    expect(await validateSession(ctx.db, token)).not.toBeNull();
    await ctx.db.delete(users).where(eq(users.id, u.id));
    expect(await validateSession(ctx.db, token)).toBeNull();
  });

  it("reflects a role change on the very next request", async () => {
    const u = await makeUser(ctx.db, { role: "admin" });
    const { token } = await createSession(ctx.db, u.id);
    await ctx.db.update(users).set({ role: "staff" }).where(eq(users.id, u.id));
    expect((await validateSession(ctx.db, token))?.user.role).toBe("staff");
  });

  it("revokes one session, all sessions, or all except the current one", async () => {
    const u = await makeUser(ctx.db);
    const a = await createSession(ctx.db, u.id);
    const b = await createSession(ctx.db, u.id);
    const c = await createSession(ctx.db, u.id);
    await revokeSession(ctx.db, a.token);
    expect(await validateSession(ctx.db, a.token)).toBeNull();
    const keep = (await validateSession(ctx.db, b.token))!.sessionId;
    await revokeUserSessions(ctx.db, u.id, keep);
    expect(await validateSession(ctx.db, b.token)).not.toBeNull();
    expect(await validateSession(ctx.db, c.token)).toBeNull();
    await revokeUserSessions(ctx.db, u.id);
    expect(await validateSession(ctx.db, b.token)).toBeNull();
  });

  it("a user can only revoke their own sessions by id", async () => {
    const mine = await makeUser(ctx.db);
    const other = await makeUser(ctx.db);
    const o = await createSession(ctx.db, other.id);
    const otherId = (await validateSession(ctx.db, o.token))!.sessionId;
    await revokeSessionById(ctx.db, mine.id, otherId);
    expect(await validateSession(ctx.db, o.token)).not.toBeNull();
    await revokeSessionById(ctx.db, other.id, otherId);
    expect(await validateSession(ctx.db, o.token)).toBeNull();
  });

  it("lists active sessions newest-used first and purges dead ones", async () => {
    const u = await makeUser(ctx.db);
    const t0 = new Date("2026-01-01T00:00:00Z");
    await createSession(ctx.db, u.id, { userAgent: "old" }, t0);
    await createSession(ctx.db, u.id, { userAgent: "new" }, new Date(t0.getTime() + 3600_000));
    const listed = await listUserSessions(ctx.db, u.id, new Date(t0.getTime() + 7200_000));
    expect(listed.map((s) => s.userAgent)).toEqual(["new", "old"]);
    await purgeExpiredSessions(ctx.db, new Date(t0.getTime() + SESSION_MAX_AGE_MS + 86_400_000));
    expect(await ctx.db.select().from(sessions)).toHaveLength(0);
  });
});
