import { config } from "dotenv";

import { PgBoss, type Job } from "pg-boss";

import {
  createStubKeywordJudge,
  loadFixture,
  runFixture,
  type KeywordRule,
  type RunResult,
} from "@madlipz/eval";

// .env lives at the repo root; pnpm filter runs us from apps/worker/.
config({ path: "../../.env" });

interface HelloPayload {
  message: string;
  enqueuedAt: string;
}

interface EvalRunPayload {
  fixturePath: string;
}

// v0 stub-judge rules. These are NOT canonical and NOT exported from the
// taxonomy package — they exist only so the worker has something deterministic
// to run end-to-end. Real judge configuration lands in Phase 1.5.
const STUB_RULES: KeywordRule[] = [
  { labelKey: "wholesome", labelId: "lbl_wholesome", keywords: ["hug", "kid", "wholesome"] },
  { labelKey: "dramatic", labelId: "lbl_dramatic", keywords: ["unreal", "moment", "are you kidding"] },
  { labelKey: "cynical", labelId: "lbl_cynical", keywords: ["imagine paying", "embarrassing"] },
  { labelKey: "affectionate", labelId: "lbl_affectionate", keywords: ["hug", "love"] },
  { labelKey: "mocking", labelId: "lbl_mocking", keywords: ["retire", "saddest", "embarrassing"] },
  { labelKey: "celebratory", labelId: "lbl_celebratory", keywords: ["goat", "what a moment"] },
  { labelKey: "cringe-flagging", labelId: "lbl_cringe", keywords: ["cringe", "secondhand"] },
  { labelKey: "parody", labelId: "lbl_parody", keywords: ["commentator voice", "bollywood", "[in "] },
  { labelKey: "localization", labelId: "lbl_localization", keywords: ["translated", "hindi", "dubbed"] },
  { labelKey: "reaction", labelId: "lbl_reaction", keywords: ["bro", "look at"] },
  { labelKey: "character-voice", labelId: "lbl_character_voice", keywords: ["commentator voice", "[in "] },
  { labelKey: "meme-anchor", labelId: "lbl_meme_anchor", keywords: ["template", "callback"] },
  { labelKey: "in-joke", labelId: "lbl_in_joke", keywords: ["group chat", "rip greg"] },
];

const STUB_LABEL_ID_TO_KEY = Object.fromEntries(
  STUB_RULES.map((r) => [r.labelId, r.labelKey] as const),
);

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
  await boss.createQueue("eval-run");

  await boss.work<HelloPayload>("hello", async ([job]: Job<HelloPayload>[]) => {
    console.log("[worker] received hello job", job.id, job.data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("[worker] completed hello job", job.id);
  });

  await boss.work<EvalRunPayload>(
    "eval-run",
    async ([job]: Job<EvalRunPayload>[]) => {
      console.log("[worker] received eval-run job", job.id, job.data);
      const fixture = await loadFixture(job.data.fixturePath);
      const judge = createStubKeywordJudge(STUB_RULES);
      const result: RunResult = await runFixture(fixture, judge, {
        labelIdToKey: STUB_LABEL_ID_TO_KEY,
      });
      console.log(
        "[worker] eval-run result",
        JSON.stringify(
          {
            jobId: job.id,
            fixtureId: result.fixtureId,
            remixCount: result.remixCount,
            macroF1: result.macroF1,
            perLabel: result.perLabel,
          },
          null,
          2,
        ),
      );
    },
  );

  console.log("[worker] listening on queues 'hello', 'eval-run'");

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
