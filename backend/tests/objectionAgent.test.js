import { describe, it, expect, beforeAll } from "vitest";
import * as objectionAgent from "../src/agents/objectionAgent.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("وكيل الاعتراض", () => {
  beforeAll(() => { delete process.env.ANTHROPIC_API_KEY; });

  it("يرجع رسائل الاعتراض النموذجية عند غياب الذكاء الاصطناعي", async () => {
    const s = SAMPLE_ANALYSES.rental;
    const out = await objectionAgent.run({
      text: "عقد إيجار",
      sample: s,
      risks: s.risks,
      hiddenItems: s.hiddenItems,
      financial: { level: "yellow", verdict: "وقّع بحذر", summaryLine: "عبء مرتفع" },
    });
    expect(out.source).toBe("fallback");
    expect(out.objectionLetters).toBe(s.objectionLetters);
  });

  it("كل رسالة اعتراض لها مصدر ونصّ كافٍ", async () => {
    const s = SAMPLE_ANALYSES.financing;
    const out = await objectionAgent.run({
      text: "عقد",
      sample: s,
      risks: s.risks,
      hiddenItems: s.hiddenItems,
      financial: s.money ? { level: "yellow", verdict: "وقّع بحذر" } : null,
    });
    expect(out.objectionLetters.length).toBeGreaterThan(0);
    for (const l of out.objectionLetters) {
      expect(l.source).toBeTypeOf("string");
      expect(l.letter.length).toBeGreaterThan(20);
    }
  });
});
