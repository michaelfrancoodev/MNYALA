import sharp from "sharp";

export const jpeg = (w = 1200, h = 800, color = { r: 40, g: 120, b: 60 }) =>
  sharp({ create: { width: w, height: h, channels: 3, background: color } }).jpeg().toBuffer();
export const png = (w = 300, h = 200) => sharp({ create: { width: w, height: h, channels: 3, background: "#fff" } }).png().toBuffer();
