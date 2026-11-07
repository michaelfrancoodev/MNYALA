import { getEnv } from "@/lib/env";
import { getLogger } from "@/server/logger";

/** Validates the environment at start-up so a misconfigured deployment stops with a clear message. */
export function validateEnvironmentOrExit(): void {
  try {
    getEnv();
  } catch (error) {
    getLogger().fatal({ err: error instanceof Error ? error.message : "unknown" }, "invalid configuration, refusing to start");
    process.exit(1);
  }
}
