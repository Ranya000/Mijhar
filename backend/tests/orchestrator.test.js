import { describe, it, expect, beforeAll } from "vitest";
import { analyzeContract, computeSafetyScore } from "../src/orchestrator.js";

const REQUIRED_KEYS = [
  "contractType", "contractKey", "safetyScore", "safetyLevel", "summary",
  "money", "risks", "hiddenItems", "marketComparison", "futureTimeline",
  "costProjection", "exposure", "objectionLetters", "financial", "meta",
];

describe("المنظّم analyzeContract", () => {
  beforeAll(() => { delete process.env.ANTHROPIC_API_KEY; });

  it("يحلّل عقد إيجار (بالمفتاح البرمجي)", async () => {
    const r = await analyzeContract({ contractType: "rental", text: "عقد إيجار تجريبي" });
    for (const k of REQUIRED_KEYS) expect(r, `مفقود: ${k}`).toHaveProperty(k);
    expect(r.contractKey).toBe("rental");
    expect(r.safetyScore).toBeGreaterThanOrEqual(3);
    expect(r.safetyScore).toBeLessThanOrEqual(99);
    expect(["red", "yellow", "green"]).toContain(r.safetyLevel);
    // الوكلاء الستة كلهم أبلغوا عن مصدرهم
    for (const id of ["risks", "hidden", "market", "future", "financial", "object"]) {
      expect(r.meta.sources, `مصدر مفقود: ${id}`).toHaveProperty(id);
    }
  });

  it("يقبل الاسم العربي لنوع العقد", async () => {
    const r = await analyzeContract({ contractType: "عقد تمويل", text: "نص تجريبي" });
    expect(r.contractKey).toBe("financing");
  });

  it("يحلّل عقد استثمار مع مدخلات مالية مخصّصة", async () => {
    const r = await analyzeContract({
      contractType: "investment",
      text: "نص",
      financial: { a: 100000, b: 50000 },
    });
    expect(r.financial.input).toEqual({ a: 100000, b: 50000 });
    expect(r.contractKey).toBe("investment");
  });

  it("يرفض نوع عقد غير مدعوم", async () => {
    await expect(analyzeContract({ contractType: "عقد زواج", text: "x" }))
      .rejects.toThrow(/غير مدعوم/);
  });

  it("يرفض النص الفارغ", async () => {
    await expect(analyzeContract({ contractType: "rental", text: "  " }))
      .rejects.toThrow(/مطلوب/);
  });

  it("computeSafetyScore يخصم حسب المخاطر", () => {
    const many = computeSafetyScore(
      [{ level: "red" }, { level: "red" }, { level: "yellow" }], 80);
    const few = computeSafetyScore([{ level: "green" }], 80);
    expect(many).toBeLessThan(few);
  });
});
