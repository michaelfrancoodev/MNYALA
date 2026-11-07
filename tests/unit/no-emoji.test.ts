import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Project rule: no emoji anywhere in the product or its source.
// Covers emoji blocks, dingbats/misc symbols, variation selector 16 and the zero-width joiner.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}\u{FE0F}\u{200D}]/u;
const ROOTS = ["src", "scripts", "tests", "seed-assets"].map((r) => path.resolve(r));
const TEXT_EXT = new Set([".ts", ".tsx", ".mts", ".css", ".md", ".json", ".mjs", ".sql", ".yml", ".yaml", ".html"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("no emoji", () => {
  const files = [
    ...ROOTS.flatMap((r) => walk(r)),
    ...["README.md", "DECISIONS.md", "package.json"].map((f) => path.resolve(f)).filter((f) => {
      try {
        return statSync(f).isFile();
      } catch {
        return false;
      }
    }),
  ].filter((f) => TEXT_EXT.has(path.extname(f)));

  it("scans a meaningful number of files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("finds no emoji in any source, content or documentation file", () => {
    const offenders = files.filter((f) => f !== path.resolve("tests/unit/no-emoji.test.ts") && EMOJI.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("the detector itself works", () => {
    expect(EMOJI.test("plain text")).toBe(false);
    expect(EMOJI.test("smile \u{1F600}")).toBe(true);
    expect(EMOJI.test("check \u2705")).toBe(true);
    expect(EMOJI.test("Swahili: Mnyala, Mbeya, mbegu za mbono")).toBe(false);
  });
});
