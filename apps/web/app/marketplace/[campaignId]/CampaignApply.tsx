"use client";

import { useState } from "react";
import { MY_APPLICATIONS, type Campaign } from "@/lib/mock-data";

export default function CampaignApply({ campaign }: { campaign: Campaign }) {
  const existing = MY_APPLICATIONS.find((a) => a.campaignId === campaign.id);
  const [applied, setApplied] = useState(!!existing);
  const [status] = useState(existing?.status ?? null);

  if (status === "accepted") {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}
      >
        <div className="text-3xl mb-3">🎉</div>
        <p className="font-display font-bold text-xl text-ink mb-2">You&apos;re in</p>
        <p className="text-sm font-sans" style={{ color: "#34d399" }}>
          Contract incoming from {campaign.brand.name} within 24 hours.
        </p>
      </div>
    );
  }

  if (applied) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="text-3xl mb-3">✓</div>
        <p className="font-display font-bold text-xl text-ink mb-2">Application sent</p>
        <p className="text-sm font-sans" style={{ color: "var(--muted)" }}>
          {campaign.brand.name} will review your voice profile and respond within 3 days.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setApplied(true)}
      className="btn-accent w-full py-4 rounded-2xl font-display font-bold text-lg text-white"
    >
      Apply to this campaign →
    </button>
  );
}
