import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hashToken } from "@/server/auth/tokens";
import { createDb } from "@/server/db/client";
import { activityLogs, authTokens, sessions } from "@/server/db/schema";
import { Browser, textOf } from "../helpers/browser";
import { resetDatabase, testDatabaseUrl } from "../helpers/db";
import { runServerExpectingExit, startServer, type RunningServer } from "../helpers/server";
import { startSmtpSink } from "../helpers/smtp-sink";
import { GOOD_PASSWORD, makeUser } from "../helpers/users";

let server: RunningServer;
let sink: Awaited<ReturnType<typeof startSmtpSink>>;
let db: ReturnType<typeof createDb>;
let tmp: string;
let ipCounter = 10;

/** Each test gets its own client address so the per-address limits of one test never affect another. */
const browser = () => new Browser(server.base, { "x-forwarded-for": `198.51.100.${++ipCounter}` });

const OWNER = { email: "owner@mnyala.test", name: "Owner Mnyala" };
const NEW_PASSWORD = "tunapanda-miti-kila-mwaka-7";

beforeAll(async () => {
  await resetDatabase();
  db = createDb(testDatabaseUrl(), { max: 4 });
  await makeUser(db.db, { ...OWNER, role: "super_admin" });
  await makeUser(db.db, { email: "staff@mnyala.test", name: "Neema Staff", role: "staff" });
  await makeUser(db.db, { email: "off@mnyala.test", name: "Gone Person", active: false });
  sink = await startSmtpSink();
  tmp = await mkdtemp(path.join(os.tmpdir(), "mnyala-e2e-"));
  server = await startServer({
    MAIL_HOST: "127.0.0.1",
    MAIL_PORT: String(sink.port),
    MAIL_SECURE: "false",
    MAIL_FROM: "Mnyala <no-reply@e2e.mnyala.test>",
    STORAGE_DIR: tmp,
  });
});

afterAll(async () => {
  await server?.stop();
  await sink?.stop();
  await db?.close();
  if (tmp) await rm(tmp, { recursive: true, force: true });
});

async function signIn(b: Browser, email = OWNER.email, password = GOOD_PASSWORD, extra: Record<string, string> = {}) {
  return b.submit("/admin/login", "email", { email, password, ...extra });
}

