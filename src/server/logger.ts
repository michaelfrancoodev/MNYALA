import pino from "pino";

/** Anything matching these paths is replaced with [redacted] before it is written. */
export const REDACT_PATHS = [
  "password",
  "*.password",
  "passwordHash",
  "*.passwordHash",
  "token",
  "*.token",
  "tokenHash",
  "*.tokenHash",
  "authorization",
  "*.authorization",
  "cookie",
  "*.cookie",
  "headers.cookie",
  "headers.authorization",
  "url",
  "resetUrl",
  "*.resetUrl",
];

export function createLogger(level: string, destination?: pino.DestinationStream) {
  return pino({ level, redact: { paths: REDACT_PATHS, censor: "[redacted]" }, base: { app: "mnyala" } }, destination);
}

let instance: pino.Logger | undefined;

const LEVELS = new Set(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);

/**
 * Must work even when the rest of the configuration is invalid, because that is exactly when
 * an operator needs the log line. So it reads LOG_LEVEL directly instead of via getEnv().
 */
export function getLogger(): pino.Logger {
  const requested = process.env.LOG_LEVEL ?? "info";
  instance ??= createLogger(LEVELS.has(requested) ? requested : "info");
  return instance;
}
