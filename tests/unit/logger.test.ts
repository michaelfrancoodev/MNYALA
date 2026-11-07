import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { createLogger } from "@/server/logger";

function capture() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(String(chunk));
      cb();
    },
  });
  return { lines, logger: createLogger("info", stream) };
}

describe("logger redaction", () => {
  it("never writes passwords, tokens, cookies or reset URLs", () => {
    const { lines, logger } = capture();
    logger.info(
      {
        password: "hunter2-secret",
        user: { passwordHash: "$argon2id$secret", token: "tok-secret" },
        headers: { cookie: "__Host-session=cookie-secret", authorization: "Bearer bearer-secret" },
        resetUrl: "https://x.test/admin/reset-password/reset-secret",
      },
      "event",
    );
    const out = lines.join("");
    for (const secret of ["hunter2-secret", "$argon2id$secret", "tok-secret", "cookie-secret", "bearer-secret", "reset-secret"]) {
      expect(out).not.toContain(secret);
    }
    expect(out).toContain("[redacted]");
  });

  it("keeps ordinary fields", () => {
    const { lines, logger } = capture();
    logger.info({ orderCode: "MN-2026-0001" }, "order created");
    expect(lines.join("")).toContain("MN-2026-0001");
  });
});

describe("getLogger", () => {
  it("still works when the environment is invalid (it must be able to report that)", async () => {
    const { getLogger } = await import("@/server/logger");
    const saved = { ...process.env };
    try {
      delete process.env.DATABASE_URL;
      delete process.env.APP_URL;
      expect(() => getLogger()).not.toThrow();
      expect(typeof getLogger().error).toBe("function");
    } finally {
      process.env = saved;
    }
  });
});
