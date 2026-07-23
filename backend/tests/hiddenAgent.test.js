import { describe, it, expect, beforeAll } from "vitest";
import * as hiddenAgent from "../src/agents/hiddenAgent.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("وكيل كاشف المخفي", () => {
  beforeAll(() => { delete process.env.ANTHROPIC_API_KEY; });

  it("يرجع البنود المخفية النموذجية عند غياب الذكاء الاصطناعي", async () => {
    const out = await hiddenAgent.run({
      contractKey: "financing",
      text: "عقد تمويل تجريبي",
      sample: SAMPLE_ANALYSES.financing,
    });
    expect(out.source).toBe("fallback");
    expect(out.hiddenItems).toBe(SAMPLE_ANALYSES.financing.hiddenItems);
  });

  it("كل بند مخفي له عنوان ومستوى صالح", async () => {
    const out = await hiddenAgent.run({
      contractKey: "rental",
      text: "عقد",
      sample: SAMPLE_ANALYSES.rental,
    });
    expect(out.hiddenItems.length).toBeGreaterThan(0);
    for (const h of out.hiddenItems) {
      expect(h.title).toBeTypeOf("string");
      expect(["red", "yellow"]).toContain(h.level);
      expect(h.translated).toBeTypeOf("string");
    }
  });
});
