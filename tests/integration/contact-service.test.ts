import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validators/contact";
import { messages } from "@/server/db/schema";
import { products } from "@/server/db/schema";
import { CONTACT_LIMITS, submitContactMessage } from "@/server/services/contact-service";
import { MemoryMailer } from "@/server/services/mail";
import { openTestDb, truncateAll } from "../helpers/db";

let ctx: Awaited<ReturnType<typeof openTestDb>>;
let mailer: MemoryMailer;
const deps = (notifyEmail?: string) => ({ db: ctx.db, mailer, appUrl: "https://mnyala.test", notifyEmail });
const input = (o: Record<string, unknown> = {}) =>
  contactSchema.parse({ fullName: "Asha Mwakyusa", email: "Asha@Example.com", phone: "0758 730 108", subject: "mkaa", message: "Habari, nahitaji mkaa wa kilo 30.", ...o });

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

describe("submitContactMessage", () => {
  it("saves the message with a normalised email and phone, unread and unreplied", async () => {
    const r = await submitContactMessage(deps(), input(), { ip: "203.0.113.5" });
    expect(r.ok).toBe(true);
    const [m] = await ctx.db.select().from(messages);
    expect(m).toMatchObject({
      fullName: "Asha Mwakyusa", email: "asha@example.com", phone: "+255758730108", subject: "mkaa",
      isRead: false, repliedAt: null, ip: "203.0.113.5", productId: null,
    });
  });

  it("links a message to the product it came from, and ignores an unknown product", async () => {
    const [p] = await ctx.db.insert(products).values({ slug: "mkaa-safi", name: "Mkaa", category: "charcoal", summary: "s" }).returning();
    await submitContactMessage(deps(), input({ product: "mkaa-safi" }), { ip: "1.1.1.1" });
    await submitContactMessage(deps(), input({ product: "does-not-exist", email: "b@example.com" }), { ip: "1.1.1.2" });
    const rows = await ctx.db.select().from(messages).orderBy(messages.createdAt);
    expect(rows[0]?.productId).toBe(p!.id);
    expect(rows[1]?.productId).toBeNull();
  });

  it("stores markup as plain text and keeps the full 2000 characters", async () => {
    const body = "<img src=x onerror=alert(1)> " + "a".repeat(1900);
    await submitContactMessage(deps(), input({ message: body }), { ip: "1.1.1.3" });
    const [m] = await ctx.db.select().from(messages);
    expect(m?.body.startsWith("<img src=x onerror=alert(1)>")).toBe(true);
    expect(m?.body).toHaveLength(body.trim().length);
  });

  describe("rate limiting", () => {
    it(`allows ${CONTACT_LIMITS.ip.limit} messages per hour from one address, then refuses with a wait time`, async () => {
      for (let i = 0; i < CONTACT_LIMITS.ip.limit; i++) {
        expect((await submitContactMessage(deps(), input({ email: `p${i}@example.com` }), { ip: "198.51.100.1" })).ok).toBe(true);
      }
      const r = await submitContactMessage(deps(), input({ email: "extra@example.com" }), { ip: "198.51.100.1" });
      expect(r).toMatchObject({ ok: false, reason: "rate_limited" });
      expect(await ctx.db.select().from(messages)).toHaveLength(CONTACT_LIMITS.ip.limit);
    });

    it("does not affect a different address", async () => {
      for (let i = 0; i < 6; i++) await submitContactMessage(deps(), input({ email: `q${i}@example.com` }), { ip: "198.51.100.2" });
      expect((await submitContactMessage(deps(), input({ email: "z@example.com" }), { ip: "198.51.100.3" })).ok).toBe(true);
    });

    it("also limits one email address used from many addresses", async () => {
      for (let i = 0; i < CONTACT_LIMITS.email.limit; i++) {
        expect((await submitContactMessage(deps(), input(), { ip: `203.0.113.${i + 10}` })).ok).toBe(true);
      }
      expect((await submitContactMessage(deps(), input(), { ip: "203.0.113.99" })).ok).toBe(false);
    });

    it("with an unknown address, a modest number of messages is never blocked by strangers", async () => {
      for (let i = 0; i < 20; i++) {
        expect((await submitContactMessage(deps(), input({ email: `u${i}@example.com` }), { ip: null })).ok).toBe(true);
      }
    });
  });

  describe("notification email", () => {
    it("tells the business, with the message and a link to open it", async () => {
      const r = await submitContactMessage(deps("info@mnyala.test"), input(), { ip: "1.1.1.4" });
      if (!r.ok) throw new Error("not ok");
      await new Promise((res) => setTimeout(res, 50));
      expect(mailer.sent).toHaveLength(1);
      expect(mailer.sent[0]?.to).toBe("info@mnyala.test");
      expect(mailer.sent[0]?.subject).toBe("New website message from Asha Mwakyusa");
      expect(mailer.sent[0]?.text).toContain("Habari, nahitaji mkaa wa kilo 30.");
      expect(mailer.sent[0]?.text).toContain(`https://mnyala.test/admin/messages/${r.id}`);
      expect(mailer.sent[0]?.text).toContain("Nahitaji mkaa");
    });

    it("sends nothing when no notification address is configured", async () => {
      await submitContactMessage(deps(), input(), { ip: "1.1.1.5" });
      await new Promise((res) => setTimeout(res, 50));
      expect(mailer.sent).toHaveLength(0);
    });

    it("never loses the customer's message when email fails", async () => {
      mailer.failWith = new Error("SMTP down");
      const r = await submitContactMessage(deps("info@mnyala.test"), input(), { ip: "1.1.1.6" });
      expect(r.ok).toBe(true);
      await new Promise((res) => setTimeout(res, 50));
      expect(await ctx.db.select().from(messages)).toHaveLength(1);
    });

    it("escapes a hostile name and message in the HTML part of the email", async () => {
      await submitContactMessage(deps("info@mnyala.test"), input({ fullName: "<b>Eve</b>", message: "<script>alert(1)</script> habari" }), { ip: "1.1.1.7" });
      await new Promise((res) => setTimeout(res, 50));
      expect(mailer.sent[0]?.html).not.toContain("<script>");
      expect(mailer.sent[0]?.html).not.toContain("<b>Eve</b>");
    });
  });
});
