import { describe, expect, it } from "vitest";
import { EnvError, getDatabaseUrl, normalizeDatabaseUrl, parseEnv } from "@/lib/env";

const valid = {
  NODE_ENV: "development",
  APP_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://u:secret-pass@localhost:5432/db",
};

describe("parseEnv", () => {
  it("accepts a minimal valid environment and applies defaults", () => {
    const env = parseEnv(valid);
    expect(env.MAIL_PORT).toBe(587);
    expect(env.MAIL_SECURE).toBe(false);
    expect(env.MAX_UPLOAD_MB).toBe(5);
    expect(env.TRUST_PROXY).toBe(false);
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("converts postgres:// to postgresql://", () => {
    expect(parseEnv({ ...valid, DATABASE_URL: "postgres://u:p@h:5432/d" }).DATABASE_URL).toBe(
      "postgresql://u:p@h:5432/d",
    );
    expect(normalizeDatabaseUrl("POSTGRES://x")).toBe("postgresql://x");
  });

  it("fails with a readable message when DATABASE_URL is missing (not an AttributeError)", () => {
    const { DATABASE_URL: _omit, ...rest } = valid;
    void _omit;
    expect(() => parseEnv(rest)).toThrow(EnvError);
    expect(() => parseEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it("rejects non-PostgreSQL URLs and invalid APP_URL", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: "mysql://u:p@h/d" })).toThrow(/PostgreSQL/);
    expect(() => parseEnv({ ...valid, APP_URL: "not a url" })).toThrow(/APP_URL/);
  });

  it("never prints secret values in error messages", () => {
    try {
      parseEnv({ ...valid, DATABASE_URL: "mysql://u:secret-pass@h/d" });
      throw new Error("should have thrown");
    } catch (e) {
      expect(String((e as Error).message)).not.toContain("secret-pass");
    }
  });

  it("treats empty optional values as unset", () => {
    const env = parseEnv({ ...valid, MAIL_HOST: "", NOTIFY_EMAIL: "", MAIL_USER: "  " });
    expect(env.MAIL_HOST).toBeUndefined();
    expect(env.NOTIFY_EMAIL).toBeUndefined();
    expect(env.MAIL_USER).toBeUndefined();
  });

  it("validates ranges and enums", () => {
    expect(() => parseEnv({ ...valid, MAIL_PORT: "70000" })).toThrow(/MAIL_PORT/);
    expect(() => parseEnv({ ...valid, TRUST_PROXY: "yes" })).toThrow(/TRUST_PROXY/);
    expect(() => parseEnv({ ...valid, NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
    expect(() => parseEnv({ ...valid, NOTIFY_EMAIL: "nope" })).toThrow(/NOTIFY_EMAIL/);
  });

  describe("production", () => {
    const prod = { ...valid, NODE_ENV: "production", APP_URL: "https://mnyala.co.tz", MAIL_HOST: "smtp.example.com" };

    it("accepts a complete production environment", () => {
      expect(parseEnv(prod).NODE_ENV).toBe("production");
    });
    it("requires https", () => {
      expect(() => parseEnv({ ...prod, APP_URL: "http://mnyala.co.tz" })).toThrow(/https/);
    });
    it("requires a mail host", () => {
      expect(() => parseEnv({ ...prod, MAIL_HOST: undefined })).toThrow(/MAIL_HOST/);
    });
  });
});

describe("getDatabaseUrl (used by the migrate job)", () => {
  it("needs only DATABASE_URL", () => {
    expect(getDatabaseUrl({ DATABASE_URL: "postgres://u:p@h/d" })).toBe("postgresql://u:p@h/d");
  });
  it("fails clearly when missing", () => {
    expect(() => getDatabaseUrl({})).toThrow(/DATABASE_URL/);
  });
});
