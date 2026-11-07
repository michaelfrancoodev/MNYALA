import path from "node:path";
import { getEnv } from "@/lib/env";
import { createDb } from "@/server/db/client";
import { seedContent } from "@/server/services/seed-content";
import { createLocalStorage } from "@/server/services/storage";

const env = getEnv();
const { db, close } = createDb(env.DATABASE_URL, { max: 2 });

try {
  const report = await seedContent(db, createLocalStorage(env.STORAGE_DIR), path.resolve("seed-assets"));
  console.log(
    `Seed finished. Created: ${report.products} products, ${report.gallery} gallery items, ` +
      `${report.media} images, ${report.settings} settings. Existing content was not changed.`,
  );
} catch (error) {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await close();
}
