import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveTargetUrl } from "@/lib/dmca";
import { getBoss } from "@/lib/queue";
import { getSupabaseAnon } from "@/lib/supabase-anon";

const intakeSchema = z.object({
  claimant_email: z.string().email("must be a valid email"),
  represented_party: z.string().trim().min(1, "required"),
  target_url: z.string().trim().min(1, "required"),
  notes: z.string().trim().optional(),
});

interface FieldError {
  field: string;
  message: string;
}

function fieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((i) => ({
    field: i.path.join(".") || "_",
    message: i.message,
  }));
}

async function readPayload(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }
  const form = await request.formData();
  const out: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) {
    out[k] = typeof v === "string" ? v : "";
  }
  return out;
}

export async function POST(request: Request): Promise<Response> {
  const raw = await readPayload(request);
  const parsed = intakeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const target = resolveTargetUrl(input.target_url);

  // Always preserve the original URL in notes when we couldn't resolve it,
  // so the admin reviewer never loses the claimant's intent.
  const noteParts: string[] = [];
  if (!target.clipId && !target.remixId) {
    noteParts.push(`Unresolved target URL: ${input.target_url}`);
  }
  if (input.notes) noteParts.push(input.notes);
  const notes = noteParts.length > 0 ? noteParts.join("\n\n") : null;

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase
    .from("dmca_notices")
    .insert({
      claimant_email: input.claimant_email,
      represented_party: input.represented_party,
      target_clip_id: target.clipId,
      target_remix_id: target.remixId,
      notes,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[dmca] insert failed:", error);
    return NextResponse.json(
      { error: "insert_failed" },
      { status: 500 },
    );
  }

  const boss = await getBoss();
  await boss.send("dmca-auto-respond", { noticeId: data.id });

  // Browsers POSTing the HTML form expect a redirect; JSON callers get JSON.
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json({ id: data.id });
  }
  const url = new URL(request.url);
  url.pathname = "/dmca/sent";
  url.search = `?id=${encodeURIComponent(data.id)}`;
  return NextResponse.redirect(url, 303);
}
