// ============================================================
// محرّك الأثر المالي — منقول من منطق الواجهة (computeFinancials)
// لكل نوع عقد معادلته الخاصة. يُستخدم من وكيل «الأثر المالي».
// ============================================================

import { fmt, pct, pct1, levelFromScore } from "./format.js";

const clampScore = (s) => Math.round(Math.max(3, Math.min(99, s)));
const verdictFor = (level, kind) => {
  const map = {
    rental:     { green: "مناسب للتوقيع", yellow: "وقّع بحذر", red: "غير مناسب حالياً" },
    financing:  { green: "مناسب للتوقيع", yellow: "وقّع بحذر", red: "غير مناسب حالياً" },
    investment: { green: "مناسبة للاستثمار", yellow: "استثمر بحذر", red: "غير مناسبة حالياً" },
  };
  return map[kind][level];
};

// ---------- إيجار: عبء السكن + نسبة الالتزامات للدخل ----------
export function computeRental(income, otherObligations, m) {
  const rent = m.monthlyRent;
  const housing = rent / income;
  const totalObl = otherObligations + rent;
  const dti = totalObl / income;
  const remaining = income - totalObl;
  const upfront = rent + rent * m.depositMonths;
  const penalty = rent * m.penaltyMonths;
  const years = [0, 1, 2].map((y) => Math.round(rent * Math.pow(1 + m.annualIncrease, y)));

  let score = 100;
  score -= Math.max(0, housing - 0.25) * 220;
  score -= Math.max(0, dti - 0.36) * 180;
  if (remaining < income * 0.25) score -= 14;
  score = clampScore(score);
  const level = levelFromScore(score);

  const reasons = [];
  reasons.push(housing > 0.33
    ? { ok: false, text: `الإيجار يلتهم ${pct(housing)} من دخلك — أعلى من الحد الموصى به (≤30%)` }
    : housing > 0.27
      ? { ok: null, text: `الإيجار ${pct(housing)} من دخلك — قريب من السقف الموصى به (30%)` }
      : { ok: true, text: `الإيجار ${pct(housing)} من دخلك — ضمن الحد الصحي (≤30%)` });
  reasons.push(dti > 0.43
    ? { ok: false, text: `مجموع التزاماتك ${pct(dti)} من الدخل — يفوق الحد الآمن (≤40%)` }
    : dti > 0.36
      ? { ok: null, text: `مجموع التزاماتك ${pct(dti)} من الدخل — مرتفع نسبياً` }
      : { ok: true, text: `مجموع التزاماتك ${pct(dti)} من الدخل — في المنطقة الآمنة` });
  reasons.push(remaining < income * 0.25
    ? { ok: false, text: `يتبقى لك ${fmt(remaining)} ر.س فقط بعد الالتزامات — هامش ضيق` }
    : { ok: true, text: `يتبقى لك ${fmt(remaining)} ر.س شهرياً بعد الالتزامات` });
  reasons.push(m.annualIncrease >= 0.10
    ? { ok: false, text: `زيادة 10% سنوياً ترفع الإيجار إلى ${fmt(years[2])} ر.س خلال 3 سنوات` }
    : { ok: true, text: `الزيادة السنوية ضمن المعتاد` });

  return { housing, dti, remaining, upfront, penalty, years, score, level, verdict: verdictFor(level, "rental"), reasons, rent, totalObl };
}