describe("who can see the admin", () => {
  it("sends a visitor who is not signed in to the sign-in page, remembering where they were going", async () => {
    const b = browser();
    const root = await b.get("/admin");
    expect(root.status).toBeGreaterThanOrEqual(300);
    expect(root.status).toBeLessThan(400);
    expect(root.location).toMatch(/\/admin\/login/);

    const deep = await b.get("/admin/forbidden");
    expect(new URL(deep.location!, server.base).pathname).toBe("/admin/login");
    expect(new URL(deep.location!, server.base).searchParams.get("next")).toBe("/admin/forbidden");
  });

  it("serves the sign-in page with a real form, in English, marked noindex, with no outside resources", async () => {
    const page = await browser().get("/admin/login");
    expect(page.status).toBe(200);
    expect(page.body).toContain('<div lang="en">');
    expect(page.body).toMatch(/name="email"/);
    expect(page.body).toMatch(/name="password"/);
    expect(page.headers.get("x-robots-tag")).toContain("noindex");
    expect(page.body).toMatch(/<meta name="robots" content="noindex/);
    const external = [...page.body.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
    expect(external).toEqual([]);
    expect(page.setCookies).toEqual([]);
  });

  it("offers no public sign-up anywhere", async () => {
    const page = await browser().get("/admin/login");
    expect(textOf(page.body).toLowerCase()).not.toMatch(/register|sign up|create account|create an account/);
    expect((await browser().get("/admin/register")).status).toBe(404);
    expect((await browser().get("/auth/register")).status).toBe(404);
  });
});

describe("signing in", () => {
  it("shows an error a person can actually read when the password is wrong (the old app showed nothing)", async () => {
    const b = browser();
    const page = await signIn(b, OWNER.email, "definitely-wrong-1");
    expect(page.status).toBe(200);
    expect(textOf(page.body)).toContain("Invalid email or password.");
    expect(page.body).toContain('role="alert"');
    expect(page.body).toContain(`value="${OWNER.email}"`);
    expect(page.setCookies.filter((c) => /session/.test(c))).toEqual([]);
  });

  it("gives exactly the same answer for an unknown email, a wrong password and a deactivated account", async () => {
    const answers = await Promise.all([
      signIn(browser(), "nobody@mnyala.test", GOOD_PASSWORD),
      signIn(browser(), OWNER.email, "definitely-wrong-2"),
      signIn(browser(), "off@mnyala.test", GOOD_PASSWORD),
    ]);
    for (const a of answers) {
      expect(a.status).toBe(200);
      expect(textOf(a.body)).toContain("Invalid email or password.");
    }
  });

  it("asks for what is missing instead of failing silently", async () => {
    const page = await signIn(browser(), "", "");
    expect(textOf(page.body)).toContain("Enter your email address.");
    expect(textOf(page.body)).toContain("Enter your password.");
  });

  it("signs in, sets a hardened session cookie, and lands on the dashboard", async () => {
    const b = browser();
    const res = await signIn(b);
    expect(res.status).toBe(303);
    expect(new URL(res.location!, server.base).pathname).toBe("/admin");

    const cookie = res.setCookies.find((c) => c.startsWith("__Host-session="));
    expect(cookie, res.setCookies.join(" | ")).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\//i);
    expect(cookie).not.toMatch(/Domain=/i);
    const expires = Date.parse(/Expires=([^;]+)/i.exec(cookie!)![1]!);
    expect((expires - Date.now()) / 86_400_000).toBeGreaterThan(13);
    expect((expires - Date.now()) / 86_400_000).toBeLessThan(15);

    const dash = await b.get("/admin");
    expect(dash.status).toBe(200);
    expect(textOf(dash.body)).toContain("Hello, Owner");
    expect(textOf(dash.body)).toContain("Super admin");
    expect(textOf(dash.body)).toContain("owner@mnyala.test");
  });

  it("stores only a hash of the session token and records the sign-in", async () => {
    const b = browser();
    await signIn(b);
    const token = b.cookie("__Host-session")!;
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const rows = await db.db.select().from(sessions).where(eq(sessions.tokenHash, hashToken(token)));
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(await db.db.select().from(sessions))).not.toContain(token);
    expect((await db.db.select().from(activityLogs)).some((l) => l.action === "user.login")).toBe(true);
  });

  it("records the client address from the trusted proxy, not from a client-supplied first entry", async () => {
    const b = new Browser(server.base, { "x-forwarded-for": "6.6.6.6, 198.51.100.200" });
    await signIn(b);
    const [row] = await db.db.select().from(sessions).where(eq(sessions.tokenHash, hashToken(b.cookie("__Host-session")!)));
    expect(row?.ip).toBe("198.51.100.200");
  });

  it("sends a signed-in person who opens the sign-in page straight to the dashboard", async () => {
    const b = browser();
    await signIn(b);
    const page = await b.get("/admin/login");
    expect(new URL(page.location!, server.base).pathname).toBe("/admin");
  });

  it("takes the person to the page they were heading for", async () => {
    const b = browser();
    const res = await signIn(b, OWNER.email, GOOD_PASSWORD, { next: "/admin/forbidden" });
    expect(new URL(res.location!, server.base).pathname).toBe("/admin/forbidden");
  });

  it("never redirects to another site or out of the admin after sign-in", async () => {
    for (const next of ["https://evil.test", "//evil.test", "/\\evil.test", "/admin/../x", "/admin/%2e%2e/x", "/administrator", "javascript:alert(1)"]) {
      const b = browser();
      const res = await signIn(b, OWNER.email, GOOD_PASSWORD, { next });
      expect(res.status, next).toBe(303);
      const loc = new URL(res.location!, server.base);
      expect(loc.origin, next).toBe(server.base);
      expect(loc.pathname, next).toBe("/admin");
    }
  });

  it("locks an account after repeated failures, even for the correct password, and says how long to wait", async () => {
    await makeUser(db.db, { email: "locked@mnyala.test", name: "Locked Person" });
    const b = browser();
    for (let i = 0; i < 5; i++) await signIn(b, "locked@mnyala.test", `wrong-attempt-${i}-x`);
    const page = await signIn(b, "locked@mnyala.test", GOOD_PASSWORD);
    expect(page.status).toBe(200);
    expect(textOf(page.body)).toMatch(/Too many attempts\. Try again in \d+ minutes?\./);
    expect(page.setCookies.filter((c) => /session/.test(c))).toEqual([]);
  });
});

describe("signing out", () => {
  it("ends the session on the server, not just in the browser", async () => {
    const b = browser();
    await signIn(b);
    const stolen = b.cookie("__Host-session")!;
    const dash = await b.get("/admin");
    expect(dash.status).toBe(200);

    const logout = await b.postFields("/admin", [...extractFields(dash.body, "$ACTION_ID_")], {});
    expect(logout.status).toBe(303);
    expect(new URL(logout.location!, server.base).pathname).toBe("/admin/login");
    expect(b.cookie("__Host-session")).toBeUndefined();
    expect(await db.db.select().from(sessions).where(eq(sessions.tokenHash, hashToken(stolen)))).toHaveLength(0);

    // Replaying the old cookie by hand gets nothing.
    const replay = new Browser(server.base);
    replay.jar.set("__Host-session", stolen);
    const page = await replay.get("/admin");
    expect(new URL(page.location!, server.base).pathname).toBe("/admin/login");
  });
});

/** The sign-out form has no named visible fields, only the framework's hidden ones. */
function extractFields(html: string, prefix: string) {
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((m) => m[0]);
  const form = forms.find((f) => f.includes(prefix) && f.includes("Sign out"));
  if (!form) throw new Error("sign-out form not found");
  return [...form.matchAll(/<input\b[^>]*type="hidden"[^>]*>/g)].map((m) => ({
    name: /name="([^"]*)"/.exec(m[0])![1]!.replace(/&amp;/g, "&"),
    value: (/value="([^"]*)"/.exec(m[0])?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
  }));
}

