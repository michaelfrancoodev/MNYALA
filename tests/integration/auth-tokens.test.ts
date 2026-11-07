import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { authTokens, sessions, users } from "@/server/db/schema";
import { createSession } from "@/server/auth/session";
import { hashToken } from "@/server/auth/tokens";
import {
  INVITE_TOKEN_HOURS, RESET_TOKEN_MINUTES, acceptInvite, findValidToken, issueToken, login, requestPasswordReset, resetPassword,
} from "@/server/services/auth-service";
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

function tokenFromMail(index = 0): string {
  const m = /\/admin\/reset-password\/([A-Za-z0-9_-]{43})/.exec(mailer.sent[index]?.text ?? "");
  if (!m?.[1]) throw new Error("no reset link in email");
  return m[1];
}

describe("requestPasswordReset", () => {
  it("emails a one-time link, and stores only a hash of its token", async () => {
    await makeUser(ctx.db, { email: "asha@mnyala.test", name: "Asha" });
    await requestPasswordReset(deps(), { email: "asha@mnyala.test", ip: "203.0.113.5" }).done;

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]?.to).toBe("asha@mnyala.test");
    expect(mailer.sent[0]?.text).toContain("https://mnyala.test/admin/reset-password/");
    expect(mailer.sent[0]?.html).toContain("Choose a new password");

    const token = tokenFromMail();
    const [row] = await ctx.db.select().from(authTokens);
    expect(row?.tokenHash).toBe(hashToken(token));
    expect(JSON.stringify(row)).not.toContain(token);
    expect(row?.purpose).toBe("password_reset");
    const minutes = (row!.expiresAt.getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(RESET_TOKEN_MINUTES - 1);
    expect(minutes).toBeLessThanOrEqual(RESET_TOKEN_MINUTES);
  });

  it("does nothing, silently, for an unknown email (no enumeration)", async () => {
    const r = requestPasswordReset(deps(), { email: "nobody@mnyala.test" });
    expect(Object.keys(r)).toEqual(["done"]);
    await r.done;
    expect(mailer.sent).toHaveLength(0);
    expect(await ctx.db.select().from(authTokens)).toHaveLength(0);
  });

  it("does nothing for a deactivated account", async () => {
    await makeUser(ctx.db, { email: "off@mnyala.test", active: false });
    await requestPasswordReset(deps(), { email: "off@mnyala.test" }).done;
    expect(mailer.sent).toHaveLength(0);
  });

  it("allows 3 requests per hour per email, then sends nothing more", async () => {
    await makeUser(ctx.db, { email: "asha@mnyala.test" });
    for (let i = 0; i < 5; i++) await requestPasswordReset(deps(), { email: "asha@mnyala.test" }).done;
    expect(mailer.sent).toHaveLength(3);
  });

  it("only the newest link works", async () => {
    await makeUser(ctx.db, { email: "asha@mnyala.test" });
    await requestPasswordReset(deps(), { email: "asha@mnyala.test" }).done;
    await requestPasswordReset(deps(), { email: "asha@mnyala.test" }).done;
    expect(await findValidToken(ctx.db, tokenFromMail(0), "password_reset")).toBeNull();
    expect(await findValidToken(ctx.db, tokenFromMail(1), "password_reset")).not.toBeNull();
  });

  it("a mail failure is swallowed: no exception, nothing leaks", async () => {
    await makeUser(ctx.db, { email: "asha@mnyala.test" });
    mailer.failWith = new Error("SMTP down: user=secret-smtp-user");
    await expect(requestPasswordReset(deps(), { email: "asha@mnyala.test" }).done).resolves.toBeUndefined();
  });

  it("matches the email ignoring case", async () => {
    await makeUser(ctx.db, { email: "Asha@Mnyala.test" });
    await requestPasswordReset(deps(), { email: " ASHA@mnyala.test " }).done;
    expect(mailer.sent).toHaveLength(1);
  });
});

