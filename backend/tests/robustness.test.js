import { describe, it, expect, beforeAll } from "vitest";
import { analyzeContract } from "../src/orchestrator.js";
import { TEST_CONTRACTS, ALL_TEST_CONTRACTS } from "../src/data/testContracts.js";

const REQUIRED = [
  "contractType", "safetyScore", "safetyLevel", "summary", "money",
  "risks", "hiddenItems", "marketComparison", "futureTimeline",
  "costProjection", "exposure", "objectionLetters", "financial", "meta",
];

const typeOf = (id) => (id.startsWith("rental") ? "rental" : id.startsWith("financing") ? "financing" : "investment");

describe("متانة التحليل على عقود متنوّعة", () => {
  beforeAll(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
  });

  it("عندنا ٩ عقود تجريبية (٣ لكل نوع)", () => {
    expect(ALL_TEST_CONTRACTS.length).toBe(9);
    expect(TEST_CONTRACTS.rental.length).toBe(3);
    expect(TEST_CONTRACTS.financing.length).toBe(3);
    expect(TEST_CONTRACTS.investment.length).toBe(3);
  });

  it("كل عقد يُحلَّل بنجاح ويرجّع بنية كاملة صالحة", async () => {
    for (const c of ALL_TEST_CONTRACTS) {
      const r = await analyzeContract({ contractType: typeOf(c.id), text: c.text });
      for (const k of REQUIRED) expect(r, `${c.id} مفقود: ${k}`).toHaveProperty(k);
      expect(r.safetyScore, c.id).toBeGreaterThanOrEqual(3);
      expect(r.safetyScore, c.id).toBeLessThanOrEqual(99);
      expect(["red", "yellow", "green"]).toContain(r.safetyLevel);
      expect(Array.isArray(r.risks)).toBe(true);
      expect(r.costProjection.yours).toHaveLength(3);
    }
  });

  it("كل عقد له تصنيف متوقّع (flavor) صالح", () => {
    for (const c of ALL_TEST_CONTRACTS) {
      expect(["red", "yellow", "green"], c.id).toContain(c.flavor);
      expect(c.text.length).toBeGreaterThan(200);
    }
  });
});
