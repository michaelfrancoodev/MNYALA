import { eq, sql } from "drizzle-orm";
import type { Db, Tx } from "@/server/db/client";
import { galleryItems, media, products } from "@/server/db/schema";
import { VARIANT_TIERS, processImage } from "./images";
import type { Storage } from "./storage";

type Executor = Db | Tx;

/**
 * Validates and processes an upload, stores every size, and records it. If anything fails after files were written,
 * they are removed again so nothing is left behind.
 */
export async function saveImage(
  db: Executor,
  storage: Storage,
  input: { bytes: Buffer; alt: string; userId: string; maxBytes: number },
) {
  const processed = await processImage(input.bytes, { maxBytes: input.maxBytes });
  const written: string[] = [];
  try {
    for (const v of processed.variants) {
      await storage.put(v.name, v.data);
      written.push(v.name);
    }
    const [row] = await db
      .insert(media)
      .values({ file: processed.file, width: processed.width, height: processed.height, bytes: processed.bytes, alt: input.alt, createdBy: input.userId })
      .returning();
    if (!row) throw new Error("image record was not saved");
    return row;
  } catch (error) {
    await Promise.all(written.map((name) => storage.remove(name).catch(() => undefined)));
    throw error;
  }
}

export async function removeImageFiles(storage: Storage, file: string): Promise<void> {
  await Promise.all(VARIANT_TIERS.map((tier) => storage.remove(`${file}-${tier}.webp`).catch(() => undefined)));
}

/** True when a product or a gallery item still uses this image. */
export async function isImageInUse(db: Executor, mediaId: string): Promise<boolean> {
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.imageId, mediaId)).limit(1);
  if (p) return true;
  const [g] = await db.select({ id: galleryItems.id }).from(galleryItems).where(eq(galleryItems.mediaId, mediaId)).limit(1);
  return Boolean(g);
}

/** Deletes the image (database row and files) only if nothing refers to it any more. Returns whether it was deleted. */
export async function deleteImageIfUnused(db: Executor, storage: Storage, mediaId: string | null): Promise<boolean> {
  if (!mediaId) return false;
  if (await isImageInUse(db, mediaId)) return false;
  const [row] = await db.delete(media).where(eq(media.id, mediaId)).returning({ file: media.file });
  if (!row) return false;
  await removeImageFiles(storage, row.file);
  return true;
}

/** Images nothing refers to (for example after a failed save). Housekeeping and tests. */
export async function countOrphanImages(db: Executor): Promise<number> {
  const rows = await db.execute<{ n: number }>(sql`
    select count(*)::int as n from media m
    where not exists (select 1 from products p where p.image_id = m.id)
      and not exists (select 1 from gallery_items g where g.media_id = m.id)`);
  return Number(rows[0]?.n ?? 0);
}
