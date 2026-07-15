import { useState, useRef } from "react";

/* =========================================================
   مجهر — كاشف المخاطر للأفراد
   وحدة عقد التمويل (منفصلة — الباكند يربطها بباقي الوحدات)
   نفس الوكلاء الستة، نتائج مختلفة لأن العقد مختلف
   ========================================================= */

// ===================== SAMPLE DATA (FINANCING) =====================
const SAMPLE_ANALYSIS = {
  contractType: "عقد تمويل شخصي",
  safetyScore: 38,
  safetyLevel: "yellow",
  summary: "تمويل بمبلغ 150,000 ر.س لكن النسبة المعلنة تخفي تكلفة فعلية أعلى بكثير، مع بنود سداد مبكر وحجز راتب تستحق التفاوض قبل التوقيع.",
  money: {
    loanAmount: 150000,
    monthlyInstallment: 3250,
    termMonths: 60,
    flatRate: 0.06,
    apr: 0.108,
    totalRepay: 195000,
    totalCost: 45000,
    adminFee: 1500,
    insuranceCost: 6750,
    earlySettlementFee: 9750,
  },
  futureTimeline: [
    { when: "عند التوقيع", text: "يُخصم 1,500 رسوم إدارية + 6,750 تأمين إجباري — فتستلم فعلياً أقل من 150,000 ر.س", icon: "wallet", level: "yellow" },
    { when: "أول قسط", text: "يبدأ خصم 3,250 ر.س شهرياً ويستمر 60 شهراً كاملة", icon: "calendar", level: "yellow" },
    { when: "عند تأخر أي قسط", text: "رسوم تأخير + تسجيل في سمة قد يضعف أهليتك الائتمانية مستقبلاً", icon: "warning", level: "red" },
    { when: "السداد المبكر", text: "غرامة قد تصل إلى أرباح الأشهر المتبقية (~9,750 ر.س وما فوق)", icon: "warning", level: "red" },
    { when: "نهاية المدة", text: "إجمالي ما سدّدته 195,000 ر.س مقابل تمويل 150,000 — تكلفة 45,000 ر.س", icon: "lock", level: "red" },
  ],
  hiddenItems: [
    {
      level: "red",
      title: "النسبة المعلنة مضلّلة",
      original: "يُمنح التمويل بنسبة ربح ثابتة قدرها 6% سنوياً تُحتسب على كامل مبلغ التمويل طوال مدة العقد.",
      translated: "النسبة الثابتة 6% تُحسب على كامل المبلغ طول المدة، لكن النسبة الفعلية (APR) تقارب 10.8% — أي ضعف ما يُروَّج لك تقريباً.",
    },
    {
      level: "red",
      title: "تحويل الراتب وحق الخصم المباشر",
      original: "يلتزم الطرف الثاني بتحويل راتبه إلى الجهة الممولة طوال مدة التمويل، ويفوّضها بالخصم المباشر من أي مستحقات أو حسابات تعود له.",
      translated: "تُجبر على تحويل راتبك لهم، ويقدرون يخصمون القسط مباشرة من حسابك دون الرجوع لك.",
    },
    {
      level: "yellow",
      title: "تأمين إجباري مضاف للمبلغ",
      original: "يُضاف قسط التأمين على التمويل إلى أصل المبلغ الممول وتُحتسب عليه نسبة الربح ذاتها.",
      translated: "التأمين 6,750 ر.س مضاف لأصل المبلغ، يعني تدفع عليه أرباح كمان — مو مجرد رسم ثابت.",
    },
  ],
  marketComparison: [
    { item: "النسبة الفعلية (APR)", yours: "10.8%", market: "7.0%", diff: "+10,080 / 3 سنوات", status: "bad" },
    { item: "غرامة السداد المبكر", yours: "أرباح المتبقي", market: "حد ساما (90 يوم)", diff: "+9,750 ريال", status: "bad" },
    { item: "التأمين على التمويل", yours: "إجباري (6,750)", market: "اختياري", diff: "+6,750 ريال", status: "bad" },
    { item: "رسوم التأخير", yours: "تراكمية شهرياً", market: "بحد منظّم", diff: "أعلى", status: "bad" },
    { item: "الرسوم الإدارية", yours: "1,500 ر.س", market: "≤1% (1,500)", diff: "مطابق للحد", status: "good" },
    { item: "حق العدول", yours: "10 أيام", market: "10 أيام", diff: "متطابق", status: "good" },
  ],
  costProjection: {
    labels: ["السنة 1", "السنة 2", "السنة 3"],
    yours:  [41250, 82500, 123750],
    market: [35640, 71280, 106920],
    gaps:   [5610, 11220, 16830],
    total: 16830,
    avgPerYear: 5610,
  },
  exposure: {
    total3y: 16830,
    avgPerYear: 5610,
    scenarios: { best: 5610, expected: 16830, worst: 31830 },
    sources: [
      { label: "فرق الأرباح (APR)", desc: "الفجوة بين نسبتك الفعلية 10.8% والسوق 7% — تتراكم كل سنة", yr: 3360, y3: 10080, level: "red", rising: true },
      { label: "التأمين الإجباري", desc: "تأمين مضاف لأصل المبلغ — قد يكون اختيارياً في عروض أخرى (الحصة على 3 سنوات)", yr: 1350, y3: 4050, level: "yellow" },
      { label: "الرسوم الإدارية", desc: "رسوم تُخصم من المبلغ المستلم مرة واحدة (موزّعة على المدة)", yr: 300, y3: 900, level: "yellow" },
      { label: "رسوم تأخير محتملة", desc: "تُضاف عند تأخر أي قسط عن موعده", yr: 600, y3: 1800, level: "yellow" },
    ],
    conditional: [
      { title: "السداد المبكر", level: "yellow", amount: "+9,750 ريال", desc: "العقد يفرض غرامة سداد مبكر تقارب أرباح الأشهر المتبقية، بينما ينظّم البنك المركزي السقف عند ربح 90 يوماً للجزء المتبقي." },
      { title: "التعثر في السداد", level: "red", amount: "تعجيل الدين", desc: "تأخر الأقساط قد يفعّل شرط حلول كامل المبلغ المتبقي دفعة واحدة، مع رسوم تأخير وقيد في سمة يضعف أهليتك مستقبلاً." },
    ],
  },
  risks: [
    {
      text: "النسبة الفعلية (APR) ضعف المعلنة تقريباً", level: "red",
      original: "يُمنح التمويل بنسبة ربح ثابتة قدرها 6% سنوياً تُحتسب على كامل مبلغ التمويل طوال مدة العقد.",
      translated: "يُسوّق لك «6% فقط»، لكن النسبة الفعلية تقارب 10.8% لأن الربح يُحسب على كامل المبلغ لا على المتبقي.",
    },
    {
      text: "تحويل الراتب وحق الخصم المباشر", level: "red",
      original: "يلتزم الطرف الثاني بتحويل راتبه إلى الجهة الممولة طوال مدة التمويل، ويفوّضها بالخصم المباشر من أي مستحقات أو حسابات تعود له.",
      translated: "تربط راتبك بالكامل بالجهة الممولة، وتفوّضهم يخصمون القسط مباشرة — مرونة أقل لك في إدارة فلوسك.",
    },
    {
      text: "شرط حلول كامل الأقساط عند التأخر", level: "red",
      original: "في حال تأخر الطرف الثاني عن سداد أي قسط يحق للجهة الممولة المطالبة بكامل المبلغ المتبقي دفعة واحدة دون إشعار مسبق.",
      translated: "لو تأخرت عن قسط واحد، يقدرون يطالبونك بكامل المبلغ المتبقي مرة وحدة وبدون إنذار.",
    },
    {
      text: "رسوم وغرامات أعلى من المعتاد", level: "yellow",
      original: "تُحتسب غرامة سداد مبكر تعادل أرباح المدة المتبقية، وتُضاف رسوم تأخير عن كل قسط لم يُسدَّد في موعده.",
      translated: "السداد المبكر والتأخير كلاهما مكلف هنا أكثر من المعتاد في السوق — راقب هذه البنود.",
    },
    {
      text: "جدول سداد ثابت ومعلوم مسبقاً", level: "green",
      original: "يُرفق بالعقد جدول سداد يوضّح قيمة كل قسط وتاريخ استحقاقه وأصل ما تبقى من المبلغ.",
      translated: "تعرف بالضبط كم وكم متى تدفع — جدول واضح ومكتوب لصالحك.",
    },
    {
      text: "حق العدول خلال 10 أيام", level: "green",
      original: "يحق للطرف الثاني العدول عن العقد خلال عشرة أيام من توقيعه دون إبداء أسباب وفق ضوابط الجهة المنظِّمة.",
      translated: "تقدر تتراجع عن التمويل خلال 10 أيام بدون مبرر — حق نظامي واضح يحميك.",
    },
  ],
  objectionLetters: [
    {
      source: "كاشف المخاطر",
      issue: "النسبة المعلنة لا تعكس التكلفة الفعلية",
      letter: "أود الاعتراض على عرض نسبة الربح بصيغتها الثابتة (6%) دون إبراز معدل النسبة السنوي الفعلي (APR) البالغ نحو 10.8%، إذ إن إبراز APR متطلّب وفق مبادئ حماية العملاء لدى البنك المركزي السعودي. أطالب بتوضيح النسبة الفعلية كتابياً وإعادة النظر فيها بما يقارب متوسط السوق.",
    },
    {
      source: "كاشف المخاطر",
      issue: "شرط حلول كامل الأقساط عند التأخر",
      letter: "أود الاعتراض على البند الذي يجيز المطالبة بكامل المبلغ المتبقي دفعة واحدة عند تأخر أي قسط ودون إشعار مسبق. أطالب بتعديل هذا البند بحيث لا يُفعَّل إلا بعد إشعار خطي ومهلة معالجة لا تقل عن ثلاثين يوماً، بما يتوافق مع الممارسات العادلة.",
    },
    {
      source: "كاشف المخفي",
      issue: "إلزامية تحويل الراتب والخصم المباشر",
      letter: "أود الاعتراض على إلزامي بتحويل كامل راتبي وتفويض الخصم المباشر من حساباتي طوال مدة التمويل. أطالب بقصر التفويض على قيمة القسط الشهري فقط في تاريخ استحقاقه، دون منح صلاحية مفتوحة للخصم من سائر مستحقاتي.",
    },
    {
      source: "كاشف المخفي",
      issue: "تأمين إجباري مضاف لأصل المبلغ",
      letter: "أود الاعتراض على إضافة قسط التأمين إلى أصل مبلغ التمويل واحتساب نسبة الربح عليه. أطالب بفصل التأمين عن أصل المبلغ، وإتاحة خيار التأمين لدى جهة منافسة، أو جعله اختيارياً بما يخفّض تكلفتي الإجمالية.",
    },
    {
      source: "الأثر المالي",
      issue: "نسبة عبء الدين مرتفعة",
      letter: "بناءً على تحليل دخلي والتزاماتي، يرفع هذا القسط نسبة عبء الدين لديّ فوق الحد المريح (33%). أطالب بإعادة هيكلة التمويل عبر خفض القسط الشهري أو تمديد المدة، بما يبقي إجمالي التزاماتي ضمن الحدود الآمنة طوال فترة السداد.",
    },
  ],
};

