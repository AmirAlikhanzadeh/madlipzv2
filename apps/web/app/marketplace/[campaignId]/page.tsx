import Link from "next/link";
import { notFound } from "next/navigation";
import { CAMPAIGNS, ME, LANGUAGE_LABELS, LANGUAGE_FLAGS, formatMoney } from "@/lib/mock-data";
import CampaignApply from "./CampaignApply";

export function generateStaticParams() {
  return CAMPAIGNS.map((c) => ({ campaignId: c.id }));
}

export default async function CampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = CAMPAIGNS.find((c) => c.id === campaignId);
  if (!campaign) notFound();

  const matchPct = Math.round(campaign.matchScore * 100);
  const matchColor = campaign.matchScore >= 0.88 ? "#a855f7" : campaign.matchScore >= 0.75 ? "#22d3ee" : "#64637a";
  const matchGlow = campaign.matchScore >= 0.88 ? "#9333ea44" : campaign.matchScore >= 0.75 ? "#22d3ee33" : "transparent";
  const myLangs = ME.languages.filter((l) => campaign.targetLanguages.includes(l));

  return (
    <div
      className="max-w-2xl mx-auto px-4 pb-16"
      style={{ paddingTop: "calc(56px + 2rem)", animation: "fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm font-sans mb-7 transition-colors"
        style={{ color: "var(--muted)" }}
      >
        ← Marketplace
      </Link>

      {/* Hero card */}
      <div
        className="rounded-3xl p-6 mb-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.brand.logo}
            alt={campaign.brand.name}
            className="w-16 h-16 rounded-2xl"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
          />
          <div>
            <p className="text-sm font-sans mb-1" style={{ color: "var(--muted)" }}>
              {campaign.brand.name} · {campaign.brand.industry} · {campaign.brand.region}
            </p>
            <h1 className="font-display font-bold text-2xl text-ink leading-tight">{campaign.name}</h1>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Budget" value={formatMoney(campaign.budgetCents)} />
        <div
          className="rounded-2xl p-4 flex flex-col gap-1"
          style={{ background: "var(--surface)", border: `1px solid ${matchColor}33`, boxShadow: `0 0 24px ${matchGlow}` }}
        >
          <p className="text-xs font-sans" style={{ color: "var(--muted)" }}>Your match</p>
          <p className="font-display font-bold text-xl" style={{ color: matchColor }}>{matchPct}%</p>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
            <div className="h-full rounded-full" style={{ width: `${matchPct}%`, background: `linear-gradient(90deg, ${matchColor}, ${matchColor}aa)`, boxShadow: `0 0 8px ${matchGlow}` }} />
          </div>
        </div>
        <StatCard label="Applicants" value={String(campaign.applicantCount)} sub={campaign.endAt ? `Closes ${campaign.endAt}` : "Open-ended"} />
      </div>

      {/* Brief */}
      <section className="rounded-2xl p-5 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-display font-semibold text-ink mb-3">Brief</h2>
        <p className="text-sm font-sans leading-relaxed" style={{ color: "var(--muted)" }}>{campaign.brief}</p>
      </section>

      {/* Target languages */}
      <section className="rounded-2xl p-5 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-display font-semibold text-ink mb-3">Target languages</h2>
        <div className="flex gap-2 flex-wrap">
          {campaign.targetLanguages.map((lang) => {
            const youSpeak = ME.languages.includes(lang);
            return (
              <div
                key={lang}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-sans"
                style={{
                  background: youSpeak ? "rgba(147,51,234,0.12)" : "var(--surface-2)",
                  border: `1px solid ${youSpeak ? "rgba(147,51,234,0.4)" : "var(--border)"}`,
                  color: youSpeak ? "white" : "var(--muted)",
                  boxShadow: youSpeak ? "0 0 12px rgba(147,51,234,0.2)" : "none",
                }}
              >
                <span>{LANGUAGE_FLAGS[lang] ?? "🌐"}</span>
                <span>{LANGUAGE_LABELS[lang] ?? lang}</span>
                {youSpeak && <span className="text-xs font-semibold" style={{ color: "#c084fc" }}>you ✓</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Why matched */}
      <section
        className="rounded-2xl p-5 mb-6"
        style={{ background: "rgba(147,51,234,0.05)", border: "1px solid rgba(147,51,234,0.2)" }}
      >
        <h2 className="font-display font-semibold text-sm mb-3" style={{ color: "#c084fc" }}>Why you were matched</h2>
        <ul className="text-sm font-sans space-y-2" style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <li>· Voice embedding: {matchPct}% cosine similarity to this brief</li>
          {myLangs.length > 0 && <li>· Native in {myLangs.map((l) => LANGUAGE_LABELS[l]).join(", ")} — required by this campaign</li>}
          <li>· Salience score above campaign floor</li>
          <li>· {ME.totalDubs} verified dubs demonstrate delivery track record</li>
          <li>· Profile state: {ME.profileState} — fully embedding-backed</li>
        </ul>
      </section>

      <CampaignApply campaign={campaign} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-xs font-sans" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="font-display font-bold text-xl text-ink">{value}</p>
      {sub && <p className="text-xs font-sans" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}
