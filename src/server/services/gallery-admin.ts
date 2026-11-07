import { asc, eq, sql } from "drizzle-orm";
import { titleFromFileName, type GalleryItemInput } from "@/lib/validators/gallery";
import type { Db } from "@/server/db/client";
import { galleryItems, media } from "@/server/db/schema";
import { ImageError } from "./images";
import { deleteImageIfUnused, removeImageFiles, saveImage } from "./media-service";
import type { Storage } from "./storage";

export async function listGalleryAdmin(db: Db) {
  return db
    .select({
      id: galleryItems.id, title: galleryItems.title, description: galleryItems.description, category: galleryItems.category,
      isPublished: galleryItems.isPublished, sortOrder: galleryItems.sortOrder, mediaId: media.id,
      file: media.file, width: media.width, height: media.height, alt: media.alt,
    })
    .from(galleryItems)
    .innerJoin(media, eq(media.id, galleryItems.mediaId))
    .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.createdAt));
}

export const IMAGE_ERROR_MESSAGE: Record<ImageError["code"], string> = {
  too_large: "This file is larger than the allowed size.",
  unsupported: "Only JPEG, PNG and WebP pictures are accepted.",
  too_many_pixels: "This picture is too large in pixels. Resize it and try again.",
  corrupt: "This file is not a readable picture.",
};

export type UploadResult = { name: string; ok: true; id: string } | { name: string; ok: false; error: string };

/** Each file is handled on its own, so one bad file never blocks the good ones. */
export async function addGalleryImages(
  db: Db,
  storage: Storage,
  args: { files: Array<{ name: string; bytes: Buffer }>; category: GalleryItemInput["category"]; published: boolean; userId: string; maxBytes: number },
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (const file of args.files) {
    try {
      const title = titleFromFileName(file.name);
      const id = await db.transaction(async (tx) => {
        const saved = await saveImage(tx, storage, { bytes: file.bytes, alt: title, userId: args.userId, maxBytes: args.maxBytes });
        try {
          const [last] = await tx.select({ max: sql<number>`coalesce(max(${galleryItems.sortOrder}), 0)::int` }).from(galleryItems);
          const [row] = await tx
            .insert(galleryItems)
            .values({ mediaId: saved.id, title, category: args.category, isPublished: args.published, sortOrder: (last?.max ?? 0) + 10 })
            .returning({ id: galleryItems.id });
          if (!row) throw new Error("gallery item was not saved");
          return row.id;
        } catch (error) {
          await removeImageFiles(storage, saved.file);
          throw error;
        }
      });
      results.push({ name: file.name, ok: true, id });
    } catch (error) {
      results.push({ name: file.name, ok: false, error: error instanceof ImageError ? IMAGE_ERROR_MESSAGE[error.code] : "This file could not be saved." });
    }
  }
  return results;
}

export async function getGalleryItem(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db
    .select({ id: galleryItems.id, title: galleryItems.title, mediaId: galleryItems.mediaId })
    .from(galleryItems)
    .where(eq(galleryItems.id, id));
  return row ?? null;
}

export async function updateGalleryItem(db: Db, id: string, input: GalleryItemInput): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [item] = await tx.select({ mediaId: galleryItems.mediaId }).from(galleryItems).where(eq(galleryItems.id, id)).for("update");
    if (!item) return false;
    await tx
      .update(galleryItems)
      .set({ title: input.title, description: input.description, category: input.category, isPublished: input.published })
      .where(eq(galleryItems.id, id));
    await tx.update(media).set({ alt: input.alt }).where(eq(media.id, item.mediaId));
    return true;
  });
}

export async function setGalleryPublished(db: Db, id: string, published: boolean): Promise<boolean> {
  const rows = await db.update(galleryItems).set({ isPublished: published }).where(eq(galleryItems.id, id)).returning({ id: galleryItems.id });
  return rows.length > 0;
}

export async function moveGalleryItem(db: Db, id: string, direction: "up" | "down"): Promise<boolean> {
  return db.transaction(async (tx) => {
    const rows = await tx.select({ id: galleryItems.id }).from(galleryItems).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.createdAt)).for("update");
    const ids = rows.map((r) => r.id);
    const i = ids.indexOf(id);
    if (i < 0) return false;
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return true;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    for (const [index, gid] of ids.entries()) await tx.update(galleryItems).set({ sortOrder: (index + 1) * 10 }).where(eq(galleryItems.id, gid));
    return true;
  });
}

export async function deleteGalleryItem(db: Db, storage: Storage, id: string): Promise<boolean> {
  const item = await getGalleryItem(db, id);
  if (!item) return false;
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
  await deleteImageIfUnused(db, storage, item.mediaId);
  return true;
}
