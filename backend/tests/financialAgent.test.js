import { describe, it, expect } from "vitest";
import * as financialAgent from "../src/agents/financialAgent.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("وكيل الأثر المالي", () => {
  it("يستخدم القيم الافتراضية عند غياب مدخلات المستخدم", () => {
    const out = financialAgent.run({
      contractKey: "rental",
      sample: SAMPLE_ANALYSES.rental,
    });
    expect(out.source).toBe("engine");
    expect(out.financial.input.a).toBe(12000);
    expect(out.financial.verdict).toBeTypeOf("string");
    expect(out.financial.summaryLine).toContain("الحكم");
    expect(out.financial.schema.aLabel).toBe("الدخل الشهري");
  });

  it("يحترم مدخلات المستخدم المخصّصة", () => {
    const out = financialAgent.run({
      contractKey: "financing",
      sample: SAMPLE_ANALYSES.financing,
      financial: { a: 25000, b: 1000 },
    });
    expect(out.financial.input).toEqual({ a: 25000, b: 1000 });
    // دخل عالٍ والتزامات قليلة ⇒ درجة أعلى
    expect(out.financial.score).toBeGreaterThan(50);
  });

  it("الاستثمار: يبني جملة ملخّص بنسبة التركيز", () => {
    const out = financialAgent.run({
      contractKey: "investment",
      sample: SAMPLE_ANALYSES.investment,
      financial: { a: 100000, b: 50000 },
    });
    expect(out.financial.summaryLine).toContain("%");
    expect(out.financial.conc).toBeCloseTo(0.5, 5);
  });
});
