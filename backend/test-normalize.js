/* اختبار سريع: نطعّم الـ normalizer بأسوأ مخرجات ممكنة (شكل البرومت القديم)
   ثم نشغّل دوال الحساب الحقيقية من الملف الشامل على النتيجة.
   node test-normalize.js  */

const { normalize } = require("./normalize");

// ===== دوال الحساب منسوخة حرفياً من الملف الشامل =====
const pct = (x) => Math.round(x * 100) + "%";
const fmt = (n) => Math.round(n).toLocaleString("en-US");

function computeRental(income, otherObligations, m) {
  const rent = m.monthlyRent;
  const housing = rent / income;
  const totalObl = otherObligations + rent;
  const dti = totalObl / income;
  const remaining = income - totalObl;
  const upfront = rent + rent * m.depositMonths;
  const penalty = rent * m.penaltyMonths;
  const years = [0, 1, 2].map((y) => Math.round(rent * Math.pow(1 + m.annualIncrease, y)));
  return { housing, dti, remaining, upfront, penalty, years };
}
function computeFinance(income, otherObligations, m) {
  const installment = m.monthlyInstallment;
  const burden = installment / income;
  const dbr = (otherObligations + installment) / income;
  const upfront = m.adminFee + m.insuranceCost;
  return { burden, dbr, upfront, earlySettle: m.earlySettlementFee, apr: m.apr, totalCost: m.totalCost };
}
function computeInvest(netWorth, investAmount, m) {
  const conc = investAmount / netWorth;
  const expReturnSar = investAmount * m.realisticReturn;
  const grow = Math.pow(1 + m.realisticReturn, 3) - 1;
  const feeRatio = grow > 0 ? (m.mgmtFee * 3 + grow * m.perfFee) / grow : 0;
  return { conc, expReturnSar, feeRatio };
}

// ===== أسوأ حالة: مخرجات البرومت القديم بالضبط =====
const OLD_SHAPE_RENTAL = {
  contractType: "rental",                    // إنجليزي — الواجهة تعرضه كما هو
  safetyScore: "42",                         // نص بدل رقم
  safetyLevel: "green",                      // متناقض مع الدرجة
  summary: "ملخص تجريبي.",
  money: {
    monthlyRent: "3,800 ر.س",                // نص فيه فاصلة ووحدة
    depositMonths: 1,
    annualIncrease: 10,                      // ☠️ 10 بدل 0.10
    penaltyMonths: 3,
    maintenanceCap: 500,
  },
  futureTimeline: [
    { when: "عند التوقيع", text: "دفعة مقدمة", icon: "payment", level: "yellow" }, // أيقونة غير مدعومة
    { when: "بعد سنة", text: "زيادة", icon: "increase", level: "red" },
  ],
  hiddenItems: [{ level: "red", title: "تجديد تلقائي", original: "نص", translated: "شرح" }],
  marketComparison: [
    { item: "الغرامة", yours: "3 أشهر", market: "شهر", diff: "+6,000", status: "red" },   // red بدل bad
    { item: "الوديعة", yours: "شهر", market: "شهر", diff: "متطابق", status: "good" },
    { item: "رسوم إدارية", yours: "2,500", market: "", diff: "", status: "yellow" },      // غامض → لازم unknown
  ],
  costProjection: {
    labels: ["Year 1", "Year 2", "Year 3"],  // إنجليزي
    yours: [43420, 47020, 50980],
    market: [38400, 40200, 42090],
    gaps: [999, 999, 999],                   // حساب خاطئ — يجب إعادة حسابه
    total: 0,
    avgPerYear: 0,
  },
  exposure: {
    total3y: 20730,
    scenarios: [5020, 20730, 62730],         // ☠️ مصفوفة بدل كائن
    sources: ["Estimated using contract text only"], // ☠️ نصوص بدل كائنات
    conditional: ["الإنهاء المبكر"],
  },
  risks: [
    { text: "خطر متوسط", level: "yellow", original: "نص", translated: "شرح" },
    { text: "خطر عالي", level: "red", original: "نص", translated: "شرح" },
  ],
  objectionLetters: [{ source: "المادة (3)", issue: "تجديد", letter: "نص الرسالة" }], // مصدر غير معروف
};

