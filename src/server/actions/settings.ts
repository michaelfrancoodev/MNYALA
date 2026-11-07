"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ne, eq, and } from "drizzle-orm";
import { sessions } from "@/server/db/schema";
import { audit } from "@/server/services/audit";
import { changePassword } from "@/server/services/auth-service";
import { updateSiteSettings } from "@/server/services/site";
import { authorize, formValue, getAuthDeps, runAdminAction, type ActionState } from "./core";

export async function changePasswordAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("staff", async (ctx): Promise<ActionState> => {
    const currentPassword = formValue(fd, "currentPassword");
    const newPassword = formValue(fd, "newPassword");

    if (!currentPassword) return { ok: false, fieldErrors: { currentPassword: ["Enter your current password."] } };
    if (!newPassword) return { ok: false, fieldErrors: { newPassword: ["Enter a new password."] } };

    const deps = getAuthDeps();
    const result = await changePassword(deps, {
      userId: ctx.user.id,
      currentSessionId: ctx.sessionId,
      currentPassword,
      newPassword,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    if (!result.ok) {
      if (result.reason === "wrong_current") {
        return { ok: false, fieldErrors: { currentPassword: ["The current password you entered is incorrect."] } };
      }
      if (result.reason === "weak_password") {
        return { ok: false, fieldErrors: { newPassword: result.problems } };
      }
      if (result.reason === "rate_limited") {
        return { ok: false, message: `Too many attempts. Try again in ${result.retryAfterSec} seconds.` };
      }
      return { ok: false, message: "Could not change password." };
    }

    redirect("/admin/settings?notice=password-changed" as Route);
  });
}

export async function saveSiteSettingsAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("admin", async (ctx): Promise<ActionState> => {
    const keys = [
      "contact.phone",
      "contact.whatsapp",
      "contact.email",
      "contact.address",
      "contact.hours",
      "site.tagline",
      "social.facebook",
      "social.instagram",
      "stats.1.value",
      "stats.1.label",
      "stats.2.value",
      "stats.2.label",
      "stats.3.value",
      "stats.3.label",
      "stats.4.value",
      "stats.4.label",
    ];

    const values: Record<string, string> = {};
    for (const key of keys) {
      values[key] = formValue(fd, key);
    }

    await updateSiteSettings(ctx.db, values, ctx.user.id);
    await audit(ctx.db, {
      userId: ctx.user.id,
      action: "settings.updated",
      entityType: "settings",
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    revalidatePath("/", "layout");
    redirect("/admin/settings?notice=settings-saved" as Route);
  });
}

export async function revokeOtherSessionsAction(fd: FormData): Promise<void> {
  const ctx = await authorize("staff");
  const currentSessionId = formValue(fd, "currentSessionId");

  if (currentSessionId) {
    await ctx.db
      .delete(sessions)
      .where(and(eq(sessions.userId, ctx.user.id), ne(sessions.id, currentSessionId)));
  }

  await audit(ctx.db, {
    userId: ctx.user.id,
    action: "user.sessions_revoked_others",
    entityType: "user",
    entityId: ctx.user.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  redirect("/admin/settings?notice=other-sessions-revoked" as Route);
}
