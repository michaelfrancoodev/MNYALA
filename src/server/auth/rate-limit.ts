import { eq, sql } from "drizzle-orm";
import type { Db, Tx } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";

type Executor = Db | Tx;

export type LimitConfig = { limit: number; windowSec: number };
export type LimitState = { count: number; retryAfterSec: number };

type Row = { count: number; retry_after: number };

/** Records one event and returns how many have happened in the current window. Atomic. */
async function hit(db: Executor, key: string, windowSec: number): Promise<LimitState> {
  const rows = await db.execute<Row>(sql`
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start <= now() - make_interval(secs => ${windowSec})
                   THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start <= now() - make_interval(secs => ${windowSec})
                          THEN now() ELSE rate_limits.window_start END
    RETURNING count,
      EXTRACT(EPOCH FROM (window_start + make_interval(secs => ${windowSec}) - now()))::float8 AS retry_after`);
  const row = rows[0];
  if (!row) throw new Error("rate limit upsert returned no row");
  return { count: Number(row.count), retryAfterSec: Math.max(1, Math.ceil(Number(row.retry_after))) };
}

/**
 * Counts every call. Use for endpoints where each request is an attempt (contact form,
 * password reset requests). `allowed` is false once the limit is exceeded in the window.
 */
export async function consume(db: Executor, key: string, cfg: LimitConfig) {
  const state = await hit(db, key, cfg.windowSec);
  return { allowed: state.count <= cfg.limit, remaining: Math.max(0, cfg.limit - state.count), retryAfterSec: state.retryAfterSec };
}

/** Records a failed attempt (for example a wrong password). */
export async function recordFailure(db: Executor, key: string, cfg: LimitConfig): Promise<void> {
  await hit(db, key, cfg.windowSec);
}

/** Read-only: have there already been `limit` failures in the current window? */
export async function isLocked(db: Executor, key: string, cfg: LimitConfig) {
  const rows = await db.execute<Row>(sql`
    SELECT count,
      EXTRACT(EPOCH FROM (window_start + make_interval(secs => ${cfg.windowSec}) - now()))::float8 AS retry_after
    FROM rate_limits
    WHERE key = ${key} AND window_start > now() - make_interval(secs => ${cfg.windowSec})`);
  const row = rows[0];
  if (!row || Number(row.count) < cfg.limit) return { locked: false as const, retryAfterSec: 0 };
  return { locked: true as const, retryAfterSec: Math.max(1, Math.ceil(Number(row.retry_after))) };
}

export async function resetLimit(db: Executor, key: string): Promise<void> {
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
}

/** Housekeeping: drop windows that ended long ago. */
export async function purgeRateLimits(db: Executor, olderThanSec = 86_400): Promise<void> {
  await db.execute(sql`DELETE FROM rate_limits WHERE window_start < now() - make_interval(secs => ${olderThanSec})`);
}
