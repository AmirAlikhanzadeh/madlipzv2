import Link from "next/link";
import { CAMPAIGNS, MY_APPLICATIONS, LANGUAGE_LABELS, LANGUAGE_FLAGS, formatMoney } from "@/lib/mock-data";

const TIER_LABEL = { self_serve: "Self-serve", mid_tier: "Mid-tier", enterprise: "Enterprise" } as const;
const STATUS_COLOR = { live: "#10b981", draft: "#6b7280", paused: "#f59e0b", closed: "#ef4444" } as const;

function MatchBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${score * 100}%`,
            background: score > 0.85 ? "#10b981" : score > 0.7 ? "#f59e0b" : "#6b7280",
          }}
        />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color: score > 0.85 ? "#10b981" : score > 0.7 ? "#f59e0b" : "var(--muted)" }}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

export default function MarketplacePage() {
  const appliedIds = new Set(MY_APPLICATIONS.map((a) => a.campaignId));

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12" style={{ paddingTop: "calc(56px + 2rem)" }}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Marketplace</h1>
          <p style={{ color: "var(--muted)" }}>
            Brand campaigns matched to your voice profile. Sorted by embedding similarity.
          </p>
        </div>
        <div
          className="text-right px-4 py-2 rounded-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>Your profile strength</p>
          <p className="text-sm font-semibold text-white">data_derived ✓</p>
        </div>
      </div>

      {/* My applications banner */}
      {MY_APPLICATIONS.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style={{ background: "rgba(255,59,107,0.08)", border: "1px solid rgba(255,59,107,0.25)" }}
        >
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-semibold text-white text-sm">You have {MY_APPLICATIONS.length} active application{MY_APPLICATIONS.length > 1 ? "s" : ""}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {MY_APPLICATIONS.filter((a) => a.status === "accepted").length} accepted ·{" "}
              {MY_APPLICATIONS.filter((a) => a.status === "applied").length} pending
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {CAMPAIGNS.map((campaign) => {
          const myApp = MY_APPLICATIONS.find((a) => a.campaignId === campaign.id);
          return (
            <Link key={campaign.id} href={`/marketplace/${campaign.id}`} className="block group">
              <div
                className="rounded-2xl p-5 transition-all group-hover:border-white/20"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start gap-4">
                  {/* Brand logo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campaign.brand.logo}
                    alt={campaign.brand.name}
                    className="w-12 h-12 rounded-xl flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-bold text-white">{campaign.brand.name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                      >
                        {TIER_LABEL[campaign.brand.tier]}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_COLOR[campaign.status] }}
                      />
                      <span className="text-xs capitalize" style={{ color: STATUS_COLOR[campaign.status] }}>
                        {campaign.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">{campaign.name}</h3>
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--muted)" }}>
                      {campaign.brief}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Target languages */}
                      <div className="flex gap-1 flex-wrap">
                        {campaign.targetLanguages.map((lang) => (
                          <span key={lang} className="text-sm" title={LANGUAGE_LABELS[lang]}>
                            {LANGUAGE_FLAGS[lang] ?? "🌐"}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>·</span>
                      <span className="text-sm font-semibold text-white">{formatMoney(campaign.budgetCents)}</span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>·</span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {campaign.applicantCount} applicants
                      </span>
                    </div>
                  </div>

                  {/* Match score + status */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[90px]">
                    {myApp ? (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{
                          background: myApp.status === "accepted" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.08)",
                          color: myApp.status === "accepted" ? "#10b981" : "var(--muted)",
                          border: `1px solid ${myApp.status === "accepted" ? "#10b981" : "var(--border)"}`,
                        }}
                      >
                        {myApp.status === "accepted" ? "✓ Accepted" : "Applied"}
                      </span>
                    ) : (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        Apply →
                      </span>
                    )}
                    <div className="w-full">
                      <p className="text-xs mb-1 text-right" style={{ color: "var(--muted)" }}>Match</p>
                      <MatchBar score={campaign.matchScore} />
                    </div>
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