const OLD_SHAPE_FINANCE = {
  contractType: "financing",
  safetyScore: 38,
  money: { loanAmount: 150000, monthlyInstallment: 3250, termMonths: 60, flatRate: 6, adminFee: 1500, insuranceCost: 6750, earlySettlementFee: 9750 },
  // apr / totalRepay / totalCost غايبة تماماً — يجب اشتقاقها
  exposure: {}, costProjection: {}, risks: [], hiddenItems: [], marketComparison: [], futureTimeline: [], objectionLetters: [],
};

const OLD_SHAPE_INVEST = {
  contractType: "investment",
  safetyScore: 28,
  money: { investmentAmount: 50000, promisedReturn: 22, mgmtFee: 2, perfFee: 20, earlyExitPenalty: 15, lockupYears: 3 },
  // realisticReturn / netAfterFeesReturn غايبة — بدونها الفجوة كلها أصفار
  exposure: { total3y: 8360, scenarios: { best: 62986, expected: 56000, worst: 0 } },
  costProjection: {}, risks: [], hiddenItems: [], marketComparison: [], futureTimeline: [], objectionLetters: [],
};

// ===== التشغيل =====
let fails = 0;
const check = (label, cond, got) => {
  console.log(`${cond ? "✅" : "❌"} ${label}${cond ? "" : `  ← ${JSON.stringify(got)}`}`);
  if (!cond) fails++;
};

console.log("\n──────── rental ────────");
const r = normalize("rental", OLD_SHAPE_RENTAL);
check("contractType صار عربي", r.contractType === "عقد إيجار سكني", r.contractType);
check("safetyScore رقم", r.safetyScore === 42 && typeof r.safetyScore === "number", r.safetyScore);
check("safetyLevel اتصحح من green → yellow", r.safetyLevel === "yellow", r.safetyLevel);
check("monthlyRent انتزع من نص", r.money.monthlyRent === 3800, r.money.monthlyRent);
check("annualIncrease اتحول 10 → 0.1", r.money.annualIncrease === 0.1, r.money.annualIncrease);
check("الأيقونات كلها مدعومة", r.futureTimeline.every((t) => ["wallet", "calendar", "chart", "warning", "lock"].includes(t.icon)), r.futureTimeline.map((t) => t.icon));
check("status ضمن الحالات الثلاث", r.marketComparison.every((m) => ["bad", "good", "unknown"].includes(m.status)), r.marketComparison.map((m) => m.status));
check("red → bad", r.marketComparison[0].status === "bad", r.marketComparison[0].status);
check("good تبقى good", r.marketComparison[1].status === "good", r.marketComparison[1].status);
check("yellow الغامضة → unknown مو good", r.marketComparison[2].status === "unknown", r.marketComparison[2].status);
check("المجهول ينعرض 'غير متوفر' مو خانة فاضية", r.marketComparison[2].market === "غير متوفر" && r.marketComparison[2].diff === "—", r.marketComparison[2]);
check("gaps اتحسبت من جديد", JSON.stringify(r.costProjection.gaps) === JSON.stringify([5020, 6820, 8890]), r.costProjection.gaps);
check("labels عربية", r.costProjection.labels[0] === "السنة 1", r.costProjection.labels);
check("scenarios صار كائن", typeof r.exposure.scenarios === "object" && !Array.isArray(r.exposure.scenarios) && r.exposure.scenarios.expected === 20730, r.exposure.scenarios);
check("sources صارت كائنات فيها yr/y3", r.exposure.sources.every((s) => typeof s.yr === "number" && typeof s.y3 === "number"), r.exposure.sources);
check("conditional صارت كائنات", r.exposure.conditional.every((c) => typeof c.title === "string" && "amount" in c), r.exposure.conditional);
check("مصدر الاعتراض صار اسم وكيل", r.objectionLetters[0].source === "كاشف المخاطر", r.objectionLetters[0].source);
check("المخاطر مرتبة أحمر أولاً", r.risks[0].level === "red", r.risks.map((x) => x.level));

