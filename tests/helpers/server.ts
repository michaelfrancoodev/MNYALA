import { spawn } from "node:child_process";
import net from "node:net";
import { testDatabaseUrl } from "./db";

/** Builds a clean environment for a child process (nothing inherited except what is listed). */
function childEnv(vars: Record<string, string>): NodeJS.ProcessEnv {
  return { NODE_ENV: "production", PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", NEXT_TELEMETRY_DISABLED: "1", ...vars };
}

export async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const port = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

export type RunningServer = { base: string; port: number; output: () => string; stop: () => Promise<void> };

/** Starts the real production server (`next start`) against the test database. Requires a prior `next build`. */
export async function startServer(env: Record<string, string>): Promise<RunningServer> {
  const port = await freePort();
  let log = "";
  const child = spawn("node_modules/.bin/next", ["start", "-p", String(port), "-H", "127.0.0.1"], {
    env: childEnv({
      DATABASE_URL: testDatabaseUrl(),
      APP_URL: "https://e2e.mnyala.test",
      TRUST_PROXY: "true",
      LOG_LEVEL: "info",
      ...env,
    }),
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (d) => (log += String(d)));
  child.stderr?.on("data", (d) => (log += String(d)));

  const exited = new Promise<number | null>((resolve) => child.on("exit", (code) => resolve(code)));
  const base = `http://127.0.0.1:${port}`;
  const start = Date.now();
  for (;;) {
    if (child.exitCode !== null) throw new Error(`server exited early (${child.exitCode}):\n${log}`);
    try {
      const res = await fetch(`${base}/api/health`);
      if (res.status === 200) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() - start > 40_000) {
      child.kill("SIGKILL");
      throw new Error(`server did not become healthy:\n${log}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return {
    base,
    port,
    output: () => log,
    stop: async () => {
      child.kill("SIGTERM");
      await Promise.race([exited, new Promise((r) => setTimeout(r, 4000))]);
      if (child.exitCode === null) child.kill("SIGKILL");
    },
  };
}

/** For the "must refuse to start" test: returns the exit code and what it printed. */
export async function runServerExpectingExit(env: Record<string, string>): Promise<{ code: number | null; output: string }> {
  const port = await freePort();
  let log = "";
  const child = spawn("node_modules/.bin/next", ["start", "-p", String(port), "-H", "127.0.0.1"], {
    env: childEnv(env),
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (d) => (log += String(d)));
  child.stderr?.on("data", (d) => (log += String(d)));
  const code = await new Promise<number | null>((resolve) => {
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(null);
    }, 20_000);
    child.on("exit", (c) => {
      clearTimeout(t);
      resolve(c);
    });
  });
  return { code, output: log };
}
