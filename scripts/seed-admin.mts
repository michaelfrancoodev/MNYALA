import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { getDatabaseUrl } from "@/lib/env";
import { validatePassword } from "@/lib/password-policy";
import { createDb } from "@/server/db/client";
import { createSuperAdmin } from "@/server/services/auth-service";

/**
 * Creates the first super admin (there is no public sign-up).
 *   pnpm seed:admin                       asks for name, email and password
 *   pnpm seed:admin --reset               sets a new password for an existing super admin
 * The password is typed on the terminal (hidden) or piped on stdin. It is never read from the environment.
 */
const reset = process.argv.includes("--reset");
const flag = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const interactive = Boolean(process.stdin.isTTY);
let muted = false;
const output = new Writable({
  write(chunk, _enc, cb) {
    if (!muted) process.stdout.write(chunk);
    cb();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: interactive });

// Piped input (for example from a password manager): read every line once, hand them out in order.
const piped: string[] = [];
if (!interactive) for await (const line of rl) piped.push(line);

async function ask(question: string, hidden = false): Promise<string> {
  if (!interactive) return (piped.shift() ?? "").trim();
  process.stdout.write(question);
  muted = hidden;
  const answer = await rl.question("");
  muted = false;
  if (hidden) process.stdout.write("\n");
  return answer.trim();
}

const { db, close } = createDb(getDatabaseUrl(), { max: 1 });
try {
  const email = flag("email") ?? (await ask("Email: "));
  const name = reset ? "" : (flag("name") ?? (await ask("Full name: ")));
  const password = await ask(reset ? "New password: " : "Password: ", true);

  const problems = validatePassword(password, { email, name });
  if (problems.length > 0) {
    console.error(`That password is not acceptable:\n  - ${problems.join("\n  - ")}`);
    process.exitCode = 1;
  } else {
    const result = await createSuperAdmin(db, { email, name, password, reset });
    if (result.created) {
      console.log(reset ? "Password updated and all sessions ended." : `Super admin created: ${email.trim().toLowerCase()}`);
    } else if (result.reason === "exists") {
      console.error("A super admin already exists. Use --reset to set a new password for them. Other people are invited from the admin.");
      process.exitCode = 1;
    } else {
      console.error("No super admin with that email exists.");
      process.exitCode = 1;
    }
  }
} catch (error) {
  // Drizzle wraps driver errors; the useful part (for example "connection refused") is in `cause`.
  const cause = error instanceof Error ? (error.cause as { message?: string } | undefined)?.message : undefined;
  console.error("Failed:", cause ?? (error instanceof Error ? error.message : error));
  process.exitCode = 1;
} finally {
  rl.close();
  await close();
}
