/* اختبار الوكلاء الستة عبر عميل Claude محاكى.
   يغطّي: بناء برومت كل وكيل، الدمج، تسليم سياق المرحلة ٢، الصمود عند فشل
   وكيل، والرمي لو فشل الجميع. بدون Express، بدون شبكة، بدون مفتاح.
   node test-agents.js  */

const { AGENTS, buildAgentPrompt, analyzeAgents } = require("./agents");

let fails = 0;
const ok = (label, cond, extra) => {
  console.log(`${cond ? "✅" : "❌"} ${label}${cond ? "" : `  ← ${JSON.stringify(extra)}`}`);
  if (!cond) fails++;
};

// ردود جزئية لكل وكيل (بدون القوس الأول — الباكند يحشوه، فالنموذج يكمل بعده)
const SLICES = {
  financial: '"money":{"monthlyRent":"3,800 ر.س","depositMonths":1,"annualIncrease":10,"penaltyMonths":3,"maintenanceCap":500}}',
  risk: '"safetyScore":"42","safetyLevel":"green","summary":"عقد فيه بنود تحتاج مراجعة.","risks":[{"text":"غرامة عالية","level":"red","original":"ثلاثة أشهر","translated":"مكلفة"}]}',
  hidden: '"hiddenItems":[{"level":"red","title":"تجديد تلقائي","original":"يتجدد تلقائياً","translated":"انتبه"}]}',
  market: '"marketComparison":[{"item":"الغرامة","yours":"3 أشهر","market":"شهر","diff":"+6000","status":"red"},{"item":"رسوم","yours":"2500","market":"","diff":"","status":"yellow"}],"costProjection":{"labels":["السنة 1","السنة 2","السنة 3"],"yours":[45600,50160,55176],"market":[45600,47880,50274],"gaps":[0,0,0],"total":0,"avgPerYear":0}}',
  future: '"futureTimeline":[{"when":"عند التوقيع","text":"دفعة مقدمة","icon":"payment","level":"yellow"}],"exposure":{"total3y":12000,"scenarios":[3000,12000,21000],"sources":["مقدّر من النص"],"conditional":["الإنهاء المبكر"]}}',
  objection: '"objectionLetters":[{"source":"المادة (3)","issue":"تجديد","letter":"أطلب توضيح البند."}]}',
};

// عميل يوجّه كل وكيل لقطعته بناءً على معرّفه الظاهر في البرومت. يسجّل الاستدعاءات.
function makeClient(opts = {}) {
  const calls = [];
  const fail = new Set(opts.fail || []);
  return {
    calls,
    messages: {
      create: async ({ messages }) => {
        const prompt = messages[0].content;
        const agent = AGENTS.find((a) => prompt.includes(`YOUR AGENT: ${a.label}`));
        const id = agent ? agent.id : "unknown";
        calls.push({ id, prompt });
        if (fail.has(id)) throw new Error(`mock fail ${id}`);
        return { stop_reason: "end_turn", content: [{ type: "text", text: SLICES[id] || '"x":1}' }] };
      },
    },
  };
}

