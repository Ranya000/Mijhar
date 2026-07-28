import { describe, it, expect } from "vitest";
import { EXAMPLES } from "../src/references/examples.js";

describe("الأمثلة التوجيهية (Few-shot)", () => {
  it("يوجد مثال لكل وكيل نصّي", () => {
    for (const id of ["risks", "hidden", "market", "future", "object"]) {
      expect(EXAMPLES[id], id).toBeTypeOf("string");
      expect(EXAMPLES[id].length, id).toBeGreaterThan(80);
    }
  });

  it("كل مثال يحتوي مخرجاً بصيغة JSON صالحة", () => {
    for (const [id, ex] of Object.entries(EXAMPLES)) {
      const start = ex.indexOf("{");
      const end = ex.lastIndexOf("}");
      const json = ex.slice(start, end + 1);
      expect(() => JSON.parse(json), `${id} JSON غير صالح`).not.toThrow();
    }
  });

  it("مثال المخاطر يستخدم مستوى صالح", () => {
    const start = EXAMPLES.risks.indexOf("{");
    const obj = JSON.parse(EXAMPLES.risks.slice(start));
    expect(["red", "yellow", "green"]).toContain(obj.level);
  });
});
