import { hash } from "@node-rs/argon2";
import type { Db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/password";
import type { Role } from "@/server/auth/roles";

export const GOOD_PASSWORD = "mkaa-wa-mbono-2026";

export async function makeUser(
  db: Db,
  o: { email?: string; name?: string; role?: Role; password?: string | null; active?: boolean; rawHash?: string } = {},
) {
  const password = o.password === undefined ? GOOD_PASSWORD : o.password;
  const passwordHash = o.rawHash ?? (password === null ? null : await hashPassword(password));
  const [row] = await db
    .insert(users)
    .values({
      email: o.email ?? `user-${Math.random().toString(36).slice(2, 8)}@mnyala.test`,
      name: o.name ?? "Test User",
      role: o.role ?? "staff",
      isActive: o.active ?? true,
      passwordHash,
    })
    .returning();
  return row!;
}

/** A valid hash made with deliberately weak parameters (as an older deployment might have produced). */
export function weakParamsHash(password: string): Promise<string> {
  return hash(password, { memoryCost: 4096, timeCost: 1, parallelism: 1 });
}
