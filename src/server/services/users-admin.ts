import { and, desc, eq, sql } from "drizzle-orm";
import type { Role } from "@/server/auth/roles";
import type { Db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { audit } from "./audit";
import type { AuthDeps } from "./auth-service";
import { INVITE_TOKEN_HOURS, issueToken, normalizeEmail } from "./auth-service";
import { inviteEmail } from "./mail-templates";
import { revokeUserSessions } from "@/server/auth/session";

export class UserAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAdminError";
  }
}

export async function countActiveSuperAdmins(db: Db): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, "super_admin"), eq(users.isActive, true)));
  return row?.count ?? 0;
}

export async function listUsersAdmin(db: Db) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      hasPassword: sql<boolean>`${users.passwordHash} is not null`,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getUserAdmin(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      hasPassword: sql<boolean>`${users.passwordHash} is not null`,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id));
  return user ?? null;
}

export async function inviteUser(
  deps: AuthDeps,
  args: {
    name: string;
    email: string;
    role: Role;
    inviterId: string;
    inviterName?: string;
    meta?: { ip?: string | null; userAgent?: string | null };
  },
) {
  const { db, mailer, appUrl } = deps;
  const email = normalizeEmail(args.email);

  // Check if email is already registered
  const [existing] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`);
  if (existing) {
    throw new UserAdminError("A user with this email address already exists.");
  }

  const [newUser] = await db
    .insert(users)
    .values({
      name: args.name.trim(),
      email,
      role: args.role,
      isActive: true,
      createdBy: args.inviterId,
    })
    .returning();

  if (!newUser) throw new Error("Could not create user.");

  const token = await issueToken(db, newUser.id, "invite", INVITE_TOKEN_HOURS * 60 * 60 * 1000);
  const link = `${appUrl.replace(/\/$/, "")}/admin/accept-invite/${token}`;

  await audit(db, {
    userId: args.inviterId,
    action: "user.invited",
    entityType: "user",
    entityId: newUser.id,
    details: { name: newUser.name, email: newUser.email, role: newUser.role },
    ip: args.meta?.ip ?? null,
    userAgent: args.meta?.userAgent ?? null,
  });

  await mailer
    .send({
      to: newUser.email,
      ...inviteEmail({ name: newUser.name, inviterName: args.inviterName || "Mnyala Admin", link, hours: INVITE_TOKEN_HOURS }),
    })
    .catch(() => {});

  return newUser;
}

export async function resendInvite(
  deps: AuthDeps,
  args: {
    userId: string;
    inviterId: string;
    inviterName?: string;
    meta?: { ip?: string | null; userAgent?: string | null };
  },
) {
  const { db, mailer, appUrl } = deps;
  const [user] = await db.select().from(users).where(eq(users.id, args.userId));
  if (!user) throw new UserAdminError("User not found.");

  const token = await issueToken(db, user.id, "invite", INVITE_TOKEN_HOURS * 60 * 60 * 1000);
  const link = `${appUrl.replace(/\/$/, "")}/admin/accept-invite/${token}`;

  await audit(db, {
    userId: args.inviterId,
    action: "user.invite_resent",
    entityType: "user",
    entityId: user.id,
    details: { email: user.email },
    ip: args.meta?.ip ?? null,
    userAgent: args.meta?.userAgent ?? null,
  });

  await mailer
    .send({
      to: user.email,
      ...inviteEmail({ name: user.name, inviterName: args.inviterName || "Mnyala Admin", link, hours: INVITE_TOKEN_HOURS }),
    })
    .catch(() => {});
}

export async function updateUserRoleAndName(
  db: Db,
  args: {
    id: string;
    name: string;
    role: Role;
    operator: { id: string; role: Role };
  },
) {
  const { id, name, role, operator } = args;

  if (operator.id === id && operator.role !== role) {
    throw new UserAdminError("You cannot change your own role.");
  }

  const [target] = await db.select().from(users).where(eq(users.id, id));
  if (!target) throw new UserAdminError("User not found.");

  if (target.role === "super_admin" && role !== "super_admin") {
    const superAdminCount = await countActiveSuperAdmins(db);
    if (superAdminCount <= 1) {
      throw new UserAdminError("Cannot demote the last active super admin.");
    }
  }

  const [updated] = await db
    .update(users)
    .set({ name: name.trim(), role })
    .where(eq(users.id, id))
    .returning();

  return updated ?? null;
}

export async function setUserActive(
  db: Db,
  args: {
    id: string;
    active: boolean;
    operator: { id: string; role: Role };
  },
) {
  const { id, active, operator } = args;

  if (operator.id === id) {
    throw new UserAdminError("You cannot deactivate your own account.");
  }

  const [target] = await db.select().from(users).where(eq(users.id, id));
  if (!target) throw new UserAdminError("User not found.");

  if (target.role === "super_admin" && !active) {
    const superAdminCount = await countActiveSuperAdmins(db);
    if (superAdminCount <= 1) {
      throw new UserAdminError("Cannot deactivate the last active super admin.");
    }
  }

  if (!active) {
    await revokeUserSessions(db, id);
  }

  const [updated] = await db
    .update(users)
    .set({ isActive: active })
    .where(eq(users.id, id))
    .returning();

  return updated ?? null;
}

export async function deleteUser(
  db: Db,
  args: {
    id: string;
    operator: { id: string; role: Role };
  },
) {
  const { id, operator } = args;

  if (operator.id === id) {
    throw new UserAdminError("You cannot delete your own account.");
  }

  const [target] = await db.select().from(users).where(eq(users.id, id));
  if (!target) throw new UserAdminError("User not found.");

  if (target.role === "super_admin") {
    const superAdminCount = await countActiveSuperAdmins(db);
    if (superAdminCount <= 1) {
      throw new UserAdminError("Cannot delete the last active super admin.");
    }
  }

  await revokeUserSessions(db, id);
  await db.delete(users).where(eq(users.id, id));
  return true;
}
