import { and, asc, eq, ne, sql } from "drizzle-orm";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ProductInput } from "@/lib/validators/product";
import type { Db } from "@/server/db/client";
import { media, products } from "@/server/db/schema";
import { deleteImageIfUnused, removeImageFiles, saveImage } from "./media-service";
import type { Storage } from "./storage";

export type ProductImageUpload = { bytes: Buffer; maxBytes: number };

export async function listProductsAdmin(db: Db) {
  return db
    .select({
      id: products.id, slug: products.slug, name: products.name, category: products.category, summary: products.summary,
      priceTzs: products.priceTzs, priceUnit: products.priceUnit, isPublished: products.isPublished, sortOrder: products.sortOrder,
      updatedAt: products.updatedAt, file: media.file, width: media.width, alt: media.alt,
    })
    .from(products)
    .leftJoin(media, eq(media.id, products.imageId))
    .orderBy(asc(products.sortOrder), asc(products.name));
}

export async function getProductAdmin(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db
    .select({
      id: products.id, slug: products.slug, name: products.name, category: products.category, summary: products.summary, features: products.features,
      priceTzs: products.priceTzs, priceUnit: products.priceUnit, isPublished: products.isPublished, imageId: products.imageId,
      file: media.file, width: media.width, height: media.height, alt: media.alt,
    })
    .from(products)
    .leftJoin(media, eq(media.id, products.imageId))
    .where(eq(products.id, id));
  return row ?? null;
}

export class SlugTakenError extends Error {
  constructor() {
    super("That web address is already used by another product.");
    this.name = "SlugTakenError";
  }
}

const isUniqueViolation = (e: unknown) => {
  const x = e as { code?: string; cause?: { code?: string } };
  return x?.code === "23505" || x?.cause?.code === "23505";
};

export async function createProduct(
  db: Db,
  storage: Storage,
  args: { input: ProductInput; image?: ProductImageUpload; userId: string },
) {
  const { input } = args;
  let savedFile: string | null = null;
  try {
    return await db.transaction(async (tx) => {
      const wanted = input.slug ? input.slug : slugify(input.name);
      const slug = await uniqueSlug(wanted, async (candidate) => {
        const [hit] = await tx.select({ id: products.id }).from(products).where(eq(products.slug, candidate));
        return Boolean(hit);
      });

      let imageId: string | null = null;
      if (args.image) {
        const saved = await saveImage(tx, storage, { bytes: args.image.bytes, alt: input.imageAlt || input.name, userId: args.userId, maxBytes: args.image.maxBytes });
        savedFile = saved.file;
        imageId = saved.id;
      }
      const [last] = await tx.select({ max: sql<number>`coalesce(max(${products.sortOrder}), 0)::int` }).from(products);
      const [row] = await tx
        .insert(products)
        .values({
          slug, name: input.name, category: input.category, summary: input.summary, features: input.features,
          priceTzs: input.priceTzs, priceUnit: input.priceTzs === null ? null : input.priceUnit, imageId,
          isPublished: input.published, sortOrder: (last?.max ?? 0) + 10,
        })
        .returning();
      if (!row) throw new Error("product was not saved");
      return row;
    });
  } catch (error) {
    if (savedFile) await removeImageFiles(storage, savedFile);
    if (isUniqueViolation(error)) throw new SlugTakenError();
    throw error;
  }
}

export async function updateProduct(
  db: Db,
  storage: Storage,
  args: { id: string; input: ProductInput; newImage?: ProductImageUpload; removeImage: boolean; userId: string },
) {
  const { id, input } = args;
  let savedFile: string | null = null;
  let oldImageId: string | null = null;
  try {
    const result = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(products).where(eq(products.id, id)).for("update");
      if (!current) return null;
      oldImageId = current.imageId;

      let slug = current.slug;
      if (input.slug && input.slug !== current.slug) {
        const [clash] = await tx.select({ id: products.id }).from(products).where(and(eq(products.slug, input.slug), ne(products.id, id)));
        if (clash) throw new SlugTakenError();
        slug = input.slug;
      }

      let imageId = current.imageId;
      if (args.newImage) {
        const saved = await saveImage(tx, storage, { bytes: args.newImage.bytes, alt: input.imageAlt || input.name, userId: args.userId, maxBytes: args.newImage.maxBytes });
        savedFile = saved.file;
        imageId = saved.id;
      } else if (args.removeImage) {
        imageId = null;
      } else if (current.imageId && input.imageAlt) {
        await tx.update(media).set({ alt: input.imageAlt }).where(eq(media.id, current.imageId));
      }

      const [row] = await tx
        .update(products)
        .set({
          slug, name: input.name, category: input.category, summary: input.summary, features: input.features,
          priceTzs: input.priceTzs, priceUnit: input.priceTzs === null ? null : input.priceUnit, imageId, isPublished: input.published,
        })
        .where(eq(products.id, id))
        .returning();
      return row ?? null;
    });
    // Only after the change is safely saved: remove the picture that is no longer used.
    if (result && oldImageId && oldImageId !== result.imageId) await deleteImageIfUnused(db, storage, oldImageId);
    return result;
  } catch (error) {
    if (savedFile) await removeImageFiles(storage, savedFile);
    if (isUniqueViolation(error)) throw new SlugTakenError();
    throw error;
  }
}

export async function setProductPublished(db: Db, id: string, published: boolean): Promise<boolean> {
  const rows = await db.update(products).set({ isPublished: published }).where(eq(products.id, id)).returning({ id: products.id });
  return rows.length > 0;
}

/** Moves a product one place up or down in the list, then renumbers so gaps and ties never accumulate. */
export async function moveProduct(db: Db, id: string, direction: "up" | "down"): Promise<boolean> {
  return db.transaction(async (tx) => {
    const rows = await tx.select({ id: products.id }).from(products).orderBy(asc(products.sortOrder), asc(products.name)).for("update");
    const ids = rows.map((r) => r.id);
    const i = ids.indexOf(id);
    if (i < 0) return false;
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return true;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    for (const [index, pid] of ids.entries()) await tx.update(products).set({ sortOrder: (index + 1) * 10 }).where(eq(products.id, pid));
    return true;
  });
}

export type DeleteProductResult = "deleted" | "not_found" | "name_mismatch";

/** The person must type the product's name. Orders keep their own copy of the name, so history is unaffected. */
export async function deleteProduct(db: Db, storage: Storage, id: string, typedName: string): Promise<DeleteProductResult> {
  const [current] = await db.select({ name: products.name, imageId: products.imageId }).from(products).where(eq(products.id, id));
  if (!current) return "not_found";
  if (typedName.trim().toLowerCase() !== current.name.trim().toLowerCase()) return "name_mismatch";
  await db.delete(products).where(eq(products.id, id));
  await deleteImageIfUnused(db, storage, current.imageId);
  return "deleted";
}
