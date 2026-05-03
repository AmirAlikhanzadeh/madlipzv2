import { NextResponse } from "next/server";

import { getBoss } from "@/lib/queue";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const boss = await getBoss();
  const job = await boss.getJobById("hello", id);

  if (!job) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    name: job.name,
    state: job.state,
    data: job.data,
    createdOn: job.createdOn,
    completedOn: job.completedOn,
  });
}
