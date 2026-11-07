import { mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLocalStorage, isSafeStoredName } from "@/server/services/storage";

const NAME = `${"a1".repeat(16)}-480.webp`;
let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "mnyala-storage-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("isSafeStoredName", () => {
  it.each([
    [NAME, true],
    [`${"f".repeat(32)}-960.webp`, true],
    [`${"0".repeat(32)}-1600.webp`, true],
    ["../" + NAME, false],
    ["/etc/passwd", false],
    ["a/" + NAME, false],
    [NAME.replace(".webp", ".jpg"), false],
    [`${"A1".repeat(16)}-480.webp`, false],
    [`${"a1".repeat(16)}-481.webp`, false],
    [`${"a1".repeat(15)}-480.webp`, false],
    [NAME + "\0", false],
    ["..\\" + NAME, false],
    ["", false],
    ["photo.webp", false],
  ])("%j -> %s", (name, ok) => {
    expect(isSafeStoredName(name)).toBe(ok);
  });
});

describe("local storage", () => {
  it("stores, reads and removes a file", async () => {
    const s = createLocalStorage(dir);
    await s.put(NAME, Buffer.from("hello"));
    expect((await s.read(NAME))?.toString()).toBe("hello");
    await s.remove(NAME);
    expect(await s.read(NAME)).toBeNull();
  });

  it("returns null for a missing file and tolerates removing it twice", async () => {
    const s = createLocalStorage(dir);
    expect(await s.read(NAME)).toBeNull();
    await expect(s.remove(NAME)).resolves.toBeUndefined();
  });

  it("refuses unsafe names for every operation and writes nothing outside the folder", async () => {
    const s = createLocalStorage(path.join(dir, "uploads"));
    for (const bad of ["../escape.webp", "/tmp/x.webp", "evil.php"]) {
      await expect(s.put(bad, Buffer.from("x"))).rejects.toThrow("Unsafe");
      await expect(s.read(bad)).rejects.toThrow("Unsafe");
      await expect(s.remove(bad)).rejects.toThrow("Unsafe");
    }
    expect(await readdir(dir)).toEqual([]);
  });
});
