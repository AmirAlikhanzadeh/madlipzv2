import { config } from "dotenv";

import { PgBoss, type Job } from "pg-boss";

// .env lives at the repo root; pnpm filter runs us from apps/worker/.
config({ path: "../../.env" });

interface HelloPayload {
  message: string;
  enqueuedAt: string;
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const boss = new PgBoss(databaseUrl);

  boss.on("error", (err: Error) => {
    console.error("[worker] pg-boss error:", err);
  });

  await boss.start();
  console.log("[worker] pg-boss started");

  await boss.createQueue("hello");

  await boss.work<HelloPayload>("hello", async ([job]: Job<HelloPayload>[]) => {
    console.log("[worker] received hello job", job.id, job.data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("[worker] completed hello job", job.id);
  });

  console.log("[worker] listening on queue 'hello'");

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[worker] ${signal} received, stopping...`);
    await boss.stop({ graceful: true });
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[worker] fatal:", err);
  process.exit(1);
});
