import { z } from "zod";
import { MESSAGE_SUBJECT } from "@/messages/sw";
import { normalizePhone } from "@/lib/phone";

export const SUBJECT_KEYS = Object.keys(MESSAGE_SUBJECT) as [keyof typeof MESSAGE_SUBJECT, ...Array<keyof typeof MESSAGE_SUBJECT>];
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

/** Removes NUL and other control characters (PostgreSQL cannot store NUL); keeps line breaks and tabs. */
export function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/\r\n?/g, "\n");
}

const clean = z.string().transform(cleanText);

export const contactSchema = z.object({
  fullName: clean
    .pipe(z.string().trim().min(2, "Tafadhali andika jina lako kamili.").max(100, "Jina ni refu mno (herufi 100 kiwango cha juu)."))
    .transform((v) => v.replace(/\s+/g, " ")),
  email: clean.pipe(
    z.string().trim().min(1, "Tafadhali andika barua pepe yako.").max(254, "Barua pepe ni ndefu mno.").pipe(z.email({ error: "Barua pepe si sahihi." })),
  ),
  phone: clean
    .pipe(z.string().trim().max(30, "Namba ya simu ni ndefu mno."))
    .transform((v, ctx) => {
      if (v === "") return null;
      const normalized = normalizePhone(v);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: "Namba ya simu si sahihi. Mfano: 0758 730 108." });
        return z.NEVER;
      }
      return normalized;
    }),
  subject: z.enum(SUBJECT_KEYS, { error: "Chagua kichwa cha ujumbe." }),
  message: clean.pipe(
    z.string().trim().min(MESSAGE_MIN, `Ujumbe uwe na angalau herufi ${MESSAGE_MIN}.`).max(MESSAGE_MAX, `Ujumbe ni mrefu mno (herufi ${MESSAGE_MAX} kiwango cha juu).`),
  ),
  /** Slug of the product the person came from, if any. Verified against the database before use. */
  product: z.string().trim().max(80).regex(/^[a-z0-9-]*$/).optional().transform((v) => (v ? v : undefined)),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Which subject to preselect for each kind of product. */
export const SUBJECT_FOR_CATEGORY = { charcoal: "mkaa", stove: "majiko", seeds: "mbegu", manure: "mboji" } as const;
