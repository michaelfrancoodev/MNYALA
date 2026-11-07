import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEnv } from "@/lib/env";
import { getDb, type Db } from "@/server/db/client";
import { AuthError, requireRole, type CurrentSession } from "@/server/auth/guards";
import type { Role } from "@/server/auth/roles";
import { clientIp, userAgent } from "@/server/request";
import { getMailer } from "@/server/services/mail";
import type { AuthDeps } from "@/server/services/auth-service";

/** What every form action returns. Expected problems are values, not exceptions. */
export type ActionState =
  | { ok: true; message: string; id?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string[]>; values?: Record<string, string> };

export const NOT_ALLOWED = "You do not have permission to do this.";
export const SESSION_ENDED = "Your session has ended. Sign in again to continue.";

export async function requestMeta() {
  const h = await headers();
  return { ip: clientIp(h, getEnv().TRUST_PROXY), userAgent: userAgent(h) };
}

export function getAuthDeps(): AuthDeps {
  return { db: getDb(), mailer: getMailer(), appUrl: getEnv().APP_URL };
}

export type ActionContext = CurrentSession & { db: Db; ip: string | null; userAgent: string | null };

/**
 * Wraps an admin action: checks the session and the minimum role inside the action itself (never
 * only in a layout or middleware), supplies request details, and turns auth failures into a message.
 */
export async function runAdminAction(
  minimum: Role,
  fn: (ctx: ActionContext) => Promise<ActionState>,
): Promise<ActionState> {
  let session: CurrentSession;
  try {
    session = await requireRole(minimum);
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: error.code === "unauthenticated" ? SESSION_ENDED : NOT_ALLOWED };
    }
    throw error;
  }
  const meta = await requestMeta();
  return fn({ ...session, db: getDb(), ...meta });
}

/** Zod issues -> { field: [messages] } for display next to each input. */
export function fieldErrorsFrom(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export function formValue(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

/**
 * For actions that are plain `<form action>` handlers returning nothing. Checks the session and the minimum role
 * on the server, and sends the person to sign in or to the "no access" page instead of doing anything.
 */
export async function authorize(minimum: Role): Promise<ActionContext> {
  let session: CurrentSession;
  try {
    session = await requireRole(minimum);
  } catch (error) {
    if (error instanceof AuthError) redirect(error.code === "unauthenticated" ? "/admin/login" : "/admin/forbidden");
    throw error;
  }
  const meta = await requestMeta();
  return { ...session, db: getDb(), ...meta };
}
