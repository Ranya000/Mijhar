/* اختبار السلسلة الكاملة عبر core.js مع عميل Claude محاكى.
   يغطّي: التحقق من المدخلات → بناء البرومت → استخراج JSON → تطبيع.
   بدون Express، بدون شبكة، بدون مفتاح.  node test-core.js  */

const { validateInput, buildPrompt, analyze, errorToResponse, canonicalType } = require("./core");

let fails = 0;
const ok = (label, cond, extra) => {
  console.log(`${cond ? "✅" : "❌"} ${label}${cond ? "" : `  ← ${JSON.stringify(extra)}`}`);
  if (!cond) fails++;
};

// عميل محاكى: يرجّع رداً "متسخ" يحاكي نموذجاً تجاهل التعليمات جزئياً.
// مهم: الباكند يحشو "{" كبداية رد المساعد، فالنموذج الحقيقي يكمل من بعد القوس —
// يعني نص الرد يبدأ بمحتوى الكائن مباشرة (بدون { في البداية).
const mockClient = (modelText) => ({
  messages: { create: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: modelText }] }) },
});

// الكائن الداخلي بدون القوس الأول (الباكند يضيفه) — هذا ما يرجعه النموذج فعلاً مع الحشو
const DIRTY_BODY = JSON.stringify({
  contractType: "rental",
  safetyScore: "42",
  safetyLevel: "green",
  summary: "عقد فيه بنود { تحتاج } مراجعة.",
  money: { monthlyRent: "3,800 ر.س", depositMonths: 1, annualIncrease: 10, penaltyMonths: 3, maintenanceCap: 500 },
  futureTimeline: [{ when: "عند التوقيع", text: "دفعة مقدمة", icon: "payment", level: "yellow" }],
  hiddenItems: [{ level: "red", title: "تجديد تلقائي", original: "يتجدد تلقائياً", translated: "انتبه" }],
  marketComparison: [
    { item: "الغرامة", yours: "3 أشهر", market: "شهر", diff: "+6000", status: "red" },
    { item: "رسوم", yours: "2500", market: "", diff: "", status: "yellow" },
  ],
  costProjection: { labels: ["Year 1", "Year 2", "Year 3"], yours: [45600, 50160, 55176], market: [45600, 47880, 50274], gaps: [0, 0, 0], total: 0, avgPerYear: 0 },
  exposure: { total3y: 12000, scenarios: [3000, 12000, 21000], sources: ["مقدّر من النص"], conditional: ["الإنهاء المبكر"] },
  risks: [{ text: "غرامة عالية", level: "red", original: "ثلاثة أشهر", translated: "مكلفة" }],
  objectionLetters: [{ source: "المادة (3)", issue: "تجديد", letter: "أطلب توضيح البند." }],
});
// نشيل القوس الأول عشان نحاكي الحشو
const DIRTY_RENTAL = DIRTY_BODY.slice(1);

