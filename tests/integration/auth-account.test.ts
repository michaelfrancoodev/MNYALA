import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { activityLogs, sessions, users } from "@/server/db/schema";
import { createSession } from "@/server/auth/session";
import { changePassword, createSuperAdmin, login } from "@/server/services/auth-service";
import { MemoryMailer } from "@/server/services/mail";
import { openTestDb, truncateAll } from "../helpers/db";
import { GOOD_PASSWORD, makeUser } from "../helpers/users";

let ctx: Awaited<ReturnType<typeof openTestDb>>;
let mailer: MemoryMailer;
const deps = () => ({ db: ctx.db, mailer, appUrl: "https://mnyala.test" });
const NEW_PASSWORD = "tunapanda-miti-kila-mwaka-7";

beforeAll(async () => {
  ctx = await openTestDb();
});
afterAll(async () => {
  await ctx.close();
});
beforeEach(async () => {
  await truncateAll(ctx.sql);
  mailer = new MemoryMailer();
});

describe("changePassword", () => {
  async function setup() {
    const u = await makeUser(ctx.db, { email: "asha@mnyala.test", name: "Asha Mwakyusa" });
    const here = await createSession(ctx.db, u.id);
    await createSession(ctx.db, u.id);
    await createSession(ctx.db, u.id);
    const [mine] = await ctx.db.select().from(sessions).where(eq(sessions.userId, u.id)).limit(1);
    return { user: u, sessionId: mine!.id, here };
  }

  it("changes the password, keeps this device signed in, signs the others out, and emails a notice", async () => {
    const { user, sessionId } = await setup();
    const r = await changePassword(deps(), { userId: user.id, currentSessionId: sessionId, currentPassword: GOOD_PASSWORD, newPassword: NEW_PASSWORD });
    expect(r).toEqual({ ok: true });
    const left = await ctx.db.select().from(sessions).where(eq(sessions.userId, user.id));
    expect(left.map((s) => s.id)).toEqual([sessionId]);
    expect((await login(deps(), { email: user.email, password: NEW_PASSWORD })).ok).toBe(true);
    expect((await login(deps(), { email: user.email, password: GOOD_PASSWORD })).ok).toBe(false);
    await new Promise((r2) => setTimeout(r2, 50));
    expect(mailer.sent.map((m) => m.subject)).toContain("Your Mnyala admin password was changed");
    expect((await ctx.db.select().from(activityLogs)).map((l) => l.action)).toContain("user.password_changed");
  });

  it("requires the current password", async () => {
    const { user, sessionId } = await setup();
    const r = await changePassword(deps(), { userId: user.id, currentSessionId: sessionId, currentPassword: "not-my-password-1", newPassword: NEW_PASSWORD });
    expect(r).toEqual({ ok: false, reason: "wrong_current" });
    expect(await ctx.db.select().from(sessions)).toHaveLength(3);
  });

  it("applies the same policy as everywhere else", async () => {
    const { user, sessionId } = await setup();
    const r = await changePassword(deps(), { userId: user.id, currentSessionId: sessionId, currentPassword: GOOD_PASSWORD, newPassword: "short1" });
    expect(r).toMatchObject({ ok: false, reason: "weak_password" });
    const r2 = await changePassword(deps(), { userId: user.id, currentSessionId: sessionId, currentPassword: GOOD_PASSWORD, newPassword: "ashamwakyusa2026" });
    expect(r2).toMatchObject({ ok: false, reason: "weak_password" });
  });

  it("a password accepted here can always be used to sign in afterwards (the old app broke this)", async () => {
    const { user, sessionId } = await setup();
    const accepted = "plain-lowercase-pass-12"; // no capitals, no symbols
    expect((await changePassword(deps(), { userId: user.id, currentSessionId: sessionId, currentPassword: GOOD_PASSWORD, newPassword: accepted })).ok).toBe(true);
    expect((await login(deps(), { email: user.email, password: accepted })).ok).toBe(true);
  });

  it("locks after 5 wrong current passwords, even if the right one follows", async () => {
    const { user, sessionId } = await setup();
    for (let i = 0; i < 5; i++) {
      await changePassword(deps(), { userId: user.id, currentSessionId: sessionId, currentPassword: `wrong-${i}-pass-x`, newPassword: NEW_PASSWORD });
    }
    const r = await changePassword(deps(), { userId: user.id, currentSessionId: sessionId, currentPassword: GOOD_PASSWORD, newPassword: NEW_PASSWORD });
    expect(r).toMatchObject({ ok: false, reason: "rate_limited" });
  });
});

describe("createSuperAdmin (the only way the first admin exists)", () => {
  it("creates the first super admin with a normalised email and a working password", async () => {
    const r = await createSuperAdmin(ctx.db, { email: "  Owner@Mnyala.CO.tz ", name: "Owner", password: NEW_PASSWORD });
    expect(r.created).toBe(true);
    const [u] = await ctx.db.select().from(users);
    expect(u).toMatchObject({ email: "owner@mnyala.co.tz", role: "super_admin", isActive: true });
    expect(u?.passwordHash?.startsWith("$argon2id$")).toBe(true);
    expect((await login(deps(), { email: "owner@mnyala.co.tz", password: NEW_PASSWORD })).ok).toBe(true);
  });

  it("refuses when a super admin already exists", async () => {
    await createSuperAdmin(ctx.db, { email: "owner@mnyala.co.tz", name: "Owner", password: NEW_PASSWORD });
    const again = await createSuperAdmin(ctx.db, { email: "intruder@evil.test", name: "X", password: NEW_PASSWORD });
    expect(again).toEqual({ created: false, reason: "exists" });
    expect(await ctx.db.select().from(users)).toHaveLength(1);
  });

  it("rejects a weak password instead of creating an account nobody can use", async () => {
    await expect(createSuperAdmin(ctx.db, { email: "o@mnyala.co.tz", name: "Owner", password: "password123" })).rejects.toThrow(/common/);
    expect(await ctx.db.select().from(users)).toHaveLength(0);
  });

  it("--reset sets a new password for an existing super admin, reactivates, and signs out every device", async () => {
    const r1 = await createSuperAdmin(ctx.db, { email: "owner@mnyala.co.tz", name: "Owner", password: NEW_PASSWORD });
    if (!r1.created) throw new Error("setup failed");
    await createSession(ctx.db, r1.id);
    await ctx.db.update(users).set({ isActive: false }).where(eq(users.id, r1.id));

    const r = await createSuperAdmin(ctx.db, { email: "OWNER@mnyala.co.tz", name: "Owner", password: "a-brand-new-passphrase-5", reset: true });
    expect(r.created).toBe(true);
    expect(await ctx.db.select().from(sessions)).toHaveLength(0);
    expect((await login(deps(), { email: "owner@mnyala.co.tz", password: "a-brand-new-passphrase-5" })).ok).toBe(true);
  });

  it("--reset cannot be used to take over a normal admin or an unknown address", async () => {
    await createSuperAdmin(ctx.db, { email: "owner@mnyala.co.tz", name: "Owner", password: NEW_PASSWORD });
    await makeUser(ctx.db, { email: "plain@mnyala.test", role: "admin" });
    for (const email of ["plain@mnyala.test", "nobody@mnyala.test"]) {
      expect(await createSuperAdmin(ctx.db, { email, name: "X", password: "a-brand-new-passphrase-5", reset: true })).toEqual({ created: false, reason: "no_such_user" });
    }
  });
});
