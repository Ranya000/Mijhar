// ============================================================
// المنظّم (Orchestrator)
// يستقبل نوع العقد ونصّه، يشغّل الوكلاء الستة (بالتوازي)،
// ويجمع مخرجاتهم في تقرير تحليل واحد يطابق ما تعرضه الواجهة.
//
// حالياً (الخطوة 1): وكيل «كاشف المخاطر» فعّال بالذكاء الاصطناعي،
// وبقية الأقسام تأتي من المحرّك الاحتياطي (بيانات نموذجية) +
// محرّك الأثر المالي. تُستبدل تباعاً بوكلاء حقيقيين في الخطوات القادمة.
// ============================================================

import { SAMPLE_ANALYSES, resolveContractKey } from "./data/index.js";
import { CONTRACT_TYPES } from "./data/agents.js";
import { computeFinancials } from "./lib/financialEngine.js";
import { levelFromScore } from "./lib/format.js";
import * as risksAgent from "./agents/risksAgent.js";

// المدخلات الافتراضية لوكيل الأثر المالي حسب نوع العقد
const FIN_DEFAULTS = {
  rental:     { a: 12000, b: 1800 },   // الدخل الشهري، الالتزامات
  financing:  { a: 13000, b: 2600 },
  investment: { a: 200000, b: 50000 }, // صافي الثروة، مبلغ الاستثمار
};

/**
 * يشغّل التحليل الكامل لعقد.
 * @param {object} input
 * @param {string} input.contractType  مفتاح برمجي أو اسم عربي
 * @param {string} input.text          نص العقد
 * @param {object} [input.financial]   { income/netWorth, obligations/amount }
 * @returns {Promise<object>} تقرير التحليل الكامل
 */
export async function analyzeContract({ contractType, text, financial }) {
  const contractKey = resolveContractKey(contractType);
  if (!contractKey) {
    const supported = Object.values(CONTRACT_TYPES).join("، ");
    throw Object.assign(new Error(`نوع عقد غير مدعوم. الأنواع المتاحة: ${supported}`), { status: 400 });
  }
  if (!text || !String(text).trim()) {
    throw Object.assign(new Error("نص العقد مطلوب."), { status: 400 });
  }

  const sample = SAMPLE_ANALYSES[contractKey];
  const sources = {};

  // ----- تشغيل الوكلاء (بالتوازي) -----
  const [risksOut] = await Promise.all([
    risksAgent.run({ contractKey, text, sample }),
  ]);
  sources.risks = risksOut.source;

  // ----- الأقسام الاحتياطية (ستصبح وكلاء لاحقاً) -----
  const hiddenItems = sample.hiddenItems;        sources.hidden = "fallback";
  const marketComparison = sample.marketComparison; sources.market = "fallback";
  const futureTimeline = sample.futureTimeline;  sources.future = "fallback";
  const objectionLetters = sample.objectionLetters; sources.object = "fallback";

  // ----- محرّك الأثر المالي (حسابي دائماً) -----
  const dflt = FIN_DEFAULTS[contractKey];
  const a = financial?.a ?? dflt.a;
  const b = financial?.b ?? dflt.b;
  const fin = computeFinancials(contractKey, a, b, sample.money);
  sources.financial = "engine";

  // ----- درجة الأمان الكلية -----
  // تُشتق من عدد المخاطر الحمراء/الصفراء ومن درجة الأثر المالي.
  const safetyScore = computeSafetyScore(risksOut.risks, fin.score);
  const safetyLevel = levelFromScore(safetyScore);

  return {
    contractType: sample.contractType,
    contractKey,
    safetyScore,
    safetyLevel,
    summary: sample.summary,
    money: sample.money,
    risks: risksOut.risks,
    hiddenItems,
    marketComparison,
    futureTimeline,
    costProjection: sample.costProjection,
    exposure: sample.exposure,
    objectionLetters,
    financial: { input: { a, b }, ...fin },
    meta: { sources, generatedAt: new Date().toISOString() },
  };
}

// درجة أمان كلية بسيطة: تبدأ من الأثر المالي وتُخصم حسب المخاطر
export function computeSafetyScore(risks, finScore) {
  const red = risks.filter((r) => r.level === "red").length;
  const yellow = risks.filter((r) => r.level === "yellow").length;
  let score = finScore - red * 12 - yellow * 5;
  score = Math.round(Math.max(3, Math.min(99, score)));
  return score;
}
