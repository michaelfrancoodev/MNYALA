import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import { authTokens, sessions, users } from "@/server/db/schema";
import { getLogger } from "@/server/logger";
import { ipKey } from "@/server/request";
import { audit } from "./audit";
import type { Mailer } from "./mail";
import { passwordChangedEmail, passwordResetEmail } from "./mail-templates";
import { consume, isLocked, recordFailure, resetLimit, type LimitConfig } from "@/server/auth/rate-limit";
import {
  dummyHash, hashPassword, needsRehash, validatePassword, verifyPassword,
} from "@/server/auth/password";
import {
  createSession, purgeExpiredSessions, revokeUserSessions, type SessionMeta, type SessionUser,
} from "@/server/auth/session";
import { generateToken, hashToken } from "@/server/auth/tokens";


export type AuthDeps = { db: Db; mailer: Mailer; appUrl: string };
type Meta = SessionMeta;

export const LIMITS = {
  loginEmail: { limit: 5, windowSec: 15 * 60 } satisfies LimitConfig,
  loginIp: { limit: 20, windowSec: 15 * 60 } satisfies LimitConfig,
  resetEmail: { limit: 3, windowSec: 60 * 60 } satisfies LimitConfig,
  resetIp: { limit: 10, windowSec: 60 * 60 } satisfies LimitConfig,
  changePassword: { limit: 5, windowSec: 15 * 60 } satisfies LimitConfig,
};

export const RESET_TOKEN_MINUTES = 30;
export const INVITE_TOKEN_HOURS = 72;
/** Nothing legitimate is longer; this stops someone making us hash megabytes. */
const MAX_PASSWORD_INPUT = 1024;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findUserByEmail(db: Db, email: string) {
  const [user] = await db.select().from(users).where(sql`lower(${users.email}) = ${normalizeEmail(email)}`);
  return user ?? null;
}

/** Sends mail without ever letting a mail failure break the flow or leak into the response. */
function sendQuietly(mailer: Mailer, to: string, content: { subject: string; text: string; html: string }): Promise<void> {
  return mailer.send({ to, ...content }).catch((error: unknown) => {
    getLogger().error({ err: error instanceof Error ? error.message : "unknown", subject: content.subject }, "email could not be sent");
  });
}

/* ------------------------------------------------------------------ sign in */

export type LoginResult =
  | { ok: true; token: string; expiresAt: Date; user: SessionUser }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "rate_limited"; retryAfterSec: number };

/**
 * One generic failure for every cause (unknown email, wrong password, deactivated account, no password yet),
 * the same work is done in every case, and failures are rate limited per email and per address.
 * Password strength is NOT checked here: a password that was accepted when it was set always works.
 */
export async function login(
  deps: AuthDeps,
  input: { email: string; password: string; ip?: string | null; userAgent?: string | null },
): Promise<LoginResult> {
  const { db } = deps;
  const email = normalizeEmail(input.email);
  const emailKey = `login:email:${email}`;
  const ipKeyName = input.ip ? `login:ip:${ipKey(input.ip)}` : null;
  const meta: Meta = { ip: input.ip ?? null, userAgent: input.userAgent ?? null };

  const emailLock = await isLocked(db, emailKey, LIMITS.loginEmail);
  const ipLock = ipKeyName ? await isLocked(db, ipKeyName, LIMITS.loginIp) : { locked: false as const, retryAfterSec: 0 };
  if (emailLock.locked || ipLock.locked) {
    await audit(db, { action: "user.login_blocked", details: { reason: "rate_limited" }, ...meta });
    return { ok: false, reason: "rate_limited", retryAfterSec: Math.max(emailLock.retryAfterSec, ipLock.retryAfterSec) };
  }

  const user = input.password.length <= MAX_PASSWORD_INPUT ? await findUserByEmail(db, email) : null;
  const storedHash = user?.passwordHash ?? (await dummyHash());
  const passwordOk = input.password.length <= MAX_PASSWORD_INPUT && (await verifyPassword(storedHash, input.password));

  if (!user || !user.passwordHash || !user.isActive || !passwordOk) {
    await recordFailure(db, emailKey, LIMITS.loginEmail);
    if (ipKeyName) await recordFailure(db, ipKeyName, LIMITS.loginIp);
    await audit(db, { userId: user?.id ?? null, action: "user.login_failed", ...meta });
    return { ok: false, reason: "invalid" };
  }

  if (needsRehash(user.passwordHash)) {
    await db.update(users).set({ passwordHash: await hashPassword(input.password) }).where(eq(users.id, user.id));
  }
  await resetLimit(db, emailKey);
  await purgeExpiredSessions(db);
  const session = await createSession(db, user.id, meta);
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await audit(db, { userId: user.id, action: "user.login", entityType: "user", entityId: user.id, ...meta });
  return { ok: true, ...session, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

/* ------------------------------------------------------- one-time tokens */

type Purpose = "password_reset" | "invite";

/** The valid, unused, unexpired token for an active user, or null. Does not consume it. */
export async function findValidToken(db: Db, token: string, purpose: Purpose, now = new Date()) {
  if (!token || token.length > 128) return null;
  const [row] = await db
    .select({ tokenId: authTokens.id, user: users })
    .from(authTokens)
    .innerJoin(users, eq(users.id, authTokens.userId))
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(token)),
        eq(authTokens.purpose, purpose),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, now),
        eq(users.isActive, true),
      ),
    );
  return row ?? null;
}

