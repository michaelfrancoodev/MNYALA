import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { messages, products } from "@/server/db/schema";
import {
  MESSAGES_PAGE_SIZE, cleanIds, deleteMessages, escapeLike, getMessage, listMessages, messageCounts, setRead, setReplied, statusOf, unreadCount,
} from "@/server/services/messages-admin";
import { openTestDb, truncateAll } from "../helpers/db";

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

let n = 0;
async function add(o: Partial<typeof messages.$inferInsert> = {}) {
  n += 1;
  const [row] = await ctx.db
    .insert(messages)
    .values({ fullName: `Person ${n}`, email: `p${n}@example.com`, body: `Message body number ${n}`, createdAt: new Date(Date.UTC(2026, 0, 1, 0, n)), ...o })
    .returning();
  return row!;
}
const list = (o: Partial<Parameters<typeof listMessages>[1]> = {}) => listMessages(ctx.db, { tab: "all", q: "", page: 1, ...o });

describe("tabs", () => {
  it("separate new, read and replied messages exclusively, and count them", async () => {
    await add();
    await add({ isRead: true });
    await add({ isRead: true });
    await add({ isRead: true, repliedAt: new Date() });
    await add({ isRead: false, repliedAt: new Date() });
    expect(await messageCounts(ctx.db)).toEqual({ all: 5, unread: 1, read: 2, replied: 2 });
    expect((await list({ tab: "unread" })).total).toBe(1);
    expect((await list({ tab: "read" })).total).toBe(2);
    expect((await list({ tab: "replied" })).total).toBe(2);
    expect((await list({ tab: "all" })).total).toBe(5);
    expect(await unreadCount(ctx.db)).toBe(1);
  });

  it("statusOf agrees with the tabs", () => {
    expect(statusOf({ isRead: false, repliedAt: null })).toBe("unread");
    expect(statusOf({ isRead: true, repliedAt: null })).toBe("read");
    expect(statusOf({ isRead: true, repliedAt: new Date() })).toBe("replied");
    expect(statusOf({ isRead: false, repliedAt: new Date() })).toBe("replied");
  });
});

describe("search", () => {
  it("finds by name, email, phone and words in the message, ignoring case", async () => {
    await add({ fullName: "Neema Kimaro", email: "neema@example.com", phone: "+255712345678", body: "Nahitaji mkaa wa jumla" });
    await add({ fullName: "Juma Said", body: "Bei ya majiko?" });
    expect((await list({ q: "neema" })).total).toBe(1);
    expect((await list({ q: "KIMARO" })).total).toBe(1);
    expect((await list({ q: "neema@example" })).total).toBe(1);
    expect((await list({ q: "712345" })).total).toBe(1);
    expect((await list({ q: "majiko" })).total).toBe(1);
    expect((await list({ q: "hakuna-kitu-hiki" })).total).toBe(0);
  });

  it("treats % _ and \\ literally, so searching for them does not match everything", async () => {
    await add({ body: "Punguzo la 100% kwa wateja" });
    await add({ body: "Hakuna asilimia hapa" });
    await add({ body: "snake_case jina" });
    await add({ body: "snakeXcase jina" });
    expect((await list({ q: "100%" })).total).toBe(1);
    expect((await list({ q: "%" })).total).toBe(1);
    expect((await list({ q: "_" })).total).toBe(1);
    expect((await list({ q: "snake_case" })).total).toBe(1);
    expect((await list({ q: "\\" })).total).toBe(0);
    expect(escapeLike("a%b_c\\d")).toBe("a\\%b\\_c\\\\d");
  });

  it("is safe against SQL injection strings", async () => {
    await add();
    expect((await list({ q: "'; DROP TABLE messages; --" })).total).toBe(0);
    expect((await ctx.sql`select count(*)::int as n from messages`)[0]?.n).toBe(1);
  });

  it("combines with the tabs", async () => {
    await add({ body: "mkaa", isRead: true });
    await add({ body: "mkaa" });
    expect((await list({ q: "mkaa", tab: "unread" })).total).toBe(1);
  });
});

