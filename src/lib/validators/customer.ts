import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer name.").max(120, "Keep the name under 120 characters."),
  phone: z
    .string()
    .trim()
    .transform((v) => {
      if (v === "") return null;
      const normalized = normalizePhone(v);
      if (!normalized) throw new Error("Enter a valid phone number (e.g. 0758 730 108).");
      return normalized;
    }),
  email: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v.toLowerCase()))
    .pipe(z.union([z.null(), z.string().email("Enter a valid email address.").max(254)])),
  address: z
    .string()
    .trim()
    .max(500, "Keep the address under 500 characters.")
    .transform((v) => (v === "" ? null : v)),
  notes: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v)),
});

export type CustomerInput = z.infer<typeof customerSchema>;
