import { and, count, desc, eq, ilike, inArray, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";
import type { Db, Tx } from "@/server/db/client";
import { messages, products } from "@/server/db/schema";

type Executor = Db | Tx;

export const MESSAGES_PAGE_SIZE = 20;
export const MESSAGE_TABS = ["all", "unread", "read", "replied"] as const;
export type MessageTab = (typeof MESSAGE_TABS)[number];
export type MessageStatus = "unread" | "read" | "replied";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only well-formed ids reach the database; anything else is dropped silently. */
export function cleanIds(values: unknown[]): string[] {
  return [...new Set(values.filter((v): v is string => typeof v === "string" && UUID.test(v)))];
}

/** Makes % and _ in a search term mean themselves, so searching "100%" does not match everything. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export function statusOf(m: { isRead: boolean; repliedAt: Date | null }): MessageStatus {
  return m.repliedAt ? "replied" : m.isRead ? "read" : "unread";
}

function tabCondition(tab: MessageTab): SQL | undefined {
  if (tab === "unread") return and(eq(messages.isRead, false), isNull(messages.repliedAt));
  if (tab === "read") return and(eq(messages.isRead, true), isNull(messages.repliedAt));
  if (tab === "replied") return isNotNull(messages.repliedAt);
  return undefined;
}

export async function listMessages(db: Executor, params: { tab: MessageTab; q: string; page: number }) {
  const term = params.q.trim();
  const search = term
    ? or(
        ilike(messages.fullName, `%${escapeLike(term)}%`),
        ilike(messages.email, `%${escapeLike(term)}%`),
        ilike(messages.phone, `%${escapeLike(term)}%`),
        ilike(messages.body, `%${escapeLike(term)}%`),
      )
    : undefined;
  const where = and(tabCondition(params.tab), search);

  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(messages).where(where);
  const pages = Math.max(1, Math.ceil(total / MESSAGES_PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page), pages);

  const rows = await db
    .select({
      id: messages.id, fullName: messages.fullName, email: messages.email, phone: messages.phone, subject: messages.subject,
      preview: sql<string>`left(${messages.body}, 110)`, isRead: messages.isRead, repliedAt: messages.repliedAt, createdAt: messages.createdAt,
    })
    .from(messages)
    .where(where)
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(MESSAGES_PAGE_SIZE)
    .offset((page - 1) * MESSAGES_PAGE_SIZE);
  return { rows, total, pages, page };
}

export async function messageCounts(db: Executor) {
  const [row] = await db
    .select({
      all: count(),
      unread: sql<number>`count(*) filter (where ${messages.isRead} = false and ${messages.repliedAt} is null)::int`,
      read: sql<number>`count(*) filter (where ${messages.isRead} = true and ${messages.repliedAt} is null)::int`,
      replied: sql<number>`count(*) filter (where ${messages.repliedAt} is not null)::int`,
    })
    .from(messages);
  return { all: Number(row?.all ?? 0), unread: Number(row?.unread ?? 0), read: Number(row?.read ?? 0), replied: Number(row?.replied ?? 0) };
}

export async function getMessage(db: Executor, id: string) {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select({
      id: messages.id, fullName: messages.fullName, email: messages.email, phone: messages.phone, subject: messages.subject, body: messages.body,
      isRead: messages.isRead, repliedAt: messages.repliedAt, createdAt: messages.createdAt, ip: messages.ip,
      productName: products.name, productSlug: products.slug,
    })
    .from(messages)
    .leftJoin(products, eq(products.id, messages.productId))
    .where(eq(messages.id, id));
  return row ?? null;
}

export async function setRead(db: Executor, ids: string[], read: boolean): Promise<number> {
  const clean = cleanIds(ids);
  if (clean.length === 0) return 0;
  const rows = await db.update(messages).set({ isRead: read }).where(inArray(messages.id, clean)).returning({ id: messages.id });
  return rows.length;
}

/** Replying implies the message has been read. Un-marking keeps it read. */
export async function setReplied(db: Executor, id: string, replied: boolean): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const rows = await db
    .update(messages)
    .set(replied ? { repliedAt: new Date(), isRead: true } : { repliedAt: null })
    .where(eq(messages.id, id))
    .returning({ id: messages.id });
  return rows.length > 0;
}

export async function deleteMessages(db: Executor, ids: string[]): Promise<number> {
  const clean = cleanIds(ids);
  if (clean.length === 0) return 0;
  const rows = await db.delete(messages).where(inArray(messages.id, clean)).returning({ id: messages.id });
  return rows.length;
}

export async function unreadCount(db: Executor): Promise<number> {
  const [row] = await db.select({ n: count() }).from(messages).where(and(eq(messages.isRead, false), isNull(messages.repliedAt)));
  return Number(row?.n ?? 0);
}
