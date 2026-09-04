import { describe, expect, it, vi, beforeEach } from "vitest";

const { createServerSupabase } = vi.hoisted(() => ({
  createServerSupabase: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  CLIPS_BUCKET: "clips",
  RENDERS_BUCKET: "renders",
  clipObjectPath: (userId: string, fileName: string) => `${userId}/${fileName}`,
  clipsPublicUrl: (path: string) =>
    `https://supabase.test/storage/v1/object/public/clips/${path}`,
  createServerSupabase,
}));

import { POST } from "../route";

const USER_PROFILE_ID = "00000000-0000-0000-0000-000000000aaa";
const NEW_CLIP_ID = "00000000-0000-0000-0000-000000000ccc";

interface CapturedInsert {
  table: string;
  payload: Record<string, unknown>;
}

function buildFakeSupabase(): {
  client: unknown;
  inserts: CapturedInsert[];
  uploads: { path: string; bucket: string; contentType: string | undefined }[];
} {
  const inserts: CapturedInsert[] = [];
  const uploads: { path: string; bucket: string; contentType: string | undefined }[] = [];

  const client = {
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { id: "auth-uid-1" } },
          error: null,
        }),
    },
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        single: () => {
          if (table === "users") {
            return Promise.resolve({ data: { id: USER_PROFILE_ID }, error: null });
          }
          if (table === "clips") {
            return Promise.resolve({ data: { id: NEW_CLIP_ID }, error: null });
          }
          return Promise.resolve({ data: null, error: { message: "unexpected table" } });
        },
        insert(payload: Record<string, unknown>) {
          inserts.push({ table, payload });
          return builder;
        },
      };
      return builder;
    },
    storage: {
      from(bucket: string) {
        return {
          upload: (path: string, _file: Blob, opts?: { contentType?: string }) => {
            uploads.push({ path, bucket, contentType: opts?.contentType });
            return Promise.resolve({ data: { path }, error: null });
          },
          remove: () => Promise.resolve({ data: null, error: null }),
        };
      },
    },
  };
  return { client, inserts, uploads };
}

function buildRequest(file: File): Request {
  const form = new FormData();
  form.set("file", file);
  return new Request("http://test.local/api/clips", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/clips", () => {
  beforeEach(() => {
    createServerSupabase.mockReset();
  });

  it("uploads, inserts a clips row, and returns clip_id + storage_url", async () => {
    const { client, inserts, uploads } = buildFakeSupabase();
    createServerSupabase.mockResolvedValue(client);

    const file = new File(["fake-bytes"], "clip.mp4", { type: "video/mp4" });
    const res = await POST(buildRequest(file));

    expect(res.status).toBe(201);
    const json = (await res.json()) as { clip_id: string; storage_url: string };
    expect(json.clip_id).toBe(NEW_CLIP_ID);
    expect(json.storage_url).toContain("/storage/v1/object/public/clips/");
    expect(json.storage_url).toContain(`${USER_PROFILE_ID}/`);

    expect(uploads).toHaveLength(1);
    expect(uploads[0]?.bucket).toBe("clips");
    expect(uploads[0]?.contentType).toBe("video/mp4");
    expect(uploads[0]?.path.startsWith(`${USER_PROFILE_ID}/`)).toBe(true);

    expect(inserts).toHaveLength(1);
    expect(inserts[0]?.table).toBe("clips");
    expect(inserts[0]?.payload.owner_user_id).toBe(USER_PROFILE_ID);
    expect(inserts[0]?.payload.storage_url).toBe(json.storage_url);
    const meta = inserts[0]?.payload.source_metadata as Record<string, unknown>;
    expect(meta.mime).toBe("video/mp4");
    expect(meta.duration_seconds).toBeNull();
  });

  it("rejects unauthenticated callers with 401", async () => {
    const client = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({}),
      storage: { from: () => ({}) },
    };
    createServerSupabase.mockResolvedValue(client);

    const res = await POST(
      buildRequest(new File(["x"], "x.mp4", { type: "video/mp4" })),
    );
    expect(res.status).toBe(401);
  });

  it("rejects unsupported mime types with 415", async () => {
    const { client } = buildFakeSupabase();
    createServerSupabase.mockResolvedValue(client);

    const res = await POST(
      buildRequest(new File(["x"], "x.gif", { type: "image/gif" })),
    );
    expect(res.status).toBe(415);
  });
});
