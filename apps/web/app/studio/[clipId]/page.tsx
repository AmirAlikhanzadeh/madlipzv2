import { notFound } from "next/navigation";
import { CLIPS } from "@/lib/mock-data";
import StudioClient from "./StudioClient";

export function generateStaticParams() {
  return CLIPS.map((c) => ({ clipId: c.id }));
}

export default async function StudioPage({ params }: { params: Promise<{ clipId: string }> }) {
  const { clipId } = await params;
  const clip = CLIPS.find((c) => c.id === clipId);
  if (!clip) notFound();
  return <StudioClient clip={clip} />;
}
