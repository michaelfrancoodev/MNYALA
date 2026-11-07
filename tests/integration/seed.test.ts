import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { galleryItems, media, products, siteSettings } from "@/server/db/schema";
import { seedContent } from "@/server/services/seed-content";
import { createLocalStorage, isSafeStoredName } from "@/server/services/storage";
import { openTestDb, truncateAll } from "../helpers/db";

const ASSETS = path.resolve("seed-assets");
let ctx: Awaited<ReturnType<typeof openTestDb>>;
let dir: string;

beforeAll(async () => {
  ctx = await openTestDb();
  dir = await mkdtemp(path.join(os.tmpdir(), "mnyala-seed-"));
});
afterAll(async () => {
  await ctx.close();
  await rm(dir, { recursive: true, force: true });
});

describe("seedContent", () => {
  it("creates the starting content on an empty database", async () => {
    await truncateAll(ctx.sql);
    const report = await seedContent(ctx.db, createLocalStorage(dir), ASSETS);
    expect(report).toEqual({ settings: 6, media: 4, products: 4, gallery: 4 });

    const list = await ctx.db.select().from(products).orderBy(products.sortOrder);
    expect(list.map((p) => p.slug)).toEqual(["mkaa-safi-wa-kisasa", "majiko-ya-ufanisi", "mbegu-za-mbono", "mboji-mbolea-asilia"]);
    expect(list.every((p) => p.isPublished)).toBe(true);
    expect(list.every((p) => p.features.length >= 3)).toBe(true);
  });

  it("invents no prices", async () => {
    const list = await ctx.db.select().from(products);
    expect(list.every((p) => p.priceTzs === null)).toBe(true);
  });

  it("publishes no unconfirmed impact statistics and no social links", async () => {
    const keys = (await ctx.db.select().from(siteSettings)).map((s) => s.key);
    expect(keys.filter((k) => k.startsWith("stats.") || k.startsWith("social."))).toEqual([]);
  });

  it("gives the manure product no photo (the old one showed another company's packaging)", async () => {
    const [manure] = await ctx.db.select().from(products).where(eq(products.slug, "mboji-mbolea-asilia"));
    expect(manure?.imageId).toBeNull();
    const others = await ctx.db.select().from(products);
    expect(others.filter((p) => p.slug !== "mboji-mbolea-asilia").every((p) => p.imageId !== null)).toBe(true);
  });

  it("writes real WebP files with safe names, matching what the database records", async () => {
    const files = await readdir(dir);
    expect(files.length).toBeGreaterThanOrEqual(4);
    for (const f of files) {
      expect(isSafeStoredName(f)).toBe(true);
      expect((await sharp(await readFile(path.join(dir, f))).metadata()).format).toBe("webp");
    }
    for (const m of await ctx.db.select().from(media)) {
      expect(files).toContain(`${m.file}-480.webp`);
      expect(m.alt.length).toBeGreaterThan(5);
    }
  });

  it("is idempotent: a second run creates nothing and duplicates nothing", async () => {
    const before = (await readdir(dir)).length;
    const report = await seedContent(ctx.db, createLocalStorage(dir), ASSETS);
    expect(report).toEqual({ settings: 0, media: 0, products: 0, gallery: 0 });
    expect(await ctx.db.select().from(products)).toHaveLength(4);
    expect(await ctx.db.select().from(galleryItems)).toHaveLength(4);
    expect(await ctx.db.select().from(media)).toHaveLength(4);
    expect((await readdir(dir)).length).toBe(before);
  });

  it("never overwrites what an admin has edited", async () => {
    await ctx.db.update(products).set({ name: "Mkaa wa Mbono (jina jipya)", priceTzs: 25000, isPublished: false }).where(eq(products.slug, "mkaa-safi-wa-kisasa"));
    await ctx.db.update(siteSettings).set({ value: "+255 700 000 000" }).where(eq(siteSettings.key, "contact.phone"));
    await seedContent(ctx.db, createLocalStorage(dir), ASSETS);
    const [p] = await ctx.db.select().from(products).where(eq(products.slug, "mkaa-safi-wa-kisasa"));
    expect(p).toMatchObject({ name: "Mkaa wa Mbono (jina jipya)", priceTzs: 25000, isPublished: false });
    const [s] = await ctx.db.select().from(siteSettings).where(eq(siteSettings.key, "contact.phone"));
    expect(s?.value).toBe("+255 700 000 000");
  });
});
