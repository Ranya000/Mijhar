// ============================================================
// الوكيل 4 — النظرة المستقبلية
// يبني خطاً زمنياً يوضّح ما سيحدث للمستخدم بعد التوقيع،
// مرحلة مرحلة (عند التوقيع، أول قسط، بعد سنة، الخروج المبكر، نهاية المدة).
// ============================================================

import { askJSON } from "../lib/llm.js";

export const id = "future";
export const name = "النظرة المستقبلية";

// الأيقونات المسموحة (متوافقة مع مكوّن Icon في الواجهة)
const ICONS = new Set(["wallet", "calendar", "warning", "lock", "chart", "file"]);

const SYSTEM = `أنت «النظرة المستقبلية» في منصة «مجهر» لتحليل العقود للأفراد في السعودية.
مهمتك: تحويل بنود العقد إلى خطّ زمني يوضّح للمستخدم ما سيحدث له فعلياً عبر مراحل العقد.
لكل مرحلة أخرج:
- when: توقيت المرحلة (مثل: "عند التوقيع"، "أول قسط"، "بعد سنة"، "الخروج المبكر"، "نهاية المدة").
- text: ما سيحدث في هذه المرحلة بلغة واضحة مع الأرقام إن وُجدت.
- icon: واحدة من: "wallet" (مال), "calendar" (موعد), "warning" (تحذير), "lock" (التزام), "chart" (نسبة).
- level: "red" لأثر سلبي كبير, "yellow" لتنبيه, "green" لأثر إيجابي.
رتّب المراحل زمنياً وأعطِ 4 إلى 5 مراحل.
أخرج JSON فقط بالشكل: {"futureTimeline":[{"when","text","icon","level"}, ...]}
لا تكتب أي نص خارج JSON.`;

const VALID = new Set(["red", "yellow", "green"]);

function sanitize(items) {
  if (!Array.isArray(items)) return null;
  const cleaned = items
    .filter((t) => t && typeof t.when === "string" && VALID.has(t.level))
    .map((t) => ({
      when: String(t.when).trim(),
      text: String(t.text || "").trim(),
      icon: ICONS.has(t.icon) ? t.icon : "calendar",
      level: t.level,
    }));
  return cleaned.length ? cleaned : null;
}

/**
 * @param {object} ctx
 * @param {string} ctx.text    نص العقد
 * @param {object} ctx.sample  بيانات النوع النموذجية (للاحتياط)
 * @returns {Promise<{futureTimeline: Array, source: "ai"|"fallback"}>}
 */
export async function run({ text, sample }) {
  const ai = await askJSON({
    system: SYSTEM,
    user: `نصّ العقد:\n\n${text}\n\nابنِ الخطّ الزمني المستقبلي وأخرج JSON فقط.`,
    maxTokens: 1800,
  });

  const cleaned = ai && sanitize(ai.futureTimeline);
  if (cleaned) return { futureTimeline: cleaned, source: "ai" };

  return { futureTimeline: sample.futureTimeline, source: "fallback" };
}
