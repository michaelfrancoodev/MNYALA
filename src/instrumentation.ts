/**
 * Runs once when the server starts. Skipped during `next build`, which must work without secrets.
 * The Node-only code lives in its own file so the Edge bundle never sees it.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { validateEnvironmentOrExit } = await import("./instrumentation-node");
  validateEnvironmentOrExit();
}
