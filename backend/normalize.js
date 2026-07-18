/* =========================================================
   normalize.js — درع الواجهة
   يحوّل أي مخرجات من النموذج إلى الشكل الذي يتوقعه الملف الشامل بالضبط.
   القاعدة: لا يرمي استثناء أبداً — أسوأ حالة يرجّع قيمة افتراضية آمنة.
   ========================================================= */

// الحقول التي يجب أن تكون كسراً عشرياً (0.10 وليس 10)
const FRACTION_KEYS = new Set([
  "annualIncrease", "flatRate", "apr", "promisedReturn", "realisticReturn",
  "netAfterFeesReturn", "mgmtFee", "perfFee", "earlyExitPenalty",
]);

// الأيقونات الوحيدة التي يرسمها مكوّن Icon في الملف الشامل
const ICONS = new Set(["wallet", "calendar", "chart", "warning", "lock"]);

// أسماء أيقونات البرومت القديم → المدعومة
const ICON_ALIASES = {
  payment: "wallet", money: "wallet", renewal: "lock", end: "lock",
  increase: "chart", percent: "chart", trending: "chart",
  alert: "warning", danger: "warning", date: "calendar",
};

const AGENTS = new Set(["كاشف المخاطر", "كاشف المخفي", "الأثر المالي"]);

const TYPE_LABEL = {
  rental: "عقد إيجار سكني",
  finance: "عقد تمويل شخصي",
  invest: "عقد فرصة استثمارية",
};

// حدود التصنيف — نقطة واحدة للتغيير (البرومت يستخدم نفس الأرقام)
const LEVEL_FROM_SCORE = (s) => (s >= 70 ? "green" : s >= 35 ? "yellow" : "red");

// ===================== أدوات =====================

/** أي شيء → رقم. يتحمّل "3,800 ر.س" و "10%" و null و undefined. */
function num(v, fallback = 0) {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const cleaned = v.replace(/[٬,\s]/g, "").replace(/[^\d.\-]/g, "");
    const n = parseFloat(cleaned);
    if (!Number.isFinite(n)) return fallback;
    return v.includes("%") ? n / 100 : n;
  }
  return fallback;
}

/** نسبة مئوية → كسر. 10 → 0.10 (الخطأ الأخطر في البرومت القديم). */
function frac(v, fallback = 0) {
  let n = num(v, fallback);
  if (n > 1) n = n / 100;      // النموذج رجّع 10 بدل 0.10
  if (n < 0) n = 0;
  if (n > 1) n = fallback;     // حتى بعد القسمة لا يزال غير منطقي
  return n;
}

function str(v, fallback = "") {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return fallback;
}

function level(v, fallback = "yellow") {
  const s = str(v).toLowerCase();
  if (s === "red" || s === "خطر") return "red";
  if (s === "green" || s === "آمن") return "green";
  if (s === "yellow" || s === "تنبيه") return "yellow";
  return fallback;
}

/** جدول السوق ثلاث حالات: bad أسوأ · good ضمن السوق · unknown ما توفرت بيانات.
 *  المجهول يُعرض رمادياً ويُستثنى من العدّ — أفضل من تلوينه أخضر وكأنه بند ممتاز. */
function status(v) {
  const s = str(v).toLowerCase();
  if (s === "bad" || s === "red" || s === "worse") return "bad";
  if (s === "good" || s === "green" || s === "better" || s === "same") return "good";
  return "unknown"; // yellow أو أي قيمة غريبة أو فاضية
}

function icon(v, lvl) {
  const s = str(v).toLowerCase();
  if (ICONS.has(s)) return s;
  if (ICON_ALIASES[s]) return ICON_ALIASES[s];
  return lvl === "red" ? "warning" : "calendar";
}

const arr = (v) => (Array.isArray(v) ? v : []);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
const round = (n) => Math.round(num(n));

/** يضمن مصفوفة أرقام بطول 3 بالضبط (المخططات تعتمد على ذلك). */
function three(v) {
  const a = arr(v).map((x) => round(x));
  while (a.length < 3) a.push(a.length ? a[a.length - 1] : 0);
  return a.slice(0, 3);
}

// ===================== money — شكل لكل نوع =====================

