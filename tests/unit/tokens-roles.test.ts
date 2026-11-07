import { describe, expect, it } from "vitest";
import { ROLES, hasRole, isRole } from "@/server/auth/roles";
import { generateToken, hashToken } from "@/server/auth/tokens";

describe("tokens", () => {
  it("are 32 random bytes in URL-safe base64", () => {
    const t = generateToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(new Set(Array.from({ length: 200 }, generateToken)).size).toBe(200);
  });

  it("are stored only as a SHA-256 hash", () => {
    const t = generateToken();
    const h = hashToken(t);
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(h).not.toContain(t);
    expect(hashToken(t)).toBe(h);
    expect(hashToken(t + "x")).not.toBe(h);
  });

  it("matches the known SHA-256 vector", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("roles", () => {
  it("rank staff < admin < super_admin", () => {
    expect(ROLES).toEqual(["staff", "admin", "super_admin"]);
    const table: Array<[Parameters<typeof hasRole>[0], Parameters<typeof hasRole>[1], boolean]> = [
      ["staff", "staff", true], ["staff", "admin", false], ["staff", "super_admin", false],
      ["admin", "staff", true], ["admin", "admin", true], ["admin", "super_admin", false],
      ["super_admin", "staff", true], ["super_admin", "admin", true], ["super_admin", "super_admin", true],
    ];
    for (const [role, min, ok] of table) expect(hasRole(role, min), `${role} >= ${min}`).toBe(ok);
  });

  it("isRole only accepts the three known roles", () => {
    expect(isRole("admin")).toBe(true);
    for (const bad of ["owner", "ADMIN", "", null, undefined, 3, {}]) expect(isRole(bad)).toBe(false);
  });
});