const AGENTS = [
  { id: "risks",     name: "كاشف المخاطر",     short: "يحدد كل بند خطير ويصنّفه",            color: "#FF3B3B", icon: "shield" },
  { id: "hidden",    name: "كاشف المخفي",      short: "يكشف الثغرات والبنود الغامضة",        color: "#B03CFF", icon: "search" },
  { id: "market",    name: "مقارنة السوق",     short: "يقارن بنودك بالمعتاد في السوق",       color: "#FFB800", icon: "chart" },
  { id: "future",    name: "النظرة المستقبلية", short: "يوضح وش بيصير لك بعد التوقيع",         color: "#00C48C", icon: "lighthouse" },
  { id: "financial", name: "الأثر المالي",      short: "يحلل دخلك ويقرر إذا التمويل يناسبك",   color: "#0EC9E0", icon: "wallet" },
  { id: "object",    name: "وكيل الاعتراض",    short: "يكتب لك رسالة اعتراض قانونية جاهزة",   color: "#3C8FFF", icon: "pen" },
];

const CONTRACT_TYPES = [
  { label: "عقد إيجار", icon: "file" },
  { label: "عقد تمويل", icon: "chart" },
  { label: "عقد استثماري", icon: "shield" },
];

const levelColors = {
  red:    { bg: "#FF3B3B", light: "rgba(255,59,59,0.12)",  text: "#FF5C5C", label: "خطر" },
  yellow: { bg: "#FFB800", light: "rgba(255,184,0,0.12)",  text: "#FFC847", label: "تنبيه" },
  green:  { bg: "#00C48C", light: "rgba(0,196,140,0.12)",  text: "#1FD89E", label: "آمن" },
};

const fmt = (n) => Math.round(n).toLocaleString("en-US");
const pct = (x) => Math.round(x * 100) + "%";
const pct1 = (x) => (x * 100).toFixed(1).replace(/\.0$/, "") + "%";

// ===================== ICONS =====================
function Icon({ name, size = 20, color = "currentColor", strokeWidth = 2 }) {
  const s = { width: size, height: size, display: "inline-block", flexShrink: 0 };
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "shield":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "search":   return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case "chart":    return <svg style={s} viewBox="0 0 24 24" {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case "eye":      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "lighthouse": return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M9.5 21l1-11h3l1 11" /><rect x="9.5" y="5.5" width="5" height="4.5" rx="0.5" /><path d="M12 3v2.5M7 21h10M4.5 6.5l2 1M19.5 6.5l-2 1" /></svg>;
    case "pen":      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
    case "wallet":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M20 12V8H6a2 2 0 010-4h12v4" /><path d="M4 6v12a2 2 0 002 2h14v-4" /><path d="M18 12a2 2 0 000 4h4v-4z" /></svg>;
    case "upload":   return <svg style={s} viewBox="0 0 24 24" {...p}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></svg>;
    case "file":     return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    case "calendar": return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "lock":     return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
    case "warning":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "arrow":    return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case "chevron":  return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>;
    case "copy":     return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
    case "check":    return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
    case "x":        return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "bank":     return <svg style={s} viewBox="0 0 24 24" {...p}><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>;
    case "trending": return <svg style={s} viewBox="0 0 24 24" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
    case "info":     return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
    case "sparkle":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z" /><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>;
    case "grid":     return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "plus":     return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "percent":  return <svg style={s} viewBox="0 0 24 24" {...p}><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>;
    default: return null;
  }
}

// ===================== BRAND =====================
function Logo({ size = 32, subtitle = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: "linear-gradient(135deg, #6B3CFF 0%, #B03CFF 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(107,60,255,0.4)", flexShrink: 0,
      }}>
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2" />
          <path d="M14.5 14.5L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="2.5" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
      <div>
        <div style={{ color: "white", fontWeight: 900, fontSize: size * 0.56, lineHeight: 1.1 }}>مجهر</div>
        {subtitle && <div style={{ color: "rgba(176,140,255,0.85)", fontSize: size * 0.34, fontWeight: 600 }}>كاشف المخاطر للأفراد</div>}
      </div>
    </div>
  );
}

