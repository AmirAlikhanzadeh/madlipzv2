import { describe, expect, it, vi, beforeEach } from "vitest";

const { createServerSupabase } = vi.hoisted(() => ({
  createServerSupabase: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  CLIPS_BUCKET: "clips",
  RENDERS_BUCKET: "renders",
  clipObjectPath: (userId: string, fileName: string) => `${userId}/${fileName}`,
  clipsPublicUrl: (path: string) => `https://supabase.test/${path}`,
  createServerSupabase,
}));

import { GET } from "../[id]/route";

const PRIVATE_CLIP_ID = "00000000-0000-0000-0000-0000000000aa";

/**
 * RLS smoke: the route handler does not filter by visibility itself — it
 * trusts what Supabase returns under the caller's session. We simulate the
 * two RLS outcomes (anon: row hidden, owner: row visible) and assert the
 * route honors them without re-checking.
 */
function buildClient(rlsResult: { data: unknown; error: unknown }): unknown {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from(_table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: () => Promise.resolve(rlsResult),
      };
      return builder;
    },
    storage: { from: () => ({}) },
  };
}

describe("GET /api/clips/[id] visibility (RLS smoke)", () => {
  beforeEach(() => {
    createServerSupabase.mockReset();
  });

  it("returns 404 when RLS hides the row from anon", async () => {
    createServerSupabase.mockResolvedValue(buildClient({ data: null, error: null }));

    const res = await GET(new Request("http://test.local/api/clips/x"), {
      params: Promise.resolve({ id: PRIVATE_CLIP_ID }),
    });

    expect(res.status).toBe(404);
  });

  it("returns the row when RLS exposes it to the owner", async () => {
    const visibleRow = {
      id: PRIVATE_CLIP_ID,
      owner_user_id: "owner-uuid",
      storage_url: "https://example.test/clip.mp4",
      source_metadata: { mime: "video/mp4", size: 10, duration_seconds: null },
      salience_score: 0,
      visibility: "creator_private",
      created_at: "2026-01-01T00:00:00.000Z",
    };
    createServerSupabase.mockResolvedValue(
      buildClient({ data: visibleRow, error: null }),
    );

    const res = await GET(new Request("http://test.local/api/clips/x"), {
      params: Promise.resolve({ id: PRIVATE_CLIP_ID }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { clip: { id: string; visibility: string } };
    expect(json.clip.id).toBe(PRIVATE_CLIP_ID);
    expect(json.clip.visibility).toBe("creator_private");
  });
});
