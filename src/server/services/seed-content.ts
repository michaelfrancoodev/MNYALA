import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import { galleryItems, media, products, siteSettings } from "@/server/db/schema";
import { SEED_GALLERY, SEED_PRODUCTS, SEED_SETTINGS } from "@/server/seed/content";
import { processImage } from "./images";
import type { Storage } from "./storage";

export type SeedReport = { settings: number; media: number; products: number; gallery: number };

/**
 * Inserts the starting content. Safe to run any number of times: anything that already exists
 * (matched by key, slug, or image content) is left exactly as the admin last edited it.
 */
export async function seedContent(db: Db, storage: Storage, assetsDir: string): Promise<SeedReport> {
  const report: SeedReport = { settings: 0, media: 0, products: 0, gallery: 0 };

  for (const [key, value] of Object.entries(SEED_SETTINGS)) {
    const rows = await db.insert(siteSettings).values({ key, value }).onConflictDoNothing().returning({ key: siteSettings.key });
    report.settings += rows.length;
  }

  // The file name is derived from the image content, so the same photo always maps to the same media row.
  async function ensureMedia(image: { file: string; alt: string }): Promise<string> {
    const bytes = await readFile(path.join(assetsDir, image.file));
    const fileName = createHash("sha256").update(bytes).digest("hex").slice(0, 32);

    const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.file, fileName));
    if (existing) return existing.id;

    const processed = await processImage(bytes, { maxBytes: 5 * 1024 * 1024, fileName });
    for (const variant of processed.variants) await storage.put(variant.name, variant.data);

    const [row] = await db
      .insert(media)
      .values({ file: fileName, width: processed.width, height: processed.height, bytes: processed.bytes, alt: image.alt })
      .onConflictDoNothing()
      .returning({ id: media.id });
    if (row) {
      report.media += 1;
      return row.id;
    }
    const [raced] = await db.select({ id: media.id }).from(media).where(eq(media.file, fileName));
    if (!raced) throw new Error("Could not create or find media row");
    return raced.id;
  }

  for (const product of SEED_PRODUCTS) {
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, product.slug));
    if (existing) continue;
    const imageId = product.image ? await ensureMedia(product.image) : null;
    await db.insert(products).values({
      slug: product.slug,
      name: product.name,
      category: product.category,
      summary: product.summary,
      features: product.features,
      imageId,
      isPublished: true,
      sortOrder: product.sortOrder,
    });
    report.products += 1;
  }

  for (const item of SEED_GALLERY) {
    const [existing] = await db
      .select({ id: galleryItems.id })
      .from(galleryItems)
      .where(and(eq(galleryItems.title, item.title), eq(galleryItems.category, item.category)));
    if (existing) continue;
    const mediaId = await ensureMedia(item.image);
    await db.insert(galleryItems).values({
      mediaId,
      title: item.title,
      description: item.description,
      category: item.category,
      isPublished: true,
      sortOrder: item.sortOrder,
    });
    report.gallery += 1;
  }

  return report;
}