(async () => {
  console.log("\n──────── canonicalType ────────");
  ok("financing → finance", canonicalType("financing") === "finance");
  ok("investment → invest", canonicalType("investment") === "invest");
  ok("RENTAL → rental (حروف كبيرة)", canonicalType("  RENTAL ") === "rental");

  console.log("\n──────── validateInput ────────");
  ok("بلا نص = 400", validateInput("", "rental").status === 400);
  ok("بلا نوع = 400", validateInput("x".repeat(100), "").status === 400);
  ok("نوع غير مدعوم = 400", validateInput("x".repeat(100), "banana").status === 400);
  ok("نص قصير = 400", validateInput("قصير", "rental").status === 400);
  ok("نص طويل جداً = 413", validateInput("x".repeat(70000), "rental").status === 413);
  const good = validateInput("المادة 1: إيجار 3800 ريال شهرياً لمدة سنة قابلة للتجديد.".repeat(2), "financing");
  ok("مدخل صحيح = ok", good.ok === true);
  ok("النوع اتحول financing → finance", good.type === "finance", good.type);
  ok("النص اتقلّم", good.text === good.text.trim());

  console.log("\n──────── buildPrompt ────────");
  const p = buildPrompt("rental", "نص العقد هنا");
  ok("النوع اندمج بالبرومت", p.includes("rental"));
  ok("النص اندمج بالبرومت", p.includes("نص العقد هنا"));
  ok("ما بقيت placeholders", !p.includes("{{type}}") && !p.includes("{{text}}"));
  // الحماية من $&: نص فيه رموز استبدال ما يخرب البرومت
  const p2 = buildPrompt("rental", "المبلغ $& والرسوم $1 و $`");
  ok("رموز $& $1 ما تخرب البرومت", p2.includes("$&") && p2.includes("$1"));

  console.log("\n──────── analyze: السلسلة الكاملة (رد متسخ → مطبّع) ────────");
  const d = await analyze(mockClient(DIRTY_RENTAL), "mock-model", "rental", "نص عقد إيجار طويل كفاية للتحليل.");
  ok("contractType صار عربي", d.contractType === "عقد إيجار سكني", d.contractType);
  ok("safetyScore رقم (من نص)", d.safetyScore === 42 && typeof d.safetyScore === "number", d.safetyScore);
  ok("safetyLevel اتصحح green→yellow", d.safetyLevel === "yellow", d.safetyLevel);
  ok("monthlyRent من '3,800 ر.س' → 3800", d.money.monthlyRent === 3800, d.money.monthlyRent);
  ok("annualIncrease 10 → 0.1 (أخطر غلط)", d.money.annualIncrease === 0.1, d.money.annualIncrease);
  ok("أيقونة payment → wallet", d.futureTimeline[0].icon === "wallet", d.futureTimeline[0].icon);
  ok("status red → bad", d.marketComparison[0].status === "bad", d.marketComparison[0].status);
  ok("status yellow الغامضة → unknown", d.marketComparison[1].status === "unknown", d.marketComparison[1].status);
  ok("المجهول يعرض 'غير متوفر'", d.marketComparison[1].market === "غير متوفر", d.marketComparison[1].market);
  ok("scenarios مصفوفة → كائن", !Array.isArray(d.exposure.scenarios) && d.exposure.scenarios.expected === 12000, d.exposure.scenarios);
  ok("sources نصوص → كائنات فيها yr", typeof d.exposure.sources[0].yr === "number", d.exposure.sources[0]);
  ok("conditional نصوص → كائنات فيها title", typeof d.exposure.conditional[0].title === "string", d.exposure.conditional[0]);
  ok("مصدر الاعتراض → اسم وكيل", d.objectionLetters[0].source === "كاشف المخاطر", d.objectionLetters[0].source);
  ok("gaps اتحسبت (مو أصفار النموذج)", JSON.stringify(d.costProjection.gaps) === JSON.stringify([0, 2280, 4902]), d.costProjection.gaps);
  ok("labels عربية", d.costProjection.labels[0] === "السنة 1", d.costProjection.labels);

  const flat = JSON.stringify(d);
  ok("ما فيه null بالرد كامل", !flat.includes("null"));
  ok("ما فيه NaN بالرد كامل", !flat.includes("NaN"));

  console.log("\n──────── analyze: حالات النموذج الصعبة ────────");
  // رد مقطوع (max_tokens) — stop_reason يمسكه قبل حتى محاولة الاستخراج
  let truncErr = false;
  try {
    await analyze({ messages: { create: async () => ({ stop_reason: "max_tokens", content: [{ type: "text", text: '"summary":"نص' }] }) } }, "m", "rental", "نص طويل كفاية للتحليل هنا.");
  } catch (e) { truncErr = /truncated/.test(e.message); }
  ok("رد مقطوع (max_tokens) يرمي خطأ واضح", truncErr);

  // JSON ناقص القوس الأخير (مع الحشو يصير {"a":1 بلا إغلاق)
  let brokenErr = false;
  try {
    await analyze(mockClient('"a":1,"b":2'), "m", "rental", "نص طويل كفاية للتحليل هنا.");
  } catch { brokenErr = true; }
  ok("JSON بلا إغلاق يرمي خطأ", brokenErr);

  console.log("\n──────── errorToResponse ────────");
  ok("401 → 500", errorToResponse({ status: 401 }).status === 500);
  ok("429 → 429", errorToResponse({ status: 429 }).status === 429);
  ok("timeout → 504", errorToResponse({ name: "APIConnectionTimeoutError" }).status === 504);
  ok("غير معروف → 502", errorToResponse({ message: "boom" }).status === 502);
  ok("كل الأخطاء لها نص عربي", errorToResponse({ status: 429 }).error.length > 0);

  console.log("\n──────── الأنواع الثلاثة تمر بالسلسلة ────────");
  for (const type of ["rental", "finance", "invest"]) {
    // بدون القوس الأول — الباكند يحشوه
    const minimalBody = '"safetyScore":60,"money":{},"risks":[],"marketComparison":[]}';
    const out = await analyze(mockClient(minimalBody), "m", type, "نص عقد طويل كفاية للتحليل هنا.");
    ok(`type=${type}: contractType عربي وscenarios كائن`, /[\u0600-\u06FF]/.test(out.contractType) && !Array.isArray(out.exposure.scenarios), out.contractType);
  }

  console.log(`\n${fails === 0 ? "🎉 السلسلة الكاملة تشتغل من الطرف للطرف" : `⚠️  ${fails} اختبار فشل`}\n`);
  process.exit(fails === 0 ? 0 : 1);
})();
