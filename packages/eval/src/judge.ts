import type { LabelAssignment } from "@madlipz/taxonomy";

import type { Judge } from "./types.js";

export interface KeywordRule {
  labelKey: string;
  labelId: string;
  keywords: string[];
}

/**
 * Deterministic offline judge. Emits a label assignment whenever any keyword
 * for a rule appears (case-insensitively) in the transcript. Intentionally
 * dumb — exists so the runner can be exercised without burning LLM calls.
 * Real LLM judges land in Phase 1.5.
 */
export function createStubKeywordJudge(rules: KeywordRule[]): Judge {
  return (remix) => {
    const transcript = remix.transcript.toLowerCase();
    const assignments: LabelAssignment[] = [];
    for (const rule of rules) {
      const hit = rule.keywords.some((kw) =>
        transcript.includes(kw.toLowerCase()),
      );
      if (hit) {
        assignments.push({
          labelId: rule.labelId,
          confidence: 1,
          source: "llm",
        });
      }
    }
    return Promise.resolve(assignments);
  };
}
