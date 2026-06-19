import type {
  EvalFixture,
  Judge,
  LabelMetrics,
  RemixResult,
  RunResult,
} from "./types.js";

export interface RunOptions {
  /** Maps the judge's labelId values back to the canonical label key used in fixtures. */
  labelIdToKey: Record<string, string>;
}

export async function runFixture(
  fixture: EvalFixture,
  judge: Judge,
  options: RunOptions,
): Promise<RunResult> {
  const remixResults: RemixResult[] = [];

  for (const remix of fixture.remixes) {
    const assignments = await judge(remix);
    const predictedLabelKeys = uniq(
      assignments
        .map((a) => options.labelIdToKey[a.labelId])
        .filter((k): k is string => typeof k === "string"),
    );
    const expectedLabelKeys = uniq(remix.expected.map((e) => e.labelKey));
    remixResults.push({
      remixId: remix.remixId,
      predictedLabelKeys,
      expectedLabelKeys,
    });
  }

  const perLabel = computePerLabel(remixResults);
  const macroF1 =
    perLabel.length === 0
      ? 0
      : perLabel.reduce((sum, m) => sum + m.f1, 0) / perLabel.length;

  return {
    fixtureId: fixture.id,
    remixCount: fixture.remixes.length,
    perLabel,
    macroF1,
    remixes: remixResults,
  };
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

function computePerLabel(remixResults: RemixResult[]): LabelMetrics[] {
  const labelKeys = new Set<string>();
  for (const r of remixResults) {
    for (const k of r.predictedLabelKeys) labelKeys.add(k);
    for (const k of r.expectedLabelKeys) labelKeys.add(k);
  }

  const metrics: LabelMetrics[] = [];
  for (const labelKey of [...labelKeys].sort()) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    for (const r of remixResults) {
      const predicted = r.predictedLabelKeys.includes(labelKey);
      const expected = r.expectedLabelKeys.includes(labelKey);
      if (predicted && expected) tp += 1;
      else if (predicted && !expected) fp += 1;
      else if (!predicted && expected) fn += 1;
    }
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 =
      precision + recall === 0
        ? 0
        : (2 * precision * recall) / (precision + recall);
    metrics.push({
      labelKey,
      truePositives: tp,
      falsePositives: fp,
      falseNegatives: fn,
      precision,
      recall,
      f1,
    });
  }
  return metrics;
}
