import { describe, it, expect } from "vitest";
import { getReferences, referencesText, REFERENCES } from "../src/references/index.js";

describe("الطبقات المرجعية", () => {
  it("كل نوع عقد له مراجع + المرجع القانوني العام", () => {
    for (const key of ["financing", "rental", "investment"]) {
      const { rules, authorities } = getReferences(key);
      // قواعد النوع + قواعد legal (6)
      expect(rules.length).toBeGreaterThan(REFERENCES.legal.rules.length);
      expect(authorities).toContain("وزارة العدل / ناجز");
      // كل قاعدة موثّقة بجهة ومرجع
      for (const r of rules) {
        expect(r.topic).toBeTypeOf("string");
        expect(r.authority).toBeTypeOf("string");
        expect(r.benchmark).toBeTypeOf("string");
      }
    }
  });

  it("مراجع التمويل تذكر ساما و APR وعبء الدين", () => {
    const txt = referencesText("financing");
    expect(txt).toContain("ساما");
    expect(txt).toMatch(/APR|النسبة الفعلية/);
    expect(txt).toMatch(/عبء الدين|DBR/);
  });

  it("مراجع الاستثمار تذكر هيئة السوق المالية ومنع ضمان العوائد", () => {
    const txt = referencesText("investment");
    expect(txt).toContain("هيئة السوق المالية");
    expect(txt).toMatch(/مضمون|ضمان/);
  });

  it("مراجع الإيجار تذكر إيجار والصيانة", () => {
    const txt = referencesText("rental");
    expect(txt).toMatch(/إيجار/);
    expect(txt).toMatch(/الصيانة/);
  });

  it("نوع غير معروف يرجّع المرجع القانوني العام فقط دون خطأ", () => {
    const { rules } = getReferences("unknown");
    expect(rules.length).toBe(REFERENCES.legal.rules.length);
    expect(referencesText("unknown")).toBeTypeOf("string");
  });
});
