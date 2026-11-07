import type { Db, Tx } from "@/server/db/client";
import { activityLogs } from "@/server/db/schema";

export type AuditEntry = {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  /** Never put passwords, tokens or message bodies here. */
  details?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
};

/** Pass the transaction handle when the audited change happens inside one, so both commit or neither does. */
export async function audit(db: Db | Tx, entry: AuditEntry): Promise<void> {
  await db.insert(activityLogs).values({
    userId: entry.userId ?? null,
    action: entry.action.slice(0, 80),
    entityType: entry.entityType?.slice(0, 40) ?? null,
    entityId: entry.entityId?.slice(0, 64) ?? null,
    details: entry.details ?? null,
    ip: entry.ip?.slice(0, 64) ?? null,
    userAgent: entry.userAgent?.slice(0, 300) ?? null,
  });
}