export async function issueToken(db: Db, userId: string, purpose: Purpose, ttlMs: number, now = new Date()): Promise<string> {
  // Only the newest link works: retire any older unused ones.
  await db
    .update(authTokens)
    .set({ usedAt: now })
    .where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)));
  const token = generateToken();
  await db.insert(authTokens).values({ userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(now.getTime() + ttlMs) });
  return token;
}

/* ------------------------------------------------------ forgot / reset */

/**
 * Always looks the same to the caller whether or not the email exists or the request was throttled.
 * The work happens in `done` so the response time does not reveal which case it was.
 */
export function requestPasswordReset(deps: AuthDeps, input: { email: string; ip?: string | null }): { done: Promise<void> } {
  const { db, mailer, appUrl } = deps;
  const email = normalizeEmail(input.email);

  const done = (async () => {
    const emailLimit = await consume(db, `reset:email:${email}`, LIMITS.resetEmail);
    const ipLimit = input.ip ? await consume(db, `reset:ip:${ipKey(input.ip)}`, LIMITS.resetIp) : { allowed: true };
    if (!emailLimit.allowed || !ipLimit.allowed) return;

    const user = await findUserByEmail(db, email);
    if (!user || !user.isActive) return;

    const token = await issueToken(db, user.id, "password_reset", RESET_TOKEN_MINUTES * 60_000);
    await audit(db, { userId: user.id, action: "user.password_reset_requested", entityType: "user", entityId: user.id, ip: input.ip ?? null });
    const link = `${appUrl.replace(/\/$/, "")}/admin/reset-password/${token}`;
    await sendQuietly(mailer, user.email, passwordResetEmail({ name: user.name, link, minutes: RESET_TOKEN_MINUTES }));
  })().catch((error: unknown) => {
    getLogger().error({ err: error instanceof Error ? error.message : "unknown" }, "password reset request failed");
  });

  return { done };
}

export type SetPasswordResult =
  | { ok: true; user: SessionUser; session?: { token: string; expiresAt: Date } }
  | { ok: false; reason: "invalid_token" }
  | { ok: false; reason: "weak_password"; problems: string[] };

async function consumeTokenAndSetPassword(
  deps: AuthDeps,
  input: { token: string; password: string; purpose: Purpose; meta: Meta; startSession: boolean },
): Promise<SetPasswordResult> {
  const { db, mailer } = deps;
  const found = await findValidToken(db, input.token, input.purpose);
  if (!found) return { ok: false, reason: "invalid_token" };

  const problems = validatePassword(input.password, { email: found.user.email, name: found.user.name });
  if (problems.length > 0) return { ok: false, reason: "weak_password", problems };

  const passwordHash = await hashPassword(input.password);
  const session = await db.transaction(async (tx) => {
    // Single use even under two simultaneous submissions: only one UPDATE can flip usedAt.
    const claimed = await tx
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(authTokens.id, found.tokenId), isNull(authTokens.usedAt)))
      .returning({ id: authTokens.id });
    if (claimed.length === 0) return null;

    await tx.update(users).set({ passwordHash }).where(eq(users.id, found.user.id));
    await tx.update(authTokens).set({ usedAt: new Date() }).where(and(eq(authTokens.userId, found.user.id), isNull(authTokens.usedAt)));
    await revokeUserSessions(tx, found.user.id);
    await audit(tx, {
      userId: found.user.id,
      action: input.purpose === "invite" ? "user.invite_accepted" : "user.password_reset",
      entityType: "user",
      entityId: found.user.id,
      ...input.meta,
    });
    if (!input.startSession) return { token: "", expiresAt: new Date(0) };
    return createSession(tx, found.user.id, input.meta);
  });
  if (!session) return { ok: false, reason: "invalid_token" };

  if (input.purpose === "password_reset") void sendQuietly(mailer, found.user.email, passwordChangedEmail({ name: found.user.name }));
  const user: SessionUser = { id: found.user.id, email: found.user.email, name: found.user.name, role: found.user.role };
  return input.startSession ? { ok: true, user, session } : { ok: true, user };
}

