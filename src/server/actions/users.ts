"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Role } from "@/server/auth/roles";
import { revokeUserSessions } from "@/server/auth/session";
import { audit } from "@/server/services/audit";
import {
  deleteUser,
  inviteUser,
  resendInvite,
  setUserActive,
  updateUserRoleAndName,
  UserAdminError,
} from "@/server/services/users-admin";
import { authorize, fieldErrorsFrom, formValue, getAuthDeps, runAdminAction, type ActionState } from "./core";

const inviteSchema = z.object({
  name: z.string().trim().min(2, "Enter the person's full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  role: z.enum(["staff", "admin", "super_admin"] as const, { error: "Choose a role." }),
});

export async function inviteUserAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("super_admin", async (ctx): Promise<ActionState> => {
    const raw = {
      name: formValue(fd, "name"),
      email: formValue(fd, "email"),
      role: formValue(fd, "role"),
    };

    const parsed = inviteSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues), values: raw };
    }

    try {
      const deps = getAuthDeps();
      await inviteUser(deps, {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        inviterId: ctx.user.id,
        inviterName: ctx.user.name,
        meta: { ip: ctx.ip, userAgent: ctx.userAgent },
      });
    } catch (error) {
      if (error instanceof UserAdminError) {
        return { ok: false, message: error.message, values: raw };
      }
      throw error;
    }

    revalidatePath("/admin/users");
    redirect("/admin/users?notice=invited" as Route);
  });
}

export async function resendInviteAction(fd: FormData): Promise<void> {
  const ctx = await authorize("super_admin");
  const userId = formValue(fd, "userId");

  try {
    const deps = getAuthDeps();
    await resendInvite(deps, {
      userId,
      inviterId: ctx.user.id,
      inviterName: ctx.user.name,
      meta: { ip: ctx.ip, userAgent: ctx.userAgent },
    });
  } catch {
    redirect("/admin/users?notice=error" as Route);
  }

  redirect("/admin/users?notice=invite-sent" as Route);
}

export async function updateUserAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("super_admin", async (ctx): Promise<ActionState> => {
    const id = formValue(fd, "id");
    const name = formValue(fd, "name").trim();
    const role = formValue(fd, "role") as Role;

    if (!name || name.length < 2) {
      return { ok: false, fieldErrors: { name: ["Enter a valid name."] } };
    }

    try {
      await updateUserRoleAndName(ctx.db, {
        id,
        name,
        role,
        operator: { id: ctx.user.id, role: ctx.user.role },
      });
      await audit(ctx.db, {
        userId: ctx.user.id,
        action: "user.updated",
        entityType: "user",
        entityId: id,
        details: { name, role },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
    } catch (error) {
      if (error instanceof UserAdminError) {
        return { ok: false, message: error.message };
      }
      throw error;
    }

    revalidatePath("/admin/users");
    redirect("/admin/users?notice=saved" as Route);
  });
}

export async function toggleUserActiveAction(fd: FormData): Promise<void> {
  const ctx = await authorize("super_admin");
  const id = formValue(fd, "id");
  const active = formValue(fd, "active") === "1";

  try {
    await setUserActive(ctx.db, {
      id,
      active,
      operator: { id: ctx.user.id, role: ctx.user.role },
    });
    await audit(ctx.db, {
      userId: ctx.user.id,
      action: active ? "user.activated" : "user.deactivated",
      entityType: "user",
      entityId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  } catch (error) {
    if (error instanceof UserAdminError) {
      redirect("/admin/users?notice=error" as Route);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users?notice=${active ? "activated" : "deactivated"}` as Route);
}

export async function revokeUserSessionsAction(fd: FormData): Promise<void> {
  const ctx = await authorize("super_admin");
  const id = formValue(fd, "id");

  await revokeUserSessions(ctx.db, id);
  await audit(ctx.db, {
    userId: ctx.user.id,
    action: "user.sessions_revoked",
    entityType: "user",
    entityId: id,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  redirect("/admin/users?notice=sessions-cleared" as Route);
}

export async function deleteUserAction(fd: FormData): Promise<void> {
  const ctx = await authorize("super_admin");
  const id = formValue(fd, "id");

  try {
    await deleteUser(ctx.db, {
      id,
      operator: { id: ctx.user.id, role: ctx.user.role },
    });
    await audit(ctx.db, {
      userId: ctx.user.id,
      action: "user.deleted",
      entityType: "user",
      entityId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  } catch (error) {
    if (error instanceof UserAdminError) {
      redirect("/admin/users?notice=cannot-delete" as Route);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?notice=deleted" as Route);
}
