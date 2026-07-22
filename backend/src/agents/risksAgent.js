// ============================================================
// الوكيل 1 — كاشف المخاطر
// يحدد كل بند خطير في العقد ويصنّفه (red/yellow/green)،
// مع النص الأصلي وترجمة تبسيطية بالعامية.
// ============================================================

import { askJSON } from "../lib/llm.js";

export const id = "risks";
export const name = "كاشف المخاطر";

const SYSTEM = `أنت «كاشف المخاطر» في منصة «مجهر» لتحليل العقود للأفراد في السعودية.
مهمتك: قراءة نص العقد وتحديد البنود الخطيرة والمتوسطة والآمنة.
لكل بند أخرج:
- text: عنوان قصير للخطر (جملة واحدة).
- level: "red" لخطر عالٍ، "yellow" لتنبيه، "green" لبند في مصلحة المستخدم.
- original: اقتباس البند كما ورد في العقد (أو أقرب صياغة).
- translated: شرح بالعامية السعودية المبسّطة لِما يعنيه البند للمستخدم.
أعطِ 4 إلى 6 بنود متنوّعة تشمل مخاطر وبنوداً آمنة.
أخرج JSON فقط بالشكل: {"risks":[{"text","level","original","translated"}, ...]}
لا تكتب أي نص خارج JSON.`;

const VALID = new Set(["red", "yellow", "green"]);

// تنظيف وتحقّق من مخرجات النموذج
function sanitize(risks) {
  if (!Array.isArray(risks)) return null;
  const cleaned = risks
    .filter((r) => r && typeof r.text === "string" && VALID.has(r.level))
    .map((r) => ({
      text: String(r.text).trim(),
      level: r.level,
      original: String(r.original || "").trim(),
      translated: String(r.translated || "").trim(),
    }));
  return cleaned.length ? cleaned : null;
}

/**
 * @param {object} ctx
 * @param {string} ctx.contractKey  rental | financing | investment
 * @param {string} ctx.text         نص العقد
 * @param {object} ctx.sample       بيانات النوع النموذجية (للاحتياط)
 * @returns {Promise<{risks: Array, source: "ai"|"fallback"}>}
 */
export async function run({ text, sample }) {
  const ai = await askJSON({
    system: SYSTEM,
    user: `نوع العقد ونصّه:\n\n${text}\n\nحلّل المخاطر وأخرج JSON فقط.`,
    maxTokens: 2000,
  });

  const cleaned = ai && sanitize(ai.risks);
  if (cleaned) return { risks: cleaned, source: "ai" };

  // المحرّك الاحتياطي: بيانات النوع النموذجية
  return { risks: sample.risks, source: "fallback" };
}
