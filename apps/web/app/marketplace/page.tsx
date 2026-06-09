import Link from "next/link";
import { CAMPAIGNS, MY_APPLICATIONS, LANGUAGE_FLAGS, LANGUAGE_LABELS, formatMoney } from "@/lib/mock-data";

const TIER_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  enterprise: { label: "Enterprise", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  mid_tier:   { label: "Mid-tier",   color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
  self_serve: { label: "Self-serve", color: "#a3a3b8", bg: "rgba(163,163,184,0.1)" },
};

function MatchScore({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.88 ? "#a855f7" : score >= 0.75 ? "#22d3ee" : "#64637a";
  const label = score >= 0.88 ? "Excellent" : score >= 0.75 ? "Strong" : "Good";
  return (
    <div className="flex flex-col items-end gap-1.5 min-w-[88px]">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-sans" style={{ color: "var(--muted)" }}>Match</span>
        <span className="text-sm font-bold font-display" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: score >= 0.88
              ? "linear-gradient(90deg, #9333ea, #ec4899)"
              : score >= 0.75
              ? "linear-gradient(90deg, #22d3ee, #6366f1)"
              : "#3a3a50",
            boxShadow: score >= 0.88 ? "0 0 8px #9333ea66" : "none",
          }}
        />
      </div>
      <span className="text-xs font-sans" style={{ color, opacity: 0.7 }}>{label} fit</span>
    </div>
  );
}

export default function MarketplacePage() {
  const appliedIds = new Set(MY_APPLICATIONS.map((a) => a.campaignId));

  return (
    <div
      className="max-w-4xl mx-auto px-4 pb-16"
      style={{ paddingTop: "calc(56px + 2.5rem)", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-sans uppercase tracking-widest mb-2" style={{ color: "var(--accent)", letterSpacing: "0.15em" }}>
          Brand Marketplace
        </p>
        <h1 className="font-display font-bold text-4xl text-ink mb-2">Find your next campaign</h1>
        <p className="font-sans text-base" style={{ color: "var(--muted)" }}>
          Ranked by embedding similarity to your voice profile.
        </p>
      </div>

      {/* My applications highlight */}
      {MY_APPLICATIONS.some((a) => a.status === "accepted") && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style={{
            background: "rgba(147,51,234,0.08)",
            border: "1px solid rgba(147,51,234,0.25)",
            animation: "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
            animationDelay: "0.1s",
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(147,51,234,0.15)" }}>🎉</div>
          <div>
            <p className="font-semibold font-sans text-white text-sm">You have an accepted offer</p>
            <p className="text-xs font-sans mt-0.5" style={{ color: "var(--muted)" }}>
              Check your profile for contract details.
            </p>
          </div>
          <Link href="/profile" className="ml-auto text-xs font-semibold font-sans px-3 py-1.5 rounded-full" style={{ background: "rgba(147,51,234,0.2)", color: "#c084fc", border: "1px solid rgba(147,51,234,0.3)" }}>
            View →
          </Link>
        </div>
      )}

      {/* Campaigns */}
      <div className="flex flex-col gap-3">
        {CAMPAIGNS.map((campaign, idx) => {
          const myApp = MY_APPLICATIONS.find((a) => a.campaignId === campaign.id);
          const tier = TIER_BADGE[campaign.brand.tier];
          return (
            <Link key={campaign.id} href={`/marketplace/${campaign.id}`} className="block group">
              <div
                className="card-glow rounded-2xl p-5 transition-all duration-200"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${0.05 * idx}s both`,
                }}
              >
                <div className="relative z-10 flex items-start gap-4">
                  {/* Brand logo */}
                  <div className="relative flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={campaign.brand.logo}
                      alt={campaign.brand.name}
                      className="w-12 h-12 rounded-xl"
                      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
                    />
                    <div
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full"
                      style={{ background: "#10b981", border: "2px solid var(--surface)", boxShadow: "0 0 6px #10b98166" }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold font-sans text-white text-sm">{campaign.brand.name}</span>
                      <span
                        className="text-xs font-sans px-2 py-0.5 rounded-full font-medium"
                        style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}33` }}
                      >
                        {tier.label}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-ink mb-2 leading-snug">{campaign.name}</h3>
                    <p className="text-sm font-sans line-clamp-2 mb-3" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                      {campaign.brief}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Language flags */}
                      <div className="flex gap-1">
                        {campaign.targetLanguages.slice(0, 6).map((l) => (
                          <span key={l} className="text-sm" title={LANGUAGE_LABELS[l]}>{LANGUAGE_FLAGS[l] ?? "🌐"}</span>
                        ))}
                        {campaign.targetLanguages.length > 6 && (
                          <span className="text-xs font-sans" style={{ color: "var(--muted)" }}>+{campaign.targetLanguages.length - 6}</span>
                        )}
                      </div>
                      <span style={{ color: "var(--border-2)" }}>·</span>
                      <span className="text-sm font-bold font-sans text-ink">{formatMoney(campaign.budgetCents)}</span>
                      <span style={{ color: "var(--border-2)" }}>·</span>
                      <span className="text-xs font-sans" style={{ color: "var(--muted)" }}>{campaign.applicantCount} applicants</span>
                    </div>
                  </div>

                  {/* Right: match + status */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {myApp && (
                      <span
                        className="text-xs font-semibold font-sans px-2.5 py-1 rounded-full capitalize"
                        style={{
                          background: myApp.status === "accepted" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                          color: myApp.status === "accepted" ? "#10b981" : "var(--muted)",
                          border: `1px solid ${myApp.status === "accepted" ? "#10b98144" : "var(--border)"}`,
                        }}
                      >
                        {myApp.status === "accepted" ? "✓ Accepted" : "Applied"}
                      </span>
                    )}
                    {!myApp && (
                      <span
                        className="text-xs font-semibold font-sans px-3 py-1.5 rounded-full text-white transition-all group-hover:shadow-glow"
                        style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)" }}
                      >
                        Apply →
                      </span>
                    )}
                    <MatchScore score={campaign.matchScore} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
