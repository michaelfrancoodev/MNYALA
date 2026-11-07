import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import nodemailer from "nodemailer";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryMailer, createFileMailer, createSmtpMailer } from "@/server/services/mail";
import { escapeHtml, inviteEmail, newMessageEmail, passwordChangedEmail, passwordResetEmail } from "@/server/services/mail-templates";

describe("templates", () => {
  it("escapeHtml neutralises markup", () => {
    expect(escapeHtml(`<img src=x onerror="alert('1')">&`)).toBe("&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;");
  });

  it("escape user-controlled names and bodies in HTML but keep plain text readable", () => {
    const m = newMessageEmail({ fullName: "<b>Eve</b>", email: "e@x.co", phone: null, subjectLabel: "Nahitaji Mkaa", body: "<script>alert(1)</script>\nSecond line", link: "https://x.test/admin/messages/1" });
    expect(m.html).not.toContain("<script>");
    expect(m.html).not.toContain("<b>Eve</b>");
    expect(m.html).toContain("&lt;script&gt;");
    expect(m.text).toContain("<script>alert(1)</script>");
    expect(m.subject).toContain("<b>Eve</b>"); // headers are not HTML
    expect(m.text).toContain("Phone: not given");
  });

  it("carry the link in both text and html, and state the validity period", () => {
    const link = "https://mnyala.test/admin/reset-password/abc";
    const r = passwordResetEmail({ name: "Asha", link, minutes: 30 });
    expect(r.text).toContain(link);
    expect(r.html).toContain(`href="${link}"`);
    expect(r.text).toContain("30 minutes");
    const i = inviteEmail({ name: "Juma", inviterName: "Asha", link, hours: 72 });
    expect(i.text).toContain("72 hours");
    expect(i.text).toContain("Asha invited you");
  });

  it("the changed-password notice tells the person what to do if it was not them", () => {
    expect(passwordChangedEmail({ name: "Asha" }).text).toContain("contact a super admin");
  });
});

describe("mailers", () => {
  const dirs: string[] = [];
  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
  });

  it("the SMTP mailer builds a correct message", async () => {
    const transport = nodemailer.createTransport({ jsonTransport: true });
    const sent: unknown[] = [];
    const original = transport.sendMail.bind(transport);
    transport.sendMail = (async (opts: Parameters<typeof original>[0]) => {
      const info = await original(opts);
      sent.push(JSON.parse(String((info as { message: string }).message)));
      return info;
    }) as typeof transport.sendMail;
    await createSmtpMailer({ transport, from: "Mnyala <no-reply@mnyala.co.tz>" }).send({ to: "asha@mnyala.test", subject: "Hello", text: "plain", html: "<p>html</p>" });
    expect(sent[0]).toMatchObject({ from: { address: "no-reply@mnyala.co.tz" }, to: [{ address: "asha@mnyala.test" }], subject: "Hello", text: "plain", html: "<p>html</p>" });
  });

  it("header injection through the subject cannot add recipients", async () => {
    const transport = nodemailer.createTransport({ jsonTransport: true });
    const original = transport.sendMail.bind(transport);
    let raw = "";
    transport.sendMail = (async (opts: Parameters<typeof original>[0]) => {
      const info = await original(opts);
      raw = String((info as { message: string }).message);
      return info;
    }) as typeof transport.sendMail;
    await createSmtpMailer({ transport, from: "a@b.co" }).send({ to: "x@y.co", subject: "Hi\r\nBcc: attacker@evil.test", text: "t", html: "h" });
    expect(JSON.parse(raw).bcc).toBeUndefined();
  });

  it("the development file mailer writes one JSON file per email", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "mnyala-outbox-"));
    dirs.push(dir);
    const mailer = createFileMailer(path.join(dir, "outbox"));
    await mailer.send({ to: "a@b.co", subject: "S", text: "T", html: "H" });
    await mailer.send({ to: "c@d.co", subject: "S2", text: "T2", html: "H2" });
    const files = await readdir(path.join(dir, "outbox"));
    expect(files).toHaveLength(2);
    expect(JSON.parse(await readFile(path.join(dir, "outbox", files[0]!), "utf8"))).toHaveProperty("to");
  });

  it("the memory mailer records and can simulate failure", async () => {
    const m = new MemoryMailer();
    await m.send({ to: "a@b.co", subject: "S", text: "T", html: "H" });
    expect(m.sent).toHaveLength(1);
    m.failWith = new Error("down");
    await expect(m.send({ to: "a@b.co", subject: "S", text: "T", html: "H" })).rejects.toThrow("down");
  });
});
