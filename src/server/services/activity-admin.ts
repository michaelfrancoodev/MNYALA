import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import { activityLogs, users } from "@/server/db/schema";

export const ACTIVITY_PAGE_SIZE = 50;

export async function listActivityLogsAdmin(
  db: Db,
  options: { q?: string; userId?: string; page?: number; pageSize?: number } = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? ACTIVITY_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const q = options.q?.trim();
  const userId = options.userId?.trim();

  const conditions = [];
  if (userId) conditions.push(eq(activityLogs.userId, userId));
  if (q) {
    conditions.push(
      or(
        ilike(activityLogs.action, `%${q}%`),
        ilike(activityLogs.entityType, `%${q}%`),
        ilike(activityLogs.entityId, `%${q}%`),
        ilike(users.name, `%${q}%`),
        ilike(users.email, `%${q}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.userId))
    .where(whereClause);

  const total = countResult?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const items = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      details: activityLogs.details,
      ip: activityLogs.ip,
      userAgent: activityLogs.userAgent,
      createdAt: activityLogs.createdAt,
      userId: activityLogs.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.userId))
    .where(whereClause)
    .orderBy(desc(activityLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { items, total, page, pages };
}
