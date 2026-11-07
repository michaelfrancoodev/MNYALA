import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { getLogger } from "@/server/logger";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** Liveness plus a real database round trip. Reveals no versions, hosts or settings. */
export async function GET() {
  const time = new Date().toISOString();
  try {
    await Promise.race([
      getDb().execute(sql`select 1`),
      new Promise((_, reject) => setTimeout(() => reject(new Error("database check timed out")), 2000)),
    ]);
    return Response.json({ status: "ok", db: "ok", time }, { headers: NO_STORE });
  } catch (error) {
    getLogger().error({ err: error instanceof Error ? error.message : "unknown" }, "health check failed");
    return Response.json({ status: "degraded", db: "down", time }, { status: 503, headers: NO_STORE });
  }
}
