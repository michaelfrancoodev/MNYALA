import sharp, { type Sharp } from "sharp";
import { describe, expect, it } from "vitest";
import { ImageError, MAX_DIMENSION, processImage } from "@/server/services/images";

const MAX = 5 * 1024 * 1024;

const jpeg = (w: number, h: number, extra?: (s: Sharp) => Sharp) => {
  const base = sharp({ create: { width: w, height: h, channels: 3, background: { r: 40, g: 120, b: 60 } } });
  return (extra ? extra(base) : base).jpeg().toBuffer();
};

async function code(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (e) {
    if (e instanceof ImageError) return e.code;
    throw e;
  }
  return "accepted";
}

describe("processImage: accepted input", () => {
  it("produces 3 WebP variants for a large photo and never exceeds 1600px", async () => {
    const out = await processImage(await jpeg(2400, 1600), { maxBytes: MAX });
    expect(out.variants.map((v) => v.tier)).toEqual([480, 960, 1600]);
    expect(out.variants.map((v) => v.width)).toEqual([480, 960, 1600]);
    for (const v of out.variants) {
      expect((await sharp(v.data).metadata()).format).toBe("webp");
      expect(v.name).toBe(`${out.file}-${v.tier}.webp`);
    }
    expect(out.width).toBe(1600);
  });

  it("never enlarges a small image and uses fewer variants", async () => {
    const mid = await processImage(await jpeg(800, 600), { maxBytes: MAX });
    expect(mid.variants.map((v) => v.width)).toEqual([480, 800]);
    const small = await processImage(await jpeg(300, 200), { maxBytes: MAX });
    expect(small.variants).toHaveLength(1);
    expect(small.variants[0]?.width).toBe(300);
    expect(small.variants[0]?.name).toMatch(/-480\.webp$/);
  });

  it("accepts PNG (with transparency) and WebP", async () => {
    const png = await sharp({ create: { width: 100, height: 100, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.5 } } }).png().toBuffer();
    const webp = await sharp({ create: { width: 100, height: 100, channels: 3, background: "#fff" } }).webp().toBuffer();
    expect(await code(processImage(png, { maxBytes: MAX }))).toBe("accepted");
    expect(await code(processImage(webp, { maxBytes: MAX }))).toBe("accepted");
  });

  it("applies EXIF rotation so portrait phone photos are upright", async () => {
    const input = await jpeg(400, 200, (s) => s.withMetadata({ orientation: 6 }));
    const out = await processImage(input, { maxBytes: MAX });
    expect(out.height).toBeGreaterThan(out.width);
  });

  it("strips EXIF metadata (location, camera, copyright) from every variant", async () => {
    const input = await jpeg(1000, 700, (s) => s.withExif({ IFD0: { Copyright: "SECRET-OWNER-TAG", Artist: "SECRET-ARTIST" } }));
    expect((await sharp(input).metadata()).exif).toBeDefined();
    const out = await processImage(input, { maxBytes: MAX });
    for (const v of out.variants) {
      expect((await sharp(v.data).metadata()).exif).toBeUndefined();
      expect(v.data.includes(Buffer.from("SECRET-OWNER-TAG"))).toBe(false);
      expect(v.data.includes(Buffer.from("SECRET-ARTIST"))).toBe(false);
    }
  });

  it("uses unpredictable names unless a fixed name is requested", async () => {
    const buf = await jpeg(500, 500);
    const a = await processImage(buf, { maxBytes: MAX });
    const b = await processImage(buf, { maxBytes: MAX });
    expect(a.file).toMatch(/^[a-f0-9]{32}$/);
    expect(a.file).not.toBe(b.file);
    const fixed = await processImage(buf, { maxBytes: MAX, fileName: "0123456789abcdef0123456789abcdef" });
    expect(fixed.file).toBe("0123456789abcdef0123456789abcdef");
  });
});

describe("processImage: rejected input", () => {
  it("rejects a text file renamed to .jpg", async () => {
    expect(await code(processImage(Buffer.from("this is not an image, just text"), { maxBytes: MAX }))).toBe("corrupt");
  });

  it("rejects an empty file", async () => {
    expect(await code(processImage(Buffer.alloc(0), { maxBytes: MAX }))).toBe("corrupt");
  });

  it("rejects SVG (can carry scripts)", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>');
    expect(await code(processImage(svg, { maxBytes: MAX }))).toBe("unsupported");
  });

  it("rejects GIF", async () => {
    const gif = await sharp({ create: { width: 10, height: 10, channels: 3, background: "#000" } }).gif().toBuffer();
    expect(await code(processImage(gif, { maxBytes: MAX }))).toBe("unsupported");
  });

  it("rejects a file over the size limit", async () => {
    expect(await code(processImage(await jpeg(1500, 1500), { maxBytes: 1000 }))).toBe("too_large");
  });

  it("rejects an image wider or taller than the dimension cap", async () => {
    const wide = await sharp({ create: { width: MAX_DIMENSION + 1, height: 10, channels: 3, background: "#000" } }).png().toBuffer();
    expect(await code(processImage(wide, { maxBytes: MAX }))).toBe("too_many_pixels");
  });

  it("rejects a truncated JPEG", async () => {
    const good = await jpeg(800, 800);
    expect(await code(processImage(good.subarray(0, 300), { maxBytes: MAX }))).toBe("corrupt");
  });
});