function normalizeMoney(type, raw) {
  const m = obj(raw);
  const f = (k) => (FRACTION_KEYS.has(k) ? frac(m[k]) : num(m[k]));

  if (type === "rental") {
    return {
      monthlyRent: round(m.monthlyRent),
      depositMonths: num(m.depositMonths),
      annualIncrease: f("annualIncrease"),
      penaltyMonths: num(m.penaltyMonths),
      maintenanceCap: round(m.maintenanceCap),
    };
  }

  if (type === "finance") {
    const loanAmount = round(m.loanAmount);
    const monthlyInstallment = round(m.monthlyInstallment);
    const termMonths = num(m.termMonths);
    // إن نسي النموذج الاشتقاقات، نحسبها بدل ما نعرض NaN
    let totalRepay = round(m.totalRepay);
    if (!totalRepay && monthlyInstallment && termMonths) totalRepay = monthlyInstallment * termMonths;
    let totalCost = round(m.totalCost);
    if (!totalCost && totalRepay && loanAmount) totalCost = totalRepay - loanAmount;
    const flatRate = f("flatRate");
    let apr = f("apr");
    if (!apr && flatRate) apr = Math.min(0.99, flatRate * 1.8); // تقريب معروف للنسبة الثابتة
    return {
      loanAmount, monthlyInstallment, termMonths, flatRate, apr,
      totalRepay, totalCost,
      adminFee: round(m.adminFee),
      insuranceCost: round(m.insuranceCost),
      earlySettlementFee: round(m.earlySettlementFee),
    };
  }

  // invest
  const investmentAmount = round(m.investmentAmount);
  const mgmtFee = f("mgmtFee");
  const perfFee = f("perfFee");
  // realisticReturn مرجع سوقي — صفر هنا يجعل كل حسابات الفجوة بلا معنى
  const realisticReturn = f("realisticReturn") || 0.08;
  let netAfterFeesReturn = f("netAfterFeesReturn");
  if (!netAfterFeesReturn) {
    netAfterFeesReturn = Math.max(0, realisticReturn * (1 - perfFee) - mgmtFee);
  }
  return {
    investmentAmount,
    promisedReturn: f("promisedReturn"),
    realisticReturn,
    netAfterFeesReturn,
    lockupYears: num(m.lockupYears),
    mgmtFee, perfFee,
    earlyExitPenalty: f("earlyExitPenalty"),
    minInvestment: round(m.minInvestment) || investmentAmount,
  };
}

// ===================== costProjection =====================

function normalizeCostProjection(raw) {
  const c = obj(raw);
  const yours = three(c.yours);
  const market = three(c.market);
  const hasData = yours.some((x) => x) || market.some((x) => x);
  if (!hasData) {
    return { labels: [], yours: [], market: [], gaps: [], total: 0, avgPerYear: 0 };
  }
  // نعيد حساب الفجوة دائماً — لا نثق بحساب النموذج
  const gaps = yours.map((y, i) => y - market[i]);
  let total = round(c.total);
  if (!total) total = gaps[2];
  // محور المخطط عربي RTL — "Year 1" من البرومت القديم يطلع إنجليزي على الشاشة
  const given = arr(c.labels).map((l) => str(l));
  const labels = given.length === 3 && given.every((l) => /[\u0600-\u06FF]/.test(l))
    ? given
    : ["السنة 1", "السنة 2", "السنة 3"];
  return {
    labels, yours, market, gaps,
    total,
    avgPerYear: round(c.avgPerYear) || round(total / 3),
  };
}

// ===================== exposure =====================

function normalizeScenarios(raw, total3y, type) {
  const s = obj(raw);
  // النموذج رجّع مصفوفة بدل كائن (شكل البرومت القديم)
  if (Array.isArray(raw)) {
    const a = raw.map((x) => round(typeof x === "object" ? x.value ?? x.amount : x));
    return {
      best: a[0] ?? 0,
      expected: a[1] ?? total3y,
      worst: a[2] ?? total3y,
    };
  }
  const best = round(s.best);
  const expected = round(s.expected) || total3y;
  const worst = round(s.worst);
  if (type === "invest") return { best, expected, worst }; // 0 في أسوأ حالة قيمة مقصودة
  return {
    best: best || Math.round(total3y / 3),
    expected,
    worst: worst || expected,
  };
}

function normalizeSources(raw) {
  return arr(raw)
    .map((s) => {
      // النموذج رجّع نصوصاً بدل كائنات (شكل البرومت القديم)
      if (typeof s === "string") {
        return { label: s, desc: "", yr: 0, y3: 0, level: "yellow", rising: false };
      }
      const o = obj(s);
      const yr = round(o.yr);
      return {
        label: str(o.label) || str(o.title),
        desc: str(o.desc),
        yr,
        y3: round(o.y3) || yr * 3,
        level: level(o.level),
        rising: o.rising === true,
      };
    })
    .filter((s) => s.label);
}

