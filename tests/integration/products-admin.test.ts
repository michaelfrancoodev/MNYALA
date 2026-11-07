import { mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { productSchema } from "@/lib/validators/product";
import { galleryItems, media, products } from "@/server/db/schema";
import { ImageError } from "@/server/services/images";
import { countOrphanImages } from "@/server/services/media-service";
import { SlugTakenError, createProduct, deleteProduct, getProductAdmin, listProductsAdmin, moveProduct, setProductPublished, updateProduct } from "@/server/services/products-admin";
import { createLocalStorage } from "@/server/services/storage";
import { openTestDb, truncateAll } from "../helpers/db";
import { jpeg } from "../helpers/images";
import { makeUser } from "../helpers/users";

let ctx: Awaited<ReturnType<typeof openTestDb>>;
let dir: string;
let userId: string;
const storage = () => createLocalStorage(dir);
const MAX = 5 * 1024 * 1024;

beforeAll(async () => {
  ctx = await openTestDb();
});
afterAll(async () => {
  await ctx.close();
});
beforeEach(async () => {
  await truncateAll(ctx.sql);
  dir = await mkdtemp(path.join(os.tmpdir(), "mnyala-prod-"));
  userId = (await makeUser(ctx.db)).id;
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const input = (o: Record<string, unknown> = {}) =>
  productSchema.parse({ name: "Mkaa Safi", slug: "", category: "charcoal", summary: "Mkaa wa ubora wa juu.", features: "Moto mrefu\nMoshi mdogo", priceTzs: "", priceUnit: "", imageAlt: "", ...o });
const files = async () => (await readdir(dir).catch(() => [])).sort();

describe("createProduct", () => {
  it("creates a product with a slug from its name, unpublished by default, at the end of the list", async () => {
    const a = await createProduct(ctx.db, storage(), { input: input(), userId });
    const b = await createProduct(ctx.db, storage(), { input: input({ name: "Majiko", category: "stove" }), userId });
    expect(a).toMatchObject({ slug: "mkaa-safi", isPublished: false, features: ["Moto mrefu", "Moshi mdogo"], priceTzs: null, sortOrder: 10 });
    expect(b.sortOrder).toBe(20);
  });

  it("numbers the slug when the name is already used, instead of failing", async () => {
    await createProduct(ctx.db, storage(), { input: input(), userId });
    const second = await createProduct(ctx.db, storage(), { input: input(), userId });
    const third = await createProduct(ctx.db, storage(), { input: input(), userId });
    expect([second.slug, third.slug]).toEqual(["mkaa-safi-2", "mkaa-safi-3"]);
  });

  it("stores the picture in three sizes under random names and records its description", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input({ imageAlt: "Mkaa unawaka" }), image: { bytes: await jpeg(2000, 1500), maxBytes: MAX }, userId });
    const [m] = await ctx.db.select().from(media).where(eq(media.id, p.imageId!));
    expect(m).toMatchObject({ alt: "Mkaa unawaka", createdBy: userId });
    expect(await files()).toEqual([`${m!.file}-1600.webp`, `${m!.file}-480.webp`, `${m!.file}-960.webp`]);
  });

  it("leaves nothing behind when the picture is not a real picture", async () => {
    await expect(createProduct(ctx.db, storage(), { input: input(), image: { bytes: Buffer.from("not an image"), maxBytes: MAX }, userId })).rejects.toBeInstanceOf(ImageError);
    expect(await ctx.db.select().from(products)).toHaveLength(0);
    expect(await ctx.db.select().from(media)).toHaveLength(0);
    expect(await files()).toEqual([]);
  });

  it("two creations at the same moment with the same name both succeed with different slugs", async () => {
    const results = await Promise.allSettled([1, 2, 3, 4].map(() => createProduct(ctx.db, storage(), { input: input(), userId })));
    const slugs = results.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<{ slug: string }>).value.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const r of results) if (r.status === "rejected") expect(r.reason).toBeInstanceOf(SlugTakenError);
    expect(slugs.length).toBeGreaterThanOrEqual(1);
  });

  it("drops the price unit when there is no price", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input({ priceUnit: "kg" }), userId });
    expect(p.priceUnit).toBeNull();
    const q = await createProduct(ctx.db, storage(), { input: input({ name: "Mbegu", priceTzs: "5,000", priceUnit: "kg" }), userId });
    expect(q).toMatchObject({ priceTzs: 5000, priceUnit: "kg" });
  });
});

