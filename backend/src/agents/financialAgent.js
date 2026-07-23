// ============================================================
// الوكيل 5 — الأثر المالي (الحاسبة التفاعلية)
// يلفّ محرّك الأثر المالي الحسابي ويطلّع تقريراً كاملاً:
// درجة، حكم (مناسب/بحذر/غير مناسب)، أسباب بالأرقام، وملخص أرقام العقد.
//
// هذا الوكيل حسابي بالكامل (deterministic) — لا يعتمد على النموذج
// اللغوي، لأن القرار المالي يجب أن يكون قابلاً للتحقّق ودقيقاً.
// ============================================================

import { computeFinancials } from "../lib/financialEngine.js";
import { fmt } from "../lib/format.js";

export const id = "financial";
export const name = "الأثر المالي";

// المدخلات الافتراضية لكل نوع عقد + وصف الحقول (تستخدمها الواجهة للحاسبة)
export const FIN_SCHEMA = {
  rental: {
    aLabel: "الدخل الشهري",  aUnit: "ر.س/شهر", aDefault: 12000,
    bLabel: "التزامات أخرى", bUnit: "ر.س/شهر", bDefault: 1800,
    aMin: 3000, aMax: 60000, bMin: 0, bMax: 40000,
  },
  financing: {
    aLabel: "الدخل الشهري",  aUnit: "ر.س/شهر", aDefault: 13000,
    bLabel: "التزامات أخرى", bUnit: "ر.س/شهر", bDefault: 2600,
    aMin: 3000, aMax: 80000, bMin: 0, bMax: 50000,
  },
  investment: {
    aLabel: "صافي الثروة السائلة", aUnit: "ر.س", aDefault: 200000,
    bLabel: "مبلغ الاستثمار",       aUnit2: "ر.س", bDefault: 50000,
    bUnit: "ر.س",
    aMin: 20000, aMax: 3000000, bMin: 5000, bMax: 1000000,
  },
};

/**
 * @param {object} ctx
 * @param {string} ctx.contractKey  rental | financing | investment
 * @param {object} ctx.sample       بيانات النوع (فيها money)
 * @param {object} [ctx.financial]  { a, b } مدخلات المستخدم
 * @returns {{financial: object, source: "engine"}}
 */
export function run({ contractKey, sample, financial }) {
  const schema = FIN_SCHEMA[contractKey];
  const a = Number.isFinite(financial?.a) ? financial.a : schema.aDefault;
  const b = Number.isFinite(financial?.b) ? financial.b : schema.bDefault;

  const fin = computeFinancials(contractKey, a, b, sample.money);

  return {
    financial: {
      input: { a, b },
      schema,
      summaryLine: buildSummaryLine(contractKey, fin),
      ...fin,
    },
    source: "engine",
  };
}

// جملة ملخّص واحدة تلخّص القرار المالي
function buildSummaryLine(contractKey, fin) {
  if (contractKey === "investment") {
    return `يمثّل الاستثمار ${Math.round(fin.conc * 100)}% من ثروتك — الحكم: ${fin.verdict}.`;
  }
  const ratio = contractKey === "financing" ? fin.dbr : fin.housing;
  const label = contractKey === "financing" ? "عبء الدين" : "عبء السكن";
  return `${label} ${Math.round(ratio * 100)}% من دخلك، ويتبقى ${fmt(fin.remaining)} ر.س — الحكم: ${fin.verdict}.`;
}
