// ============================================================
// الوكيل 2 — كاشف المخفي
// يكشف البنود الغامضة والمخفية المصاغة بلغة قانونية ملتوية،
// ويترجمها بالعامية موضّحاً ما تعنيه فعلياً للمستخدم.
// ============================================================

import { askJSON } from "../lib/llm.js";

export const id = "hidden";
export const name = "كاشف المخفي";

const SYSTEM = `أنت «كاشف المخفي» في منصة «مجهر» لتحليل العقود للأفراد في السعودية.
مهمتك: اصطياد البنود المخفية أو الغامضة أو المصاغة بطريقة تُخفي أثرها الحقيقي
(مثل: تجديد تلقائي، تفويضات مفتوحة، رسوم قابلة للتعديل من طرف واحد، تناقضات بين البنود).
لكل بند مخفي أخرج:
- level: "red" لخطر عالٍ، "yellow" لتنبيه.
- title: عنوان قصير يصف البند المخفي.
- original: اقتباس البند كما ورد في العقد (أو أقرب صياغة).
- translated: شرح بالعامية السعودية المبسّطة لِما يخفيه هذا البند على المستخدم.
ركّز على البنود التي "لا يلاحظها" القارئ العادي. أعطِ 2 إلى 4 بنود.
أخرج JSON فقط بالشكل: {"hiddenItems":[{"level","title","original","translated"}, ...]}
لا تكتب أي نص خارج JSON.`;

const VALID = new Set(["red", "yellow"]);

function sanitize(items) {
  if (!Array.isArray(items)) return null;
  const cleaned = items
    .filter((h) => h && typeof h.title === "string" && VALID.has(h.level))
    .map((h) => ({
      level: h.level,
      title: String(h.title).trim(),
      original: String(h.original || "").trim(),
      translated: String(h.translated || "").trim(),
    }));
  return cleaned.length ? cleaned : null;
}

/**
 * @param {object} ctx
 * @param {string} ctx.text    نص العقد
 * @param {object} ctx.sample  بيانات النوع النموذجية (للاحتياط)
 * @returns {Promise<{hiddenItems: Array, source: "ai"|"fallback"}>}
 */
export async function run({ text, sample }) {
  const ai = await askJSON({
    system: SYSTEM,
    user: `نصّ العقد:\n\n${text}\n\nاكشف البنود المخفية وأخرج JSON فقط.`,
    maxTokens: 1800,
  });

  const cleaned = ai && sanitize(ai.hiddenItems);
  if (cleaned) return { hiddenItems: cleaned, source: "ai" };

  return { hiddenItems: sample.hiddenItems, source: "fallback" };
}
