import { createHash, randomBytes } from "node:crypto";

/** 32 random bytes, URL-safe. This is what goes in a cookie or an emailed link. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** What we store. A leaked database therefore does not leak working sessions or reset links. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
