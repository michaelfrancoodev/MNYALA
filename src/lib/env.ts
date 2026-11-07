import { z } from "zod";

/** Normalise the scheme: many hosts hand out postgres:// but the driver URL form is postgresql://. */
export function normalizeDatabaseUrl(value: string): string {
  return value.replace(/^postgres:\/\//i, "postgresql://");
}

const databaseUrl = z
  .string({ error: "is required" })
  .min(1, "is required")
  .transform(normalizeDatabaseUrl)
  .refine((v) => /^postgresql:\/\/.+/.test(v), "must be a PostgreSQL URL (postgresql://user:pass@host:5432/db)");

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const boolString = z
  .enum(["true", "false"], { error: 'must be "true" or "false"' })
  .transform((v) => v === "true");

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_URL: z.url({ error: "must be a full URL, for example https://mnyala.co.tz" }),
    DATABASE_URL: databaseUrl,

    MAIL_HOST: optionalString,
    MAIL_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    MAIL_SECURE: boolString.default(false),
    MAIL_USER: optionalString,
    MAIL_PASSWORD: optionalString,
    MAIL_FROM: z.string().min(3).default("Mnyala <no-reply@localhost>"),
    NOTIFY_EMAIL: z.preprocess(emptyToUndefined, z.email().optional()),

    STORAGE_DIR: z.string().min(1).default("./data/uploads"),
    MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(25).default(5),
    TRUST_PROXY: boolString.default(false),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;
    if (!env.APP_URL.startsWith("https://")) {
      ctx.addIssue({ code: "custom", path: ["APP_URL"], message: "must use https:// in production" });
    }
    if (!env.MAIL_HOST) {
      ctx.addIssue({ code: "custom", path: ["MAIL_HOST"], message: "is required in production (password reset and invites need email)" });
    }
  });

export type Env = z.infer<typeof envSchema>;

export class EnvError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid environment configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "EnvError";
  }
}

/** Pure and testable. Messages name the variable and the rule, never the value (values may be secrets). */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (result.success) return result.data;
  throw new EnvError(
    result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
  );
}

let cached: Env | undefined;

/** Validated once, on first use at runtime (not at import time, so `next build` needs no secrets). */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

/** For scripts that only need the database (the migrate job has no mail settings). */
export function getDatabaseUrl(raw: Record<string, string | undefined> = process.env): string {
  const result = databaseUrl.safeParse(raw.DATABASE_URL);
  if (!result.success) {
    throw new EnvError([`DATABASE_URL: ${result.error.issues[0]?.message ?? "is invalid"}`]);
  }
  return result.data;
}
