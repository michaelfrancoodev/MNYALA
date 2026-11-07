import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "@/server/db/client";
import { activityLogs, messages, products } from "@/server/db/schema";
import { Browser, findForm, textOf } from "../helpers/browser";
import { resetDatabase, testDatabaseUrl } from "../helpers/db";
import { startServer, type RunningServer } from "../helpers/server";
import { GOOD_PASSWORD, makeUser } from "../helpers/users";

let server: RunningServer;
let db: ReturnType<typeof createDb>;
let tmp: string;
let ipN = 40;

const as = async (email: string) => {
  const b = new Browser(server.base, { "x-forwarded-for": `203.0.113.${++ipN}` });
  const res = await b.submit("/admin/login", "email", { email, password: GOOD_PASSWORD });
  expect(res.status, `sign in as ${email}`).toBe(303);
  return b;
};
const STAFF = "staff@mnyala.test", ADMIN = "admin@mnyala.test", OWNER = "owner@mnyala.test";

let seq = 0;
async function add(o: Partial<typeof messages.$inferInsert> = {}) {
  seq += 1;
  const [row] = await db.db
    .insert(messages)
    .values({ fullName: `Mteja ${seq}`, email: `m${seq}@example.com`, body: `Habari, ujumbe namba ${seq}.`, subject: "mkaa", createdAt: new Date(Date.UTC(2026, 5, 1, 0, seq)), ...o })
    .returning();
  return row!;
}
async function reset() {
  await db.sql`truncate table messages, activity_logs restart identity cascade`;
  seq = 0;
}

beforeAll(async () => {
  await resetDatabase();
  db = createDb(testDatabaseUrl(), { max: 4 });
  await makeUser(db.db, { email: STAFF, name: "Neema Staff", role: "staff" });
  await makeUser(db.db, { email: ADMIN, name: "Asha Admin", role: "admin" });
  await makeUser(db.db, { email: OWNER, name: "Owner Mnyala", role: "super_admin" });
  tmp = await mkdtemp(path.join(os.tmpdir(), "mnyala-e2e-msg-"));
  server = await startServer({ MAIL_HOST: "127.0.0.1", STORAGE_DIR: tmp });
});
afterAll(async () => {
  await server?.stop();
  await db?.close();
  if (tmp) await rm(tmp, { recursive: true, force: true });
});

