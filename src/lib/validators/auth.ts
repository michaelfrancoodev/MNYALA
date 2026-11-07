import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "That email address is too long.")
  .pipe(z.email({ error: "Enter a valid email address." }));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(1024, "That password is too long."),
});

export const forgotPasswordSchema = z.object({ email });

export const setPasswordSchema = z
  .object({
    password: z.string().min(1, "Choose a password.").max(1024),
    confirm: z.string().min(1, "Type the password again."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords do not match." });

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password.").max(1024),
    password: z.string().min(1, "Choose a new password.").max(1024),
    confirm: z.string().min(1, "Type the new password again."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords do not match." });

/** Only paths inside the admin are acceptable redirect targets after sign-in. */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!(value === "/admin" || value.startsWith("/admin/") || value.startsWith("/admin?"))) return null;
  if (value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return null;
  // Dot segments and encoded dots/slashes would let "/admin/../x" or "/admin/%2e%2e/x" leave the admin.
  if (value.includes("..") || /%(2e|2f|5c|00)/i.test(value)) return null;
  if (/^\/admin\/(login|forgot-password|reset-password|accept-invite)/.test(value)) return null;
  return value.length <= 300 ? value : null;
}