/** After a reset the user signs in again with the new password; every old session is gone. */
export function resetPassword(deps: AuthDeps, input: { token: string; password: string } & Meta) {
  return consumeTokenAndSetPassword(deps, {
    token: input.token,
    password: input.password,
    purpose: "password_reset",
    meta: { ip: input.ip, userAgent: input.userAgent },
    startSession: false,
  });
}

/** Accepting an invite sets the first password and signs the person straight in. */
export function acceptInvite(deps: AuthDeps, input: { token: string; password: string } & Meta) {
  return consumeTokenAndSetPassword(deps, {
    token: input.token,
    password: input.password,
    purpose: "invite",
    meta: { ip: input.ip, userAgent: input.userAgent },
    startSession: true,
  });
}

/* -------------------------------------------------------- change password */

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: "wrong_current" }
  | { ok: false; reason: "weak_password"; problems: string[] }
  | { ok: false; reason: "rate_limited"; retryAfterSec: number };

export async function changePassword(
  deps: AuthDeps,
  input: { userId: string; currentSessionId: string; currentPassword: string; newPassword: string } & Meta,
): Promise<ChangePasswordResult> {
  const { db, mailer } = deps;
  const key = `change-password:user:${input.userId}`;

  const lock = await isLocked(db, key, LIMITS.changePassword);
  if (lock.locked) return { ok: false, reason: "rate_limited", retryAfterSec: lock.retryAfterSec };

  const [user] = await db.select().from(users).where(eq(users.id, input.userId));
  if (!user?.passwordHash) return { ok: false, reason: "wrong_current" };

  const currentOk = input.currentPassword.length <= MAX_PASSWORD_INPUT && (await verifyPassword(user.passwordHash, input.currentPassword));
  if (!currentOk) {
    await recordFailure(db, key, LIMITS.changePassword);
    await audit(db, { userId: user.id, action: "user.password_change_failed", ip: input.ip, userAgent: input.userAgent });
    return { ok: false, reason: "wrong_current" };
  }

  const problems = validatePassword(input.newPassword, { email: user.email, name: user.name });
  if (problems.length > 0) return { ok: false, reason: "weak_password", problems };

  const passwordHash = await hashPassword(input.newPassword);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, user.id));
    await revokeUserSessions(tx, user.id, input.currentSessionId);
    await audit(tx, { userId: user.id, action: "user.password_changed", entityType: "user", entityId: user.id, ip: input.ip, userAgent: input.userAgent });
  });
  await resetLimit(db, key);
  void sendQuietly(mailer, user.email, passwordChangedEmail({ name: user.name }));
  return { ok: true };
}

/* -------------------------------------------------- first super admin (CLI) */

export type CreateSuperAdminResult = { created: true; id: string } | { created: false; reason: "exists" | "no_such_user" };

/**
 * There is no public sign-up. The first super admin is created here, from the command line.
 * Refuses when a super admin already exists, unless `reset` is set, which only sets a new password
 * for an existing super admin with that email.
 */
export async function createSuperAdmin(
  db: Db,
  input: { email: string; name: string; password: string; reset?: boolean },
): Promise<CreateSuperAdminResult> {
  const email = normalizeEmail(input.email);
  const problems = validatePassword(input.password, { email, name: input.name });
  if (problems.length > 0) throw new Error(problems.join(" "));
  const passwordHash = await hashPassword(input.password);

  const [existingAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "super_admin")).limit(1);

  if (input.reset) {
    const [target] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "super_admin"), sql`lower(${users.email}) = ${email}`));
    if (!target) return { created: false, reason: "no_such_user" };
    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash, isActive: true }).where(eq(users.id, target.id));
      await tx.delete(sessions).where(eq(sessions.userId, target.id));
      await audit(tx, { userId: target.id, action: "user.password_reset_cli", entityType: "user", entityId: target.id });
    });
    return { created: true, id: target.id };
  }

  if (existingAdmin) return { created: false, reason: "exists" };
  const [row] = await db
    .insert(users)
    .values({ email, name: input.name.trim(), passwordHash, role: "super_admin", isActive: true })
    .returning({ id: users.id });
  if (!row) throw new Error("Could not create the super admin");
  await audit(db, { userId: row.id, action: "user.super_admin_created", entityType: "user", entityId: row.id });
  return { created: true, id: row.id };
}
