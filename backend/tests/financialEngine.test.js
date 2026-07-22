import { describe, it, expect } from "vitest";
import {
  computeRental,
  computeFinancing,
  computeInvestment,
  computeFinancials,
} from "../src/lib/financialEngine.js";
import { levelFromScore } from "../src/lib/format.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("محرّك الأثر المالي", () => {
  it("الإيجار: النسبة والدرجة ضمن نطاق منطقي", () => {
    const r = computeRental(12000, 1800, SAMPLE_ANALYSES.rental.money);
    expect(r.housing).toBeCloseTo(3800 / 12000, 5);
    expect(r.score).toBeGreaterThanOrEqual(3);
    expect(r.score).toBeLessThanOrEqual(99);
    expect(["red", "yellow", "green"]).toContain(r.level);
    expect(r.reasons.length).toBe(4);
  });

  it("الإيجار: دخل منخفض ⇒ خطر أعلى (درجة أقل)", () => {
    const high = computeRental(20000, 1000, SAMPLE_ANALYSES.rental.money);
    const low = computeRental(6000, 3000, SAMPLE_ANALYSES.rental.money);
    expect(low.score).toBeLessThan(high.score);
  });

  it("التمويل: يحسب عبء الدين DBR", () => {
    const f = computeFinancing(13000, 2600, SAMPLE_ANALYSES.financing.money);
    expect(f.dbr).toBeCloseTo((2600 + 3250) / 13000, 5);
    expect(f.verdict).toBeTypeOf("string");
  });

  it("الاستثمار: تركيز مرتفع ⇒ درجة منخفضة", () => {
    const diversified = computeInvestment(1000000, 50000, SAMPLE_ANALYSES.investment.money);
    const concentrated = computeInvestment(80000, 50000, SAMPLE_ANALYSES.investment.money);
    expect(concentrated.score).toBeLessThan(diversified.score);
    expect(concentrated.conc).toBeGreaterThan(0.5);
  });

  it("الموجّه computeFinancials يوزّع حسب النوع", () => {
    const r = computeFinancials("rental", 12000, 1800, SAMPLE_ANALYSES.rental.money);
    expect(r).toHaveProperty("housing");
    expect(() => computeFinancials("unknown", 1, 1, {})).toThrow();
  });

  it("levelFromScore يطابق العتبات", () => {
    expect(levelFromScore(80)).toBe("green");
    expect(levelFromScore(50)).toBe("yellow");
    expect(levelFromScore(20)).toBe("red");
  });
});
