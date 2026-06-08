"use client";

import { useState } from "react";
import { MY_APPLICATIONS, type Campaign } from "@/lib/mock-data";

export default function CampaignApply({ campaign }: { campaign: Campaign }) {
  const existingApp = MY_APPLICATIONS.find((a) => a.campaignId === campaign.id);
  const [applied, setApplied] = useState(!!existingApp);
  const [status] = useState(existingApp?.status ?? null);

  if (status === "accepted") {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid #10b981" }}
      >
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-bold text-white mb-1">You&apos;ve been accepted!</p>
        <p className="text-sm" style={{ color: "#10b981" }}>
          A contract will be sent to your profile within 24 hours.
        </p>
      </div>
    );
  }

  if (applied) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
      >
        <p className="text-xl mb-2">✓</p>
        <p className="font-semibold text-white mb-1">Application submitted</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {campaign.brand.name} will review your profile and respond within 3 days.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setApplied(true)}
      className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-transform active:scale-95"
      style={{ background: "var(--accent)" }}
    >
      Apply to this campaign →
    </button>
  );
}
