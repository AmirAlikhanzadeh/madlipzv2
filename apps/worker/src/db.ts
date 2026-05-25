import postgres, { type Sql } from "postgres";

let cached: Sql | undefined;

// The worker connects with the postgres role (DATABASE_URL is the Supabase
// session-pooler URI), which bypasses RLS. That's the right posture here:
// the worker runs trusted background jobs (auto-response, finalize) that
// need to read+update dmca_notices regardless of public policies.
export function getSql(): Sql {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  cached = postgres(url, { prepare: false });
  return cached;
}
