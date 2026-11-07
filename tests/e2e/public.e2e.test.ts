import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "@/server/db/client";
import { messages } from "@/server/db/schema";
import { seedContent } from "@/server/services/seed-content";
import { createLocalStorage } from "@/server/services/storage";
import { Browser, textOf, type Page } from "../helpers/browser";
import { resetDatabase, testDatabaseUrl } from "../helpers/db";
import { startServer, type RunningServer } from "../helpers/server";
import { startSmtpSink } from "../helpers/smtp-sink";

let server: RunningServer;
let sink: Awaited<ReturnType<typeof startSmtpSink>>;
let db: ReturnType<typeof createDb>;
let tmp: string;
let ip = 20;
const visitor = () => new Browser(server.base, { "x-forwarded-for": `192.0.2.${++ip}` });

const PAGES = ["/", "/kuhusu", "/bidhaa", "/picha", "/wasiliana", "/faragha"];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}\u{FE0F}\u{200D}]/u;
const hrefs = (html: string) => [...html.matchAll(/\bhref="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, "&"));

beforeAll(async () => {
  await resetDatabase();
  db = createDb(testDatabaseUrl(), { max: 4 });
  tmp = await mkdtemp(path.join(os.tmpdir(), "mnyala-e2e-pub-"));
  await seedContent(db.db, createLocalStorage(tmp), path.resolve("seed-assets"));
  sink = await startSmtpSink();
  server = await startServer({
    MAIL_HOST: "127.0.0.1", MAIL_PORT: String(sink.port), MAIL_SECURE: "false", MAIL_FROM: "Mnyala <no-reply@e2e.mnyala.test>",
    NOTIFY_EMAIL: "info@e2e.mnyala.test", STORAGE_DIR: tmp,
  });
});

afterAll(async () => {
  await server?.stop();
  await sink?.stop();
  await db?.close();
  if (tmp) await rm(tmp, { recursive: true, force: true });
});

describe("every public page", () => {
  it.each(PAGES)("%s is well formed, in Kiswahili, and self-contained", async (p) => {
    const page = await visitor().get(p);
    expect(page.status).toBe(200);
    expect(page.setCookies, "public pages must not set cookies").toEqual([]);
    expect(page.body).toContain('<html lang="sw"');
    expect(page.body.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(page.body).toMatch(/<title>[^<]{5,}<\/title>/);
    expect(page.body).toMatch(/<meta name="description" content="[^"]{30,}"/);
    expect(page.body).toContain('id="main"');
    expect(page.body).toContain("Ruka hadi maudhui");
    expect(page.body).not.toMatch(/<meta name="robots" content="noindex/);
    expect(EMOJI.test(textOf(page.body))).toBe(false);
    expect(page.body.toLowerCase()).not.toContain("mnyaa");

    // every image has an alt attribute and fixed dimensions (no layout shift)
    for (const img of page.body.match(/<img\b[^>]*>/g) ?? []) {
      expect(img, img).toMatch(/\balt="/);
      expect(img, img).toMatch(/\bwidth="\d+"/);
      expect(img, img).toMatch(/\bheight="\d+"/);
    }
    // ids are unique
    const ids = [...page.body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size, `duplicate ids on ${p}`).toBe(ids.length);
    // nothing is loaded from another site
    const external = [...page.body.matchAll(/\b(?:src|srcset|action)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
    expect(external).toEqual([]);
    expect(page.body.length).toBeLessThan(80_000);
  });

  it("shows the same main navigation everywhere, with the current page marked", async () => {
    for (const [p, label] of [["/", "Mwanzo"], ["/kuhusu", "Kuhusu sisi"], ["/bidhaa", "Bidhaa"], ["/picha", "Picha"], ["/wasiliana", "Wasiliana"]] as const) {
      const body = (await visitor().get(p)).body;
      expect(body).toMatch(new RegExp(`aria-current="page"[^>]*>${label}<`));
    }
  });

  it("has no dead internal link anywhere (the old site had broken and dead links)", async () => {
    const seen = new Set<string>();
    for (const p of PAGES) {
      for (const h of hrefs((await visitor().get(p)).body)) {
        if (!h.startsWith("/") || h.startsWith("//") || h.startsWith("/_next")) continue;
        seen.add(h.split("#")[0]!);
      }
    }
    expect([...seen].length).toBeGreaterThan(8);
    for (const target of seen) {
      const res = await visitor().visit(target || "/");
      expect(res.status, `link ${target}`).toBe(200);
    }
  });

  it("serves its fonts and stylesheet from its own domain", async () => {
    const page = await visitor().get("/");
    const css = [...page.body.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]!);
    expect(css.length).toBeGreaterThan(0);
    const sheet = await visitor().get(css[0]!);
    expect(sheet.status).toBe(200);
    expect(sheet.body).not.toMatch(/https?:\/\/fonts\.(googleapis|gstatic)\.com/);
    const font = /url\(([^)]*\.woff2)\)/.exec(sheet.body)?.[1]?.replace(/["']/g, "");
    expect(font).toBeTruthy();
    expect((await visitor().get(new URL(font!, new URL(css[0]!, server.base)).pathname)).status).toBe(200);
  });
});

describe("home page", () => {
  it("presents the business with real contact routes and structured data", async () => {
    const { body } = await visitor().get("/");
    const text = textOf(body);
    expect(text).toContain("Mkaa safi unaotokana na matunda ya mbono");
    for (const name of ["Mkaa Safi wa Kisasa", "Majiko ya Ufanisi", "Mbegu za Mbono", "Mboji (Mbolea Asilia)"]) expect(text).toContain(name);
    expect(body).toContain('href="tel:+255758730108"');
    expect(body).toContain('href="https://wa.me/255758730108');
    expect(body).toContain('href="mailto:info@mnyala.co.tz"');
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(body)?.[1];
    const data = JSON.parse(ld!);
    expect(data).toMatchObject({ "@type": "LocalBusiness", name: "Mnyala Co. Ltd", telephone: "+255 758 730 108", url: "https://e2e.mnyala.test" });
  });

  it("does not publish the unverified impact statistics", async () => {
    const all = (await Promise.all(PAGES.map((p) => visitor().get(p)))).map((r) => textOf(r.body)).join(" ");
    expect(all).not.toMatch(/500\+|1000\+|tani 500|wateja 1000/i);
  });
});

describe("products page", () => {
  it("lists each product with a way to order, and no invented prices", async () => {
    const { body } = await visitor().get("/bidhaa");
    for (const slug of ["mkaa-safi-wa-kisasa", "majiko-ya-ufanisi", "mbegu-za-mbono", "mboji-mbolea-asilia"]) {
      expect(body).toContain(`id="${slug}"`);
      expect(body).toContain(`href="/wasiliana?bidhaa=${slug}"`);
    }
    expect(textOf(body).match(/Wasiliana kwa bei/g)).toHaveLength(4);
    expect(textOf(body)).not.toMatch(/TSh \d/);
    expect(body).toContain("wa.me/255758730108?text=Habari%20Mnyala");
  });

  it("shows the product without a photo honestly, as text only (no fake or borrowed image)", async () => {
    const { body } = await visitor().get("/bidhaa");
    const mboji = /<article id="mboji-mbolea-asilia"[\s\S]*?<\/article>/.exec(body)![0];
    expect(mboji).not.toMatch(/<img\b/);
    const charcoal = /<article id="mkaa-safi-wa-kisasa"[\s\S]*?<\/article>/.exec(body)![0];
    expect(charcoal).toMatch(/<img\b[^>]*alt="Vipande vya mkaa/);
  });
});

describe("images", () => {
  it("every image on every page loads, is WebP, cacheable for a year, and cannot be sniffed as anything else", async () => {
    const urls = new Set<string>();
    for (const p of PAGES) {
      const { body } = await visitor().get(p);
      for (const m of body.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
        for (const part of m[1]!.split(",")) {
          const u = part.trim().split(/\s+/)[0]!;
          if (u.startsWith("/uploads/")) urls.add(u);
        }
      }
    }
    expect(urls.size).toBeGreaterThanOrEqual(4);
    for (const u of urls) {
      const res = await fetch(new URL(u, server.base));
      expect(res.status, u).toBe(200);
      expect(res.headers.get("content-type"), u).toBe("image/webp");
      expect(res.headers.get("cache-control"), u).toContain("immutable");
      expect(res.headers.get("x-content-type-options"), u).toBe("nosniff");
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect(String.fromCharCode(...bytes.slice(0, 4)), u).toBe("RIFF");
      expect(bytes.length, u).toBeLessThan(400_000);
    }
  });

  it("refuses every path that is not a file we generated (no traversal, no other types)", async () => {
    const hash = "a".repeat(32);
    for (const bad of [
      "/uploads/../.env", "/uploads/..%2f..%2fetc%2fpasswd", "/uploads/%2e%2e/%2e%2e/etc/passwd", "/uploads/evil.php",
      "/uploads/index.html", `/uploads/${hash}-480.jpg`, `/uploads/${hash.toUpperCase()}-480.webp`, `/uploads/${hash}-481.webp`,
      "/uploads/a/b.webp", "/uploads/", "/uploads", `/uploads/${hash}-480.webp`, "/uploads/%00.webp",
    ]) {
      const res = await fetch(new URL(bad, server.base));
      expect(res.status, bad).toBe(404);
      expect(res.headers.get("content-type") ?? "", bad).not.toMatch(/image\/webp/);
    }
  });
});

describe("gallery", () => {
  it("shows every published photo, and filters by kind without JavaScript", async () => {
    const all = (await visitor().get("/picha")).body;
    expect(all.match(/Fungua picha:/g)).toHaveLength(4);
    expect(all).toContain("/picha?kundi=product");
    expect((await visitor().get("/picha?kundi=product")).body.match(/Fungua picha:/g)).toHaveLength(3);
    expect((await visitor().get("/picha?kundi=production")).body.match(/Fungua picha:/g)).toHaveLength(1);
    expect((await visitor().get("/picha?kundi=bogus")).body.match(/Fungua picha:/g)).toHaveLength(4);
    expect((await visitor().get("/picha?kundi=community")).body.match(/Fungua picha:/g)).toHaveLength(4);
  });
});

describe("addresses from the old site and search engines", () => {
  it.each([["/about", "/kuhusu"], ["/products", "/bidhaa"], ["/gallery", "/picha"], ["/contact", "/wasiliana"], ["/auth/login", "/admin/login"]])(
    "%s permanently moves to %s",
    async (from, to) => {
      const res = await visitor().get(from);
      expect(res.status).toBe(308);
      expect(new URL(res.location!, server.base).pathname).toBe(to);
    },
  );

  it("publishes a sitemap and robots rules that hide the admin", async () => {
    const sitemap = (await visitor().get("/sitemap.xml")).body;
    for (const p of ["", "/kuhusu", "/bidhaa", "/picha", "/wasiliana", "/faragha"]) expect(sitemap).toContain(`<loc>https://e2e.mnyala.test${p}</loc>`);
    expect(sitemap).not.toContain("/admin");
    const robots = (await visitor().get("/robots.txt")).body;
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap: https://e2e.mnyala.test/sitemap.xml");
  });

  it("answers an unknown address with a friendly Kiswahili 404 that does not point people at the admin", async () => {
    const res = await visitor().get("/ukurasa-usiokuwepo");
    expect(res.status).toBe(404);
    const text = textOf(res.body);
    expect(text).toContain("Ukurasa huu haupatikani");
    expect(res.body).toContain("<footer");
    expect(res.body).toContain("<header");
    const adminLinks = hrefs(res.body).filter((h) => h.startsWith("/admin"));
    expect(adminLinks.every((h) => h === "/admin/login")).toBe(true);
    expect(res.body).not.toMatch(/stack|TypeError|at \w+ \(/);
  });
});

describe("contact form", () => {
  const FORM = "fullName";
  const valid = (o: Record<string, string> = {}) => ({
    fullName: "Asha Mwakyusa", email: "asha@example.com", phone: "0758 730 108", subject: "mkaa",
    message: "Habari, nahitaji mkaa wa kilo 30 tafadhali.", t: String(Date.now() - 20_000), ...o,
  });

  it("arrives from a product with the subject and message already filled in", async () => {
    const { body } = await visitor().get("/wasiliana?bidhaa=majiko-ya-ufanisi");
    expect(body).toMatch(/<option value="majiko"[^>]*selected|<option selected=""[^>]*value="majiko"/);
    expect(body).toContain("Habari, nahitaji kujua zaidi kuhusu Majiko ya Ufanisi.");
    expect(body).toMatch(/name="product"[^>]*value="majiko-ya-ufanisi"|value="majiko-ya-ufanisi"[^>]*name="product"/);
    // an invalid product reference is ignored: nothing is preselected or prefilled
    const bad = (await visitor().get("/wasiliana?bidhaa=../../etc")).body;
    expect(bad).not.toMatch(/value="\.\.\/\.\.\/etc"/);
    expect(bad).not.toContain("Habari, nahitaji kujua zaidi");
  });

  it("tells the person what to fix, in Kiswahili, beside each field, and keeps what they typed", async () => {
    const res = await visitor().submit("/wasiliana", FORM, valid({ fullName: "Neema", email: "not-an-email", message: "mfupi", phone: "12" }));
    expect(res.status).toBe(200);
    const text = textOf(res.body);
    expect(text).toContain("Barua pepe si sahihi.");
    expect(text).toContain("Ujumbe uwe na angalau herufi 10.");
    expect(text).toContain("Namba ya simu si sahihi");
    expect(res.body).toContain('role="alert"');
    expect(res.body).toContain('value="Neema"');
    expect(res.body).toContain('aria-invalid="true"');
  });

  it("rejects an empty form field by field without failing", async () => {
    const res = await visitor().submit("/wasiliana", FORM, valid({ fullName: "", email: "", message: "", subject: "" }));
    expect(res.status).toBe(200);
    expect(textOf(res.body)).toContain("Tafadhali andika jina lako kamili.");
    expect(textOf(res.body)).toContain("Chagua kichwa cha ujumbe.");
  });

  it("handles a 500-character name and hostile characters without a server error (the old app returned 500)", async () => {
    const long = await visitor().submit("/wasiliana", FORM, valid({ fullName: "x".repeat(500) }));
    expect(long.status).toBe(200);
    expect(textOf(long.body)).toMatch(/Jina ni refu mno|Tafadhali sahihisha/);
    const before = await db.db.select().from(messages);
    const nul = await visitor().submit("/wasiliana", FORM, valid({ email: "nul@example.com", message: "Habari\u0000 yako, nahitaji bei ya mkaa." }));
    expect(nul.status).toBe(200);
    expect(textOf(nul.body)).toContain("Ujumbe wako umetumwa kikamilifu");
    expect((await db.db.select().from(messages)).length).toBe(before.length + 1);
  });

  it("saves a valid message and emails the business over real SMTP", async () => {
    const res = await visitor().submit("/wasiliana", FORM, valid({ email: "full-flow@example.com" }));
    expect(textOf(res.body)).toContain("Ujumbe wako umetumwa kikamilifu. Tutawasiliana nawe hivi karibuni.");
    expect(res.body).toContain('role="status"');
    const [row] = await db.db.select().from(messages).where(eq(messages.email, "full-flow@example.com"));
    expect(row).toMatchObject({ fullName: "Asha Mwakyusa", phone: "+255758730108", subject: "mkaa", isRead: false });
    expect(row?.ip).toMatch(/^192\.0\.2\./);

    const start = Date.now();
    while (!sink.received.some((m) => m.text.includes(row!.id))) {
      if (Date.now() - start > 8000) throw new Error("no notification email");
      await new Promise((r) => setTimeout(r, 50));
    }
    const mail = sink.received.find((m) => m.text.includes(row!.id))!;
    expect(mail.to).toEqual(["info@e2e.mnyala.test"]);
    expect(mail.subject).toBe("New website message from Asha Mwakyusa");
    expect(mail.text).toContain("Nahitaji mkaa");
    expect(mail.text).toContain(`https://e2e.mnyala.test/admin/messages/${row!.id}`);
  });

  it("links the message to the product it came from", async () => {
    await visitor().submit("/wasiliana?bidhaa=mbegu-za-mbono", FORM, valid({ email: "product-flow@example.com", subject: "mbegu" }));
    const rows = await db.db.select().from(messages).where(eq(messages.email, "product-flow@example.com"));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.productId).not.toBeNull();
  });

  it("silently drops scripts: a filled honeypot or an impossibly fast submission saves nothing but shows no error", async () => {
    const before = (await db.db.select().from(messages)).length;
    const bot = await visitor().submit("/wasiliana", FORM, valid({ email: "bot1@example.com", website: "http://spam.test" }));
    expect(textOf(bot.body)).toContain("Ujumbe wako umetumwa kikamilifu");
    const fast = await visitor().submit("/wasiliana", FORM, valid({ email: "bot2@example.com", t: String(Date.now()) }));
    expect(textOf(fast.body)).toContain("Ujumbe wako umetumwa kikamilifu");
    expect((await db.db.select().from(messages)).length).toBe(before);
  });

  it("asks a sender who writes too often to wait, and still keeps the messages already sent", async () => {
    const b = visitor();
    for (let i = 0; i < 5; i++) {
      const r = await b.submit("/wasiliana", FORM, valid({ email: `limit${i}@example.com` }));
      expect(textOf(r.body)).toContain("Ujumbe wako umetumwa kikamilifu");
    }
    const sixth = await b.submit("/wasiliana", FORM, valid({ email: "limit6@example.com" }));
    expect(textOf(sixth.body)).toContain("Umetuma ujumbe mwingi. Tafadhali jaribu tena baadaye.");
    expect(sixth.body).toContain('role="alert"');
    expect((await db.db.select().from(messages).where(eq(messages.email, "limit6@example.com"))).length).toBe(0);
    expect((await db.db.select().from(messages)).filter((m) => m.email.startsWith("limit")).length).toBe(5);
  });

  it("refuses a message posted from another site", async () => {
    const before = (await db.db.select().from(messages)).length;
    const page: Page = await visitor().submit("/wasiliana", FORM, valid({ email: "csrf@example.com" }), { origin: "https://evil.test" });
    expect(page.status).not.toBe(200);
    expect((await db.db.select().from(messages)).length).toBe(before);
  });
});

describe("privacy page", () => {
  it("states what is collected and that public pages set no cookies, with a way to ask for deletion", async () => {
    const text = textOf((await visitor().get("/faragha")).body);
    expect(text).toContain("jina lako, barua pepe, namba ya simu");
    expect(text).toContain("hazitumii vidakuzi vya ufuatiliaji");
    expect(text).toContain("info@mnyala.co.tz");
  });
});
