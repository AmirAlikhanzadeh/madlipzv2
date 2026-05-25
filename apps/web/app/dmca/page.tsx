export const metadata = {
  title: "DMCA — MadLipz",
  description: "File a DMCA notice or open a partnership conversation.",
};

export default function DmcaIntakePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">
        Take it down. Or talk to us.
      </h1>

      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        We comply with every valid DMCA notice within 24 hours. If you&apos;d
        rather discuss a partnership where this content stays up under your
        terms, reply to our auto-response within 4 hours and we&apos;ll hold
        the takedown for 48.
      </p>

      <form
        method="post"
        action="/api/dmca"
        className="mt-8 flex flex-col gap-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-900">
            Your email
          </span>
          <input
            required
            type="email"
            name="claimant_email"
            autoComplete="email"
            className="rounded border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-900">
            Rights holder you represent
          </span>
          <input
            required
            type="text"
            name="represented_party"
            className="rounded border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-900">
            URL of the content
          </span>
          <input
            required
            type="text"
            name="target_url"
            placeholder="https://madlipz.to/clip/..."
            className="rounded border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-900">
            Notes (optional)
          </span>
          <textarea
            name="notes"
            rows={4}
            className="rounded border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="self-start rounded bg-neutral-900 px-5 py-2.5 text-base font-medium text-white hover:bg-neutral-800"
        >
          File notice
        </button>
      </form>
    </main>
  );
}
