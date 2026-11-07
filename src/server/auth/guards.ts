import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/server/db/client";
import { readSessionToken } from "./cookie";
import { hasRole, type Role } from "./roles";
import { validateSession, type SessionUser } from "./session";

export type CurrentSession = { user: SessionUser; sessionId: string };

/** Loaded once per request, straight from the database, never trusted from the cookie alone. */
export const getSession = cache(async (): Promise<CurrentSession | null> => {
  const token = await readSessionToken();
  if (!token) return null;
  const found = await validateSession(getDb(), token);
  return found ? { user: found.user, sessionId: found.sessionId } : null;
});

export class AuthError extends Error {
  constructor(public readonly code: "unauthenticated" | "forbidden") {
    super(code === "unauthenticated" ? "Not signed in" : "Not allowed");
    this.name = "AuthError";
  }
}

/** For server actions and handlers: throws, the caller turns it into a response. */
export async function requireRole(minimum: Role): Promise<CurrentSession> {
  const session = await getSession();
  if (!session) throw new AuthError("unauthenticated");
  if (!hasRole(session.user.role, minimum)) throw new AuthError("forbidden");
  return session;
}

/** For pages and layouts: redirects. Call it in every protected page, not only in the layout. */
export async function requirePageRole(minimum: Role, returnTo?: string): Promise<CurrentSession> {
  const session = await getSession();
  if (!session) redirect(returnTo ? `/admin/login?next=${encodeURIComponent(returnTo)}` : "/admin/login");
  if (!hasRole(session.user.role, minimum)) redirect("/admin/forbidden");
  return session;
}
