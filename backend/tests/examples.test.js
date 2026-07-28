import { describe, it, expect } from "vitest";
import { EXAMPLES } from "../src/references/examples.js";

// يستخرج كل كائنات JSON المستقلة (كل سطر يبدأ بـ {) من نص المثال
function extractJSONObjects(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("{") && l.endsWith("}"));
}

describe("الأمثلة التوجيهية (Few-shot)", () => {
  it("يوجد مثال لكل وكيل نصّي", () => {
    for (const id of ["risks", "hidden", "market", "future", "object"]) {
      expect(EXAMPLES[id], id).toBeTypeOf("string");
      expect(EXAMPLES[id].length, id).toBeGreaterThan(80);
    }
  });

  it("كل كائنات JSON في الأمثلة صالحة", () => {
    for (const [id, ex] of Object.entries(EXAMPLES)) {
      const objs = extractJSONObjects(ex);
      expect(objs.length, `${id} بلا JSON`).toBeGreaterThan(0);
      for (const o of objs) {
        expect(() => JSON.parse(o), `${id} JSON غير صالح: ${o.slice(0, 40)}`).not.toThrow();
      }
    }
  });

  it("الوكلاء المميّزون (مخاطر/مخفي/سوق/مستقبل) لهم مثالان (خطِر + آمن)", () => {
    for (const id of ["risks", "hidden", "market", "future"]) {
      expect(extractJSONObjects(EXAMPLES[id]).length, id).toBeGreaterThanOrEqual(2);
    }
  });

  it("مثال المخاطر يحوي مستوى خطِر ومستوى آمن", () => {
    const levels = extractJSONObjects(EXAMPLES.risks).map((o) => JSON.parse(o).level);
    expect(levels).toContain("red");
    expect(levels).toContain("green");
  });
});
