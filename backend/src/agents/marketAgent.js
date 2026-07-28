// ============================================================
// الوكيل 3 — مقارنة السوق
// يقارن بنود العقد بالمعتاد في السوق السعودي، ويطلّع جدولاً
// يوضّح: بندك مقابل السوق، الفرق، وهل هو في صالحك (good) أو ضدك (bad).
// ============================================================

import { askJSON } from "../lib/llm.js";
import { referencesText } from "../references/index.js";
import { marketExample } from "../references/examples.js";

export const id = "market";
export const name = "مقارنة السوق";

const SYSTEM = `أنت «مقارنة السوق» في منصة «مجهر» لتحليل العقود للأفراد في السعودية.
مهمتك: مقارنة بنود العقد بالمعتاد والمنظّم في السوق السعودي
(أنظمة وزارة الإسكان/إيجار، البنك المركزي ساما، هيئة السوق المالية).
لكل بند قابل للمقارنة أخرج:
- item: اسم البند (مثل: غرامة الإنهاء المبكر، النسبة الفعلية APR، رسوم الأداء).
- yours: قيمة البند في عقد المستخدم (مختصرة).
- market: القيمة المعتادة/المنظّمة في السوق.
- diff: الفرق بلغة مختصرة (مبلغ تقريبي بالريال إن أمكن، أو وصف).
- status: "bad" إذا كان بند المستخدم أسوأ من السوق، "good" إذا مطابق أو أفضل.
أعطِ 5 إلى 6 بنود، وضمّن بنداً أو اثنين "good" للتوازن.
أخرج JSON فقط بالشكل: {"marketComparison":[{"item","yours","market","diff","status"}, ...]}
لا تكتب أي نص خارج JSON.`;

const VALID = new Set(["bad", "good"]);

function sanitize(rows) {
  if (!Array.isArray(rows)) return null;
  const cleaned = rows
    .filter((r) => r && typeof r.item === "string" && VALID.has(r.status))
    .map((r) => ({
      item: String(r.item).trim(),
      yours: String(r.yours || "").trim(),
      market: String(r.market || "").trim(),
      diff: String(r.diff || "").trim(),
      status: r.status,
    }));
  return cleaned.length ? cleaned : null;
}

/**
 * @param {object} ctx
 * @param {string} ctx.text    نص العقد
 * @param {object} ctx.sample  بيانات النوع النموذجية (للاحتياط)
 * @returns {Promise<{marketComparison: Array, source: "ai"|"fallback"}>}
 */
export async function run({ contractKey, text, sample }) {
  const refs = referencesText(contractKey);
  const ai = await askJSON({
    system: SYSTEM,
    user: `${refs}\n\n${marketExample}\n\nقارن بنود العقد بالمراجع التنظيمية أعلاه والسوق السعودي، واجعل عمود «السوق» مستنداً للأنظمة الموثّقة. نصّ العقد:\n${text}\n\nأخرج JSON فقط.`,
    maxTokens: 1800,
  });

  const cleaned = ai && sanitize(ai.marketComparison);
  if (cleaned) return { marketComparison: cleaned, source: "ai" };

  return { marketComparison: sample.marketComparison, source: "fallback" };
}
