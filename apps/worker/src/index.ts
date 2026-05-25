import { config } from "dotenv";

import { PgBoss, type Job } from "pg-boss";

import { getSql } from "./db.js";
import { getEmailSender } from "./email.js";

// .env lives at the repo root; pnpm filter runs us from apps/worker/.
config({ path: "../../.env" });

interface HelloPayload {
  message: string;
  enqueuedAt: string;
}

interface DmcaJobPayload {
  noticeId: string;
}

interface DmcaNoticeRow {
  id: string;
  claimant_email: string;
  represented_party: string;
  status: string;
  notes: string | null;
}

const FOUR_HOURS_SECONDS = 4 * 60 * 60;

function autoRespondEmail(notice: DmcaNoticeRow): {
  subject: string;
  body: string;
} {
  const subject = `Your DMCA notice for ${notice.represented_party} — received`;
  const body = [
    `Hi,`,
    ``,
    `We've received your DMCA notice on behalf of ${notice.represented_party}.`,
    `Reference: ${notice.id}`,
    ``,
    `By default we will execute a compliant takedown within 24 hours.`,
    ``,
    `Before we do, an offer: MadLipz exists because rights holders gain when`,
    `their content gets remixed by fans. If you'd like to keep this content`,
    `up under terms you control — attribution, revenue share, takedown veto —`,
    `reply to this email within 4 hours and we'll hold the takedown for 48`,
    `hours to talk it through.`,
    ``,
    `If we don't hear from you, the takedown proceeds as filed.`,
    ``,
    `— MadLipz`,
  ].join("\n");
  return { subject, body };
}

async function handleDmcaAutoRespond(boss: PgBoss, noticeId: string): Promise<void> {
  const sql = getSql();
  const rows = await sql<DmcaNoticeRow[]>`
    SELECT id, claimant_email, represented_party, status, notes
    FROM dmca_notices
    WHERE id = ${noticeId}
    LIMIT 1
  `;
  const notice = rows[0];
  if (!notice) {
    console.error("[worker] dmca-auto-respond: notice not found", noticeId);
    return;
  }

  const { subject, body } = autoRespondEmail(notice);
  const result = await getEmailSender().send({
    to: notice.claimant_email,
    subject,
    body,
  });
  console.log("[worker] dmca-auto-respond sent", {
    noticeId,
    emailId: result.id,
  });

  await boss.sendAfter(
    "dmca-finalize",
    { noticeId } satisfies DmcaJobPayload,
    null,
    FOUR_HOURS_SECONDS,
  );
}

async function handleDmcaFinalize(noticeId: string): Promise<void> {
  const sql = getSql();
  // Only transition `received` → `tombstoned`. If the claimant replied within
  // the 4h window, an admin will have flipped the status to
  // `awaiting_bd_response` (or `bd_converted`) and we leave it alone. The
  // actual content takedown cascade is a separate, schema-level migration
  // that's explicitly out of scope for this PR.
  const updated = await sql<{ id: string }[]>`
    UPDATE dmca_notices
    SET status = 'tombstoned'
    WHERE id = ${noticeId}
      AND status = 'received'
    RETURNING id
  `;
  if (updated.length > 0) {
    console.log("[worker] dmca-finalize tombstoned", noticeId);
  } else {
    console.log("[worker] dmca-finalize no-op (not in 'received')", noticeId);
  }
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
  await boss.createQueue("dmca-auto-respond");
  await boss.createQueue("dmca-finalize");

  await boss.work<HelloPayload>("hello", async ([job]: Job<HelloPayload>[]) => {
    console.log("[worker] received hello job", job.id, job.data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("[worker] completed hello job", job.id);
  });

  await boss.work<DmcaJobPayload>(
    "dmca-auto-respond",
    async ([job]: Job<DmcaJobPayload>[]) => {
      console.log("[worker] dmca-auto-respond start", job.id, job.data);
      await handleDmcaAutoRespond(boss, job.data.noticeId);
    },
  );

  await boss.work<DmcaJobPayload>(
    "dmca-finalize",
    async ([job]: Job<DmcaJobPayload>[]) => {
      console.log("[worker] dmca-finalize start", job.id, job.data);
      await handleDmcaFinalize(job.data.noticeId);
    },
  );

  console.log(
    "[worker] listening on queues 'hello', 'dmca-auto-respond', 'dmca-finalize'",
  );

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
