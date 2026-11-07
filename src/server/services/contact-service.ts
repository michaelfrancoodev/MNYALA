import { eq } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import { messages, products } from "@/server/db/schema";
import { getLogger } from "@/server/logger";
import { ipKey } from "@/server/request";
import { consume, type LimitConfig } from "@/server/auth/rate-limit";
import { MESSAGE_SUBJECT } from "@/messages/sw";
import type { ContactInput } from "@/lib/validators/contact";
import type { Mailer } from "./mail";
import { newMessageEmail } from "./mail-templates";

export const CONTACT_LIMITS = {
  ip: { limit: 5, windowSec: 3600 } satisfies LimitConfig,
  /** Used when the address is unknown: one shared bucket, so it only guards against floods. */
  unknownIp: { limit: 200, windowSec: 3600 } satisfies LimitConfig,
  email: { limit: 5, windowSec: 3600 } satisfies LimitConfig,
};

export type ContactDeps = { db: Db; mailer: Mailer; appUrl: string; notifyEmail?: string };
export type ContactResult = { ok: true; id: string } | { ok: false; reason: "rate_limited"; retryAfterSec: number };

export async function submitContactMessage(deps: ContactDeps, input: ContactInput, meta: { ip: string | null }): Promise<ContactResult> {
  const { db } = deps;

  const ipLimit = await consume(db, `contact:ip:${ipKey(meta.ip)}`, meta.ip ? CONTACT_LIMITS.ip : CONTACT_LIMITS.unknownIp);
  const emailLimit = await consume(db, `contact:email:${input.email.toLowerCase()}`, CONTACT_LIMITS.email);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { ok: false, reason: "rate_limited", retryAfterSec: Math.max(ipLimit.retryAfterSec, emailLimit.retryAfterSec) };
  }

  let productId: string | null = null;
  if (input.product) {
    const [p] = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.product));
    productId = p?.id ?? null;
  }

  const [row] = await db
    .insert(messages)
    .values({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      subject: input.subject,
      body: input.message,
      productId,
      ip: meta.ip,
    })
    .returning({ id: messages.id });
  if (!row) throw new Error("message was not saved");

  // The customer's message is already safe in the database; a mail problem must never lose it or fail the request.
  if (deps.notifyEmail) {
    const content = newMessageEmail({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      subjectLabel: MESSAGE_SUBJECT[input.subject],
      body: input.message,
      link: `${deps.appUrl.replace(/\/$/, "")}/admin/messages/${row.id}`,
    });
    void deps.mailer.send({ to: deps.notifyEmail, ...content }).catch((error: unknown) => {
      getLogger().error({ err: error instanceof Error ? error.message : "unknown" }, "new-message notification could not be sent");
    });
  }
  return { ok: true, id: row.id };
}
