import Link from "next/link";
import {
  ME, MY_REMIXES, MY_APPLICATIONS, CAMPAIGNS,
  LANGUAGE_LABELS, LANGUAGE_FLAGS,
  PROFILE_STATE_LABEL, PROFILE_STATE_COLOR,
  formatMoney,
} from "@/lib/mock-data";

const PROFILE_STATE_STEPS = ["aspirational", "blended", "data_derived"] as const;

export default function ProfilePage() {
  const currentStepIdx = PROFILE_STATE_STEPS.indexOf(ME.profileState);
  const acceptedCampaigns = MY_APPLICATIONS.filter((a) => a.status === "accepted");
  const pendingCampaigns = MY_APPLICATIONS.filter((a) => a.status === "applied");

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16" style={{ paddingTop: "calc(56px + 2rem)" }}>
      {/* Hero */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-start gap-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ME.avatar} alt={ME.name} className="w-20 h-20 rounded-2xl border-2" style={{ borderColor: "var(--accent)" }} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{ME.name}</h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: `${PROFILE_STATE_COLOR[ME.profileState]}22`,
                color: PROFILE_STATE_COLOR[ME.profileState],
                border: `1px solid ${PROFILE_STATE_COLOR[ME.profileState]}44`,
              }}
            >
              {PROFILE_STATE_LABEL[ME.profileState]}
            </span>
          </div>
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>{ME.bio}</p>
          <div className="flex gap-5 text-sm">
            <div><span className="font-bold text-white">{ME.followers.toLocaleString()}</span> <span style={{ color: "var(--muted)" }}>followers</span></div>
            <div><span className="font-bold text-white">{ME.totalDubs}</span> <span style={{ color: "var(--muted)" }}>dubs</span></div>
            <div><span className="font-bold text-white">{formatMoney(ME.earnings)}</span> <span style={{ color: "var(--muted)" }}>earned</span></div>
          </div>
        </div>
      </div>

      {/* Profile state progress */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold text-white mb-4">Creator profile</h2>
        <div className="flex items-center gap-0">
          {PROFILE_STATE_STEPS.map((step, i) => {
            const done = i <= currentStepIdx;
            const current = i === currentStepIdx;
            const label = PROFILE_STATE_LABEL[step];
            return (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {i > 0 && (
                  <div
                    className="absolute left-0 right-1/2 top-3 h-0.5 -translate-y-1/2"
                    style={{ background: done ? PROFILE_STATE_COLOR[step] : "var(--border)" }}
                  />
                )}
                {i < 2 && (
                  <div
                    className="absolute left-1/2 right-0 top-3 h-0.5 -translate-y-1/2"
                    style={{ background: i < currentStepIdx ? PROFILE_STATE_COLOR[PROFILE_STATE_STEPS[i + 1]] : "var(--border)" }}
                  />
                )}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 mb-2"
                  style={{
                    background: done ? PROFILE_STATE_COLOR[step] : "var(--surface-2)",
                    border: `2px solid ${done ? PROFILE_STATE_COLOR[step] : "var(--border)"}`,
                    color: done ? "white" : "var(--muted)",
                    boxShadow: current ? `0 0 12px ${PROFILE_STATE_COLOR[step]}88` : "none",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <p className="text-xs text-center leading-tight" style={{ color: done ? "white" : "var(--muted)" }}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
          {ME.profileState === "data_derived"
            ? "Your profile is fully data-derived — brands see your real embedding, not a survey."
            : ME.profileState === "blended"
            ? "Your profile is blending survey data with observed remix performance."
            : "Your profile is based on your survey answers. Start dubbing to build your embedding."}
        </p>
      </div>

      {/* Languages */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold text-white mb-3">Voice languages</h2>
        <div className="flex gap-3 flex-wrap">
          {ME.languages.map((lang) => (
            <div
              key={lang}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white"
              style={{ background: "rgba(255,59,107,0.1)", border: "1px solid rgba(255,59,107,0.3)" }}
            >
              <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_LABELS[lang] ?? lang}</span>
            </div>
          ))}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ background: "var(--surface-2)", border: "1px dashed var(--border)", color: "var(--muted)" }}
          >
            + Add language
          </button>
        </div>
      </div>

      {/* My applications */}
      {MY_APPLICATIONS.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-white mb-3">Campaign applications</h2>
          <div className="flex flex-col gap-3">
            {MY_APPLICATIONS.map((app) => {
              const campaign = CAMPAIGNS.find((c) => c.id === app.campaignId)!;
              return (
                <Link key={app.campaignId} href={`/marketplace/${app.campaignId}`}>
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl hover:border-white/20 transition-colors"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={campaign.brand.logo} alt={campaign.brand.name} className="w-10 h-10 rounded-xl" />
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{campaign.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {campaign.brand.name} · Applied {app.appliedAt}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{
                        background: app.status === "accepted" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                        color: app.status === "accepted" ? "#10b981" : "var(--muted)",
                        border: `1px solid ${app.status === "accepted" ? "#10b981" : "var(--border)"}`,
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* My dubs */}
      <div>
        <h2 className="font-semibold text-white mb-3">My dubs</h2>
        {MY_REMIXES.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}
          >
            <p className="text-2xl mb-2">🎙</p>
            <p className="font-semibold text-white mb-1">No dubs yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Go to the feed and start dubbing clips.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Browse feed
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MY_REMIXES.map((remix) => (
              <Link key={remix.id} href={`/studio/${remix.clipId}`} className="block group">
                <div className="rounded-xl overflow-hidden relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={remix.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-2"
                    style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-semibold text-white"
                        style={{ background: remix.mode === "dub" ? "var(--accent)" : "#7c3aed" }}
                      >
                        {remix.mode}
                      </span>
                      <span className="text-xs text-white/70">
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
