import { config } from "dotenv";
import { PgBoss } from "pg-boss";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// scripts/ is inside apps/worker/, .env is at the repo root (../../).
config({ path: resolve(__dirname, "..", "..", "..", ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL not set");

const fixturePath = resolve(
  __dirname,
  "..",
  "..",
  "..",
  "packages/eval/fixtures/sports-reaction-v0.json",
);

const boss = new PgBoss(databaseUrl);
await boss.start();
await boss.createQueue("eval-run");
const id = await boss.send("eval-run", { fixturePath });
console.log("enqueued eval-run job", id);
await boss.stop({ graceful: true });
