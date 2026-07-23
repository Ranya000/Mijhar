// ============================================================
// الوكيل 6 — وكيل الاعتراض
// يبني على مخرجات الوكلاء الآخرين (المخاطر + البنود المخفية +
// الأثر المالي) ويكتب رسائل اعتراض قانونية جاهزة للإرسال.
// كل رسالة تحمل «مصدرها»: الوكيل الذي رصد المشكلة.
// ============================================================

import { askJSON } from "../lib/llm.js";

export const id = "object";
export const name = "وكيل الاعتراض";

const SYSTEM = `أنت «وكيل الاعتراض» في منصة «مجهر» لتحليل العقود للأفراد في السعودية.
تصلك قائمة بالمشكلات التي رصدها الوكلاء الآخرون (مخاطر، بنود مخفية، أثر مالي).
مهمتك: صياغة رسالة اعتراض قانونية مهذّبة وحازمة لكل مشكلة، موجّهة للطرف الآخر،
تطالب بتعديل البند بما يتوافق مع الأنظمة السعودية والممارسات العادلة.
لكل رسالة أخرج:
- source: اسم الوكيل الذي رصد المشكلة (كما ورد في المدخلات).
- issue: عنوان المشكلة المختصر.
- letter: نص رسالة الاعتراض (فقرة واحدة رسمية بصيغة المتكلم «أود الاعتراض... أطالب بـ...»).
أخرج JSON فقط بالشكل: {"objectionLetters":[{"source","issue","letter"}, ...]}
لا تكتب أي نص خارج JSON.`;

function sanitize(letters) {
  if (!Array.isArray(letters)) return null;
  const cleaned = letters
    .filter((l) => l && typeof l.letter === "string" && l.letter.trim().length > 20)
    .map((l) => ({
      source: String(l.source || "كاشف المخاطر").trim(),
      issue: String(l.issue || "").trim(),
      letter: String(l.letter).trim(),
    }));
  return cleaned.length ? cleaned : null;
}

// يبني قائمة المشكلات من مخرجات الوكلاء لتغذية النموذج
function buildIssuesBrief({ risks, hiddenItems, financial }) {
  const lines = [];
  for (const r of risks || []) {
    if (r.level !== "green") lines.push(`- [كاشف المخاطر] ${r.text}`);
  }
  for (const h of hiddenItems || []) {
    lines.push(`- [كاشف المخفي] ${h.title}`);
  }
  if (financial && financial.level !== "green") {
    lines.push(`- [الأثر المالي] ${financial.verdict}: ${financial.summaryLine || "عبء مالي مرتفع"}`);
  }
  return lines.join("\n");
}

/**
 * @param {object} ctx
 * @param {string} ctx.text          نص العقد
 * @param {object} ctx.sample        بيانات النوع النموذجية (للاحتياط)
 * @param {Array}  ctx.risks         مخرجات وكيل المخاطر
 * @param {Array}  ctx.hiddenItems   مخرجات وكيل المخفي
 * @param {object} ctx.financial     مخرجات وكيل الأثر المالي
 * @returns {Promise<{objectionLetters: Array, source: "ai"|"fallback"}>}
 */
export async function run({ text, sample, risks, hiddenItems, financial }) {
  const brief = buildIssuesBrief({ risks, hiddenItems, financial });

  const ai = await askJSON({
    system: SYSTEM,
    user:
      `نصّ العقد:\n\n${text}\n\n` +
      `المشكلات التي رصدها الوكلاء الآخرون:\n${brief}\n\n` +
      `اكتب رسالة اعتراض لكل مشكلة وأخرج JSON فقط.`,
    maxTokens: 2600,
  });

  const cleaned = ai && sanitize(ai.objectionLetters);
  if (cleaned) return { objectionLetters: cleaned, source: "ai" };

  return { objectionLetters: sample.objectionLetters, source: "fallback" };
}
