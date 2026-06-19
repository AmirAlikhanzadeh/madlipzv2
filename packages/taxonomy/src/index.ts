/**
 * @madlipz/taxonomy
 *
 * Types only. This package intentionally does NOT export a canonical list of
 * label keys as runtime constants.
 *
 * The `labels` row set is council-governed data that lives in Postgres and
 * mutates outside of code deploys (proposals → council approval → retirement).
 * If code hardcoded the keys, the deploy pipeline would become the bottleneck
 * for taxonomy evolution and would silently drift from the source of truth.
 *
 * The accompanying `seed/v0-candidate-labels.json` is a STARTER for the
 * council to ratify into the `labels` table — not a runtime import target.
 */

import type { remixLabelSourceEnum } from "@madlipz/schema";

export type LabelSource = (typeof remixLabelSourceEnum.enumValues)[number];

export interface Label {
  id: string;
  key: string;
  displayName: string;
  description: string | null;
  createdByUserId: string;
  councilApprovedAt: Date | null;
  retiredAt: Date | null;
}

export interface LabelAssignment {
  labelId: string;
  confidence: number;
  source: LabelSource;
}
