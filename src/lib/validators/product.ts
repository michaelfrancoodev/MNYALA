import { z } from "zod";
import { slugify } from "@/lib/slug";

export const PRODUCT_CATEGORIES = ["charcoal", "stove", "seeds", "manure"] as const;
export const MAX_FEATURES = 10;
export const MAX_FEATURE_LENGTH = 140;

const trimmed = (max: number, tooLong: string, min = 0, tooShort = "This is required.") =>
  z.string().trim().min(min, tooShort).max(max, tooLong);

/** One feature per line in the form; blank lines are dropped. */
export function parseFeatures(text: string): string[] {
  return [...new Set(text.split(/\r?\n/).map((l) => l.trim().replace(/\s+/g, " ")).filter(Boolean))];
}

export const productSchema = z.object({
  name: trimmed(120, "Keep the name under 120 characters.", 2, "Enter the product name."),
  slug: z
    .string()
    .trim()
    .max(80, "The web address part is too long.")
    .transform((v) => slugify(v))
    .optional(),
  category: z.enum(PRODUCT_CATEGORIES, { error: "Choose a category." }),
  summary: trimmed(300, "Keep the summary under 300 characters.", 10, "Write a short description (at least 10 characters)."),
  features: z
    .string()
    .transform(parseFeatures)
    .pipe(
      z
        .array(z.string().max(MAX_FEATURE_LENGTH, `Each point must be under ${MAX_FEATURE_LENGTH} characters.`))
        .max(MAX_FEATURES, `Use at most ${MAX_FEATURES} points.`),
    ),
  /** Whole shillings. Empty means "contact us for the price". */
  priceTzs: z
    .string()
    .trim()
    .transform((v) => v.replace(/[,\s]/g, ""))
    .pipe(z.union([z.literal(""), z.string().regex(/^\d{1,9}$/, "Enter the price as whole shillings, for example 25000.")]))
    .transform((v) => (v === "" ? null : Number(v))),
  priceUnit: z
    .string()
    .trim()
    .max(30, "Keep the unit under 30 characters.")
    .transform((v) => (v === "" ? null : v)),
  published: z.string().optional().transform((v) => v === "on" || v === "1" || v === "true"),
  imageAlt: z.string().trim().max(200, "Keep the picture description under 200 characters."),
});

export type ProductInput = z.infer<typeof productSchema>;
