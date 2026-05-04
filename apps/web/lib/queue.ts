import { config } from "dotenv";
import { PgBoss } from "pg-boss";

// Next.js auto-loads .env from apps/web/, but our DATABASE_URL lives at the
// monorepo root. Load it once at module init.
config({ path: "../../.env" });

// Next.js dev hot-reloads route modules; cache the started boss on globalThis
// so we don't open N connections per file save.
const globalForBoss = globalThis as unknown as {
  bossPromise?: Promise<PgBoss>;
};

function startBoss(): Promise<PgBoss> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const boss = new PgBoss(databaseUrl);
  return boss.start();
}

export function getBoss(): Promise<PgBoss> {
  if (!globalForBoss.bossPromise) {
    globalForBoss.bossPromise = startBoss();
  }
  return globalForBoss.bossPromise;
}
