import { describe, it, expect, beforeAll } from "vitest";
import * as futureAgent from "../src/agents/futureAgent.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("وكيل النظرة المستقبلية", () => {
  beforeAll(() => { delete process.env.ANTHROPIC_API_KEY; });

  it("يرجع الخطّ الزمني النموذجي عند غياب الذكاء الاصطناعي", async () => {
    const out = await futureAgent.run({
      contractKey: "financing",
      text: "عقد تمويل تجريبي",
      sample: SAMPLE_ANALYSES.financing,
    });
    expect(out.source).toBe("fallback");
    expect(out.futureTimeline).toBe(SAMPLE_ANALYSES.financing.futureTimeline);
  });

  it("كل مرحلة لها توقيت ومستوى صالح", async () => {
    const out = await futureAgent.run({
      contractKey: "rental",
      text: "عقد",
      sample: SAMPLE_ANALYSES.rental,
    });
    expect(out.futureTimeline.length).toBeGreaterThan(0);
    for (const t of out.futureTimeline) {
      expect(t.when).toBeTypeOf("string");
      expect(["red", "yellow", "green"]).toContain(t.level);
    }
  });
});
