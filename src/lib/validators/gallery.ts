import { z } from "zod";

export const GALLERY_CATEGORIES = ["product", "production", "delivery", "community"] as const;

export const galleryItemSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(120, "Keep the title under 120 characters."),
  description: z
    .string()
    .trim()
    .max(300, "Keep the description under 300 characters.")
    .transform((v) => (v === "" ? null : v)),
  category: z.enum(GALLERY_CATEGORIES, { error: "Choose a category." }),
  alt: z.string().trim().min(3, "Describe what the picture shows (used by screen readers).").max(200, "Keep the description under 200 characters."),
  published: z.string().optional().transform((v) => v === "on" || v === "1" || v === "true"),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

/** A sensible starting title from a file name: "mkaa_safi-2.JPG" -> "Mkaa safi 2". */
export function titleFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim();
  const cleaned = base.replace(/[\u0000-\u001f<>/\\]+/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length < 2) return "Picha";
  return (cleaned[0]!.toUpperCase() + cleaned.slice(1)).slice(0, 120);
}
