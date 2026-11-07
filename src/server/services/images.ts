import { randomBytes } from "node:crypto";
import sharp, { type Metadata } from "sharp";

export const VARIANT_TIERS = [480, 960, 1600] as const;
export type Tier = (typeof VARIANT_TIERS)[number];

export const MAX_DIMENSION = 6000;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export type ImageErrorCode = "too_large" | "unsupported" | "too_many_pixels" | "corrupt";

export class ImageError extends Error {
  constructor(
    public readonly code: ImageErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ImageError";
  }
}

export type ProcessedImage = {
  /** Random base name, no extension. */
  file: string;
  /** Size of the largest variant produced. */
  width: number;
  height: number;
  bytes: number;
  variants: Array<{ name: string; tier: Tier; width: number; height: number; data: Buffer }>;
};

/**
 * Validates by the real file content (not extension or declared type), applies EXIF rotation,
 * strips all metadata (including GPS), and encodes WebP variants. Never enlarges a small image.
 * Pass `fileName` for deterministic output (seeding); uploads leave it out and get a random name.
 */
export async function processImage(
  input: Buffer,
  options: { maxBytes: number; fileName?: string },
): Promise<ProcessedImage> {
  if (input.length === 0) throw new ImageError("corrupt", "The file is empty.");
  if (input.length > options.maxBytes) {
    throw new ImageError("too_large", `The file is larger than ${Math.round(options.maxBytes / 1024 / 1024)} MB.`);
  }

  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_DIMENSION * MAX_DIMENSION, failOn: "error" }).metadata();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/pixel limit/i.test(message)) throw new ImageError("too_many_pixels", "The image dimensions are too large.");
    throw new ImageError("corrupt", "This file is not a readable image.");
  }

  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new ImageError("unsupported", "Only JPEG, PNG and WebP images are accepted.");
  }
  if (!meta.width || !meta.height) throw new ImageError("corrupt", "This file is not a readable image.");
  if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
    throw new ImageError("too_many_pixels", `The image must be at most ${MAX_DIMENSION} pixels on each side.`);
  }

  const file = options.fileName ?? randomBytes(16).toString("hex");
  const variants: ProcessedImage["variants"] = [];

  for (const [index, tier] of VARIANT_TIERS.entries()) {
    const previous = VARIANT_TIERS[index - 1];
    // The smallest tier always exists; larger tiers only when the source is wider than the tier below.
    if (previous !== undefined && meta.width <= previous) continue;
    try {
      const { data, info } = await sharp(input, { limitInputPixels: MAX_DIMENSION * MAX_DIMENSION, failOn: "error" })
        .rotate()
        .resize({ width: tier, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer({ resolveWithObject: true });
      variants.push({ name: `${file}-${tier}.webp`, tier, width: info.width, height: info.height, data });
    } catch {
      throw new ImageError("corrupt", "This image could not be processed.");
    }
  }

  const largest = variants[variants.length - 1];
  if (!largest) throw new ImageError("corrupt", "This image could not be processed.");
  return { file, width: largest.width, height: largest.height, bytes: largest.data.length, variants };
}
