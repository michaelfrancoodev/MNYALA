import { getEnv } from "@/lib/env";
import { createLocalStorage, isSafeStoredName } from "@/server/services/storage";

export const dynamic = "force-dynamic";

/** Serves processed images. Only names we generated ourselves can ever reach the disk. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const name = path.length === 1 ? path[0] : undefined;
  if (!name || !isSafeStoredName(name)) return new Response("Not found", { status: 404 });

  const data = await createLocalStorage(getEnv().STORAGE_DIR).read(name);
  if (!data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(data.length),
      // The name is random and the content never changes, so browsers may keep it for a year.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
