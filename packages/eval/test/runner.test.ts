import { describe, expect, it } from "vitest";

import { createStubKeywordJudge, runFixture } from "../src/index.js";
import type { EvalFixture } from "../src/index.js";

describe("runFixture", () => {
  it("produces a RunResult with per-label metrics and a macro-F1", async () => {
    const fixture: EvalFixture = {
      id: "test-fixture",
      remixes: [
        {
          remixId: "r1",
          transcript: "What a moment, GOAT behavior, unreal.",
          expected: [
            { labelKey: "celebratory", source: "human" },
            { labelKey: "dramatic", source: "human" },
          ],
        },
        {
          remixId: "r2",
          transcript: "Embarrassing. Just retire already.",
          expected: [{ labelKey: "mocking", source: "human" }],
        },
      ],
    };

    const judge = createStubKeywordJudge([
      {
        labelKey: "celebratory",
        labelId: "lbl_celebratory",
        keywords: ["goat", "unreal"],
      },
      {
        labelKey: "dramatic",
        labelId: "lbl_dramatic",
        keywords: ["unreal", "moment"],
      },
      {
        labelKey: "mocking",
        labelId: "lbl_mocking",
        keywords: ["embarrassing", "retire"],
      },
    ]);

    const result = await runFixture(fixture, judge, {
      labelIdToKey: {
        lbl_celebratory: "celebratory",
        lbl_dramatic: "dramatic",
        lbl_mocking: "mocking",
      },
    });

    expect(result.fixtureId).toBe("test-fixture");
    expect(result.remixCount).toBe(2);
    expect(result.remixes).toHaveLength(2);
    expect(result.perLabel.length).toBeGreaterThan(0);

    for (const m of result.perLabel) {
      expect(m.precision).toBeGreaterThanOrEqual(0);
      expect(m.precision).toBeLessThanOrEqual(1);
      expect(m.recall).toBeGreaterThanOrEqual(0);
      expect(m.recall).toBeLessThanOrEqual(1);
      expect(m.f1).toBeGreaterThanOrEqual(0);
      expect(m.f1).toBeLessThanOrEqual(1);
    }

    expect(result.macroF1).toBeGreaterThanOrEqual(0);
    expect(result.macroF1).toBeLessThanOrEqual(1);
  });
});
