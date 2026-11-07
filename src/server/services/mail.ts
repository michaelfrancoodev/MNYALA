import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { getEnv } from "@/lib/env";

export type MailMessage = { to: string; subject: string; text: string; html: string };

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export function createSmtpMailer(options: {
  transport: Transporter;
  from: string;
}): Mailer {
  return {
    async send(message) {
      await options.transport.sendMail({ from: options.from, to: message.to, subject: message.subject, text: message.text, html: message.html });
    },
  };
}

/** Development only (when no SMTP host is set): writes each email to a file so flows can be tried locally. */
export function createFileMailer(dir: string): Mailer {
  return {
    async send(message) {
      await mkdir(dir, { recursive: true });
      const name = `${Date.now()}-${randomBytes(4).toString("hex")}.json`;
      await writeFile(path.join(dir, name), JSON.stringify(message, null, 2));
    },
  };
}

/** For tests: remembers what would have been sent. */
export class MemoryMailer implements Mailer {
  readonly sent: MailMessage[] = [];
  failWith: Error | null = null;
  async send(message: MailMessage): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}

let instance: Mailer | undefined;

export function getMailer(): Mailer {
  if (instance) return instance;
  const env = getEnv();
  if (env.MAIL_HOST) {
    const transport = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_SECURE,
      auth: env.MAIL_USER ? { user: env.MAIL_USER, pass: env.MAIL_PASSWORD ?? "" } : undefined,
    });
    instance = createSmtpMailer({ transport, from: env.MAIL_FROM });
  } else {
    instance = createFileMailer(path.resolve("data/outbox"));
  }
  return instance;
}
