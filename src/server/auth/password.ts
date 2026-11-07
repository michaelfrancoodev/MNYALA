import { hash, verify } from "@node-rs/argon2";

export { PASSWORD_MAX, PASSWORD_MIN, validatePassword, type PasswordContext } from "@/lib/password-policy";

/* ---------------------------------------------------------------- hashing */

// argon2id, 19 MiB memory, 2 passes (OWASP minimum recommendation).
const PARAMS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, PARAMS);
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}

/** True when a stored hash was made with weaker parameters than the current ones. */
export function needsRehash(storedHash: string): boolean {
  const m = /^\$argon2id\$v=\d+\$m=(\d+),t=(\d+),p=(\d+)\$/.exec(storedHash);
  if (!m) return true;
  return Number(m[1]) < PARAMS.memoryCost || Number(m[2]) < PARAMS.timeCost || Number(m[3]) < PARAMS.parallelism;
}

let dummy: Promise<string> | undefined;

/**
 * A real hash that matches nothing. Sign-in verifies against it when the email is unknown,
 * so "no such user" and "wrong password" take the same time.
 */
export function dummyHash(): Promise<string> {
  dummy ??= hashPassword(`unused-${Math.random().toString(36)}-${Date.now()}`);
  return dummy;
}
