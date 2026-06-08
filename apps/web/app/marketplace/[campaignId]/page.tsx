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
  const matchColor = campaign.matchScore > 0.85 ? "#10b981" : campaign.matchScore > 0.7 ? "#f59e0b" : "#6b7280";

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12" style={{ paddingTop: "calc(56px + 2rem)" }}>
      <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm mb-6 hover:text-white transition-colors" style={{ color: "var(--muted)" }}>
        ← Marketplace
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={campaign.brand.logo} alt={campaign.brand.name} className="w-16 h-16 rounded-2xl" />
        <div>
          <p className="text-sm mb-0.5" style={{ color: "var(--muted)" }}>
            {campaign.brand.name} · {campaign.brand.industry} · {campaign.brand.region}
          </p>
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Budget */}
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Budget</p>
          <p className="text-xl font-bold text-white">{formatMoney(campaign.budgetCents)}</p>
        </div>
        {/* Match */}
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: `1px solid ${matchColor}33` }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Your match score</p>
          <p className="text-xl font-bold" style={{ color: matchColor }}>{matchPct}%</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {matchPct >= 90 ? "Excellent fit" : matchPct >= 75 ? "Strong fit" : "Good fit"}
          </p>
        </div>
        {/* Applicants */}
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Applicants</p>
          <p className="text-xl font-bold text-white">{campaign.applicantCount}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {campaign.endAt ? `Closes ${campaign.endAt}` : "Open-ended"}
          </p>
        </div>
      </div>

      {/* Brief */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-3">Brief</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{campaign.brief}</p>
      </div>

      {/* Target languages */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-3">Target languages</h2>
        <div className="flex gap-3 flex-wrap">
          {campaign.targetLanguages.map((lang) => {
            const youSpeak = ME.languages.includes(lang);
            return (
              <div
                key={lang}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                style={{
                  background: youSpeak ? "rgba(255,59,107,0.1)" : "var(--surface-2)",
                  border: `1px solid ${youSpeak ? "var(--accent)" : "var(--border)"}`,
                  color: youSpeak ? "white" : "var(--muted)",
                }}
              >
                <span>{LANGUAGE_FLAGS[lang] ?? "🌐"}</span>
                <span>{LANGUAGE_LABELS[lang] ?? lang}</span>
                {youSpeak && <span className="text-xs" style={{ color: "var(--accent)" }}>you ✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Matching explanation */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "rgba(255,59,107,0.05)", border: "1px solid rgba(255,59,107,0.2)" }}
      >
        <h2 className="font-semibold text-white mb-2 text-sm">Why you were matched</h2>
        <ul className="text-sm space-y-1.5" style={{ color: "var(--muted)" }}>
          <li>• Your voice profile aligns with this brief&apos;s embedding ({matchPct}% cosine similarity)</li>
          <li>• You speak {ME.languages.filter((l) => campaign.targetLanguages.includes(l)).map((l) => LANGUAGE_LABELS[l]).join(", ") || "compatible languages"}</li>
          <li>• Your content salience score exceeds the campaign floor</li>
          <li>• {ME.totalDubs} past dubs demonstrate consistent delivery</li>
        </ul>
      </div>

      <CampaignApply campaign={campaign} />
    </div>
  );
}
