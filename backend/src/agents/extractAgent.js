// ============================================================
// وكيل الاستخلاص — يقرأ نص العقد ويستخرج منه:
//   • الملخّص (summary)
//   • الأرقام المالية (money) بنفس مفاتيح النوع
//   • تراكم التكلفة (costProjection) وبيانات التعرّض (exposure)
// يملأ قالباً مطابقاً لشكل البيانات، ويتحقّق من كل جزء على حدة؛
// أي جزء غير صالح يرجع لقيمة القالب (فلا تنكسر المخططات أبداً).
// ============================================================

import { askJSON } from "../lib/llm.js";

export const id = "extract";
export const name = "استخلاص العقد";

const SYSTEM = `أنت محلل عقود دقيق في منصة «مجهر» بالسعودية. مهمتك استخراج الأرقام والملخص من نص العقد وملء قالب JSON.
قواعد مهمة:
- summary: جملة أو جملتان تلخّص العقد ومخاطره الأساسية مستخدماً الأرقام الحقيقية من العقد.
- money: احتفظ بنفس مفاتيح القالب تماماً، واملأها بقيم من العقد. النِسب المئوية تُكتب كأجزاء عشرية (15% = 0.15، 5% = 0.05).
- costProjection: تكلفة تراكمية عبر 3 سنوات؛ yours (عقد المستخدم) عادةً أعلى من market (السوق العادل)؛ gaps = yours − market لكل سنة؛ كل المصفوفات بطول 3؛ total وavgPerYear أرقام.
- exposure: total3y وavgPerYear وscenarios{best,expected,worst} وsources[] وconditional[] بنفس شكل القالب.
استخدم أرقام العقد الحقيقية قدر الإمكان. أعِد JSON فقط بنفس مفاتيح القالب دون أي نص خارجه.`;

const isNum = (x) => typeof x === "number" && isFinite(x);
const arr3 = (a) => Array.isArray(a) && a.length === 3 && a.every(isNum);

function validMoney(m, template) {
  if (!m || typeof m !== "object") return false;
  return Object.keys(template).every((k) => isNum(m[k]));
}
function validCost(c) {
  return c && Array.isArray(c.labels) && arr3(c.yours) && arr3(c.market) && arr3(c.gaps) && isNum(c.total) && isNum(c.avgPerYear);
}
function validExposure(e) {
  if (!e || !isNum(e.total3y) || !isNum(e.avgPerYear)) return false;
  if (!e.scenarios || !isNum(e.scenarios.best) || !isNum(e.scenarios.expected) || !isNum(e.scenarios.worst)) return false;
  if (!Array.isArray(e.sources) || e.sources.length === 0) return false;
  return e.sources.every((s) => s && typeof s.label === "string" && isNum(s.yr) && isNum(s.y3));
}

/**
 * @param {object} ctx
 * @param {string} ctx.text    نص العقد
 * @param {object} ctx.sample  بيانات النوع (قالب + احتياط)
 * @returns {Promise<{summary,money,costProjection,exposure, source:"ai"|"fallback"}>}
 */
export async function run({ text, sample }) {
  const template = {
    summary: sample.summary,
    money: sample.money,
    costProjection: sample.costProjection,
    exposure: sample.exposure,
  };

  const ai = await askJSON({
    system: SYSTEM,
    user:
      `قالب JSON (املأه بأرقام العقد الحقيقية واحتفظ بنفس المفاتيح):\n${JSON.stringify(template)}\n\n` +
      `نص العقد:\n${text}\n\nأعِد JSON فقط.`,
    maxTokens: 2500,
  });

  const out = { ...template, source: "fallback" };
  if (ai) {
    let used = false;
    if (typeof ai.summary === "string" && ai.summary.trim().length > 10) { out.summary = ai.summary.trim(); used = true; }
    if (validMoney(ai.money, sample.money)) { out.money = { ...sample.money, ...ai.money }; used = true; }
    if (validCost(ai.costProjection)) { out.costProjection = ai.costProjection; used = true; }
    if (validExposure(ai.exposure)) { out.exposure = { ...sample.exposure, ...ai.exposure }; used = true; }
    if (used) out.source = "ai";
  }
  return out;
}
