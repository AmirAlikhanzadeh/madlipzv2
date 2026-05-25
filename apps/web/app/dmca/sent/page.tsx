interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export const metadata = {
  title: "Notice received — MadLipz",
};

export default async function DmcaSentPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">We got it.</h1>

      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        Compliant takedown within 24 hours. Check your email — if you&apos;d
        rather talk before we take it down, reply within 4 hours and we&apos;ll
        hold for 48.
      </p>

      {id ? (
        <p className="mt-8 text-sm text-neutral-500">
          Reference: <span className="font-mono text-neutral-900">{id}</span>
        </p>
      ) : null}
    </main>
  );
}
