import { describe, it, expect, beforeAll } from "vitest";
import * as extractAgent from "../src/agents/extractAgent.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("وكيل الاستخلاص", () => {
  beforeAll(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
  });

  it("يرجع قالب النوع عند غياب الذكاء الاصطناعي", async () => {
    const out = await extractAgent.run({ text: "عقد تجريبي", sample: SAMPLE_ANALYSES.financing });
    expect(out.source).toBe("fallback");
    expect(out.summary).toBe(SAMPLE_ANALYSES.financing.summary);
    expect(out.money).toBe(SAMPLE_ANALYSES.financing.money);
    expect(out.costProjection).toBe(SAMPLE_ANALYSES.financing.costProjection);
    expect(out.exposure).toBe(SAMPLE_ANALYSES.financing.exposure);
  });

  it("يبقي البنية سليمة (مفاتيح المخططات موجودة)", async () => {
    const out = await extractAgent.run({ text: "عقد", sample: SAMPLE_ANALYSES.rental });
    expect(out.costProjection.yours).toHaveLength(3);
    expect(out.exposure.scenarios).toHaveProperty("worst");
  });
});
