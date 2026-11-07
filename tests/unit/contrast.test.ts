import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");

function token(name: string): string {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m?.[1]) throw new Error(`token --color-${name} not found in globals.css`);
  return m[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background, where it is used]
const pairs: Array<[string, string, string]> = [
  ["ink", "paper", "body text"],
  ["ink", "surface", "text on cards and inputs"],
  ["ink-soft", "paper", "secondary text"],
  ["muted", "paper", "hints and captions"],
  ["muted", "surface", "hints inside cards"],
  ["brand-dark", "paper", "links"],
  ["brand-dark", "brand-tint", "links on tinted areas"],
  ["surface", "brand", "primary button label"],
  ["surface", "brand-dark", "primary button hover"],
  ["surface", "danger", "danger button label"],
  ["danger", "surface", "field error text"],
  ["danger", "paper", "error text on page"],
  ["ink", "danger-tint", "error alert text"],
  ["ink", "brand-tint", "success alert text"],
  ["ember", "paper", "small accent text"],
  ["ember", "ember-tint", "accent badge"],
];

describe("colour tokens meet WCAG AA (4.5:1) for text", () => {
  it.each(pairs)("%s on %s (%s)", (fg, bg) => {
    expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("the old bright amber would have failed, which is why it is not used for text", () => {
    expect(ratio("#f5a623", token("paper"))).toBeLessThan(3);
  });
});
