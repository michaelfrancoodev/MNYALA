import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";
import { galleryItemSchema, titleFromFileName } from "@/lib/validators/gallery";
import { MAX_FEATURES, parseFeatures, productSchema } from "@/lib/validators/product";

describe("slugify", () => {
  it.each([
    ["Mkaa Safi wa Kisasa", "mkaa-safi-wa-kisasa"],
    ["  Mboji (Mbolea Asilia)  ", "mboji-mbolea-asilia"],
    ["Café déjà vu", "cafe-deja-vu"],
    ["A---B___C", "a-b-c"],
    ["100% Safi!!", "100-safi"],
    ["", ""],
    ["###", ""],
    ["Jiko la 5kg / 10kg", "jiko-la-5kg-10kg"],
    ["../../etc/passwd", "etc-passwd"],
    ["<script>alert(1)</script>", "script-alert-1-script"],
  ])("%j -> %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("never exceeds the limit and never ends with a hyphen", () => {
    const s = slugify("a".repeat(50) + " " + "b".repeat(50));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });

  it("only produces characters that are safe in a web address", () => {
    expect(slugify("Ñandú & Ünïcode \u2713 \u6f22\u5b57 emoji")).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$|^$/);
  });
});

describe("uniqueSlug", () => {
  it("returns the base when free, then numbers it", async () => {
    expect(await uniqueSlug("mkaa", async () => false)).toBe("mkaa");
    const taken = new Set(["mkaa", "mkaa-2", "mkaa-3"]);
    expect(await uniqueSlug("mkaa", async (c) => taken.has(c))).toBe("mkaa-4");
  });
  it("falls back to a default when the name had no usable characters", async () => {
    expect(await uniqueSlug("", async () => false)).toBe("bidhaa");
  });
  it("keeps the numbered slug within 80 characters", async () => {
    const base = "x".repeat(80);
    const slug = await uniqueSlug(base, async (c) => c === base);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-2")).toBe(true);
  });
});

const baseProduct = { name: "Mkaa Safi", slug: "", category: "charcoal", summary: "Mkaa wa ubora wa juu.", features: "Moto mrefu\nMoshi mdogo", priceTzs: "", priceUnit: "", imageAlt: "" };
const errorsOf = (o: Record<string, unknown>) => {
  const r = productSchema.safeParse({ ...baseProduct, ...o });
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

describe("productSchema", () => {
  it("accepts a normal product and normalises it", () => {
    const r = productSchema.parse({ ...baseProduct, slug: " Mkaa Safi Kisasa ", published: "on" });
    expect(r).toMatchObject({ name: "Mkaa Safi", slug: "mkaa-safi-kisasa", features: ["Moto mrefu", "Moshi mdogo"], priceTzs: null, priceUnit: null, published: true });
  });

  it("reads prices written the way people write them, as whole shillings", () => {
    for (const [input, expected] of [["25000", 25000], ["25,000", 25000], [" 25 000 ", 25000], ["0", 0], ["", null], ["   ", null], ["999999999", 999999999]] as const) {
      expect(productSchema.parse({ ...baseProduct, priceTzs: input }).priceTzs, input).toBe(expected);
    }
    for (const bad of ["abc", "-5", "12.5", "1e5", "25000 TSh", "9999999999", "0x10"]) expect(errorsOf({ priceTzs: bad }).priceTzs, bad).toBeTruthy();
  });

  it("drops the unit when there is no price", () => {
    expect(productSchema.parse({ ...baseProduct, priceUnit: "kg" }).priceUnit).toBe("kg");
  });

  it("explains each problem", () => {
    expect(errorsOf({ name: "A" }).name).toMatch(/product name/);
    expect(errorsOf({ name: "x".repeat(121) }).name).toMatch(/120/);
    expect(errorsOf({ category: "cars" }).category).toBe("Choose a category.");
    expect(errorsOf({ summary: "short" }).summary).toMatch(/at least 10/);
    expect(errorsOf({ summary: "x".repeat(301) }).summary).toMatch(/300/);
  });

  it("limits the bullet points", () => {
    expect(errorsOf({ features: Array.from({ length: MAX_FEATURES + 1 }, (_, i) => `Point ${i}`).join("\n") }).features).toMatch(/at most 10/);
    expect(errorsOf({ features: "x".repeat(141) })["features"]).toMatch(/under 140/);
    expect(errorsOf({ features: "" })).toEqual({});
  });
});

describe("parseFeatures", () => {
  it("one per line, trimmed, blank lines and repeats removed, Windows newlines handled", () => {
    expect(parseFeatures("  A  \r\n\r\nB\nA\n   \nC   D")).toEqual(["A", "B", "C D"]);
    expect(parseFeatures("")).toEqual([]);
  });
});

describe("gallery validators", () => {
  const good = { title: "Mkaa", description: "", category: "product", alt: "Vipande vya mkaa" };
  it("accepts a normal item", () => {
    expect(galleryItemSchema.parse(good)).toMatchObject({ title: "Mkaa", description: null, published: false });
  });
  it("requires a title and a picture description (accessibility)", () => {
    expect(galleryItemSchema.safeParse({ ...good, title: "" }).success).toBe(false);
    expect(galleryItemSchema.safeParse({ ...good, alt: "" }).success).toBe(false);
    expect(galleryItemSchema.safeParse({ ...good, category: "x" }).success).toBe(false);
  });
  it("titleFromFileName makes a readable starting title", () => {
    expect(titleFromFileName("mkaa_safi-2.JPG")).toBe("Mkaa safi 2");
    expect(titleFromFileName("IMG.20260101.webp")).toBe("IMG 20260101");
    expect(titleFromFileName(".jpg")).toBe("Picha");
    expect(titleFromFileName("<b>x</b>.png")).toBe("B x b");
    expect(titleFromFileName("..\\..\\etc\\passwd.png")).toBe("Etc passwd");
    expect(titleFromFileName("a".repeat(300) + ".png").length).toBeLessThanOrEqual(120);
  });
});