describe("paging", () => {
  it("returns 20 per page, newest first, and the right number of pages", async () => {
    for (let i = 0; i < 45; i++) await add();
    const p1 = await list({ page: 1 });
    expect(p1).toMatchObject({ total: 45, pages: 3, page: 1 });
    expect(p1.rows).toHaveLength(MESSAGES_PAGE_SIZE);
    expect(p1.rows[0]!.createdAt.getTime()).toBeGreaterThan(p1.rows[19]!.createdAt.getTime());
    expect((await list({ page: 3 })).rows).toHaveLength(5);
  });

  it("never lists the same message twice across pages", async () => {
    for (let i = 0; i < 45; i++) await add({ createdAt: new Date("2026-02-02T00:00:00Z") }); // identical timestamps
    const ids = [...(await list({ page: 1 })).rows, ...(await list({ page: 2 })).rows, ...(await list({ page: 3 })).rows].map((r) => r.id);
    expect(new Set(ids).size).toBe(45);
  });

  it("clamps a page number that is too big or too small instead of failing", async () => {
    for (let i = 0; i < 25; i++) await add();
    expect((await list({ page: 999 })).page).toBe(2);
    expect((await list({ page: 0 })).page).toBe(1);
    expect((await list({ page: -5 })).page).toBe(1);
  });

  it("an empty result has one page", async () => {
    expect(await list()).toMatchObject({ total: 0, pages: 1, page: 1, rows: [] });
  });

  it("previews only the start of a long message", async () => {
    await add({ body: "x".repeat(1900) });
    expect((await list()).rows[0]?.preview).toHaveLength(110);
  });
});

describe("changing messages", () => {
  it("marks messages read and unread, ignoring malformed ids", async () => {
    const a = await add();
    const b = await add();
    expect(await setRead(ctx.db, [a.id, b.id, "not-a-uuid", "'; drop --", ""], true)).toBe(2);
    expect((await messageCounts(ctx.db)).unread).toBe(0);
    expect(await setRead(ctx.db, [a.id], false)).toBe(1);
    expect((await messageCounts(ctx.db)).unread).toBe(1);
    expect(await setRead(ctx.db, [], true)).toBe(0);
  });

  it("replying marks it read; un-replying keeps it read", async () => {
    const a = await add();
    expect(await setReplied(ctx.db, a.id, true)).toBe(true);
    let [row] = await ctx.db.select().from(messages).where(eq(messages.id, a.id));
    expect(row?.isRead).toBe(true);
    expect(row?.repliedAt).not.toBeNull();
    await setReplied(ctx.db, a.id, false);
    [row] = await ctx.db.select().from(messages).where(eq(messages.id, a.id));
    expect(row?.repliedAt).toBeNull();
    expect(row?.isRead).toBe(true);
  });

  it("says so when the message does not exist", async () => {
    expect(await setReplied(ctx.db, "00000000-0000-4000-8000-000000000000", true)).toBe(false);
    expect(await setReplied(ctx.db, "nope", true)).toBe(false);
  });

  it("deletes exactly the chosen messages and reports how many", async () => {
    const a = await add();
    const b = await add();
    const keep = await add();
    expect(await deleteMessages(ctx.db, [a.id, b.id, a.id, "bad"])).toBe(2);
    const left = await ctx.db.select().from(messages);
    expect(left.map((m) => m.id)).toEqual([keep.id]);
    expect(await deleteMessages(ctx.db, [])).toBe(0);
  });

  it("cleanIds keeps only unique, well-formed uuids", () => {
    const id = "123e4567-e89b-42d3-a456-426614174000";
    expect(cleanIds([id, id.toUpperCase(), "x", 5, null, {}, `${id} `])).toEqual([id, id.toUpperCase()]);
  });
});

describe("getMessage", () => {
  it("returns the message with the product it was about", async () => {
    const [p] = await ctx.db.insert(products).values({ slug: "mkaa", name: "Mkaa Safi", category: "charcoal", summary: "s" }).returning();
    const m = await add({ productId: p!.id, phone: "+255758730108" });
    expect(await getMessage(ctx.db, m.id)).toMatchObject({ id: m.id, productName: "Mkaa Safi", productSlug: "mkaa", phone: "+255758730108" });
  });
  it("returns null for unknown or malformed ids (the page shows 404, not an error)", async () => {
    expect(await getMessage(ctx.db, "00000000-0000-4000-8000-000000000000")).toBeNull();
    for (const bad of ["abc", "", "../etc", "1; drop table messages"]) expect(await getMessage(ctx.db, bad)).toBeNull();
  });
});