describe("updateProduct", () => {
  it("changes the details and keeps the old address unless a new one is given", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input(), userId });
    const u = await updateProduct(ctx.db, storage(), { id: p.id, input: input({ name: "Mkaa Bora", priceTzs: "25000", priceUnit: "mfuko" }), removeImage: false, userId });
    expect(u).toMatchObject({ name: "Mkaa Bora", slug: "mkaa-safi", priceTzs: 25000, priceUnit: "mfuko" });
    const v = await updateProduct(ctx.db, storage(), { id: p.id, input: input({ name: "Mkaa Bora", slug: "Mkaa Mpya" }), removeImage: false, userId });
    expect(v?.slug).toBe("mkaa-mpya");
  });

  it("refuses an address another product already uses", async () => {
    await createProduct(ctx.db, storage(), { input: input({ name: "Majiko", category: "stove" }), userId });
    const p = await createProduct(ctx.db, storage(), { input: input(), userId });
    await expect(updateProduct(ctx.db, storage(), { id: p.id, input: input({ slug: "majiko" }), removeImage: false, userId })).rejects.toBeInstanceOf(SlugTakenError);
    expect((await getProductAdmin(ctx.db, p.id))?.slug).toBe("mkaa-safi");
  });

  it("replacing the picture removes the old files and keeps exactly one set", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input(), image: { bytes: await jpeg(1000, 700), maxBytes: MAX }, userId });
    const before = await files();
    const u = await updateProduct(ctx.db, storage(), { id: p.id, input: input({ imageAlt: "Mpya" }), newImage: { bytes: await jpeg(1000, 700, { r: 200, g: 20, b: 20 }), maxBytes: MAX }, removeImage: false, userId });
    const after = await files();
    expect(after).toHaveLength(before.length);
    expect(after.some((f) => before.includes(f))).toBe(false);
    expect(await ctx.db.select().from(media)).toHaveLength(1);
    expect(u?.imageId).not.toBe(p.imageId);
    expect(await countOrphanImages(ctx.db)).toBe(0);
  });

  it("a bad replacement picture changes nothing", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input(), image: { bytes: await jpeg(1000, 700), maxBytes: MAX }, userId });
    const before = await files();
    await expect(updateProduct(ctx.db, storage(), { id: p.id, input: input({ name: "Jina Jipya" }), newImage: { bytes: Buffer.from("junk"), maxBytes: MAX }, removeImage: false, userId })).rejects.toBeInstanceOf(ImageError);
    expect(await files()).toEqual(before);
    expect((await getProductAdmin(ctx.db, p.id))?.name).toBe("Mkaa Safi");
  });

  it("removing the picture deletes it, but not when a gallery item still uses it", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input(), image: { bytes: await jpeg(1000, 700), maxBytes: MAX }, userId });
    await ctx.db.insert(galleryItems).values({ mediaId: p.imageId!, title: "Shared", category: "product" });
    await updateProduct(ctx.db, storage(), { id: p.id, input: input(), removeImage: true, userId });
    expect((await getProductAdmin(ctx.db, p.id))?.imageId).toBeNull();
    expect(await ctx.db.select().from(media)).toHaveLength(1);
    expect(await files()).toHaveLength(3);
  });

  it("only updates the picture description when no new picture is uploaded", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input({ imageAlt: "Kwanza" }), image: { bytes: await jpeg(900, 600), maxBytes: MAX }, userId });
    await updateProduct(ctx.db, storage(), { id: p.id, input: input({ imageAlt: "Maelezo mapya" }), removeImage: false, userId });
    expect((await ctx.db.select().from(media))[0]?.alt).toBe("Maelezo mapya");
  });

  it("returns null for a product that does not exist", async () => {
    expect(await updateProduct(ctx.db, storage(), { id: "00000000-0000-4000-8000-000000000000", input: input(), removeImage: false, userId })).toBeNull();
  });
});

