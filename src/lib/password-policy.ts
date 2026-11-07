import { COMMON_PASSWORDS } from "./common-passwords";

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

export type PasswordContext = { email?: string; name?: string };

/**
 * The one password policy. Every place that sets a password (first admin, invite, reset, change)
 * calls this, so a password accepted in one place can always be used to sign in.
 * Returns a list of plain-language problems; an empty list means the password is acceptable.
 */
export function validatePassword(password: string, context: PasswordContext = {}): string[] {
  const problems: string[] = [];
  if (password.length < PASSWORD_MIN) problems.push(`Use at least ${PASSWORD_MIN} characters.`);
  if (password.length > PASSWORD_MAX) problems.push(`Use at most ${PASSWORD_MAX} characters.`);
  if (!/\p{L}/u.test(password)) problems.push("Include at least one letter.");
  if (!/\d/.test(password)) problems.push("Include at least one number.");

  const lower = password.toLowerCase();
  const stripped = lower.replace(/[\d\W_]+$/u, "");
  if (COMMON_PASSWORDS.has(lower) || (stripped.length >= 5 && COMMON_PASSWORDS.has(stripped))) {
    problems.push("This password is too common. Choose something less guessable.");
  }

  const email = context.email?.trim().toLowerCase();
  const local = email?.split("@")[0] ?? "";
  if ((email && lower === email) || (local.length >= 4 && lower.includes(local))) {
    problems.push("The password must not contain your email address.");
  }
  const name = context.name?.trim().toLowerCase().replace(/\s+/g, "");
  if (name && name.length >= 4 && lower.includes(name)) {
    problems.push("The password must not contain your name.");
  }
  return problems;
}

