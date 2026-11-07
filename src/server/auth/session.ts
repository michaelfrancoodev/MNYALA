import { and, desc, eq, gt, lte, ne, or } from "drizzle-orm";
import type { Db, Tx } from "@/server/db/client";
import { sessions, users } from "@/server/db/schema";
import type { Role } from "./roles";
import { generateToken, hashToken } from "./tokens";

type Executor = Db | Tx;

const DAY = 24 * 60 * 60 * 1000;
/** A session ends 14 days after sign-in, or after 7 days without use, whichever comes first. */
export const SESSION_MAX_AGE_MS = 14 * DAY;
export const SESSION_IDLE_MS = 7 * DAY;
/** `last_used_at` is refreshed at most this often, to avoid a write on every request. */
const TOUCH_EVERY_MS = 5 * 60 * 1000;

export type SessionUser = { id: string; email: string; name: string; role: Role };
export type SessionMeta = { ip?: string | null; userAgent?: string | null };

export async function createSession(db: Executor, userId: string, meta: SessionMeta = {}, now = new Date()) {
  const token = generateToken();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS);
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    lastUsedAt: now,
    ip: meta.ip?.slice(0, 64) ?? null,
    userAgent: meta.userAgent?.slice(0, 300) ?? null,
  });
  return { token, expiresAt };
}

/**
 * Looks the user up from the database on every call, so a deactivated or deleted user loses
 * access immediately, whatever the cookie says.
 */
export async function validateSession(db: Executor, token: string, now = new Date()) {
  if (!token || token.length > 128) return null;
  const [row] = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      lastUsedAt: sessions.lastUsedAt,
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, now), eq(users.isActive, true)));
  if (!row) return null;

  if (now.getTime() - row.lastUsedAt.getTime() > SESSION_IDLE_MS) {
    await db.delete(sessions).where(eq(sessions.id, row.sessionId));
    return null;
  }
  if (now.getTime() - row.lastUsedAt.getTime() > TOUCH_EVERY_MS) {
    await db.update(sessions).set({ lastUsedAt: now }).where(eq(sessions.id, row.sessionId));
  }
  const user: SessionUser = { id: row.id, email: row.email, name: row.name, role: row.role };
  return { user, sessionId: row.sessionId, expiresAt: row.expiresAt };
}

export async function revokeSession(db: Executor, token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

/** Signs a user out everywhere, optionally keeping the session they are using right now. */
export async function revokeUserSessions(db: Executor, userId: string, exceptSessionId?: string): Promise<void> {
  await db
    .delete(sessions)
    .where(exceptSessionId ? and(eq(sessions.userId, userId), ne(sessions.id, exceptSessionId)) : eq(sessions.userId, userId));
}

export async function revokeSessionById(db: Executor, userId: string, sessionId: string): Promise<void> {
  await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
}

export async function listUserSessions(db: Executor, userId: string, now = new Date()) {
  return db
    .select({ id: sessions.id, createdAt: sessions.createdAt, lastUsedAt: sessions.lastUsedAt, ip: sessions.ip, userAgent: sessions.userAgent })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, now)))
    .orderBy(desc(sessions.lastUsedAt));
}

export async function purgeExpiredSessions(db: Executor, now = new Date()): Promise<void> {
  await db.delete(sessions).where(or(lte(sessions.expiresAt, now), lte(sessions.lastUsedAt, new Date(now.getTime() - SESSION_IDLE_MS))));
}