describe("resetPassword", () => {
  async function setup() {
    const u = await makeUser(ctx.db, { email: "asha@mnyala.test", name: "Asha Mwakyusa" });
    await requestPasswordReset(deps(), { email: u.email }).done;
    return { user: u, token: tokenFromMail() };
  }

  it("sets the new password, ends every session, and tells the owner", async () => {
    const { user, token } = await setup();
    await createSession(ctx.db, user.id);
    await createSession(ctx.db, user.id);
    mailer.sent.length = 0;

    const r = await resetPassword(deps(), { token, password: NEW_PASSWORD });
    expect(r.ok).toBe(true);
    expect(await ctx.db.select().from(sessions)).toHaveLength(0);
    expect((await login(deps(), { email: user.email, password: NEW_PASSWORD })).ok).toBe(true);
    expect(await login(deps(), { email: user.email, password: GOOD_PASSWORD })).toMatchObject({ ok: false });
    await new Promise((r2) => setTimeout(r2, 50));
    expect(mailer.sent.map((m) => m.subject)).toContain("Your Mnyala admin password was changed");
  });

  it("works exactly once", async () => {
    const { token } = await setup();
    expect((await resetPassword(deps(), { token, password: NEW_PASSWORD })).ok).toBe(true);
    expect(await resetPassword(deps(), { token, password: "another-pass-phrase-8" })).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("two simultaneous submissions: exactly one succeeds", async () => {
    const { token } = await setup();
    const results = await Promise.all([
      resetPassword(deps(), { token, password: NEW_PASSWORD }),
      resetPassword(deps(), { token, password: "second-pass-phrase-9" }),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });

  it("rejects a weak password and keeps the link usable so the person can try again", async () => {
    const { token } = await setup();
    const weak = await resetPassword(deps(), { token, password: "password123" });
    expect(weak).toMatchObject({ ok: false, reason: "weak_password" });
    expect((await resetPassword(deps(), { token, password: NEW_PASSWORD })).ok).toBe(true);
  });

  it("rejects a password containing the person's own name or email", async () => {
    const { token } = await setup();
    expect(await resetPassword(deps(), { token, password: "ashamwakyusa-2026-x" })).toMatchObject({ reason: "weak_password" });
    expect(await resetPassword(deps(), { token, password: "my-asha-login-2026" })).toMatchObject({ reason: "weak_password" });
  });

  it("rejects an expired link", async () => {
    const { token } = await setup();
    await ctx.sql`update auth_tokens set expires_at = now() - interval '1 minute'`;
    expect(await resetPassword(deps(), { token, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("rejects junk, empty and oversized tokens without touching the database", async () => {
    await setup();
    for (const bad of ["", "nope", "A".repeat(43), "A".repeat(500)]) {
      expect(await resetPassword(deps(), { token: bad, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
    }
  });

  it("rejects the link if the account was deactivated meanwhile", async () => {
    const { user, token } = await setup();
    await ctx.db.update(users).set({ isActive: false }).where(eq(users.id, user.id));
    expect(await resetPassword(deps(), { token, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("does not start a session by itself: the person signs in again", async () => {
    const { token } = await setup();
    const r = await resetPassword(deps(), { token, password: NEW_PASSWORD });
    expect(r.ok && r.session).toBeFalsy();
    expect(await ctx.db.select().from(sessions)).toHaveLength(0);
  });
});

describe("invitations", () => {
  async function invite(o: { active?: boolean } = {}) {
    const u = await makeUser(ctx.db, { email: "new@mnyala.test", name: "Juma Kimaro", password: null, active: o.active });
    const token = await issueToken(ctx.db, u.id, "invite", INVITE_TOKEN_HOURS * 3_600_000);
    return { user: u, token };
  }

  it("sets the first password and signs the person straight in", async () => {
    const { user, token } = await invite();
    const r = await acceptInvite(deps(), { token, password: NEW_PASSWORD });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.session?.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect((await login(deps(), { email: user.email, password: NEW_PASSWORD })).ok).toBe(true);
  });

  it("is single use and enforces the same password policy", async () => {
    const { token } = await invite();
    expect(await acceptInvite(deps(), { token, password: "password123" })).toMatchObject({ reason: "weak_password" });
    expect((await acceptInvite(deps(), { token, password: NEW_PASSWORD })).ok).toBe(true);
    expect(await acceptInvite(deps(), { token, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("an invite link cannot be used as a reset link, nor the reverse", async () => {
    const { user, token } = await invite();
    expect(await resetPassword(deps(), { token, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
    const resetToken = await issueToken(ctx.db, user.id, "password_reset", 60_000);
    expect(await acceptInvite(deps(), { token: resetToken, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("is refused for a deactivated account and after expiry", async () => {
    const off = await invite({ active: false });
    expect(await acceptInvite(deps(), { token: off.token, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
    await ctx.sql`delete from auth_tokens`;
    await ctx.sql`delete from users`;
    const fresh = await invite();
    await ctx.sql`update auth_tokens set expires_at = now() - interval '1 second'`;
    expect(await acceptInvite(deps(), { token: fresh.token, password: NEW_PASSWORD })).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("an invited person with no password cannot sign in before accepting", async () => {
    await invite();
    expect(await login(deps(), { email: "new@mnyala.test", password: GOOD_PASSWORD })).toEqual({ ok: false, reason: "invalid" });
  });
});
