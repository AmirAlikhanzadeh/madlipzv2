import Link from "next/link";
import {
  ME, MY_REMIXES, MY_APPLICATIONS, CAMPAIGNS,
  LANGUAGE_LABELS, LANGUAGE_FLAGS,
  PROFILE_STATE_LABEL, PROFILE_STATE_COLOR,
  formatMoney,
} from "@/lib/mock-data";

const STEPS = ["aspirational", "blended", "data_derived"] as const;

export default function ProfilePage() {
  const stepIdx = STEPS.indexOf(ME.profileState);
  const acceptedCount = MY_APPLICATIONS.filter((a) => a.status === "accepted").length;

  return (
    <div
      className="max-w-2xl mx-auto px-4 pb-16"
      style={{ paddingTop: "calc(56px + 2rem)", animation: "fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      {/* ── Hero ── */}
      <div
        className="rounded-3xl p-6 mb-5 relative overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Ambient glow behind avatar */}
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)" }}
        />
        <div className="relative flex items-start gap-5">
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ME.avatar}
              alt={ME.name}
              className="w-20 h-20 rounded-2xl"
              style={{ border: "2px solid rgba(147,51,234,0.4)", boxShadow: "0 0 24px rgba(147,51,234,0.3)" }}
            />
            <div
              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-xs font-bold font-sans"
              style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", color: "white", fontSize: "9px" }}
            >
              {PROFILE_STATE_LABEL[ME.profileState].split(" ")[0].toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-ink mb-1">{ME.name}</h1>
            <p className="text-sm font-sans mb-3" style={{ color: "var(--muted)" }}>{ME.bio}</p>
            <div className="flex gap-5">
              <Stat value={ME.followers.toLocaleString()} label="followers" />
              <Stat value={String(ME.totalDubs)} label="dubs" />
              <Stat value={formatMoney(ME.earnings)} label="earned" gradient />
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile state progress ── */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-display font-semibold text-ink mb-5">Creator profile</h2>
        <div className="relative flex items-center justify-between mb-4">
          {/* Track line */}
          <div className="absolute left-0 right-0 h-0.5 top-4 mx-8" style={{ background: "var(--border-2)" }} />
          <div
            className="absolute left-8 h-0.5 top-4 transition-all duration-700"
            style={{
              right: stepIdx === 0 ? "calc(100% - 8px - 24px)" : stepIdx === 1 ? "50%" : "8px",
              background: "linear-gradient(90deg, #9333ea, #ec4899)",
              boxShadow: "0 0 8px #9333ea66",
            }}
          />
          {STEPS.map((step, i) => {
            const done = i <= stepIdx;
            const current = i === stepIdx;
            return (
              <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sans transition-all duration-500"
                  style={{
                    background: done ? "linear-gradient(135deg, #9333ea, #ec4899)" : "var(--surface-2)",
                    border: `2px solid ${done ? "transparent" : "var(--border-2)"}`,
                    color: done ? "white" : "var(--muted)",
                    boxShadow: current ? "0 0 20px #9333ea88, 0 0 40px #9333ea44" : "none",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <p className="text-xs font-sans text-center" style={{ color: done ? "var(--text)" : "var(--muted)", maxWidth: 80 }}>
                  {PROFILE_STATE_LABEL[step]}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs font-sans mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
          {ME.profileState === "data_derived"
            ? "Your embedding is 100% derived from observed dub performance. Brands see your real cultural voice."
            : ME.profileState === "blended"
            ? "Profile is blending survey responses with live remix performance. Keep dubbing to level up."
            : "Profile built from survey only. Record your first dubs to start building your embedding."}
        </p>
      </div>

      {/* ── Languages ── */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-display font-semibold text-ink mb-3">Voice languages</h2>
        <div className="flex gap-2.5 flex-wrap">
          {ME.languages.map((lang) => (
            <div
              key={lang}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-sans font-medium text-ink"
              style={{
                background: "rgba(147,51,234,0.1)",
                border: "1px solid rgba(147,51,234,0.3)",
                boxShadow: "0 0 12px rgba(147,51,234,0.15)",
              }}
            >
              <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_LABELS[lang] ?? lang}</span>
            </div>
          ))}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-sans transition-colors"
            style={{ background: "var(--surface-2)", border: "1px dashed var(--border-2)", color: "var(--muted)" }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* ── Campaigns ── */}
      {MY_APPLICATIONS.length > 0 && (
        <div className="mb-5">
          <h2 className="font-display font-semibold text-ink mb-3">Campaigns</h2>
          <div className="flex flex-col gap-2.5">
            {MY_APPLICATIONS.map((app) => {
              const campaign = CAMPAIGNS.find((c) => c.id === app.campaignId)!;
              const accepted = app.status === "accepted";
              return (
                <Link key={app.campaignId} href={`/marketplace/${app.campaignId}`}>
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                    style={{
                      background: "var(--surface)",
                      border: `1px solid ${accepted ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
                      boxShadow: accepted ? "0 0 16px rgba(16,185,129,0.1)" : "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={campaign.brand.logo} alt={campaign.brand.name} className="w-10 h-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold font-sans text-ink text-sm leading-snug">{campaign.name}</p>
                      <p className="text-xs font-sans mt-0.5" style={{ color: "var(--muted)" }}>
                        {campaign.brand.name} · {app.appliedAt}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold font-sans px-2.5 py-1 rounded-full capitalize flex-shrink-0"
                      style={{
                        background: accepted ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                        color: accepted ? "#34d399" : "var(--muted)",
                        border: `1px solid ${accepted ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                      }}
                    >
                      {accepted ? "✓ Accepted" : app.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── My dubs ── */}
      <div>
        <h2 className="font-display font-semibold text-ink mb-3">My dubs</h2>
        {MY_REMIXES.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: "var(--surface)", border: "1px dashed var(--border-2)" }}
          >
            <div className="text-3xl mb-3">🎙</div>
            <p className="font-display font-semibold text-ink mb-1">Nothing yet</p>
            <p className="text-sm font-sans mb-5" style={{ color: "var(--muted)" }}>Start dubbing clips to build your voice profile.</p>
            <Link href="/" className="btn-accent inline-block px-5 py-2.5 text-sm font-sans">
              Browse feed
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MY_REMIXES.map((remix, i) => (
              <Link key={remix.id} href={`/studio/${remix.clipId}`} className="block group">
                <div
                  className="rounded-xl overflow-hidden relative aspect-video"
                  style={{ animation: `scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) ${0.05 * i}s both` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={remix.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-2"
                    style={{ background: "linear-gradient(transparent, rgba(7,7,13,0.85))" }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold font-sans px-1.5 py-0.5 rounded text-white"
                        style={{
                          background: remix.mode === "dub"
                            ? "linear-gradient(135deg, #9333ea, #ec4899)"
                            : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        }}
                      >
                        {remix.mode}
                      </span>
                      <span className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {LANGUAGE_FLAGS[remix.language]} {LANGUAGE_LABELS[remix.language]}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, gradient }: { value: string; label: string; gradient?: boolean }) {
  return (
    <div>
      <p
        className={`font-display font-bold text-lg ${gradient ? "gradient-text" : "text-ink"}`}
      >
        {value}
      </p>
      <p className="text-xs font-sans" style={{ color: "var(--muted)" }}>{label}</p>
    </div>
  );
}
