"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { forgotPasswordSchema, loginSchema, safeNextPath, setPasswordSchema } from "@/lib/validators/auth";
import { clearSessionCookie, readSessionToken, setSessionCookie } from "@/server/auth/cookie";
import { getSession } from "@/server/auth/guards";
import { revokeSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { acceptInvite, login, requestPasswordReset, resetPassword } from "@/server/services/auth-service";
import { audit } from "@/server/services/audit";
import { fieldErrorsFrom, formValue, getAuthDeps, requestMeta, type ActionState } from "./core";

const INVALID_CREDENTIALS = "Invalid email or password.";

function waitMessage(retryAfterSec: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `Too many attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}

export async function loginAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const raw = { email: formValue(fd, "email"), password: formValue(fd, "password") };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues), values: { email: raw.email } };
  }

  const meta = await requestMeta();
  const result = await login(getAuthDeps(), { ...parsed.data, ...meta });
  if (!result.ok) {
    const message = result.reason === "rate_limited" ? waitMessage(result.retryAfterSec) : INVALID_CREDENTIALS;
    return { ok: false, message, values: { email: raw.email } };
  }

  await setSessionCookie(result.token, result.expiresAt);
  // safeNextPath only returns paths inside /admin, so the cast is safe.
  redirect((safeNextPath(formValue(fd, "next")) ?? "/admin") as Route);
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  const token = await readSessionToken();
  if (token) await revokeSession(getDb(), token);
  if (session) {
    const meta = await requestMeta();
    await audit(getDb(), { userId: session.user.id, action: "user.logout", entityType: "user", entityId: session.user.id, ...meta });
  }
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function forgotPasswordAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const raw = { email: formValue(fd, "email") };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues), values: raw };

  const { ip } = await requestMeta();
  // Not awaited: the work (and any email) happens after we reply, so timing reveals nothing.
  void requestPasswordReset(getAuthDeps(), { email: parsed.data.email, ip });
  return { ok: true, message: "If that email belongs to an account, we have sent a link to reset the password. It is valid for 30 minutes." };
}

export async function resetPasswordAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const parsed = setPasswordSchema.safeParse({ password: formValue(fd, "password"), confirm: formValue(fd, "confirm") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const meta = await requestMeta();
  const result = await resetPassword(getAuthDeps(), { token: formValue(fd, "token"), password: parsed.data.password, ...meta });
  if (!result.ok) {
    if (result.reason === "weak_password") return { ok: false, fieldErrors: { password: result.problems } };
    return { ok: false, message: "This link is no longer valid. Ask for a new one." };
  }
  redirect("/admin/login?notice=password-reset");
}

export async function acceptInviteAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const parsed = setPasswordSchema.safeParse({ password: formValue(fd, "password"), confirm: formValue(fd, "confirm") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const meta = await requestMeta();
  const result = await acceptInvite(getAuthDeps(), { token: formValue(fd, "token"), password: parsed.data.password, ...meta });
  if (!result.ok) {
    if (result.reason === "weak_password") return { ok: false, fieldErrors: { password: result.problems } };
    return { ok: false, message: "This invitation is no longer valid. Ask a super admin to send a new one." };
  }
  if (result.session) await setSessionCookie(result.session.token, result.session.expiresAt);
  redirect("/admin");
}