// ---------- تمويل: نسبة عبء الدين (DBR) ----------
export function computeFinancing(income, otherObligations, m) {
  const installment = m.monthlyInstallment;
  const burden = installment / income;
  const totalObl = otherObligations + installment;
  const dbr = totalObl / income;
  const remaining = income - totalObl;
  const upfront = m.adminFee + m.insuranceCost;
  const earlySettle = m.earlySettlementFee;

  let score = 100;
  score -= Math.max(0, dbr - 0.33) * 300;
  score -= Math.max(0, burden - 0.28) * 170;
  if (remaining < income * 0.30) score -= 12;
  score = clampScore(score);
  const level = levelFromScore(score);

  const reasons = [];
  reasons.push(burden > 0.33
    ? { ok: false, text: `القسط يلتهم ${pct(burden)} من دخلك — أعلى من الحد المريح (≤28%)` }
    : burden > 0.28
      ? { ok: null, text: `القسط ${pct(burden)} من دخلك — قريب من السقف المريح (28%)` }
      : { ok: true, text: `القسط ${pct(burden)} من دخلك — ضمن الحد الصحي (≤28%)` });
  reasons.push(dbr > 0.45
    ? { ok: false, text: `عبء الدين ${pct(dbr)} من دخلك — يتجاوز حد ساما الأعلى (45%)` }
    : dbr > 0.33
      ? { ok: null, text: `عبء الدين ${pct(dbr)} من دخلك — يفوق الحد المريح (33%) لدى ساما` }
      : { ok: true, text: `عبء الدين ${pct(dbr)} من دخلك — ضمن حدود ساما الآمنة` });
  reasons.push(remaining < income * 0.30
    ? { ok: false, text: `يتبقى لك ${fmt(remaining)} ر.س فقط بعد الالتزامات — هامش ضيق` }
    : { ok: true, text: `يتبقى لك ${fmt(remaining)} ر.س شهرياً بعد الالتزامات` });
  reasons.push(m.apr >= 0.08
    ? { ok: false, text: `النسبة الفعلية (APR) ${pct1(m.apr)} مرتفعة مقارنة بالسوق (~7%) — تُضخّم التكلفة` }
    : { ok: true, text: `النسبة الفعلية (APR) ضمن المعتاد` });

  return { burden, dbr, remaining, upfront, earlySettle, score, level, verdict: verdictFor(level, "financing"), reasons, installment, totalObl, totalCost: m.totalCost };
}

// ---------- استثمار: نسبة التركيز في فرصة واحدة ----------
export function computeInvestment(netWorth, investAmount, m) {
  const conc = investAmount / netWorth;
  const remaining = netWorth - investAmount;
  const expReturnSar = investAmount * m.realisticReturn;
  const grow = Math.pow(1 + m.realisticReturn, 3) - 1;
  const feeRatio = grow > 0 ? (m.mgmtFee * 3 + grow * m.perfFee) / grow : 0;

  let score = 100;
  score -= Math.max(0, conc - 0.15) * 350;
  score -= Math.max(0, (m.promisedReturn - m.realisticReturn) - 0.05) * 120;
  if (remaining < netWorth * 0.40) score -= 15;
  score = clampScore(score);
  const level = levelFromScore(score);

  const reasons = [];
  reasons.push(conc > 0.30
    ? { ok: false, text: `هذا الاستثمار يمثّل ${pct(conc)} من ثروتك — تركيز مرتفع جداً في فرصة واحدة عالية المخاطر` }
    : conc > 0.15
      ? { ok: null, text: `يمثّل ${pct(conc)} من ثروتك — أعلى من الحد الموصى به للفرص عالية المخاطر (≤15%)` }
      : { ok: true, text: `يمثّل ${pct(conc)} من ثروتك — ضمن حدود التنويع الصحي (≤15%)` });
  reasons.push(remaining < netWorth * 0.40
    ? { ok: false, text: `لن يتبقى لك سوى ${fmt(remaining)} ر.س — سيولة غير كافية لو خسرت رأس المال` }
    : { ok: true, text: `يتبقى لك ${fmt(remaining)} ر.س سائلة لو لم تسترد رأس المال` });
  reasons.push((m.promisedReturn - m.realisticReturn) > 0.08
    ? { ok: false, text: `عائد موعود ${pct1(m.promisedReturn)} مقابل واقع السوق ~${pct1(m.realisticReturn)} — وعد مبالغ فيه يرفع شبهة المخاطرة العالية أو الاحتيال` }
    : { ok: true, text: `العائد الموعود قريب من واقع السوق` });
  reasons.push(m.lockupYears >= 3
    ? { ok: null, text: `أموالك محبوسة ${m.lockupYears} سنوات — لا يمكن سحبها عند الحاجة الطارئة دون غرامة` }
    : { ok: true, text: `فترة الحظر ضمن المعتاد` });

  return { conc, remaining, investAmount, netWorth, expReturnSar, feeRatio, score, level, verdict: verdictFor(level, "investment"), reasons, promisedReturn: m.promisedReturn, realisticReturn: m.realisticReturn };
}

// موجّه حسب نوع العقد
export function computeFinancials(contractKey, a, b, money) {
  if (contractKey === "rental") return computeRental(a, b, money);
  if (contractKey === "financing") return computeFinancing(a, b, money);
  if (contractKey === "investment") return computeInvestment(a, b, money);
  throw new Error(`نوع عقد غير معروف: ${contractKey}`);
}
