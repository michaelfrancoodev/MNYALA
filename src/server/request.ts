import { isIP } from "node:net";

/**
 * The client address, or null when we cannot know it safely.
 * Only trusted when the app sits behind our own reverse proxy (TRUST_PROXY=true). We take the LAST
 * X-Forwarded-For entry, the one our proxy appended, because earlier entries are client-controlled.
 */
export function clientIp(headers: Pick<Headers, "get">, trustProxy: boolean): string | null {
  if (!trustProxy) return null;
  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) return null;
  const last = forwarded.split(",").pop()?.trim() ?? "";
  return isIP(last) ? last : null;
}

export function userAgent(headers: Pick<Headers, "get">): string | null {
  return headers.get("user-agent")?.slice(0, 300) ?? null;
}

/** For state-changing route handlers: the browser-sent Origin must be exactly our own origin. */
export function isSameOrigin(headers: Pick<Headers, "get">, appUrl: string): boolean {
  const origin = headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}

/** Rate-limit key part for an address. Unknown addresses share one bucket with a generous limit. */
export function ipKey(ip: string | null): string {
  return ip ?? "unknown";
}