function ScoreMeter({ score, level, size = 140 }) {
  const color = levelColors[level];
  const r = size * 0.385;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.085} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color.bg} strokeWidth={size * 0.085}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color.bg})` }} />
        <text x="50%" y="46%" textAnchor="middle" fill="white" fontSize={size * 0.2} fontWeight="900" fontFamily="Tajawal, sans-serif">{score}</text>
        <text x="50%" y="62%" textAnchor="middle" fill={color.bg} fontSize={size * 0.093} fontWeight="700" fontFamily="Tajawal, sans-serif">{color.label}</text>
      </svg>
    </div>
  );
}

function Badge({ level, children }) {
  const c = levelColors[level];
  return (
    <span style={{
      background: c.light, color: c.text, border: `1px solid ${c.bg}33`,
      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.bg }} />
      {children}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 22px", ...style,
    }}>{children}</div>
  );
}

function MeterBar({ value, max = 1, color, threshold, thresholdLabel }) {
  const w = Math.min(100, (value / max) * 100);
  const tPos = threshold != null ? Math.min(100, (threshold / max) * 100) : null;
  return (
    <div style={{ paddingBottom: thresholdLabel ? 18 : 0 }}>
      <div style={{ position: "relative", width: "100%", height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "visible" }}>
        <div style={{ position: "absolute", insetInlineStart: 0, top: 0, height: "100%", width: `${w}%`, background: color, borderRadius: 100, transition: "width .7s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 10px ${color}88` }} />
        {tPos != null && (
          <div style={{ position: "absolute", insetInlineStart: `${tPos}%`, top: -4, bottom: -4, width: 2, background: "rgba(255,255,255,0.6)", borderRadius: 2 }}>
            {thresholdLabel && (
              <span style={{ position: "absolute", top: 14, transform: "translateX(50%)", insetInlineStart: 0, whiteSpace: "nowrap", fontSize: 9.5, color: "rgba(255,255,255,0.5)" }}>{thresholdLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== FINANCIAL ENGINE (FINANCING / DBR) =====================
function computeFinancials(income, otherObligations, m) {
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
  score = Math.round(Math.max(3, Math.min(99, score)));
  const level = score >= 70 ? "green" : score >= 45 ? "yellow" : "red";
  const verdict = level === "green" ? "مناسب للتوقيع" : level === "yellow" ? "وقّع بحذر" : "غير مناسب حالياً";

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

  return { burden, dbr, remaining, upfront, earlySettle, score, level, verdict, reasons, installment, totalObl, totalCost: m.totalCost };
}

// ===================== APP =====================
export default function App() {
  const [page, setPage] = useState("home");          // home | upload | analyzing | dashboard
  const [section, setSection] = useState("overview"); // dashboard section
  const [contractType, setContractType] = useState("");
  const [text, setText] = useState("");
  const [analyzeStep, setAnalyzeStep] = useState(0);   // how many agents finished (0..6)
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [expandedRisk, setExpandedRisk] = useState(0);
  const [expandedHidden, setExpandedHidden] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // financial agent state
  const [finReady, setFinReady] = useState(false);
  const [finMode, setFinMode] = useState(null);       // null | "bank" | "manual"
  const [connecting, setConnecting] = useState(false);
  const [income, setIncome] = useState(13000);
  const [obligations, setObligations] = useState(2600);

  const fileRef = useRef();
  const d = SAMPLE_ANALYSIS;
  const fin = computeFinancials(income, obligations, d.money);

  const reset = () => { setPage("upload"); setText(""); setAnalyzeStep(0); setSection("overview"); setSidebarOpen(false); };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setPage("analyzing");
    setAnalyzeStep(0);
    const per = 540; // ms per agent
    AGENTS.forEach((_, i) => setTimeout(() => setAnalyzeStep(i + 1), per * (i + 1)));
    setTimeout(() => { setPage("dashboard"); setSection("overview"); }, per * AGENTS.length + 700);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(String(ev.target.result));
    reader.readAsText(file);
  };

  const handleCopy = (letter, idx) => {
    navigator.clipboard?.writeText(letter).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const connectBank = () => {
    setConnecting(true);
    setFinMode("bank");
    setTimeout(() => { setIncome(13000); setObligations(2600); setConnecting(false); setFinReady(true); }, 1900);
  };

  const baseStyle = {
    minHeight: "100vh", background: "#0A0A0F",
    backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,60,255,0.18) 0%, transparent 60%)",
    fontFamily: "Tajawal, sans-serif", direction: "rtl", color: "white",
  };
  const headerStyle = {
    borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 28px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)",
  };

  const FontAndStyles = (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: Tajawal, sans-serif; }
        input { font-family: Tajawal, sans-serif; }
        ::selection { background: rgba(107,60,255,0.4); }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        :focus-visible { outline: 2px solid #8B6CFF; outline-offset: 2px; border-radius: 6px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .fade-section { animation: fadeUp .4s ease both; }
        .rail-item { transition: background .18s, border-color .18s; }
        .hover-lift { transition: transform .2s, box-shadow .2s, background .2s, border-color .2s; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 100px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.5); border: 3px solid #0EC9E0; }
        input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: white; cursor: pointer; border: 3px solid #0EC9E0; }
        .dash-rail {
          position: fixed; top: 0; right: 0; height: 100vh; width: 286px;
          background: rgba(16,15,24,0.94); backdrop-filter: blur(18px);
          border-left: 1px solid rgba(255,255,255,0.08);
          overflow-y: auto; z-index: 60; padding: 16px 14px 24px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .dash-main { margin-right: 286px; min-width: 0; }
        .rail-backdrop { display: none; }
        .mobile-rail-toggle, .mobile-rail-close { display: none; }
        @media (max-width: 880px) {
          .dash-rail { width: 84%; max-width: 320px; transform: translateX(100%); transition: transform .28s cubic-bezier(.4,0,.2,1); box-shadow: -20px 0 60px rgba(0,0,0,0.55); }
          .dash-rail.rail-open { transform: translateX(0); }
          .dash-main { margin-right: 0; }
          .rail-backdrop.show { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 55; }
          .mobile-rail-toggle, .mobile-rail-close { display: flex; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
        }
      `}</style>
    </>
  );

  // ---------- HOME ----------
  if (page === "home") return (
    <div style={baseStyle}>
      {FontAndStyles}
      <div style={headerStyle}><Logo size={34} /></div>

      <div style={{ textAlign: "center", padding: "76px 24px 56px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 30, display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 92, height: 92, borderRadius: 26,
            background: "linear-gradient(135deg, rgba(107,60,255,0.22), rgba(176,60,255,0.22))",
            border: "1px solid rgba(107,60,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 60px rgba(107,60,255,0.25)",
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
              <path d="M9 2h6v9H9z" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="12" cy="5.5" r="1.5" fill="rgba(176,60,255,0.9)" />
              <path d="M12 11v3" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 14c-2 1-3 3-3 3h16s-1-2-3-3" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 20h6" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="11" r="3" stroke="rgba(176,60,255,0.5)" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(107,60,255,0.12)", border: "1px solid rgba(107,60,255,0.28)", borderRadius: 100, padding: "5px 14px", marginBottom: 22, fontSize: 13, color: "rgba(196,176,255,0.95)", fontWeight: 700 }}>
          <Icon name="sparkle" size={14} color="#B08CFF" /> ٦ وكلاء ذكاء اصطناعي يعملون معاً
        </div>
        <h1 style={{ fontSize: 46, fontWeight: 900, margin: "0 0 14px", lineHeight: 1.2 }}>افهم عقدك قبل ما توقّع</h1>
        <div style={{ width: 60, height: 3, background: "linear-gradient(90deg, #6B3CFF, #B03CFF)", borderRadius: 10, margin: "0 auto 22px" }} />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, lineHeight: 1.9, margin: "0 0 40px", maxWidth: 580, marginInline: "auto" }}>
          ارفع عقدك، وخلّ مجهر يكشف لك البنود الخطيرة والمخفية، يقارنها بالسوق، يحسب أثرها على محفظتك، ويجهّز لك رسالة اعتراض جاهزة — كل ذلك في ثوانٍ.
        </p>
        <button onClick={() => setPage("upload")} className="hover-lift" style={{
          display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 38px",
          background: "linear-gradient(135deg, #6B3CFF, #B03CFF)", border: "none", borderRadius: 14,
          color: "white", fontSize: 18, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 8px 32px rgba(107,60,255,0.45)",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(107,60,255,0.55)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(107,60,255,0.45)"; }}>
          <Icon name="arrow" size={20} color="white" /> ابدأ بتحليل عقدك
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 90px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>تعرّف على الوكلاء الستة</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>كل وكيل متخصص في زاوية مختلفة من عقدك</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {AGENTS.map((a) => (
            <div key={a.id} className="hover-lift" style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${a.color}26`,
              borderRadius: 16, padding: 20, textAlign: "right", position: "relative",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${a.color}0D`; e.currentTarget.style.borderColor = `${a.color}55`; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = `${a.color}26`; e.currentTarget.style.transform = "none"; }}>
              {a.isNew && <span style={{ position: "absolute", insetInlineEnd: 16, top: 16, background: `${a.color}22`, color: a.color, border: `1px solid ${a.color}55`, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 9px" }}>جديد</span>}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${a.color}18`, border: `1px solid ${a.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={a.icon} size={19} color={a.color} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{a.name}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{a.short}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ---------- UPLOAD ----------
  if (page === "upload") return (
    <div style={baseStyle}>
      {FontAndStyles}
      <div style={headerStyle}>
        <Logo size={32} />
        <button onClick={() => setPage("home")} style={ghostBtn}>← رجوع</button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 24px 70px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px" }}>أرفق عقدك</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0 }}>الصق النص أو ارفع ملف، وخلّ الوكلاء يشتغلون</p>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>نوع العقد</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {CONTRACT_TYPES.map((t) => {
                const on = contractType === t.label;
                return (
                  <button key={t.label} onClick={() => setContractType(t.label)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: on ? "linear-gradient(135deg,#6B3CFF,#B03CFF)" : "rgba(107,60,255,0.1)",
                    border: on ? "1px solid #6B3CFF" : "1px solid rgba(107,60,255,0.3)",
                    color: on ? "white" : "rgba(196,176,255,0.9)",
                    borderRadius: 12, padding: "10px 18px", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", transition: "all .2s", boxShadow: on ? "0 4px 16px rgba(107,60,255,0.35)" : "none",
                  }}>
                    <Icon name={t.icon} size={15} color={on ? "white" : "rgba(196,176,255,0.9)"} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={!contractType} placeholder={contractType ? "الصق نص العقد هنا..." : "اختر نوع العقد أولاً قبل كتابة أو لصق النص..."}
            style={{
              width: "100%", minHeight: 200, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 1.8,
              padding: "14px 16px", resize: "vertical", outline: "none", direction: "rtl",
            }} />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => fileRef.current.click()} disabled={!contractType} style={fileBtn}><Icon name="upload" size={16} color="rgba(255,255,255,0.6)" /> رفع ملف</button>
            <button onClick={() => setText(SAMPLE_CONTRACT_TEXT)} disabled={!contractType} style={fileBtn}><Icon name="file" size={16} color="rgba(255,255,255,0.6)" /> تجربة بعقد جاهز</button>
          </div>
          <input ref={fileRef} type="file" accept=".txt" style={{ display: "none" }} onChange={handleFile} />

          <button onClick={handleAnalyze} disabled={!text.trim() || !contractType} style={{
            width: "100%", marginTop: 14, padding: "15px", border: "none", borderRadius: 12,
            background: (text.trim() && contractType) ? "linear-gradient(135deg,#6B3CFF,#B03CFF)" : "rgba(255,255,255,0.06)",
            color: (text.trim() && contractType) ? "white" : "rgba(255,255,255,0.25)",
            fontSize: 16, fontWeight: 800, cursor: (text.trim() && contractType) ? "pointer" : "not-allowed",
            transition: "all .2s", boxShadow: (text.trim() && contractType) ? "0 8px 32px rgba(107,60,255,0.35)" : "none",
          }}>حلّل العقد الآن</button>
        </Card>

        <div style={{ marginTop: 30 }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", marginBottom: 14 }}>الوكلاء الذين سيحللون عقدك</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {AGENTS.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${a.color}22`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${a.color}18`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={a.icon} size={15} color={a.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{a.name}{a.isNew && <span style={{ background: `${a.color}22`, color: a.color, fontSize: 9, fontWeight: 800, borderRadius: 100, padding: "1px 7px" }}>جديد</span>}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{a.short}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- ANALYZING ----------
  if (page === "analyzing") {
    const total = AGENTS.length;
    const pctDone = Math.round((analyzeStep / total) * 100);
    return (
      <div style={{ ...baseStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {FontAndStyles}
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: 22, background: "linear-gradient(135deg, #6B3CFF, #B03CFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 36px rgba(107,60,255,0.5)", animation: "pulse 1.6s infinite" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2" />
                <path d="M14.5 14.5L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", textAlign: "center" }}>الوكلاء يحلّلون عقدك...</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, margin: "0 0 26px", textAlign: "center" }}>نفحص كل بند، نكشف المخفي، ونحسب الكلفة بالريال</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
            {AGENTS.map((a, i) => {
              const done = i < analyzeStep;
              const active = i === analyzeStep;
              return (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: done ? `${a.color}14` : active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${done ? a.color + "3D" : active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 13, padding: "11px 14px",
                  opacity: done || active ? 1 : 0.5, transition: "all .4s ease",
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${a.color}1A`, border: `1px solid ${a.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={a.icon} size={16} color={a.color} />
                  </div>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: done || active ? "white" : "rgba(255,255,255,0.6)" }}>{a.name}</span>
                  {done ? (
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="check" size={13} color="#0A0A0F" />
                    </span>
                  ) : active ? (
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${a.color}40`, borderTopColor: a.color, animation: "spin .8s linear infinite", flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctDone}%`, borderRadius: 100, background: "linear-gradient(90deg,#6B3CFF,#B03CFF)", transition: "width .5s cubic-bezier(.4,0,.2,1)", boxShadow: "0 0 12px rgba(176,60,255,0.6)" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#B08CFF", minWidth: 38, textAlign: "left" }}>{pctDone}%</span>
          </div>
        </div>
      </div>
    );
  }

  // ===================== DASHBOARD =====================
  const activeAgent = AGENTS.find((a) => a.id === section);
  const concerns = d.risks.filter((r) => r.level !== "green").length;
  const badMarket = d.marketComparison.filter((m) => m.status === "bad").length;
  const railStats = {
    risks: `${concerns} مخاطر`,
    hidden: `${d.hiddenItems.length} بنود`,
    market: `${badMarket}/${d.marketComparison.length} أسوأ`,
    future: `${d.futureTimeline.length} مراحل`,
    financial: null,
    object: `${d.objectionLetters.length} رسائل`,
  };

  return (
    <div style={baseStyle}>
      {FontAndStyles}

      {/* ===== FIXED SIDE RAIL ===== */}
      <aside className={"dash-rail" + (sidebarOpen ? " rail-open" : "")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 6, marginBottom: 2 }}>
          <Logo size={28} />
          <button className="mobile-rail-close" onClick={() => setSidebarOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, width: 32, height: 32, cursor: "pointer", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={15} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 13px" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>العقد قيد التحليل</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{d.contractType}</div>
            <Badge level={d.safetyLevel}>{d.safetyScore}/100</Badge>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.32)", padding: "4px 10px 6px", letterSpacing: 0.4 }}>لوحة التحليل</div>
          <RailItem active={section === "overview"} onClick={() => { setSection("overview"); setSidebarOpen(false); }}
            color="#8B6CFF" icon="grid" name="نظرة عامة" stat="ملخص" />
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.32)", padding: "10px 10px 6px", letterSpacing: 0.4 }}>الوكلاء الستة</div>
          {AGENTS.map((a) => (
            <RailItem key={a.id} active={section === a.id} onClick={() => { setSection(a.id); setSidebarOpen(false); }}
              color={a.color} icon={a.icon} name={a.name}
              stat={a.id === "financial" && finReady ? null : railStats[a.id]}
              dotLevel={a.id === "financial" && finReady ? fin.level : null}
              isNew={a.isNew && !(a.id === "financial" && finReady)} />
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          <button onClick={reset} className="hover-lift" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", borderRadius: 11, padding: "11px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            <Icon name="plus" size={14} color="rgba(255,255,255,0.7)" /> تحليل عقد جديد
          </button>
        </div>
      </aside>

      <div className={"rail-backdrop" + (sidebarOpen ? " show" : "")} onClick={() => setSidebarOpen(false)} />

      {/* ===== MAIN ===== */}
      <div className="dash-main">
        <div style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button className="mobile-rail-toggle" onClick={() => setSidebarOpen(true)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, width: 36, height: 36, cursor: "pointer", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="grid" size={16} color="rgba(255,255,255,0.7)" />
            </button>
            <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {section === "overview" ? "نظرة عامة" : activeAgent ? activeAgent.name : ""}
            </div>
          </div>
          <Badge level={d.safetyLevel}>{d.contractType}</Badge>
        </div>

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 20px 70px" }}>
          {section !== "overview" && activeAgent && (
            <div className="fade-section" key={"h-" + section} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: `${activeAgent.color}18`, border: `1px solid ${activeAgent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={activeAgent.icon} size={24} color={activeAgent.color} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{activeAgent.name}</h2>
                  {activeAgent.isNew && <span style={{ background: `${activeAgent.color}22`, color: activeAgent.color, border: `1px solid ${activeAgent.color}55`, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 9px" }}>جديد</span>}
                </div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, margin: "3px 0 0" }}>{activeAgent.short}</p>
              </div>
            </div>
          )}

          <div className="fade-section" key={section}>
            {section === "overview" && <Overview d={d} fin={fin} finReady={finReady} goto={setSection} />}
            {section === "risks" && <RisksPanel d={d} expanded={expandedRisk} setExpanded={setExpandedRisk} />}
            {section === "hidden" && <HiddenPanel d={d} expanded={expandedHidden} setExpanded={setExpandedHidden} />}
            {section === "market" && <MarketPanel d={d} />}
            {section === "future" && <FuturePanel d={d} />}
            {section === "financial" && (
              <FinancialPanel
                d={d} fin={fin} finReady={finReady} finMode={finMode} connecting={connecting}
                income={income} obligations={obligations}
                setIncome={setIncome} setObligations={setObligations}
                setFinMode={setFinMode} connectBank={connectBank} setFinReady={setFinReady}
                goto={setSection}
              />
            )}
            {section === "object" && <ObjectPanel d={d} copiedIdx={copiedIdx} handleCopy={handleCopy} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== RAIL ITEM =====================
function RailItem({ active, onClick, color, icon, name, stat, dotLevel, isNew }) {
  return (
    <button onClick={onClick} className="rail-item" style={{
      width: "100%", display: "flex", alignItems: "center", gap: 11,
      background: active ? `${color}1A` : "transparent",
      border: active ? `1px solid ${color}44` : "1px solid transparent",
      borderRadius: 12, padding: "11px 12px", cursor: "pointer", textAlign: "right", marginBottom: 3,
      position: "relative",
    }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {active && <span style={{ position: "absolute", insetInlineStart: -12, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: color, borderRadius: 4 }} />}
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}1A`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: active ? "white" : "rgba(255,255,255,0.82)", fontWeight: 700, fontSize: 14 }}>{name}</div>
      </div>
      {dotLevel && <span style={{ width: 9, height: 9, borderRadius: "50%", background: levelColors[dotLevel].bg, boxShadow: `0 0 8px ${levelColors[dotLevel].bg}`, flexShrink: 0 }} />}
      {isNew && <span style={{ background: `${color}22`, color, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 8px", flexShrink: 0 }}>جديد</span>}
      {stat && !isNew && !dotLevel && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>{stat}</span>}
    </button>
  );
}

// ===================== OVERVIEW =====================
function Overview({ d, fin, finReady, goto }) {
  const overallLevel = !finReady ? d.safetyLevel
    : (d.safetyLevel === "red" || fin.level === "red") ? "red"
      : (d.safetyLevel === "yellow" || fin.level === "yellow") ? "yellow" : "green";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: `linear-gradient(135deg, ${levelColors[overallLevel].bg}14 0%, rgba(107,60,255,.08) 100%)`, border: `1px solid ${levelColors[overallLevel].bg}33` }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Badge level={d.safetyLevel}>درجة أمان العقد</Badge>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: "12px 0 8px" }}>{d.contractType}</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14.5, lineHeight: 1.8, margin: 0, maxWidth: 460 }}>{d.summary}</p>
            <div style={{ marginTop: 16, display: "flex", gap: 18, flexWrap: "wrap" }}>
              <Stat n={d.risks.filter(r => r.level === "red").length} label="بنود خطيرة" color="#FF5C5C" />
              <Stat n={d.hiddenItems.length} label="بنود مخفية" color="#B08CFF" />
              <Stat n={d.marketComparison.filter(m => m.status === "bad").length} label="أسوأ من السوق" color="#FFC847" />
            </div>
          </div>
          <ScoreMeter score={d.safetyScore} level={d.safetyLevel} size={150} />
        </div>
      </Card>

      <Card style={{ border: `1px solid ${levelColors[overallLevel].bg}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: finReady ? 14 : 4 }}>
          <Icon name={overallLevel === "green" ? "check" : "warning"} size={18} color={levelColors[overallLevel].bg} />
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>التوصية النهائية</h3>
        </div>
        {finReady ? (
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: levelColors[overallLevel].text, marginBottom: 8 }}>
              {overallLevel === "green" ? "التمويل مناسب لك" : overallLevel === "yellow" ? "وقّع بحذر بعد التفاوض" : "لا يُنصح بالتوقيع حالياً"}
            </div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.8, margin: 0 }}>
              قانونياً: {d.safetyLevel === "green" ? "بنود مقبولة" : "توجد بنود تستحق الاعتراض"}. مالياً: {fin.verdict} — القسط يمثل {pct(fin.burden)} من دخلك وعبء الدين {pct(fin.dbr)}.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.7, margin: 0, maxWidth: 460 }}>
              لرؤية التوصية الكاملة، أكمل تحليل <b style={{ color: "#0EC9E0" }}>الأثر المالي</b> — أضف دخلك ليحسب مجهر إذا كان هذا التمويل يناسب وضعك.
            </p>
            <button onClick={() => goto("financial")} className="hover-lift" style={{ background: "rgba(14,201,224,0.12)", border: "1px solid rgba(14,201,224,0.4)", color: "#0EC9E0", borderRadius: 12, padding: "11px 18px", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              <Icon name="wallet" size={16} color="#0EC9E0" /> احسب الأثر المالي
            </button>
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {AGENTS.map((a) => (
          <button key={a.id} onClick={() => goto(a.id)} className="hover-lift" style={{
            textAlign: "right", background: "rgba(255,255,255,0.03)", border: `1px solid ${a.color}26`,
            borderRadius: 14, padding: 16, cursor: "pointer",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${a.color}0D`; e.currentTarget.style.borderColor = `${a.color}55`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = `${a.color}26`; e.currentTarget.style.transform = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}18`, border: `1px solid ${a.color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={a.icon} size={17} color={a.color} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{a.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5 }}>{a.short}</span>
              <Icon name="chevron" size={15} color={a.color} />
            </div>
          </button>
        ))}
      </div>

      <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11.5, textAlign: "center", margin: "6px 0 0" }}>
        التحليل إرشادي ولا يُعدّ استشارة قانونية أو مالية رسمية.
      </p>
    </div>
  );
}

function Stat({ n, label, color }) {
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ===================== RISKS =====================
function RisksPanel({ d, expanded, setExpanded }) {
  const sorted = [...d.risks].sort((a, b) => order(b.level) - order(a.level));
  return (
    <div>
      <Legend />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {sorted.map((r, i) => {
          const c = levelColors[r.level];
          const open = expanded === i;
          return (
            <div key={i} style={{ border: `1px solid ${c.bg}33`, borderRadius: 12, overflow: "hidden" }}>
              <div onClick={() => setExpanded(open ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.light, padding: "13px 16px", cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.bg, flexShrink: 0 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{r.text}</span>
                  <span style={{ background: c.bg + "22", color: c.text, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 9px" }}>{c.label}</span>
                </div>
                <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .22s" }}><Icon name="chevron" size={16} color={c.bg} /></span>
              </div>
              {open && <ClauseDetail original={r.original} translated={r.translated} c={c} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== HIDDEN =====================
function HiddenPanel({ d, expanded, setExpanded }) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, marginTop: 0, marginBottom: 16 }}>
        هذه بنود قد تمر عليك دون انتباه في النص الطويل، لكنها تحمل أثراً مالياً حقيقياً عليك. اضغط أي بند لرؤية النص الأصلي ومعناه المبسّط.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {d.hiddenItems.map((item, i) => {
          const c = levelColors[item.level];
          const open = expanded === i;
          return (
            <div key={i} style={{ border: `1px solid ${c.bg}33`, borderRadius: 12, overflow: "hidden", background: c.light }}>
              <div onClick={() => setExpanded(open ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.bg, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{item.title}</span>
                </div>
                <span style={{ transform: open ? "rotate(180deg)" : "none", transition: ".2s" }}><Icon name="chevron" size={16} color={c.bg} /></span>
              </div>
              {open && <ClauseDetail original={item.original} translated={item.translated} c={c} altLabel="إيش يعني؟" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClauseDetail({ original, translated, c, altLabel = "الترجمة التبسيطية" }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.22)", padding: "12px 16px" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 9, padding: "10px 12px", marginBottom: 9 }}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginBottom: 4 }}>النص الأصلي</div>
        <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 13, lineHeight: 1.85 }}>"{original}"</div>
      </div>
      <div style={{ background: `${c.bg}18`, borderRadius: 9, padding: "10px 12px", border: `1px solid ${c.bg}33` }}>
        <div style={{ color: c.text, fontSize: 11, fontWeight: 800, marginBottom: 4 }}>{altLabel}</div>
        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13.5, lineHeight: 1.85 }}>{translated}</div>
      </div>
    </div>
  );
}

// ===================== MARKET =====================
function LegendDot({ color, label, dash }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>
      <span style={{ width: 16, height: 0, borderTop: dash ? `2.5px dotted ${color}` : `3px solid ${color}`, borderRadius: 2 }} />
      {label}
    </span>
  );
}

function CostChart({ data, title = "كيف تتراكم التكلفة (مقارنة بتمويل عادل)" }) {
  const W = 600, H = 270, PL = 46, PR = 46, PT = 40, PB = 28;
  const n = data.labels.length;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const allVals = [...data.yours, ...data.market];
  const vMax = Math.max(...allVals), vMin = Math.min(...allVals), span = vMax - vMin || 1;
  const top = vMax + span * 0.30, bot = vMin - span * 0.34;
  const xFor = (i) => (W - PR) - (i / (n - 1)) * plotW;
  const yFor = (v) => PT + ((top - v) / (top - bot)) * plotH;
  const yoursPts = data.yours.map((v, i) => [xFor(i), yFor(v)]);
  const marketPts = data.market.map((v, i) => [xFor(i), yFor(v)]);
  const line = (pts) => pts.map((p) => p.map((x) => Math.round(x)).join(",")).join(" ");
  const areaPts = line(yoursPts) + " " + line([...marketPts].reverse());
  const CY = "#22D3EE", GAP = "#F5C84B";
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 14.5 }}>{title}</span>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <LegendDot color={CY} label="تمويلك" />
          <LegendDot color="rgba(255,255,255,0.8)" label="تمويل عادل" dash />
          <LegendDot color={GAP} label="الفرق الذي تدفعه زيادة" />
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }} fontFamily="Tajawal, sans-serif">
        <defs>
          <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GAP} stopOpacity="0.32" />
            <stop offset="100%" stopColor={GAP} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((g, i) => (
          <line key={i} x1={PL} x2={W - PR} y1={PT + g * plotH} y2={PT + g * plotH} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        <polygon points={areaPts} fill="url(#gapFill)" />
        <polyline points={line(marketPts)} fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />
        <polyline points={line(yoursPts)} fill="none" stroke={CY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${CY}88)` }} />
        {data.gaps.map((g, i) => {
          const my = (yoursPts[i][1] + marketPts[i][1]) / 2;
          return <text key={i} x={Math.round(xFor(i))} y={Math.round(my) + 4} fill={GAP} fontSize="14" fontWeight="800" textAnchor="middle">{fmt(g)}+</text>;
        })}
        {yoursPts.map((p, i) => (
          <g key={i}>
            <circle cx={Math.round(p[0])} cy={Math.round(p[1])} r="4.5" fill={CY} stroke="#0A0A0F" strokeWidth="2" />
            <text x={Math.round(p[0])} y={Math.round(p[1]) - 12} fill={CY} fontSize="13.5" fontWeight="800" textAnchor="middle">{fmt(data.yours[i])}</text>
          </g>
        ))}
        {marketPts.map((p, i) => (
          <g key={i}>
            <circle cx={Math.round(p[0])} cy={Math.round(p[1])} r="4.5" fill="#fff" stroke="#0A0A0F" strokeWidth="2" />
            <text x={Math.round(p[0])} y={Math.round(p[1]) + 20} fill="rgba(255,255,255,0.75)" fontSize="13" fontWeight="700" textAnchor="middle">{fmt(data.market[i])}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 34px 0", color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>
        {data.labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </Card>
  );
}

function MarketPanel({ d }) {
  const bad = d.marketComparison.filter((m) => m.status === "bad").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, margin: 0 }}>
        بنود تمويلك مقابل المعتاد في السوق السعودي — والفرق محسوباً بالريال.
      </p>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={thCell}>البند</th>
                <th style={thCell}>تمويلك</th>
                <th style={thCell}>السوق</th>
                <th style={thCell}>الفرق</th>
              </tr>
            </thead>
            <tbody>
              {d.marketComparison.map((row, i) => {
                const isBad = row.status === "bad";
                const col = isBad ? "#FF6B6B" : "#1FD89E";
                return (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ ...tdCell, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{row.item}</td>
                    <td style={{ ...tdCell, fontWeight: 800, color: col }}>{row.yours}</td>
                    <td style={{ ...tdCell, color: "rgba(255,255,255,0.6)" }}>{row.market}</td>
                    <td style={tdCell}>
                      <span style={{ display: "inline-block", fontWeight: 800, fontSize: 12.5, color: col, background: col + "1A", border: `1px solid ${col}33`, borderRadius: 100, padding: "3px 11px", whiteSpace: "nowrap" }}>{row.diff}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <CostChart data={d.costProjection} />

      <Card style={{ background: bad >= 2 ? "rgba(255,59,59,0.07)" : "rgba(0,196,140,0.07)", border: `1px solid ${bad >= 2 ? "rgba(255,59,59,0.25)" : "rgba(0,196,140,0.25)"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name={bad >= 2 ? "warning" : "check"} size={18} color={bad >= 2 ? "#FF5C5C" : "#1FD89E"} />
          <span style={{ fontWeight: 800, fontSize: 14.5, color: bad >= 2 ? "#FF5C5C" : "#1FD89E" }}>الخلاصة</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 13.5, lineHeight: 1.8, margin: "8px 0 0" }}>
          تمويلك أسوأ في {bad} من {d.marketComparison.length} بنود، والفرق يصل إلى نحو {fmt(d.costProjection.avgPerYear)} ريال سنوياً فوق السوق — وهي بنود قابلة للتفاوض قبل التوقيع.
        </p>
      </Card>
    </div>
  );
}

const thCell = { textAlign: "right", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" };
const tdCell = { textAlign: "right", padding: "13px 16px", fontSize: 13.5, verticalAlign: "middle" };

// ===================== FUTURE =====================
function FuturePanel({ d }) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, marginTop: 0, marginBottom: 20 }}>
        ما الذي ينتظرك بعد توقيع هذا التمويل؟ هذه الأحداث مرتّبة زمنياً كما ستقع فعلاً.
      </p>
      <div style={{ position: "relative", paddingInlineStart: 8 }}>
        <div style={{ position: "absolute", insetInlineStart: 23, top: 8, bottom: 8, width: 2, background: "linear-gradient(180deg, rgba(0,196,140,0.5), rgba(255,59,59,0.4))" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {d.futureTimeline.map((ev, i) => {
            const c = levelColors[ev.level];
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0A0A0F", border: `2px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 4px rgba(10,10,15,1)` }}>
                  <Icon name={ev.icon} size={15} color={c.bg} />
                </div>
                <div style={{ flex: 1, background: c.light, border: `1px solid ${c.bg}2E`, borderRadius: 12, padding: "12px 15px" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: c.text, marginBottom: 4 }}>{ev.when}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{ev.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===================== FINANCIAL =====================
function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      <span style={{ fontSize: 13.5, fontWeight: 800, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
    </div>
  );
}

function ExposureHero({ exp }) {
  return (
    <Card style={{ background: "linear-gradient(135deg, rgba(245,200,75,0.10), rgba(255,255,255,0.02))", border: "1px solid rgba(245,200,75,0.30)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon name="wallet" size={16} color="#F5C84B" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#F5C84B" }}>إجمالي التعرّض المتوقع</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: "#FFD56A", lineHeight: 1 }}>{fmt(exp.total3y)}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>ريال / 3 سنوات</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13.5, lineHeight: 1.8, margin: "10px 0 0" }}>
        بمعدل ~{fmt(exp.avgPerYear)} ريال سنوياً فوق ما يدفعه السوق على تمويل مماثل.
      </p>
    </Card>
  );
}

function ScenarioCell({ value, color, label, sub }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{fmt(value)}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{sub}</div>
    </div>
  );
}

function ScenarioBar({ exp }) {
  const s = exp.scenarios;
  return (
    <Card>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>سيناريوهات التعرّض</div>
      <div style={{ height: 12, borderRadius: 100, background: "linear-gradient(90deg, #FF5C5C, #F5C84B 50%, #1FD89E)", marginBottom: 16 }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, textAlign: "center" }}>
        <ScenarioCell value={s.best} color="#1FD89E" label="أفضل حالة" sub="بلا مفاجآت" />
        <ScenarioCell value={s.expected} color="#FFD56A" label="المتوقع" sub="على مدى 3 سنوات" />
        <ScenarioCell value={s.worst} color="#FF5C5C" label="أسوأ حالة" sub="سداد مبكر أو تعثر" />
      </div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.7, margin: "14px 0 0" }}>
        «أسوأ حالة» تفترض سداداً مبكراً بكامل غرامة العقد أو تعثراً يفعّل الرسوم والقيود الائتمانية — تفاصيلها في «تعرّض مشروط» بالأسفل.
      </p>
    </Card>
  );
}

function SourcesBreakdown({ exp }) {
  const maxY3 = Math.max(...exp.sources.map((s) => s.y3));
  const colorOf = (lvl) => (lvl === "red" ? "#FF6B6B" : lvl === "yellow" ? "#FFC847" : "#1FD89E");
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 18 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 44, textAlign: "left" }}>3 سنوات</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 44, textAlign: "left" }}>سنوياً</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>من وين تطلع الفلوس؟</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {exp.sources.map((s, i) => {
          const col = colorOf(s.level);
          const w = Math.max(8, (s.y3 / maxY3) * 100);
          return (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 18, alignItems: "baseline", flexShrink: 0, paddingTop: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", minWidth: 44, textAlign: "left" }}>{fmt(s.y3)}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: col, minWidth: 44, textAlign: "left" }}>{fmt(s.yr)}</span>
                </div>
                <div style={{ minWidth: 0, textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: col, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    {s.rising && <span style={{ fontSize: 10.5, color: "#FFC847" }}>↗ متزايد</span>}{s.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 100, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${w}%`, borderRadius: 100, background: `linear-gradient(90deg, ${col}55, ${col})` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 16, paddingTop: 14 }}>
        <div style={{ display: "flex", gap: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#FFD56A", minWidth: 44, textAlign: "left" }}>{fmt(exp.total3y)}</span>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#FFD56A", minWidth: 44, textAlign: "left" }}>{fmt(exp.avgPerYear)}</span>
        </div>
        <span style={{ fontWeight: 900, fontSize: 14.5 }}>الإجمالي</span>
      </div>
    </Card>
  );
}

function ConditionalCards({ exp }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>تعرّض مشروط — إن حصل</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {exp.conditional.map((cc, i) => {
          const lc = levelColors[cc.level];
          return (
            <div key={i} style={{ background: lc.light, border: `1px solid ${lc.bg}44`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: lc.bg + "22", color: lc.text, border: `1px solid ${lc.bg}44`, fontSize: 11, fontWeight: 800, borderRadius: 100, padding: "3px 10px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: lc.bg }} /> {lc.label}
                </span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{cc.title}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: lc.text, marginBottom: 8 }}>{cc.amount}</div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, lineHeight: 1.8, margin: 0 }}>{cc.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// تكلفة التمويل الإجمالية + تباين النسبة المعلنة مقابل الفعلية (خاص بعقد التمويل)
function FinanceCostCard({ m }) {
  const principalPct = (m.loanAmount / m.totalRepay) * 100;
  const costPct = 100 - principalPct;
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Icon name="bank" size={15} color="#FFC847" />
        <span style={{ fontWeight: 800, fontSize: 14.5 }}>التكلفة الإجمالية للتمويل</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, margin: "0 0 16px" }}>
        تستلم {fmt(m.loanAmount)} ر.س، لكنك تسدّد {fmt(m.totalRepay)} ر.س على مدى {m.termMonths} شهراً
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 12, marginBottom: 18 }}>
        <MoneyTile label="المبلغ المُموَّل" value={m.loanAmount} color="#1FD89E" />
        <MoneyTile label="إجمالي ما تسدده" value={m.totalRepay} color="#FFC847" />
        <MoneyTile label="تكلفة التمويل" value={m.totalCost} color="#FF5C5C" strong />
      </div>

      <div style={{ height: 26, borderRadius: 8, overflow: "hidden", display: "flex", marginBottom: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${principalPct}%`, background: "linear-gradient(90deg,#1FD89E,#12A87C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#04222A" }}>أصل المبلغ</div>
        <div style={{ width: `${costPct}%`, background: "linear-gradient(90deg,#FF8A4C,#FF5C5C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#2A0A0A" }}>التكلفة</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 18 }}>
        <span>{Math.round(principalPct)}% أصل</span>
        <span>{Math.round(costPct)}% تكلفة تمويل</span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 150, background: "rgba(0,196,140,0.08)", border: "1px solid rgba(0,196,140,0.25)", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>النسبة المعلنة (ثابتة)</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1FD89E" }}>{pct1(m.flatRate)}</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>الرقم الذي يُروَّج لك</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,0.4)" }}>
          <Icon name="arrow" size={20} color="rgba(255,255,255,0.4)" />
        </div>
        <div style={{ flex: 1, minWidth: 150, background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.28)", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>النسبة الفعلية (APR)</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FF5C5C" }}>{pct1(m.apr)}</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>التكلفة الحقيقية عليك</div>
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.8, margin: "14px 0 0" }}>
        النسبة الفعلية (APR) تقارب ضعف المعلنة لأن «النسبة الثابتة» تُحسب على كامل المبلغ طوال المدة، بينما تنخفض مديونيتك فعلياً كل شهر مع السداد.
      </p>
    </Card>
  );
}

function FinancialPanel({ d, fin, finReady, finMode, connecting, income, obligations, setIncome, setObligations, setFinMode, connectBank, setFinReady, goto }) {
  const TEAL = "#0EC9E0";
  const c = levelColors[fin.level];
  const exp = d.exposure;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ===== التعرّض المالي (يظهر دائماً — بلا إدخال) ===== */}
      <ExposureHero exp={exp} />
      <ScenarioBar exp={exp} />
      <FinanceCostCard m={d.money} />
      <CostChart data={d.costProjection} />
      <SourcesBreakdown exp={exp} />
      <ConditionalCards exp={exp} />

      {/* ===== القدرة على التحمّل ===== */}
      <Divider label="هل يناسب وضعك المالي؟" />

      {!finReady && (
      <>
        <Card>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.85, margin: "0 0 4px" }}>
            عشان نعرف إذا هذا التمويل يناسب وضعك، نحتاج نفهم دخلك والتزاماتك. اختر الطريقة الأنسب لك:
          </p>
        </Card>

        {!finMode && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            <ChoiceCard color={TEAL} icon="bank" title="ربط حساب بنكي" desc="نقرأ دخلك والتزاماتك المتكررة تلقائياً من كشف حسابك" badge="الأسرع" onClick={connectBank} />
            <ChoiceCard color="#8B6CFF" icon="pen" title="إدخال يدوي" desc="أدخل دخلك الشهري والتزاماتك بنفسك في خطوة واحدة" onClick={() => setFinMode("manual")} />
          </div>
        )}

        {finMode === "bank" && connecting && (
          <Card style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 18px", borderRadius: "50%", border: `3px solid ${TEAL}33`, borderTopColor: TEAL, animation: "spin .9s linear infinite" }} />
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>جاري الربط الآمن مع البنك...</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>نقرأ كشف الحساب لتحديد الدخل والالتزامات</div>
          </Card>
        )}

        {finMode === "manual" && (
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <SliderField label="الدخل الشهري الصافي" value={income} setValue={setIncome} min={3000} max={50000} step={500} color={TEAL} />
              <SliderField label="التزاماتك الشهرية الحالية (قروض، أقساط، إيجار)" value={obligations} setValue={setObligations} min={0} max={30000} step={250} color="#8B6CFF" />
              <button onClick={() => setFinReady(true)} className="hover-lift" style={{ background: `linear-gradient(135deg, ${TEAL}, #12A8C4)`, border: "none", color: "#04222A", fontWeight: 900, fontSize: 16, borderRadius: 12, padding: "14px", cursor: "pointer", boxShadow: `0 8px 28px ${TEAL}44` }}>
                حلّل قدرتي المالية
              </button>
            </div>
          </Card>
        )}
      </>
      )}

      {finReady && (
      <>
        <Card style={{ background: `linear-gradient(135deg, ${c.bg}14, ${TEAL}0A)`, border: `1px solid ${c.bg}38` }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              {finMode === "bank" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: TEAL + "1A", border: `1px solid ${TEAL}33`, color: TEAL, fontSize: 11, fontWeight: 700, borderRadius: 100, padding: "3px 10px", marginBottom: 10 }}>
                  <Icon name="bank" size={12} color={TEAL} /> مرتبط بحساب بنكي (محاكاة)
                </span>
              )}
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>هل توقّع هذا التمويل؟</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: c.text, lineHeight: 1.15 }}>{fin.verdict}</div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.8, margin: "10px 0 0", maxWidth: 420 }}>
                بناءً على دخل {fmt(income)} ر.س، يمثّل قسط هذا التمويل {pct(fin.burden)} من دخلك، ومجموع التزاماتك (عبء الدين) سيصبح {pct(fin.dbr)}.
              </p>
            </div>
            <ScoreMeter score={fin.score} level={fin.level} size={150} />
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Icon name="trending" size={16} color={TEAL} />
            <span style={{ fontWeight: 800, fontSize: 14.5 }}>جرّب أرقامك — التوصية تتغير لحظياً</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SliderField label="الدخل الشهري الصافي" value={income} setValue={setIncome} min={3000} max={50000} step={500} color={TEAL} />
            <SliderField label="التزاماتك الشهرية الحالية" value={obligations} setValue={setObligations} min={0} max={30000} step={250} color="#8B6CFF" />
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <RatioCard title="نسبة القسط من الدخل" value={fin.burden} threshold={0.28} thresholdLabel="السقف 28%" good={fin.burden <= 0.28} color={TEAL} max={0.7} />
          <RatioCard title="نسبة عبء الدين (DBR)" value={fin.dbr} threshold={0.33} thresholdLabel="حد ساما 33%" good={fin.dbr <= 0.33} color="#8B6CFF" max={1} />
        </div>

        <Card>
          <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>التدفق النقدي الشهري</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <MoneyTile label="الدخل" value={income} color="#1FD89E" />
            <MoneyTile label="قسط هذا التمويل" value={-fin.installment} color="#FFC847" />
            <MoneyTile label="التزامات أخرى" value={-(fin.totalObl - fin.installment)} color="#B08CFF" />
            <MoneyTile label="المتبقي لك" value={fin.remaining} color={fin.remaining < income * 0.30 ? "#FF5C5C" : "#0EC9E0"} strong />
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <InfoPill label="الرسوم والتأمين المقدمة" value={`${fmt(fin.upfront)} ر.س`} />
            <InfoPill label="غرامة السداد المبكر" value={`${fmt(fin.earlySettle)} ر.س`} danger />
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>لماذا هذه التوصية؟</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {fin.reasons.map((r, i) => {
              const col = r.ok === true ? "#1FD89E" : r.ok === false ? "#FF5C5C" : "#FFC847";
              const ic = r.ok === true ? "check" : r.ok === false ? "x" : "info";
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, background: col + "0F", border: `1px solid ${col}26`, borderRadius: 10, padding: "11px 13px" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: col + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Icon name={ic} size={13} color={col} />
                  </div>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>{r.text}</span>
                </div>
              );
            })}
          </div>
          <button onClick={() => goto("object")} className="hover-lift" style={{ marginTop: 16, width: "100%", background: "rgba(60,143,255,0.1)", border: "1px solid rgba(60,143,255,0.35)", color: "#5C9FFF", borderRadius: 12, padding: "12px", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="pen" size={15} color="#5C9FFF" /> اطلب رسالة اعتراض على عبء التمويل
          </button>
        </Card>

        <button onClick={() => { setFinReady(false); setFinMode(null); }} style={{ ...ghostBtn, alignSelf: "center", padding: "9px 18px" }}>
          إعادة إدخال البيانات المالية
        </button>
      </>
      )}

      <PrivacyNote />
    </div>
  );
}

function ChoiceCard({ color, icon, title, desc, badge, onClick }) {
  return (
    <button onClick={onClick} className="hover-lift" style={{
      textAlign: "right", background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`,
      borderRadius: 16, padding: 20, cursor: "pointer", position: "relative",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}0D`; e.currentTarget.style.borderColor = `${color}66`; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.transform = "none"; }}>
      {badge && <span style={{ position: "absolute", insetInlineEnd: 16, top: 16, background: color + "22", color, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 9px" }}>{badge}</span>}
      <div style={{ width: 48, height: 48, borderRadius: 13, background: `${color}1A`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon name={icon} size={22} color={color} />
      </div>
      <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 6 }}>{title}</div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </button>
  );
}

function SliderField({ label, value, setValue, min, max, step, color }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 17, fontWeight: 900, color }}>{fmt(value)} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>ر.س</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%", background: `linear-gradient(90deg, ${color} ${fill}%, rgba(255,255,255,0.1) ${fill}%)` }} />
    </div>
  );
}

function RatioCard({ title, value, threshold, thresholdLabel, good, color, max = 0.7 }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: good ? "#1FD89E" : "#FF5C5C" }}>{pct(value)}</span>
      </div>
      <MeterBar value={Math.min(value, max)} max={max} color={good ? "#1FD89E" : "#FF5C5C"} threshold={threshold} thresholdLabel={thresholdLabel} />
      <div style={{ marginTop: 14, fontSize: 12, color: good ? "#1FD89E" : "#FF5C5C", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name={good ? "check" : "warning"} size={13} color={good ? "#1FD89E" : "#FF5C5C"} />
        {good ? "ضمن الحد الصحي" : "يتجاوز الحد الموصى به"}
      </div>
    </Card>
  );
}

function MoneyTile({ label, value, color, strong }) {
  const sign = value < 0 ? "−" : "";
  return (
    <div style={{ background: strong ? color + "12" : "rgba(255,255,255,0.03)", border: `1px solid ${strong ? color + "40" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "13px 14px" }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color }}>{sign}{fmt(Math.abs(value))} <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>ر.س</span></div>
    </div>
  );
}

function InfoPill({ label, value, danger }) {
  const col = danger ? "#FF5C5C" : "rgba(255,255,255,0.7)";
  return (
    <div style={{ flex: 1, minWidth: 160, background: danger ? "rgba(255,59,59,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${danger ? "rgba(255,59,59,0.22)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "10px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: col, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function PrivacyNote() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "0 4px" }}>
      <Icon name="lock" size={13} color="rgba(255,255,255,0.35)" />
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, lineHeight: 1.7, margin: 0 }}>
        نموذج تجريبي: لا نجمع أرقام بطاقات أو بيانات بنكية حقيقية. كل الأرقام التي تدخلها تبقى على جهازك وتُستخدم للحساب فقط.
      </p>
    </div>
  );
}

// ===================== OBJECTION =====================
function ObjectPanel({ d, copiedIdx, handleCopy }) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, marginTop: 0, marginBottom: 16 }}>
        رسائل اعتراض جاهزة صاغها الوكيل بناءً على ما كشفه باقي الوكلاء. انسخ أي رسالة وأرسلها للجهة الممولة كما هي.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {d.objectionLetters.map((item, i) => {
          const srcColor = item.source === "كاشف المخاطر" ? "#FF5C5C" : item.source === "كاشف المخفي" ? "#B08CFF" : item.source === "الأثر المالي" ? "#0EC9E0" : "#5C9FFF";
          return (
            <div key={i} style={{ background: "rgba(60,143,255,0.05)", border: "1px solid rgba(60,143,255,0.2)", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
                <div>
                  <span style={{ background: srcColor + "1A", color: srcColor, border: `1px solid ${srcColor}33`, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "3px 10px" }}>مصدر: {item.source}</span>
                  <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 8 }}>{item.issue}</div>
                </div>
                <button onClick={() => handleCopy(item.letter, i)} style={{
                  background: copiedIdx === i ? "rgba(0,196,140,0.15)" : "rgba(255,255,255,0.06)",
                  border: copiedIdx === i ? "1px solid rgba(0,196,140,0.35)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 9, padding: "7px 13px", cursor: "pointer",
                  color: copiedIdx === i ? "#1FD89E" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                }}>
                  <Icon name={copiedIdx === i ? "check" : "copy"} size={13} color={copiedIdx === i ? "#1FD89E" : "rgba(255,255,255,0.6)"} />
                  {copiedIdx === i ? "تم النسخ" : "نسخ"}
                </button>
              </div>
              <div style={{ background: "rgba(0,0,0,0.22)", borderRadius: 10, padding: "13px 15px", color: "rgba(255,255,255,0.78)", fontSize: 13.5, lineHeight: 1.9 }}>
                {item.letter}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== SMALL HELPERS / STYLES =====================
function Legend() {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
      {["red", "yellow", "green"].map((l) => (
        <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: levelColors[l].bg }} /> {levelColors[l].label}
        </span>
      ))}
    </div>
  );
}
const order = (l) => (l === "red" ? 3 : l === "yellow" ? 2 : 1);

const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 7,
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "8px 16px",
  fontSize: 13, cursor: "pointer", fontWeight: 600,
};
const labelStyle = { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, marginBottom: 10 };
const fileBtn = {
  flex: 1, padding: "11px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
  color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
};

const SAMPLE_CONTRACT_TEXT = `عقد تمويل شخصي

المادة (1): تمنح الجهة الممولة الطرف الثاني تمويلاً بمبلغ 150,000 ريال يُسدَّد على 60 قسطاً شهرياً متساوياً قدر كل قسط 3,250 ريال.

المادة (2): يُمنح التمويل بنسبة ربح ثابتة قدرها 6% سنوياً تُحتسب على كامل مبلغ التمويل طوال مدة العقد، ويبلغ معدل النسبة السنوي الفعلي (APR) نحو 10.8%.

المادة (3): يُضاف قسط التأمين على التمويل البالغ 6,750 ريال إلى أصل المبلغ الممول وتُحتسب عليه نسبة الربح ذاتها، إضافة إلى رسوم إدارية قدرها 1,500 ريال.

المادة (4): يلتزم الطرف الثاني بتحويل راتبه إلى الجهة الممولة طوال مدة التمويل، ويفوّضها بالخصم المباشر من أي مستحقات أو حسابات تعود له.

المادة (5): في حال رغبة الطرف الثاني في السداد المبكر يلتزم بدفع غرامة تعادل أرباح المدة المتبقية من التمويل.

المادة (6): في حال تأخر الطرف الثاني عن سداد أي قسط يحق للجهة الممولة المطالبة بكامل المبلغ المتبقي دفعة واحدة دون إشعار مسبق، وتُضاف رسوم تأخير عن كل قسط لم يُسدَّد في موعده.

المادة (7): يُرفق بالعقد جدول سداد يوضّح قيمة كل قسط وتاريخ استحقاقه وأصل ما تبقى من المبلغ.

المادة (8): يحق للطرف الثاني العدول عن العقد خلال عشرة أيام من توقيعه دون إبداء أسباب وفق ضوابط الجهة المنظِّمة.`;
