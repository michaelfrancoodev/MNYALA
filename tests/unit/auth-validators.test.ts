import { describe, expect, it } from "vitest";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, safeNextPath, setPasswordSchema } from "@/lib/validators/auth";

describe("safeNextPath (open-redirect guard)", () => {
  it.each(["/admin", "/admin/orders", "/admin/messages?page=2", "/admin/orders/9f3a?tab=items"])("accepts %s", (v) => {
    expect(safeNextPath(v)).toBe(v);
  });

  it.each([
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/admin\\..\\x",
    "/admin/../x",
    "/admin/%2e%2e/x",
    "/admin/%2E%2E/x",
    "/admin%2f..%2fx",
    "/admin/..",
    "/adminx/../../etc",
    "/administrator",
    "javascript:alert(1)",
    "/",
    "/products",
    "admin",
    "",
    "/admin/login",
    "/admin/login?next=/admin",
    "/admin/forgot-password",
    "/admin/reset-password/abc",
    "/admin/accept-invite/abc",
    "/admin/\u0000x",
    "/admin/\nSet-Cookie: a=b",
    `/admin/${"a".repeat(400)}`,
  ])("rejects %j", (v) => {
    expect(safeNextPath(v)).toBeNull();
  });

  it("rejects non-strings", () => {
    for (const v of [null, undefined, 5, {}, ["/admin"]]) expect(safeNextPath(v)).toBeNull();
  });
});

describe("login/forgot schemas", () => {
  it("trim the email and demand a valid one", () => {
    expect(loginSchema.parse({ email: "  a@b.co ", password: "x" }).email).toBe("a@b.co");
    expect(loginSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x".repeat(1025) }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "a".repeat(250) + "@b.co" }).success).toBe(false);
  });
});

describe("set/change password schemas", () => {
  it("require both fields to match, and point the error at the confirm field", () => {
    const r = setPasswordSchema.safeParse({ password: "abcdefghij1", confirm: "abcdefghij2" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["confirm"]);
    expect(setPasswordSchema.safeParse({ password: "abcdefghij1", confirm: "abcdefghij1" }).success).toBe(true);
  });

  it("change-password also needs the current password", () => {
    expect(changePasswordSchema.safeParse({ current: "", password: "abcdefghij1", confirm: "abcdefghij1" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ current: "old", password: "abcdefghij1", confirm: "abcdefghij1" }).success).toBe(true);
  });
});
