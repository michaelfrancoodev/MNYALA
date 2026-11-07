import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/server/db/client";
import { galleryItems, media, products, siteSettings } from "@/server/db/schema";

export type SiteSettings = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  hours?: string;
  tagline?: string;
  facebook?: string;
  instagram?: string;
  /** Impact figures. Shown only when the owner has entered them. */
  stats: Array<{ label: string; value: string }>;
};

const text = (v: unknown): string | undefined => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await getDb().select().from(siteSettings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const stats: SiteSettings["stats"] = [];
  for (let i = 1; i <= 4; i++) {
    const value = text(map.get(`stats.${i}.value`));
    const label = text(map.get(`stats.${i}.label`));
    if (value && label) stats.push({ value, label });
  }
  return {
    phone: text(map.get("contact.phone")),
    whatsapp: text(map.get("contact.whatsapp")),
    email: text(map.get("contact.email")),
    address: text(map.get("contact.address")),
    hours: text(map.get("contact.hours")),
    tagline: text(map.get("site.tagline")),
    facebook: text(map.get("social.facebook")),
    instagram: text(map.get("social.instagram")),
    stats,
  };
});

export async function updateSiteSettings(
  db: ReturnType<typeof getDb>,
  settings: Record<string, string>,
  userId?: string,
): Promise<void> {
  for (const [key, val] of Object.entries(settings)) {
    await db
      .insert(siteSettings)
      .values({ key, value: val.trim(), updatedBy: userId })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: val.trim(), updatedBy: userId, updatedAt: new Date() },
      });
  }
}

export type MediaRef = { file: string; width: number; height: number; alt: string };

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  category: "charcoal" | "stove" | "seeds" | "manure";
  summary: string;
  features: string[];
  priceTzs: number | null;
  priceUnit: string | null;
  image: MediaRef | null;
};

export const getPublishedProducts = cache(async (): Promise<PublicProduct[]> => {
  const rows = await getDb()
    .select({
      id: products.id, slug: products.slug, name: products.name, category: products.category, summary: products.summary,
      features: products.features, priceTzs: products.priceTzs, priceUnit: products.priceUnit,
      file: media.file, width: media.width, height: media.height, alt: media.alt,
    })
    .from(products)
    .leftJoin(media, eq(media.id, products.imageId))
    .where(eq(products.isPublished, true))
    .orderBy(asc(products.sortOrder), asc(products.name));
  return rows.map((r) => ({
    id: r.id, slug: r.slug, name: r.name, category: r.category, summary: r.summary, features: r.features,
    priceTzs: r.priceTzs, priceUnit: r.priceUnit,
    image: r.file && r.width && r.height && r.alt !== null ? { file: r.file, width: r.width, height: r.height, alt: r.alt } : null,
  }));
});

export type PublicGalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: "product" | "production" | "delivery" | "community";
  image: MediaRef;
};

export const getPublishedGallery = cache(async (): Promise<PublicGalleryItem[]> => {
  const rows = await getDb()
    .select({
      id: galleryItems.id, title: galleryItems.title, description: galleryItems.description, category: galleryItems.category,
      file: media.file, width: media.width, height: media.height, alt: media.alt,
    })
    .from(galleryItems)
    .innerJoin(media, eq(media.id, galleryItems.mediaId))
    .where(eq(galleryItems.isPublished, true))
    .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.createdAt));
  return rows.map((r) => ({
    id: r.id, title: r.title, description: r.description, category: r.category,
    image: { file: r.file, width: r.width, height: r.height, alt: r.alt },
  }));
});