const rowsOn = (html: string) => (html.match(/aria-label="Select message from /g) ?? []).length;
const idsOn = (html: string) => [...html.matchAll(/name="ids" value="([0-9a-f-]{36})"/g)].map((m) => m[1]!);

describe("getting to the messages", () => {
  it("sends a signed-out visitor to sign in, then straight back to the messages (deep link kept)", async () => {
    await reset();
    const b = new Browser(server.base, { "x-forwarded-for": "203.0.113.30" });
    const res = await b.get("/admin/messages?tab=unread");
    const loc = new URL(res.location!, server.base);
    expect(loc.pathname).toBe("/admin/login");
    expect(loc.searchParams.get("next")).toBe("/admin/messages?tab=unread");
    const signedIn = await b.submit(res.location!, "email", { email: STAFF, password: GOOD_PASSWORD });
    expect(signedIn.status).toBe(303);
    expect(signedIn.location).toBe("/admin/messages?tab=unread");
  });
});

describe("the list", () => {
  it("is empty and says so kindly when nothing has arrived", async () => {
    await reset();
    const page = await (await as(STAFF)).get("/admin/messages");
    expect(page.status).toBe(200);
    expect(textOf(page.body)).toContain("No messages yet");
  });

  it("shows 20 per page, newest first, with paging, status, and an unread count in the menu", async () => {
    await reset();
    for (let i = 0; i < 25; i++) await add({ isRead: i % 5 === 0 });
    const b = await as(STAFF);
    const p1 = await b.get("/admin/messages");
    expect(rowsOn(p1.body)).toBe(20);
    expect(textOf(p1.body)).toContain("Page 1 of 2");
    expect(textOf(p1.body)).toContain("Showing 1 to 20 of 25");
    expect(textOf(p1.body)).toMatch(/Messages\s*20 waiting/); // 20 of 25 are unread
    expect(textOf(p1.body)).toContain("Mteja 25"); // the newest
    const p2 = await b.get("/admin/messages?page=2");
    expect(rowsOn(p2.body)).toBe(5);
    expect(new Set([...idsOn(p1.body), ...idsOn(p2.body)]).size).toBe(25);
    expect(p1.body).toContain('rel="next"');
    expect(p2.body).toContain('rel="prev"');
  });

  it("filters by tab and survives nonsense in the address", async () => {
    await reset();
    await add({ isRead: false });
    await add({ isRead: true });
    await add({ isRead: true, repliedAt: new Date() });
    const b = await as(STAFF);
    expect(rowsOn((await b.get("/admin/messages?tab=unread")).body)).toBe(1);
    expect(rowsOn((await b.get("/admin/messages?tab=read")).body)).toBe(1);
    expect(rowsOn((await b.get("/admin/messages?tab=replied")).body)).toBe(1);
    for (const bad of ["?tab=hack", "?page=abc", "?page=-1", "?page=99999999999", "?tab[]=x", "?q=" + "z".repeat(5000), "?page=1.5"]) {
      const res = await b.get(`/admin/messages${bad}`);
      expect(res.status, bad).toBe(200);
    }
    expect(rowsOn((await b.get("/admin/messages?page=999")).body)).toBe(3);
  });

  it("searches, and a search with no hits says what to do", async () => {
    await reset();
    await add({ fullName: "Neema Kimaro", body: "Nahitaji majiko mawili" });
    await add({ fullName: "Juma Said", body: "Bei ya mbegu?" });
    const b = await as(STAFF);
    expect(rowsOn((await b.get("/admin/messages?q=kimaro")).body)).toBe(1);
    expect(rowsOn((await b.get("/admin/messages?q=mbegu")).body)).toBe(1);
    const none = await b.get("/admin/messages?q=hakuna");
    expect(textOf(none.body)).toContain("Nothing matches");
    expect(none.body).toContain('href="/admin/messages"');
    expect(rowsOn((await b.get("/admin/messages?q=%25")).body)).toBe(0);
  });

  it("shows hostile text from a visitor as plain text, never as markup", async () => {
    await reset();
    await add({ fullName: '<img src=x onerror="alert(1)">', body: "<script>alert('xss')</script> habari" });
    const b = await as(STAFF);
    const list = await b.get("/admin/messages");
    expect(list.body).not.toContain("<img src=x");
    expect(list.body).not.toContain("<script>alert");
    expect(list.body).toContain("&lt;img src=x");
    const id = idsOn(list.body)[0]!;
    const detail = await b.get(`/admin/messages/${id}`);
    expect(detail.body).not.toContain("<script>alert");
    expect(detail.body).toContain("&lt;script&gt;alert");
  });

  it("is built to work on a phone: a labelled table that becomes stacked cards, every control labelled", async () => {
    await reset();
    await add();
    const { body } = await (await as(STAFF)).get("/admin/messages");
    expect(body).toContain('<table aria-label="Messages"');
    expect(body).toMatch(/data-label="From"/);
    expect(body).toMatch(/data-label="Received"/);
    expect(body).toMatch(/aria-label="Select all on this page"/);
    expect(body).toMatch(/aria-label="Select message from Mteja 1"/);
    expect(body).toContain('aria-label="Filter messages"');
    expect(body).toContain('role="search"');
  });
});

describe("one message", () => {
  it("shows everything an admin needs, with correct reply links", async () => {
    await reset();
    const [p] = await db.db.insert(products).values({ slug: "majiko", name: "Majiko ya Ufanisi", category: "stove", summary: "s" }).returning();
    const m = await add({ fullName: "Asha Mwakyusa", email: "asha@example.com", phone: "+255758730108", subject: "majiko", body: "Habari,\nnahitaji jiko.\n\nAsante.", productId: p!.id });
    const b = await as(STAFF);
    const { status, body } = await b.get(`/admin/messages/${m.id}`);
    expect(status).toBe(200);
    expect(textOf(body)).toContain("Nahitaji majiko");
    expect(textOf(body)).toContain("From Asha Mwakyusa");
    expect(textOf(body)).toContain("Majiko ya Ufanisi");
    expect(body).toContain("whitespace-pre-wrap");
    expect(body).toContain('href="mailto:asha@example.com"');
    expect(body).toContain('href="mailto:asha@example.com?subject=Re%3A%20Nahitaji%20majiko"');
    expect(body).toContain('href="tel:+255758730108"');
    expect(body).toContain('href="https://wa.me/255758730108?text=');
  });

  it("is a 404 for an unknown or malformed id, never a crash", async () => {
    const b = await as(STAFF);
    for (const id of ["00000000-0000-4000-8000-000000000000", "abc", "1%27%20OR%201=1", "..%2f..%2fetc"]) {
      expect((await b.get(`/admin/messages/${id}`)).status, id).toBe(404);
    }
  });

  it("can be marked replied and not replied, and replying counts as reading", async () => {
    await reset();
    const m = await add();
    const b = await as(STAFF);
    const done = await b.submit(`/admin/messages/${m.id}`, "replied", { replied: "1" });
    expect(done.status).toBe(303);
    expect(done.location).toBe(`/admin/messages/${m.id}?notice=replied`);
    let [row] = await db.db.select().from(messages).where(eq(messages.id, m.id));
    expect(row?.repliedAt).not.toBeNull();
    expect(row?.isRead).toBe(true);
    expect(textOf((await b.visit(done.location!)).body)).toContain("Marked as replied.");
    await b.submit(`/admin/messages/${m.id}`, "replied", { replied: "0" });
    [row] = await db.db.select().from(messages).where(eq(messages.id, m.id));
    expect(row?.repliedAt).toBeNull();
  });
});

describe("bulk actions", () => {
  it("marks the ticked messages read, tells the person, and the menu count drops", async () => {
    await reset();
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) ids.push((await add()).id);
    const b = await as(STAFF);
    const res = await b.submit("/admin/messages", "back", { ids: [ids[0]!, ids[1]!], op: "read" });
    expect(res.status).toBe(303);
    expect(res.location).toBe("/admin/messages?notice=marked-read");
    const after = await b.visit(res.location!);
    expect(textOf(after.body)).toContain("Marked as read.");
    expect(textOf(after.body)).toMatch(/Messages\s*2 waiting/);
    const rows = await db.db.select().from(messages);
    expect(rows.filter((r) => r.isRead)).toHaveLength(2);
    const back = await b.submit("/admin/messages", "back", { ids: [ids[0]!], op: "unread" });
    expect(back.location).toBe("/admin/messages?notice=marked-unread");
  });

  it("asks for a selection instead of doing nothing silently", async () => {
    await reset();
    await add();
    const res = await (await as(STAFF)).submit("/admin/messages", "back", { op: "read" });
    expect(res.location).toBe("/admin/messages?notice=none-selected");
  });

  it("ignores junk ids and never follows a hostile 'back' address", async () => {
    await reset();
    const m = await add();
    const b = await as(STAFF);
    const res = await b.submit("/admin/messages", "back", { ids: [m.id, "'; drop table messages; --"], op: "read", back: "https://evil.test/x" });
    expect(res.location).toBe("/admin/messages?notice=marked-read");
    const res2 = await b.submit("/admin/messages", "back", { ids: [m.id], op: "read", back: "/admin/messages/../../x" });
    expect(res2.location).not.toContain("..");
    expect(new URL(res2.location!, server.base).pathname).toBe("/admin/messages");
    expect(await db.db.select().from(messages)).toHaveLength(1);
  });
});

describe("who may delete (enforced on the server, not only hidden in the page)", () => {
  async function deleteFieldsFromAdminDetail(id: string) {
    const adminPage = await (await as(ADMIN)).get(`/admin/messages/${id}`);
    return findForm(adminPage.body, "ids");
  }

  it("shows no delete controls to staff, and shows them to admins", async () => {
    await reset();
    const m = await add();
    const staffList = (await (await as(STAFF)).get("/admin/messages")).body;
    const staffDetail = (await (await as(STAFF)).get(`/admin/messages/${m.id}`)).body;
    for (const html of [staffList, staffDetail]) expect(textOf(html)).not.toMatch(/Delete/);
    const adminList = textOf((await (await as(ADMIN)).get("/admin/messages")).body);
    expect(adminList).toContain("Delete ticked");
    expect(textOf((await (await as(ADMIN)).get(`/admin/messages/${m.id}`)).body)).toContain("Delete this message");
  });

  it("refuses staff who replay an admin's delete form, and the message survives", async () => {
    await reset();
    const m = await add();
    const fields = await deleteFieldsFromAdminDetail(m.id);
    const staff = await as(STAFF);
    const res = await staff.postFields(`/admin/messages/${m.id}`, fields, {});
    expect(res.status).toBe(303);
    expect(new URL(res.location!, server.base).pathname).toBe("/admin/forbidden");
    expect(await db.db.select().from(messages)).toHaveLength(1);
  });

  it("refuses someone who is not signed in at all", async () => {
    await reset();
    const m = await add();
    const fields = await deleteFieldsFromAdminDetail(m.id);
    const anon = new Browser(server.base, { "x-forwarded-for": "203.0.113.31" });
    const res = await anon.postFields(`/admin/messages/${m.id}`, fields, {});
    expect(new URL(res.location!, server.base).pathname).toBe("/admin/login");
    expect(await db.db.select().from(messages)).toHaveLength(1);
  });

  it("lets an admin delete one message, records who did it without keeping the text, and both roles above staff can", async () => {
    await reset();
    const m = await add({ body: "Siri ya mteja ambayo haipaswi kuingia kwenye kumbukumbu." });
    const fields = await deleteFieldsFromAdminDetail(m.id);
    const admin = await as(ADMIN);
    const res = await admin.postFields(`/admin/messages/${m.id}`, fields, {});
    expect(res.status).toBe(303);
    expect(res.location).toBe("/admin/messages?notice=deleted");
    expect(await db.db.select().from(messages)).toHaveLength(0);
    expect(textOf((await admin.visit(res.location!)).body)).toContain("Messages deleted.");
    const logs = await db.db.select().from(activityLogs).where(eq(activityLogs.action, "message.deleted"));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.details).toEqual({ count: 1 });
    expect(JSON.stringify(logs)).not.toContain("Siri ya mteja");

    const m2 = await add();
    const f2 = await deleteFieldsFromAdminDetail(m2.id);
    expect((await (await as(OWNER)).postFields(`/admin/messages/${m2.id}`, f2, {})).location).toBe("/admin/messages?notice=deleted");
  });

  it("bulk delete: staff are refused, an admin deletes only the ticked messages", async () => {
    await reset();
    const keep = await add();
    const a = await add();
    const c = await add();
    const adminPage = (await (await as(ADMIN)).get("/admin/messages")).body;
    const deleteId = /form="bulk" name="(\$ACTION_ID_[a-f0-9]+)"/.exec(adminPage)![1]!;
    const body = (ids: string[]) => ({ [deleteId]: "", ids, back: "/admin/messages" });

    const staff = await as(STAFF);
    const refused = await staff.postFields("/admin/messages", [], body([a.id, c.id]));
    expect(new URL(refused.location!, server.base).pathname).toBe("/admin/forbidden");
    expect(await db.db.select().from(messages)).toHaveLength(3);

    const done = await (await as(ADMIN)).postFields("/admin/messages", [], body([a.id, c.id]));
    expect(done.location).toBe("/admin/messages?notice=deleted");
    expect((await db.db.select().from(messages)).map((r) => r.id)).toEqual([keep.id]);
    const [log] = await db.db.select().from(activityLogs).where(eq(activityLogs.action, "message.deleted"));
    expect(log?.details).toEqual({ count: 2 });
  });
});

describe("the sign-in is required for every message address", () => {
  it("redirects every messages page and action for a signed-out visitor", async () => {
    await reset();
    const m = await add();
    const anon = new Browser(server.base, { "x-forwarded-for": "203.0.113.32" });
    for (const p of ["/admin/messages", `/admin/messages/${m.id}`, "/admin/messages?q=a"]) {
      const res = await anon.get(p);
      expect(new URL(res.location!, server.base).pathname, p).toBe("/admin/login");
      expect(res.body, p).not.toContain("Mteja");
    }
  });
});
