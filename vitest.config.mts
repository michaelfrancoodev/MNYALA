import { configDefaults, defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Load .env for local runs. Existing environment variables (CI) always win.
try {
  process.loadEnvFile(".env");
} catch {
  /* no .env file: rely on the real environment */
}

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // End-to-end tests need a built server; they have their own command (pnpm test:e2e).
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    testTimeout: 30_000,
    hookTimeout: 90_000,
    // Integration tests share one Postgres database, so files run one after another.
    fileParallelism: false,
  },
});