function normalizeConditional(raw) {
  return arr(raw)
    .map((c) => {
      if (typeof c === "string") {
        return { title: c, level: "yellow", amount: "", desc: "" };
      }
      const o = obj(c);
      return {
        title: str(o.title),
        level: level(o.level),
        amount: str(o.amount),   // نص عرض وليس رقماً: "+6,000 ريال"
        desc: str(o.desc),
      };
    })
    .filter((c) => c.title);
}

function normalizeExposure(type, raw, money, costTotal) {
  const e = obj(raw);
  const total3y = round(e.total3y) || costTotal;
  const out = {
    total3y,
    avgPerYear: round(e.avgPerYear) || round(total3y / 3),
    scenarios: normalizeScenarios(e.scenarios, total3y, type),
    sources: normalizeSources(e.sources),
    conditional: normalizeConditional(e.conditional),
  };
  if (type === "invest") {
    // بطاقة الاستثمار الرئيسية تقرأ exp.capitalAtRisk — بدونها تعرض NaN
    out.capitalAtRisk = round(e.capitalAtRisk) || money.investmentAmount || 0;
  }
  return out;
}

// ===================== المدخل الرئيسي =====================

/**
 * @param {string} type   rental | finance | invest
 * @param {object} raw    JSON كما رجع من النموذج
 * @returns {object}      كائن مطابق تماماً لما يتوقعه الملف الشامل
 */
function normalize(type, raw) {
  const t = TYPE_LABEL[type] ? type : "rental";
  const d = obj(raw);

  let safetyScore = Math.round(num(d.safetyScore, 50));
  safetyScore = Math.max(0, Math.min(100, safetyScore));

  const money = normalizeMoney(t, d.money);
  const costProjection = normalizeCostProjection(d.costProjection);

  return {
    // نتجاهل "rental" لو رجّعها النموذج بالإنجليزي — الواجهة تعرض هذا النص كما هو
    contractType: /[\u0600-\u06FF]/.test(str(d.contractType)) ? str(d.contractType) : TYPE_LABEL[t],
    safetyScore,
    // نشتق المستوى دائماً: يمنع تناقض 42/green على الشاشة
    safetyLevel: LEVEL_FROM_SCORE(safetyScore),
    summary: str(d.summary),
    money,

    futureTimeline: arr(d.futureTimeline)
      .map((x) => {
        const o = obj(x);
        const lvl = level(o.level, "green");
        return { when: str(o.when), text: str(o.text), icon: icon(o.icon, lvl), level: lvl };
      })
      .filter((x) => x.text),

    hiddenItems: arr(d.hiddenItems)
      .map((x) => {
        const o = obj(x);
        return {
          level: level(o.level, "red"),
          title: str(o.title),
          original: str(o.original),
          translated: str(o.translated),
        };
      })
      .filter((x) => x.title),

    marketComparison: arr(d.marketComparison)
      .map((x) => {
        const o = obj(x);
        const st = status(o.status);
        return {
          item: str(o.item),
          yours: str(o.yours),
          // البند المجهول لازم يكون واضح إنه مجهول، لا خانة فاضية يفسّرها المستخدم كما يشاء
          market: st === "unknown" ? (str(o.market) || "غير متوفر") : str(o.market),
          diff: st === "unknown" ? (str(o.diff) || "—") : str(o.diff),
          status: st,
        };
      })
      .filter((x) => x.item),

    costProjection,
    exposure: normalizeExposure(t, d.exposure, money, costProjection.total),

    risks: arr(d.risks)
      .map((x) => {
        const o = obj(x);
        return {
          text: str(o.text) || str(o.title),
          level: level(o.level, "red"),
          original: str(o.original),
          translated: str(o.translated),
        };
      })
      .filter((x) => x.text)
      // الأحمر أولاً — نفس ترتيب أولوية اللوحات
      .sort((a, b) => (b.level === "red") - (a.level === "red")),

    objectionLetters: arr(d.objectionLetters)
      .map((x) => {
        const o = obj(x);
        const src = str(o.source);
        return {
          source: AGENTS.has(src) ? src : "كاشف المخاطر", // أي قيمة أخرى تكسر اللوحة
          issue: str(o.issue),
          letter: str(o.letter),
        };
      })
      .filter((x) => x.letter),
  };
}

module.exports = { normalize, LEVEL_FROM_SCORE, TYPE_LABEL };
