import type { LabelAssignment } from "@madlipz/taxonomy";

export interface EvalExpectedLabel {
  labelKey: string;
  source: "human";
}

export interface EvalRemix {
  remixId: string;
  transcript: string;
  expected: EvalExpectedLabel[];
}

export interface EvalFixture {
  id: string;
  remixes: EvalRemix[];
}

export type Judge = (remix: EvalRemix) => Promise<LabelAssignment[]>;

export interface LabelMetrics {
  labelKey: string;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface RemixResult {
  remixId: string;
  predictedLabelKeys: string[];
  expectedLabelKeys: string[];
}

export interface RunResult {
  fixtureId: string;
  remixCount: number;
  perLabel: LabelMetrics[];
  macroF1: number;
  remixes: RemixResult[];
}
