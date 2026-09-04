import { NextResponse } from "next/server";

import { createServerSupabase } from "@/lib/storage";

const ALLOWED_VISIBILITY = new Set(["public", "creator_private"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerSupabase();

  // RLS handles visibility: anon sees public only; owner sees their own at any visibility.
  const { data, error } = await supabase
    .from("clips")
    .select(
      "id, owner_user_id, storage_url, source_metadata, salience_score, visibility, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ clip: data });
}

interface PatchBody {
  visibility?: unknown;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PatchBody | null;
  const visibility = body?.visibility;
  if (typeof visibility !== "string" || !ALLOWED_VISIBILITY.has(visibility)) {
    return NextResponse.json(
      { error: "visibility must be 'public' or 'creator_private'" },
      { status: 400 },
    );
  }

  // App-layer ownership assertion in addition to RLS — fail loudly if the
  // caller targets someone else's clip.
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_auth_id", user.id)
    .single<{ id: string }>();
  if (profileError || !profile) {
    return NextResponse.json({ error: "user profile missing" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("clips")
    .update({ visibility })
    .eq("id", id)
    .eq("owner_user_id", profile.id)
    .select("id, visibility")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ clip: data });
}