describe("ordering and visibility", () => {
  it("moves a product up and down, renumbers, and ignores moves past the ends", async () => {
    const [a, b, c] = [await createProduct(ctx.db, storage(), { input: input({ name: "Bidhaa A" }), userId }), await createProduct(ctx.db, storage(), { input: input({ name: "Bidhaa B" }), userId }), await createProduct(ctx.db, storage(), { input: input({ name: "Bidhaa C" }), userId })];
    const order = async () => (await listProductsAdmin(ctx.db)).map((p) => p.name);
    expect(await order()).toEqual(["Bidhaa A", "Bidhaa B", "Bidhaa C"]);
    await moveProduct(ctx.db, c.id, "up");
    expect(await order()).toEqual(["Bidhaa A", "Bidhaa C", "Bidhaa B"]);
    await moveProduct(ctx.db, a.id, "up");
    await moveProduct(ctx.db, b.id, "down");
    expect(await order()).toEqual(["Bidhaa A", "Bidhaa C", "Bidhaa B"]);
    await moveProduct(ctx.db, b.id, "up");
    await moveProduct(ctx.db, b.id, "up");
    expect(await order()).toEqual(["Bidhaa B", "Bidhaa A", "Bidhaa C"]);
    expect((await listProductsAdmin(ctx.db)).map((p) => p.sortOrder)).toEqual([10, 20, 30]);
  });

  it("publishes and unpublishes", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input(), userId });
    expect(await setProductPublished(ctx.db, p.id, true)).toBe(true);
    expect((await getProductAdmin(ctx.db, p.id))?.isPublished).toBe(true);
    expect(await setProductPublished(ctx.db, "00000000-0000-4000-8000-000000000000", true)).toBe(false);
  });
});

describe("deleteProduct", () => {
  it("needs the product's name typed, in any letter case", async () => {
    const p = await createProduct(ctx.db, storage(), { input: input(), userId });
    expect(await deleteProduct(ctx.db, storage(), p.id, "wrong")).toBe("name_mismatch");
    expect(await deleteProduct(ctx.db, storage(), p.id, "")).toBe("name_mismatch");
    expect(await ctx.db.select().from(products)).toHaveLength(1);
    expect(await deleteProduct(ctx.db, storage(), p.id, "  MKAA safi ")).toBe("deleted");
    expect(await ctx.db.select().from(products)).toHaveLength(0);
    expect(await deleteProduct(ctx.db, storage(), p.id, "Mkaa Safi")).toBe("not_found");
  });

  it("removes its picture files, unless another place still shows that picture", async () => {
    const a = await createProduct(ctx.db, storage(), { input: input(), image: { bytes: await jpeg(900, 600), maxBytes: MAX }, userId });
    await deleteProduct(ctx.db, storage(), a.id, "Mkaa Safi");
    expect(await files()).toEqual([]);
    expect(await ctx.db.select().from(media)).toHaveLength(0);

    const b = await createProduct(ctx.db, storage(), { input: input({ name: "Bidhaa B" }), image: { bytes: await jpeg(900, 600), maxBytes: MAX }, userId });
    await ctx.db.insert(galleryItems).values({ mediaId: b.imageId!, title: "Shared", category: "product" });
    await deleteProduct(ctx.db, storage(), b.id, "Bidhaa B");
    expect(await ctx.db.select().from(media)).toHaveLength(1);
    // a 900 px wide picture is stored in two sizes (480 and 900): it is never enlarged to fill a bigger one
    expect(await files()).toHaveLength(2);
  });
});

describe("getProductAdmin", () => {
  it("returns null for unknown or malformed ids", async () => {
    for (const id of ["abc", "", "../x", "00000000-0000-4000-8000-000000000000"]) expect(await getProductAdmin(ctx.db, id)).toBeNull();
  });
});
