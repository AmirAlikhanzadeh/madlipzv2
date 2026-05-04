import { NextResponse } from "next/server";

import { getBoss } from "@/lib/queue";

interface HelloRequestBody {
  message?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HelloRequestBody;

  if (typeof body.message !== "string") {
    return NextResponse.json(
      { error: "message is required and must be a string" },
      { status: 400 },
    );
  }

  const boss = await getBoss();
  const jobId = await boss.send("hello", {
    message: body.message,
    enqueuedAt: new Date().toISOString(),
  });

  if (!jobId) {
    return NextResponse.json(
      { error: "failed to enqueue job" },
      { status: 500 },
    );
  }

  return NextResponse.json({ job_id: jobId });
}