describe("cross-site requests", () => {
  it("refuses a sign-in posted from another origin", async () => {
    const b = browser();
    const res = await b.submit("/admin/login", "email", { email: OWNER.email, password: GOOD_PASSWORD }, { origin: "https://evil.test" });
    expect(res.status).not.toBe(303);
    expect(res.setCookies.filter((c) => /session/.test(c))).toEqual([]);
    expect(b.cookie("__Host-session")).toBeUndefined();
  });
});

describe("forgot and reset password", () => {
  const ASK = "email";

  async function askForReset(b: Browser, email: string) {
    return b.submit("/admin/forgot-password", ASK, { email });
  }

  function linkFrom(mail: { text: string }): string {
    const m = /https:\/\/e2e\.mnyala\.test(\/admin\/reset-password\/[A-Za-z0-9_-]{43})/.exec(mail.text);
    if (!m?.[1]) throw new Error(`no reset link in:\n${mail.text}`);
    return m[1];
  }

  it("answers the same way whether or not the email has an account", async () => {
    const known = await askForReset(browser(), "staff@mnyala.test");
    const unknown = await askForReset(browser(), "nobody-at-all@mnyala.test");
    expect(known.status).toBe(200);
    expect(textOf(known.body)).toContain("If that email belongs to an account");
    expect(textOf(unknown.body)).toContain("If that email belongs to an account");
    expect(textOf(known.body)).toBe(textOf(unknown.body).replace("nobody-at-all@mnyala.test", "staff@mnyala.test"));
  });

  it("emails a working one-time link over real SMTP, and sends nothing for an unknown address", async () => {
    await sink.waitFor(1);
    const toStaff = sink.received.filter((m) => m.to.includes("staff@mnyala.test"));
    expect(toStaff.length).toBeGreaterThanOrEqual(1);
    expect(sink.received.some((m) => m.to.includes("nobody-at-all@mnyala.test"))).toBe(false);
    const mail = toStaff[0]!;
    expect(mail.subject).toBe("Reset your Mnyala admin password");
    expect(mail.from).toBe("no-reply@e2e.mnyala.test");
    expect(mail.html).toContain("Choose a new password");
    const page = await browser().get(linkFrom(mail));
    expect(page.status).toBe(200);
    expect(textOf(page.body)).toContain("Choose a new password");
    expect(textOf(page.body)).toContain("staff@mnyala.test");
  });

  it("shows a helpful page, not an error, for a link that is junk", async () => {
    const page = await browser().get("/admin/reset-password/not-a-real-token");
    expect(page.status).toBe(200);
    expect(textOf(page.body)).toContain("This link has expired");
    expect(page.body).toContain("/admin/forgot-password");
  });

  it("walks the whole recovery: weak password refused, mismatch refused, strong accepted, old password dead, link single-use", async () => {
    await makeUser(db.db, { email: "recover@mnyala.test", name: "Recover Person" });
    const first = browser();
    await signIn(first, "recover@mnyala.test");
    expect((await first.get("/admin")).status).toBe(200);

    const b = browser();
    await askForReset(b, "recover@mnyala.test");
    await sink.waitFor(sink.received.filter(() => true).length);
    const mail = await waitForMailTo("recover@mnyala.test");
    const link = linkFrom(mail);

    const weak = await b.submit(link, "password", { password: "password123", confirm: "password123" });
    expect(weak.status).toBe(200);
    expect(textOf(weak.body)).toMatch(/too common/);

    const mismatch = await b.submit(link, "password", { password: NEW_PASSWORD, confirm: NEW_PASSWORD + "x" });
    expect(textOf(mismatch.body)).toContain("The two passwords do not match.");

    const done = await b.submit(link, "password", { password: NEW_PASSWORD, confirm: NEW_PASSWORD });
    expect(done.status).toBe(303);
    expect(new URL(done.location!, server.base).pathname).toBe("/admin/login");
    const login = await b.visit(done.location!);
    expect(textOf(login.body)).toContain("Your password has been changed.");

    // every old session ended, old password dead, new one works
    expect(new URL((await first.get("/admin")).location!, server.base).pathname).toBe("/admin/login");
    expect(textOf((await signIn(browser(), "recover@mnyala.test", GOOD_PASSWORD)).body)).toContain("Invalid email or password.");
    expect((await signIn(browser(), "recover@mnyala.test", NEW_PASSWORD)).status).toBe(303);

    // the link cannot be used twice
    const again = await browser().get(link);
    expect(textOf(again.body)).toContain("This link has expired");
  });

  it("an expired link is refused at both the page and the form", async () => {
    await makeUser(db.db, { email: "late@mnyala.test", name: "Late Person" });
    const b = browser();
    await askForReset(b, "late@mnyala.test");
    const link = linkFrom(await waitForMailTo("late@mnyala.test"));
    const token = link.split("/").pop()!;
    const page = await b.get(link);
    const fields = [...page.body.matchAll(/<input\b[^>]*type="hidden"[^>]*>/g)].map((m) => ({
      name: /name="([^"]*)"/.exec(m[0])![1]!.replace(/&amp;/g, "&"),
      value: (/value="([^"]*)"/.exec(m[0])?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
    }));
    await db.db.update(authTokens).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(authTokens.tokenHash, hashToken(token)));
    const post = await b.postFields(link, fields, { password: NEW_PASSWORD, confirm: NEW_PASSWORD });
    // The page re-renders, sees the link is dead and says so, instead of pretending to accept the password.
    expect(textOf(post.body)).toMatch(/This link has expired|This link is no longer valid/);
    expect(textOf((await browser().get(link)).body)).toContain("This link has expired");
    // and nothing changed: the old password still works, the attempted new one does not
    expect(textOf((await signIn(browser(), "late@mnyala.test", NEW_PASSWORD)).body)).toContain("Invalid email or password.");
    expect((await signIn(browser(), "late@mnyala.test", GOOD_PASSWORD)).status).toBe(303);
  });

  async function waitForMailTo(address: string) {
    const start = Date.now();
    for (;;) {
      const found = [...sink.received].reverse().find((m) => m.to.includes(address));
      if (found) return found;
      if (Date.now() - start > 8000) throw new Error(`no email to ${address}`);
      await new Promise((r) => setTimeout(r, 50));
    }
  }
});

