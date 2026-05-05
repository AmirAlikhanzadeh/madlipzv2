import { config } from "dotenv";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Next.js auto-loads .env from apps/web/, but ours lives at the monorepo root.
config({ path: "../../.env" });

export const CLIPS_BUCKET = "clips";
export const RENDERS_BUCKET = "renders";

interface SupabaseEnv {
  url: string;
  anonKey: string;
}

// Cache env lookups once per module instance; survives Next.js dev hot reload.
const globalForStorage = globalThis as unknown as {
  supabaseEnv?: SupabaseEnv;
};

function getEnv(): SupabaseEnv {
  if (globalForStorage.supabaseEnv) {
    return globalForStorage.supabaseEnv;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required",
    );
  }
  globalForStorage.supabaseEnv = { url, anonKey };
  return globalForStorage.supabaseEnv;
}

/**
 * Per-request, cookies-aware Supabase client for use inside route handlers
 * and server components. RLS runs as the signed-in user.
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const { url, anonKey } = getEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: { name: string; value: string; options: CookieOptions }[]) {
        // Route handlers can write cookies; server components can't. Either is fine here.
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // ignore — read-only cookie store (e.g. server component)
        }
      },
    },
  });
}

/** Public URL for an object in the clips bucket (bucket is public-read). */
export function clipsPublicUrl(path: string): string {
  const { url } = getEnv();
  return `${url}/storage/v1/object/public/${CLIPS_BUCKET}/${path}`;
}

/** Storage object path for a user's clip upload: "{user_id}/{uuid}.{ext}". */
export function clipObjectPath(userId: string, fileName: string): string {
  return `${userId}/${fileName}`;
}
