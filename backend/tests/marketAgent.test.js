import { describe, it, expect, beforeAll } from "vitest";
import * as marketAgent from "../src/agents/marketAgent.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("وكيل مقارنة السوق", () => {
  beforeAll(() => { delete process.env.ANTHROPIC_API_KEY; });

  it("يرجع جدول المقارنة النموذجي عند غياب الذكاء الاصطناعي", async () => {
    const out = await marketAgent.run({
      contractKey: "investment",
      text: "عقد استثماري تجريبي",
      sample: SAMPLE_ANALYSES.investment,
    });
    expect(out.source).toBe("fallback");
    expect(out.marketComparison).toBe(SAMPLE_ANALYSES.investment.marketComparison);
  });

  it("كل صف مقارنة له حالة صالحة (good/bad)", async () => {
    const out = await marketAgent.run({
      contractKey: "rental",
      text: "عقد",
      sample: SAMPLE_ANALYSES.rental,
    });
    expect(out.marketComparison.length).toBeGreaterThan(0);
    for (const row of out.marketComparison) {
      expect(row.item).toBeTypeOf("string");
      expect(["good", "bad"]).toContain(row.status);
    }
  });
});
