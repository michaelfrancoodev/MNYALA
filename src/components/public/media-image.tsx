import type { MediaRef } from "@/server/services/site";

/** Tiers that exist for an image whose largest stored variant is `width` pixels wide (see processImage). */
export function imageSources(file: string, width: number): { src: string; srcSet: string } {
  const tiers: Array<{ tier: number; w: number }> = [{ tier: 480, w: Math.min(480, width) }];
  if (width > 480) tiers.push({ tier: 960, w: Math.min(960, width) });
  if (width > 960) tiers.push({ tier: 1600, w: Math.min(1600, width) });
  const url = (t: number) => `/uploads/${file}-${t}.webp`;
  return {
    src: url(tiers[tiers.length - 1]!.tier),
    srcSet: tiers.map((t) => `${url(t.tier)} ${t.w}w`).join(", "),
  };
}

export function MediaImage({
  image,
  sizes,
  className,
  priority = false,
}: {
  image: MediaRef;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const { src, srcSet } = imageSources(image.file, image.width);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- already resized to WebP tiers by processImage
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
}
