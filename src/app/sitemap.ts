import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getEnv().APP_URL.replace(/\/$/, "");
  return ["", "/kuhusu", "/bidhaa", "/picha", "/wasiliana", "/faragha"].map((path) => ({ url: `${base}${path}` || base }));
}
