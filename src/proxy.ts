import { NextResponse, type NextRequest } from "next/server";

/**
 * Not a security control. It only tells the admin layout which page was requested, so that after
 * signing in a person lands where they were going. The value is validated before it is used.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/admin/:path*"] };
