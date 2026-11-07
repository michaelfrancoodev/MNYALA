import { mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { galleryItemSchema } from "@/lib/validators/gallery";
import { galleryItems, media } from "@/server/db/schema";
import { addGalleryImages, deleteGalleryItem, listGalleryAdmin, moveGalleryItem, setGalleryPublished, updateGalleryItem } from "@/server/services/gallery-admin";
import { countOrphanImages } from "@/server/services/media-service";
import { createLocalStorage } from "@/server/services/storage";
import { openTestDb, truncateAll } from "../helpers/db";
import { jpeg, png } from "../helpers/images";
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
  dir = await mkdtemp(path.join(os.tmpdir(), "mnyala-gal-"));
  userId = (await makeUser(ctx.db)).id;
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});
const files = async () => (await readdir(dir).catch(() => [])).sort();
const add = async (list: Array<{ name: string; bytes: Buffer }>, o: { published?: boolean; category?: "product" | "production" | "delivery" | "community" } = {}) =>
  addGalleryImages(ctx.db, storage(), { files: list, category: o.category ?? "product", published: o.published ?? false, userId, maxBytes: MAX });

describe("addGalleryImages", () => {
  it("adds each picture with a title from its file name, in order, unpublished unless asked", async () => {
    const r = await add([{ name: "mkaa_safi.jpg", bytes: await jpeg() }, { name: "jiko-la-chuma.png", bytes: await png(800, 600) }]);
    expect(r.map((x) => x.ok)).toEqual([true, true]);
    const list = await listGalleryAdmin(ctx.db);
    expect(list.map((g) => g.title)).toEqual(["Mkaa safi", "Jiko la chuma"]);
    expect(list.map((g) => g.sortOrder)).toEqual([10, 20]);
    expect(list.every((g) => !g.isPublished)).toBe(true);
    expect(list[0]?.alt).toBe("Mkaa safi");
  });

  it("a bad file never blocks the good ones, and says exactly what was wrong with it", async () => {
    const r = await add([
      { name: "good.jpg", bytes: await jpeg() },
      { name: "notes.jpg", bytes: Buffer.from("this is text, not a picture") },
      { name: "drawing.svg", bytes: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5"/>') },
      { name: "also-good.jpg", bytes: await jpeg(600, 400) },
    ]);
    expect(r.map((x) => x.ok)).toEqual([true, false, false, true]);
    expect(r[1]).toMatchObject({ ok: false, error: "This file is not a readable picture." });
    expect(r[2]).toMatchObject({ ok: false, error: "Only JPEG, PNG and WebP pictures are accepted." });
    expect(await listGalleryAdmin(ctx.db)).toHaveLength(2);
    expect(await countOrphanImages(ctx.db)).toBe(0);
  });

  it("rejects a file over the size limit", async () => {
    const r = await addGalleryImages(ctx.db, storage(), { files: [{ name: "big.jpg", bytes: await jpeg(1500, 1500) }], category: "product", published: false, userId, maxBytes: 500 });
    expect(r[0]).toMatchObject({ ok: false, error: "This file is larger than the allowed size." });
    expect(await files()).toEqual([]);
  });

  it("publishes immediately when asked", async () => {
    await add([{ name: "a.jpg", bytes: await jpeg() }], { published: true, category: "production" });
    expect((await listGalleryAdmin(ctx.db))[0]).toMatchObject({ isPublished: true, category: "production" });
  });
});

describe("editing, ordering and removing", () => {
  async function seed(n = 3) {
    await add(await Promise.all(Array.from({ length: n }, async (_, i) => ({ name: `p${i + 1}.jpg`, bytes: await jpeg(700 + i, 500) }))));
    return listGalleryAdmin(ctx.db);
  }

  it("updates title, description, category, visibility and the picture description together", async () => {
    const [g] = await seed(1);
    const ok = await updateGalleryItem(ctx.db, g!.id, galleryItemSchema.parse({ title: "Mchakato", description: "Mtambo wa kiwanda", category: "production", alt: "Mtambo wa buluu", published: "on" }));
    expect(ok).toBe(true);
    expect((await listGalleryAdmin(ctx.db))[0]).toMatchObject({ title: "Mchakato", description: "Mtambo wa kiwanda", category: "production", isPublished: true, alt: "Mtambo wa buluu" });
    expect(await updateGalleryItem(ctx.db, "00000000-0000-4000-8000-000000000000", galleryItemSchema.parse({ title: "Xx", description: "", category: "product", alt: "xxx" }))).toBe(false);
  });

  it("moves pictures and renumbers", async () => {
    const list = await seed(3);
    await moveGalleryItem(ctx.db, list[2]!.id, "up");
    expect((await listGalleryAdmin(ctx.db)).map((g) => g.title)).toEqual(["P1", "P3", "P2"]);
    await moveGalleryItem(ctx.db, list[0]!.id, "up");
    expect((await listGalleryAdmin(ctx.db)).map((g) => g.sortOrder)).toEqual([10, 20, 30]);
  });

  it("publishes and unpublishes", async () => {
    const [g] = await seed(1);
    await setGalleryPublished(ctx.db, g!.id, true);
    expect((await listGalleryAdmin(ctx.db))[0]?.isPublished).toBe(true);
  });

  it("deleting removes the files from disk and the database, and leaves no orphans", async () => {
    const list = await seed(2);
    const before = await files();
    expect(await deleteGalleryItem(ctx.db, storage(), list[0]!.id)).toBe(true);
    expect((await files()).length).toBeLessThan(before.length);
    expect(await ctx.db.select().from(media)).toHaveLength(1);
    expect(await ctx.db.select().from(galleryItems)).toHaveLength(1);
    expect(await countOrphanImages(ctx.db)).toBe(0);
    expect(await deleteGalleryItem(ctx.db, storage(), list[0]!.id)).toBe(false);
    expect(await deleteGalleryItem(ctx.db, storage(), "nope")).toBe(false);
  });
});