(async () => {
  console.log("\n──────── سجل الوكلاء ────────");
  ok("ستة وكلاء بالضبط", AGENTS.length === 6, AGENTS.length);
  ok("ثلاثة في المرحلة ١", AGENTS.filter((a) => a.phase === 1).length === 3);
  ok("ثلاثة في المرحلة ٢", AGENTS.filter((a) => a.phase === 2).length === 3);
  const labels = AGENTS.map((a) => a.label);
  ["الأثر المالي", "كاشف المخاطر", "كاشف المخفي", "مقارنة السوق", "النظرة المستقبلية", "صائغ الاعتراض"]
    .forEach((l) => ok(`الوكيل موجود: ${l}`, labels.includes(l)));

  console.log("\n──────── buildAgentPrompt ────────");
  const fin = AGENTS.find((a) => a.id === "financial");
  const p = buildAgentPrompt(fin, "rental", "المبلغ $& والرسوم $1", null);
  ok("البرومت المشترك مدموج", p.includes("Majhar"));
  ok("قسم الوكيل مدموج", p.includes("YOUR AGENT: الأثر المالي"));
  ok("النوع مدموج", p.includes("Contract type:\nrental"));
  ok("رموز $& $1 تمر حرفياً (لا replace)", p.includes("$&") && p.includes("$1"));
  const pNoCtx = buildAgentPrompt(fin, "rental", "نص", null);
  ok("بلا سياق = لا كتلة سياق", !pNoCtx.includes("Analysis so far"));
  const mkt = AGENTS.find((a) => a.id === "market");
  const pCtx = buildAgentPrompt(mkt, "rental", "نص", { money: { monthlyRent: 3800 } });
  ok("مع سياق = كتلة السياق تظهر", pCtx.includes("Analysis so far") && pCtx.includes("3800"));

  console.log("\n──────── السلسلة الكاملة: ٦ وكلاء → دمج → تطبيع ────────");
  const client = makeClient();
  const d = await analyzeAgents(client, "mock", "rental", "نص عقد إيجار طويل كفاية للتحليل هنا.");

  ok("نودي كل الوكلاء الستة", client.calls.length === 6, client.calls.length);
  ok("المرحلة ١ قبل المرحلة ٢", (() => {
    const order = client.calls.map((c) => AGENTS.find((a) => a.id === c.id)?.phase);
    const firstP2 = order.indexOf(2);
    return order.slice(0, firstP2).every((ph) => ph === 1) && order.slice(firstP2).every((ph) => ph === 2);
  })(), client.calls.map((c) => c.id));

  // نتحقق أن قطعة كل وكيل وصلت ومرّت بالتطبيع الصحيح
  ok("financial → money مطبّع (3,800 ر.س → 3800)", d.money.monthlyRent === 3800, d.money.monthlyRent);
  ok("financial → annualIncrease 10 → 0.1", d.money.annualIncrease === 0.1, d.money.annualIncrease);
  ok("risk → safetyScore رقم", d.safetyScore === 42 && typeof d.safetyScore === "number", d.safetyScore);
  ok("risk → safetyLevel اتصحح green→yellow", d.safetyLevel === "yellow", d.safetyLevel);
  ok("risk → risks وصلت", d.risks.length === 1 && d.risks[0].level === "red");
  ok("hidden → hiddenItems وصلت", d.hiddenItems.length === 1 && d.hiddenItems[0].title === "تجديد تلقائي");
  ok("market → status red→bad", d.marketComparison[0].status === "bad", d.marketComparison[0].status);
  ok("market → yellow الغامضة→unknown", d.marketComparison[1].status === "unknown");
  ok("market → costProjection.gaps اتحسبت", JSON.stringify(d.costProjection.gaps) === JSON.stringify([0, 2280, 4902]), d.costProjection.gaps);
  ok("future → أيقونة payment→wallet", d.futureTimeline[0].icon === "wallet", d.futureTimeline[0].icon);
  ok("future → scenarios مصفوفة→كائن", !Array.isArray(d.exposure.scenarios) && d.exposure.scenarios.expected === 12000);
  ok("objection → source صار اسم وكيل", d.objectionLetters[0].source === "كاشف المخاطر", d.objectionLetters[0].source);
  ok("_degraded غير موجود عند النجاح", d._degraded === undefined);

  const flat = JSON.stringify(d);
  ok("ما فيه null بالرد", !flat.includes("null"));
  ok("ما فيه NaN بالرد", !flat.includes("NaN"));

  console.log("\n──────── تسليم السياق للمرحلة ٢ ────────");
  const marketCall = client.calls.find((c) => c.id === "market");
  ok("مقارنة السوق استلمت money في سياقها", marketCall.prompt.includes("Analysis so far") && marketCall.prompt.includes("monthlyRent"));
  const objCall = client.calls.find((c) => c.id === "objection");
  ok("صائغ الاعتراض استلم risks + hiddenItems", objCall.prompt.includes("risks") && objCall.prompt.includes("hiddenItems"));

  console.log("\n──────── الصمود: فشل وكيل واحد ────────");
  const c2 = makeClient({ fail: ["hidden"] });
  const d2 = await analyzeAgents(c2, "mock", "rental", "نص عقد طويل كفاية للتحليل هنا.");
  ok("التحليل ما انكسر مع فشل وكيل", typeof d2.safetyScore === "number");
  ok("قطعة الوكيل الفاشل فاضية", d2.hiddenItems.length === 0);
  ok("_degraded يذكر الوكيل الفاشل", Array.isArray(d2._degraded) && d2._degraded.includes("hidden"));
  ok("بقية الوكلاء اشتغلوا", d2.money.monthlyRent === 3800 && d2.risks.length === 1);

  console.log("\n──────── الصمود: فشل وكيل مرحلة ١ يعطّل سياق مرحلة ٢ بلا كسر ────────");
  const c3 = makeClient({ fail: ["financial"] });
  const d3 = await analyzeAgents(c3, "mock", "rental", "نص عقد طويل كفاية للتحليل هنا.");
  const mktNoCtx = c3.calls.find((c) => c.id === "market");
  ok("مقارنة السوق اشتغلت بلا سياق money", mktNoCtx && !mktNoCtx.prompt.includes("Analysis so far"));
  ok("النتيجة ما زالت صالحة", typeof d3.safetyScore === "number" && d3._degraded.includes("financial"));

  console.log("\n──────── فشل الجميع يرمي ────────");
  let threw = false;
  try {
    await analyzeAgents(makeClient({ fail: AGENTS.map((a) => a.id) }), "mock", "rental", "نص عقد طويل كفاية للتحليل هنا.");
  } catch (e) { threw = e.allFailed === true; }
  ok("فشل كل الوكلاء يرمي allFailed", threw);

  console.log("\n──────── الأنواع الثلاثة تمر بالسلسلة ────────");
  for (const type of ["rental", "finance", "invest"]) {
    const out = await analyzeAgents(makeClient(), "mock", type, "نص عقد طويل كفاية للتحليل هنا.");
    ok(`type=${type}: contractType عربي وscenarios كائن`, /[؀-ۿ]/.test(out.contractType) && !Array.isArray(out.exposure.scenarios), out.contractType);
  }

  console.log(`\n${fails === 0 ? "🎉 الوكلاء الستة يشتغلون بالتوازي ويندمجون بنجاح" : `⚠️  ${fails} اختبار فشل`}\n`);
  process.exit(fails === 0 ? 0 : 1);
})();
