import { describe, expect, it } from "vitest";
import {
  PASSWORD_MAX, PASSWORD_MIN, dummyHash, hashPassword, needsRehash, validatePassword, verifyPassword,
} from "@/server/auth/password";

describe("validatePassword", () => {
  it("accepts a reasonable password", () => {
    expect(validatePassword("mkaa-wa-mbono-2026")).toEqual([]);
    expect(validatePassword("Tunapanda9Miti")).toEqual([]);
  });

  it("requires the minimum length", () => {
    expect(validatePassword("abc1defg9")).toHaveLength(1); // 9 chars
    expect(validatePassword("abc1defg90")).toEqual([]); // 10 chars
    expect(PASSWORD_MIN).toBe(10);
  });

  it("rejects absurdly long input", () => {
    expect(validatePassword("a1".repeat(PASSWORD_MAX))).toContainEqual(expect.stringMatching(/at most/));
  });

  it("needs a letter and a number", () => {
    expect(validatePassword("1234567890123")).toContainEqual(expect.stringMatching(/letter/));
    expect(validatePassword("abcdefghijklm")).toContainEqual(expect.stringMatching(/number/));
  });

  it("does not force symbols or capital letters", () => {
    expect(validatePassword("alllowercase99")).toEqual([]);
  });

  it("rejects common passwords, including decorated ones", () => {
    for (const p of ["password123", "Password1234", "PASSWORD123!", "qwerty12345", "iloveyou2024", "mnyala12345", "Tanzania2026!"]) {
      expect(validatePassword(p), p).toContainEqual(expect.stringMatching(/too common/));
    }
  });

  it("does not flag an uncommon password that merely contains a common word", () => {
    expect(validatePassword("my-purple-password-garden-7")).toEqual([]);
  });

  it("rejects passwords that contain the email or the name", () => {
    expect(validatePassword("asha.mwakyusa@mnyala.co.tz", { email: "asha.mwakyusa@mnyala.co.tz" })).not.toEqual([]);
    expect(validatePassword("xx-asha.mwakyusa-99", { email: "asha.mwakyusa@mnyala.co.tz" })).toContainEqual(expect.stringMatching(/email/));
    expect(validatePassword("ashamwakyusa-2026!", { name: "Asha Mwakyusa" })).toContainEqual(expect.stringMatching(/name/));
  });

  it("ignores very short names so common letters do not cause false rejections", () => {
    expect(validatePassword("joaquin-4-bananas", { name: "Jo", email: "jo@x.co" })).toEqual([]);
  });
});

describe("hashing", () => {
  it("produces argon2id hashes that verify only the right password", async () => {
    const h = await hashPassword("correct-horse-42");
    expect(h.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(h, "correct-horse-42")).toBe(true);
    expect(await verifyPassword(h, "correct-horse-43")).toBe(false);
    expect(h).not.toContain("correct-horse");
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same-password-1")).not.toBe(await hashPassword("same-password-1"));
  });

  it("returns false (never throws) for a malformed stored hash", async () => {
    expect(await verifyPassword("not-a-hash", "x")).toBe(false);
    expect(await verifyPassword("", "x")).toBe(false);
  });

  it("detects weaker parameters that should be upgraded", async () => {
    expect(needsRehash(await hashPassword("whatever-123"))).toBe(false);
    expect(needsRehash("$argon2id$v=19$m=4096,t=1,p=1$c29tZXNhbHQ$aGFzaA")).toBe(true);
    expect(needsRehash("$2b$10$abcdefghijklmnopqrstuv")).toBe(true);
  });

  it("has a dummy hash that never matches anything, for constant-time sign-in", async () => {
    const d = await dummyHash();
    expect(d.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(d, "")).toBe(false);
    expect(await verifyPassword(d, "password")).toBe(false);
    expect(await dummyHash()).toBe(d);
  });
});