const finR = computeRental(12000, 1800, r.money);
check("الحساب المالي بلا NaN", Object.values(finR).flat().every((v) => Number.isFinite(v)), finR);
check("إيجار السنة 3 منطقي (لا 1000%)", finR.years[2] === 4598, finR.years);
console.log(`   الإيجار ${pct(finR.housing)} من الدخل · مقدم ${fmt(finR.upfront)} · غرامة ${fmt(finR.penalty)} · بعد 3 سنوات ${fmt(finR.years[2])}`);

console.log("\n──────── finance ────────");
const f = normalize("finance", OLD_SHAPE_FINANCE);
check("contractType عربي", f.contractType === "عقد تمويل شخصي", f.contractType);
check("flatRate اتحول 6 → 0.06", f.money.flatRate === 0.06, f.money.flatRate);
check("apr اتشتقت من flatRate", Math.abs(f.money.apr - 0.108) < 0.001, f.money.apr);
check("totalRepay اتحسبت", f.money.totalRepay === 195000, f.money.totalRepay);
check("totalCost اتحسبت", f.money.totalCost === 45000, f.money.totalCost);
const finF = computeFinance(13000, 2600, f.money);
check("الحساب المالي بلا NaN", Object.values(finF).every((v) => Number.isFinite(v)), finF);
console.log(`   القسط ${pct(finF.burden)} · DBR ${pct(finF.dbr)} · مقدم ${fmt(finF.upfront)} · تكلفة ${fmt(finF.totalCost)}`);

console.log("\n──────── invest ────────");
const i = normalize("invest", OLD_SHAPE_INVEST);
check("contractType عربي", i.contractType === "عقد فرصة استثمارية", i.contractType);
check("promisedReturn اتحول 22 → 0.22", i.money.promisedReturn === 0.22, i.money.promisedReturn);
check("realisticReturn له افتراضي 0.08", i.money.realisticReturn === 0.08, i.money.realisticReturn);
check("netAfterFeesReturn اتشتقت", i.money.netAfterFeesReturn > 0 && i.money.netAfterFeesReturn < 0.08, i.money.netAfterFeesReturn);
check("capitalAtRisk موجودة", i.exposure.capitalAtRisk === 50000, i.exposure.capitalAtRisk);
check("worst = 0 محفوظة (مو مستبدلة)", i.exposure.scenarios.worst === 0, i.exposure.scenarios);
const finI = computeInvest(200000, 50000, i.money);
check("الحساب المالي بلا NaN", Object.values(finI).every((v) => Number.isFinite(v)), finI);
console.log(`   التركيز ${pct(finI.conc)} · عائد واقعي ${fmt(finI.expReturnSar)} ر.س · الرسوم تلتهم ${pct(finI.feeRatio)} من الأرباح`);

console.log("\n──────── حالات متطرفة ────────");
const empty = normalize("rental", {});
check("كائن فاضي ما يكسر شي", empty.safetyLevel === "yellow" && empty.risks.length === 0, empty.safetyLevel);
check("computeRental على كائن فاضي بلا NaN", Object.values(computeRental(12000, 0, empty.money)).flat().every((v) => Number.isFinite(v)));
const junk = normalize("rental", { money: null, risks: "لا شيء", exposure: [], costProjection: 5 });
check("قيم null/خاطئة ما تكسر شي", Array.isArray(junk.risks) && junk.risks.length === 0 && junk.costProjection.total === 0);
check("نوع غير معروف يرجع rental", normalize("banana", {}).contractType === "عقد إيجار سكني");

console.log(`\n${fails === 0 ? "🎉 كل الاختبارات نجحت" : `⚠️  ${fails} اختبار فشل`}\n`);
process.exit(fails === 0 ? 0 : 1);
