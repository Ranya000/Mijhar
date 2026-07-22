import { describe, it, expect, beforeAll } from "vitest";
import * as risksAgent from "../src/agents/risksAgent.js";
import { parseJSON } from "../src/lib/llm.js";
import { SAMPLE_ANALYSES } from "../src/data/index.js";

describe("وكيل كاشف المخاطر", () => {
  beforeAll(() => {
    // ضمان عدم وجود مفتاح API ⇒ اختبار المحرّك الاحتياطي
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("يرجع بيانات النوع النموذجية عند غياب الذكاء الاصطناعي", async () => {
    const out = await risksAgent.run({
      contractKey: "rental",
      text: "عقد إيجار تجريبي",
      sample: SAMPLE_ANALYSES.rental,
    });
    expect(out.source).toBe("fallback");
    expect(out.risks).toBe(SAMPLE_ANALYSES.rental.risks);
    expect(out.risks.every((r) => ["red", "yellow", "green"].includes(r.level))).toBe(true);
  });
});

describe("parseJSON", () => {
  it("يستخرج JSON من نص عادي", () => {
    expect(parseJSON('كلام {"a":1} كلام')).toEqual({ a: 1 });
  });
  it("يستخرج JSON من كتلة ```json", () => {
    expect(parseJSON('```json\n{"b":2}\n```')).toEqual({ b: 2 });
  });
  it("يستخرج مصفوفة", () => {
    expect(parseJSON("[1,2,3]")).toEqual([1, 2, 3]);
  });
  it("يرجع null لنص بلا JSON", () => {
    expect(parseJSON("لا يوجد كائن هنا")).toBeNull();
  });
});
