# MadLipz v2

Turborepo monorepo. Agent Teams: each agent owns ONE branch exclusively.

## Repo Layout
- `apps/web` — Next.js app (main product surface)
- `apps/worker` — background worker process
- `packages/schema` — Drizzle ORM schema, migrations, RLS policies
- `packages/taxonomy` — content classification logic
- `packages/eval` — eval scoring

## Branch Ownership (Agent Teams)
- clip-upload-storage — video ingestion, storage buckets, clips API
- dmca-intake-funnel — DMCA intake, status state machine, worker email/db
- pg-boss-foundation — async job queue infrastructure, worker patterns
- taxonomy-eval-foundation — content classification, label governance, eval scoring

## Protocol
- Before any action: run `git branch --show-current` to confirm you are on your assigned branch.
- Never edit files outside your branch's ownership area.
- Before editing `packages/schema`: check `.claude/tasks/` for file locks.
- Secrets come from environment only. Never hardcode credentials. Never commit `.env`.
- If a task is ambiguous, stop and surface to the team lead. Do not assume.

## Domain Rules (verified against packages/schema/src/index.ts)
- dmca_notices.status uses dmcaStatusEnum: received -> awaiting_bd_response -> tombstoned -> bd_converted. Defaults to "received". Never delete dmca_notices rows — move them to "tombstoned" instead.
- Labels are a TABLE (pgEnum is NOT used) because the taxonomy is council-governed and mutates outside deploys. Never convert the labels table to a pgEnum.
- All async work goes through pg-boss. No direct cron, setTimeout, or setInterval.
- Every new table must have RLS policies (see drizzle/0001_rls_policies.sql).
