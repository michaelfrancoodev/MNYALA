import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { testDatabaseUrl } from "../helpers/db";

async function loadRoute() {
  vi.resetModules();
  delete (globalThis as { __mnyalaDb?: unknown }).__mnyalaDb;
  return import("@/app/api/health/route");
}

beforeAll(() => {
  vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("LOG_LEVEL", "silent");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("LOG_LEVEL", "silent");
});

describe("GET /api/health", () => {
  it("answers 200 with db ok when the database is reachable", async () => {
    vi.stubEnv("DATABASE_URL", testDatabaseUrl());
    const { GET } = await loadRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok", db: "ok" });
    expect(Number.isNaN(Date.parse(body.time))).toBe(false);
  });

  it("answers 503 when the database is down, without leaking connection details", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://nobody:leak-me-not@127.0.0.1:1/none");
    const { GET } = await loadRoute();
    const res = await GET();
    const text = await res.text();
    expect(res.status).toBe(503);
    expect(JSON.parse(text)).toMatchObject({ status: "degraded", db: "down" });
    expect(text).not.toContain("leak-me-not");
    expect(text).not.toContain("127.0.0.1");
  });

  it("answers 503 (not a crash) when the configuration is invalid", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { GET } = await loadRoute();
    expect((await GET()).status).toBe(503);
  });
});
