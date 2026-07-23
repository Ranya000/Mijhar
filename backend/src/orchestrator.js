// ============================================================
// المنظّم (Orchestrator)
// يستقبل نوع العقد ونصّه، يشغّل الوكلاء الستة، ويجمع مخرجاتهم
// في تقرير تحليل واحد يطابق ما تعرضه الواجهة.
//
// خمسة وكلاء يعملون بالتوازي (مخاطر، مخفي، سوق، مستقبل، مالي)،
// ثم وكيل الاعتراض يعمل بعدهم لأنه يعتمد على مخرجاتهم.
// كل وكيل نصّي يعمل بالذكاء الاصطناعي (Claude) مع محرّك احتياطي
// يضمن نتائج كاملة حتى بدون مفتاح API.
// ============================================================

import { SAMPLE_ANALYSES, resolveContractKey } from "./data/index.js";
import { CONTRACT_TYPES } from "./data/agents.js";
import { levelFromScore } from "./lib/format.js";
import * as risksAgent from "./agents/risksAgent.js";
import * as hiddenAgent from "./agents/hiddenAgent.js";
import * as marketAgent from "./agents/marketAgent.js";
import * as futureAgent from "./agents/futureAgent.js";
import * as financialAgent from "./agents/financialAgent.js";
import * as objectionAgent from "./agents/objectionAgent.js";

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
  const [risksOut, hiddenOut, marketOut, futureOut] = await Promise.all([
    risksAgent.run({ contractKey, text, sample }),
    hiddenAgent.run({ contractKey, text, sample }),
    marketAgent.run({ contractKey, text, sample }),
    futureAgent.run({ contractKey, text, sample }),
  ]);
  sources.risks = risksOut.source;
  sources.hidden = hiddenOut.source;
  sources.market = marketOut.source;
  sources.future = futureOut.source;

  const hiddenItems = hiddenOut.hiddenItems;
  const marketComparison = marketOut.marketComparison;
  const futureTimeline = futureOut.futureTimeline;

  // ----- وكيل الأثر المالي (حسابي دائماً) -----
  const finOut = financialAgent.run({ contractKey, sample, financial });
  const fin = finOut.financial;
  sources.financial = finOut.source;

  // ----- وكيل الاعتراض (يعتمد على مخرجات الوكلاء أعلاه) -----
  const objectionOut = await objectionAgent.run({
    text, sample,
    risks: risksOut.risks,
    hiddenItems,
    financial: fin,
  });
  const objectionLetters = objectionOut.objectionLetters;
  sources.object = objectionOut.source;

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
    financial: fin,
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
