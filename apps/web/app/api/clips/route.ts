import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  CLIPS_BUCKET,
  clipObjectPath,
  clipsPublicUrl,
  createServerSupabase,
} from "@/lib/storage";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_MIMES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};
const DEFAULT_LIMIT = 20;

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_auth_id", user.id)
    .single<{ id: string }>();
  if (profileError || !profile) {
    return NextResponse.json({ error: "user profile missing" }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "file is required (multipart/form-data field 'file')" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `file exceeds ${MAX_BYTES} bytes` },
      { status: 413 },
    );
  }

  const ext = ALLOWED_MIMES[file.type];
  if (!ext) {
    return NextResponse.json(
      {
        error: `unsupported mime; allowed: ${Object.keys(ALLOWED_MIMES).join(", ")}`,
      },
      { status: 415 },
    );
  }

  const objectPath = clipObjectPath(profile.id, `${randomUUID()}.${ext}`);
  const { error: uploadError } = await supabase.storage
    .from(CLIPS_BUCKET)
    .upload(objectPath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    return NextResponse.json(
      { error: `upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const storageUrl = clipsPublicUrl(objectPath);
  const { data: row, error: insertError } = await supabase
    .from("clips")
    .insert({
      owner_user_id: profile.id,
      storage_url: storageUrl,
      source_metadata: {
        mime: file.type,
        size: file.size,
        duration_seconds: null,
      },
    })
    .select("id")
    .single<{ id: string }>();
  if (insertError || !row) {
    // Best effort: orphan the storage object rather than the row.
    await supabase.storage.from(CLIPS_BUCKET).remove([objectPath]);
    return NextResponse.json(
      { error: `insert failed: ${insertError?.message ?? "unknown"}` },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { clip_id: row.id, storage_url: storageUrl },
    { status: 201 },
  );
}

export async function GET(request: Request): Promise<NextResponse> {
  const supabase = await createServerSupabase();
  const url = new URL(request.url);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
  if (!Number.isFinite(offset) || offset < 0) {
    return NextResponse.json({ error: "invalid offset" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clips")
    .select("id, owner_user_id, storage_url, created_at, salience_score")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(offset, offset + DEFAULT_LIMIT - 1);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clips: data, limit: DEFAULT_LIMIT, offset });
}
