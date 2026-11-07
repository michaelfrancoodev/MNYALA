"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getEnv } from "@/lib/env";
import { contactSchema } from "@/lib/validators/contact";
import { getDb } from "@/server/db/client";
import { products } from "@/server/db/schema";
import { submitContactMessage } from "@/server/services/contact-service";
import { getMailer } from "@/server/services/mail";
import { fieldErrorsFrom, formValue, requestMeta, type ActionState } from "./core";

const SUCCESS = "Ujumbe wako umetumwa kikamilifu. Tutawasiliana nawe hivi karibuni.";
const TOO_MANY = "Umetuma ujumbe mwingi. Tafadhali jaribu tena baadaye.";
const TRY_AGAIN = "Samahani, kuna tatizo. Tafadhali jaribu tena au tupigie simu.";
/** A person cannot read and fill this form in under three seconds; a script can. */
const MIN_FILL_MS = 3000;

const FIELDS = ["fullName", "email", "phone", "subject", "message", "product"] as const;

export async function submitContactAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const values: Record<string, string> = Object.fromEntries(FIELDS.map((k) => [k, formValue(fd, k)]));

  // Honeypot: a real person never sees or fills the hidden "website" field. Answer as if it worked.
  if (formValue(fd, "website") !== "") return { ok: true, message: SUCCESS };

  const renderedAt = Number(formValue(fd, "t"));
  if (Number.isFinite(renderedAt) && renderedAt > 0 && Date.now() - renderedAt < MIN_FILL_MS) return { ok: true, message: SUCCESS };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues), values };

  try {
    const env = getEnv();
    const { ip } = await requestMeta();
    const result = await submitContactMessage(
      { db: getDb(), mailer: getMailer(), appUrl: env.APP_URL, notifyEmail: env.NOTIFY_EMAIL },
      parsed.data,
      { ip },
    );
    if (!result.ok) return { ok: false, message: TOO_MANY, values };
    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { ok: true, message: SUCCESS, id: result.id };
  } catch {
    return { ok: false, message: TRY_AGAIN, values };
  }
}

/** Used by the contact page to preselect the subject and message when a customer arrives from a product. */
export async function productForPrefill(slug: string | undefined) {
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const [p] = await getDb()
    .select({ slug: products.slug, name: products.name, category: products.category })
    .from(products)
    .where(eq(products.slug, slug));
  return p ?? null;
}
