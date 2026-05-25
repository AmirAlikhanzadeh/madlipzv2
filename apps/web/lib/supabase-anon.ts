import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Mirror lib/queue.ts: ensure root .env is loaded for server-side imports.
config({ path: "../../.env" });

let cached: SupabaseClient | undefined;

// Anon-keyed Supabase client for server-side use only. Inserts run under the
// `anon` Postgres role, so RLS policies decide what's allowed (the public
// DMCA intake relies on the dmca_notices_insert_public policy).
export function getSupabaseAnon(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
