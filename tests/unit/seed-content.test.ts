import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SEED_GALLERY, SEED_PRODUCTS, SEED_SETTINGS } from "@/server/seed/content";

const assets = path.resolve("seed-assets");

describe("seed content is valid for the schema and honest", () => {
  it("fits the column limits", () => {
    for (const p of SEED_PRODUCTS) {
      expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(p.slug.length).toBeLessThanOrEqual(80);
      expect(p.name.length).toBeLessThanOrEqual(120);
      expect(p.summary.length).toBeLessThanOrEqual(300);
      expect(p.features.length).toBeLessThanOrEqual(10);
      for (const f of p.features) expect(f.length).toBeLessThanOrEqual(140);
      if (p.image) expect(p.image.alt.length).toBeLessThanOrEqual(200);
    }
    for (const g of SEED_GALLERY) {
      expect(g.title.length).toBeLessThanOrEqual(120);
      expect(g.description.length).toBeLessThanOrEqual(300);
      expect(g.image.alt.length).toBeLessThanOrEqual(200);
    }
  });

  it("only references photos that exist in seed-assets", () => {
    const files = [...SEED_PRODUCTS.flatMap((p) => (p.image ? [p.image.file] : [])), ...SEED_GALLERY.map((g) => g.image.file)];
    for (const f of files) expect(existsSync(path.join(assets, f)), f).toBe(true);
  });

  it("has unique slugs and unique gallery title/category pairs (seed matches on them)", () => {
    expect(new Set(SEED_PRODUCTS.map((p) => p.slug)).size).toBe(SEED_PRODUCTS.length);
    expect(new Set(SEED_GALLERY.map((g) => `${g.category}:${g.title}`)).size).toBe(SEED_GALLERY.length);
  });

  it('uses "mbono" and never the old misspelling "mnyaa"', () => {
    expect(JSON.stringify([SEED_PRODUCTS, SEED_GALLERY, SEED_SETTINGS]).toLowerCase()).not.toContain("mnyaa");
  });

  it("carries the real contact details", () => {
    expect(SEED_SETTINGS["contact.whatsapp"]).toBe("255758730108");
    expect(SEED_SETTINGS["contact.email"]).toBe("info@mnyala.co.tz");
  });
});
