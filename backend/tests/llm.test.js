import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { activeProvider, isLLMEnabled, askJSON } from "../src/lib/llm.js";

describe("اكتشاف مزوّد الذكاء الاصطناعي", () => {
  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it("لا مزوّد بدون مفاتيح", () => {
    expect(activeProvider()).toBeNull();
    expect(isLLMEnabled()).toBe(false);
  });

  it("Gemini عند وجود مفتاحه فقط", () => {
    process.env.GEMINI_API_KEY = "test-key";
    expect(activeProvider()).toBe("gemini");
    expect(isLLMEnabled()).toBe(true);
  });

  it("Claude له الأولوية عند وجود المفتاحين", () => {
    process.env.GEMINI_API_KEY = "g";
    process.env.ANTHROPIC_API_KEY = "a";
    expect(activeProvider()).toBe("anthropic");
  });
});

describe("askJSON عبر Gemini (fetch مُحاكى)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it("يحلّل رد Gemini إلى JSON", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    delete process.env.ANTHROPIC_API_KEY;
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"risks":[{"text":"x","level":"red"}]}' }] } }],
      }),
    });
    const out = await askJSON({ system: "s", user: "u" });
    expect(out).toEqual({ risks: [{ text: "x", level: "red" }] });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("يرجع null عند فشل النداء (يتيح المحرّك الاحتياطي)", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    delete process.env.ANTHROPIC_API_KEY;
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 429, text: async () => "quota" });
    const out = await askJSON({ system: "s", user: "u" });
    expect(out).toBeNull();
  });
});