describe("what the server writes to its log", () => {
  it("contains no passwords, session tokens or reset links", async () => {
    const out = server.output();
    expect(out.length).toBeGreaterThan(0);
    for (const secret of [GOOD_PASSWORD, NEW_PASSWORD, "definitely-wrong", "/admin/reset-password/"]) {
      expect(out).not.toContain(secret);
    }
    expect(out).not.toMatch(/__Host-session=[A-Za-z0-9_-]{43}/);
    expect(out).not.toMatch(/[A-Za-z0-9_-]{43}.*reset/);
  });
});

describe("start-up safety", () => {
  it("refuses to start with an insecure APP_URL in production and says why", async () => {
    const r = await runServerExpectingExit({
      DATABASE_URL: testDatabaseUrl(),
      APP_URL: "http://insecure.test",
      MAIL_HOST: "127.0.0.1",
      LOG_LEVEL: "info",
    });
    expect(r.code).toBe(1);
    expect(r.output).toContain("refusing to start");
    expect(r.output).toContain("APP_URL: must use https://");
  });

  it("refuses to start when DATABASE_URL is missing", async () => {
    // Empty on purpose: a .env file on disk would otherwise fill in a missing value.
    const r = await runServerExpectingExit({ DATABASE_URL: "", APP_URL: "https://x.test", MAIL_HOST: "127.0.0.1", LOG_LEVEL: "info" });
    expect(r.code).toBe(1);
    expect(r.output).toContain("DATABASE_URL");
  });
});
