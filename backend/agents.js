/* =========================================================
   agents.js — الوكلاء الستة الحقيقيون
   كل وكيل نداء Claude مستقل ببرومت متخصص. يشتغلون على مرحلتين:
     المرحلة ١ (بالتوازي): الأثر المالي · كاشف المخاطر · كاشف المخفي
     المرحلة ٢ (بالتوازي، تبني على الأولى):
        مقارنة السوق ← تحتاج money
        النظرة المستقبلية ← تحتاج money
        صائغ الاعتراض ← يحتاج risks + hiddenItems
   ثم تُدمج القطع الست في كائن واحد ويمرّ على normalize مرة واحدة.
   يستقبل عميل Claude كاعتماد فيصير قابلاً للاختبار بمحاكاة.
   ========================================================= */

const fs = require("fs");
const path = require("path");

const { extractJson } = require("./json");
const { normalize } = require("./normalize");

const readPrompt = (f) => fs.readFileSync(path.join(__dirname, "prompts", "agents", f), "utf8");

// البرومت المشترك يُقرأ مرة عند الإقلاع — أي خطأ يظهر فوراً لا عند أول طلب
const COMMON = readPrompt("_common.txt");

/**
 * سجل الوكلاء. `needs` تحدد أي قطع من المرحلة الأولى تُمرَّر كسياق لهذا الوكيل.
 * ترتيب المصفوفة = ترتيب العرض؛ `phase` يحدد الدفعة المتوازية.
 */
const AGENTS = [
  { id: "financial", label: "الأثر المالي",      phase: 1, maxTokens: 1200, body: readPrompt("financial.txt") },
  { id: "risk",      label: "كاشف المخاطر",       phase: 1, maxTokens: 3000, body: readPrompt("risk.txt") },
  { id: "hidden",    label: "كاشف المخفي",        phase: 1, maxTokens: 2000, body: readPrompt("hidden.txt") },
  { id: "market",    label: "مقارنة السوق",       phase: 2, maxTokens: 2500, needs: ["money"], body: readPrompt("market.txt") },
  { id: "future",    label: "النظرة المستقبلية",  phase: 2, maxTokens: 3000, needs: ["money"], body: readPrompt("future.txt") },
  { id: "objection", label: "صائغ الاعتراض",      phase: 2, maxTokens: 2500, needs: ["risks", "hiddenItems"], body: readPrompt("objection.txt") },
];

/**
 * يبني برومت وكيل واحد بالتركيب (لا replace) — فنص العقد لو فيه $& أو $1
 * يمرّ حرفياً بلا أي تفسير كأنماط استبدال.
 */
function buildAgentPrompt(agent, type, text, context) {
  const parts = [
    COMMON,
    agent.body,
    "=========================================================\nINPUT\n=========================================================",
    "Contract type:\n" + type,
  ];
  if (context && Object.keys(context).length) {
    parts.push(
      "Analysis so far from the other agents (build on it, keep your numbers consistent):\n" +
        JSON.stringify(context)
    );
  }
  parts.push("Contract text:\n" + text);
  return parts.join("\n\n");
}

/**
 * ينفّذ وكيلاً واحداً: يبني برومته، ينادي Claude بحشو "{"، يستخرج JSON.
 * يرمي عند القطع (max_tokens) أو تعذّر الاستخراج — المنسّق يمسك الرمي.
 * @returns {Promise<object>} قطعة جزئية من الشكل النهائي
 */
async function runAgent(client, model, agent, type, text, context) {
  const prompt = buildAgentPrompt(agent, type, text, context);

  const res = await client.messages.create({
    model,
    max_tokens: agent.maxTokens,
    temperature: 0,
    messages: [
      { role: "user", content: prompt },
      // حشو بداية الرد يمنع أي مقدمة قبل الـ JSON
      { role: "assistant", content: "{" },
    ],
  });

  if (res.stop_reason === "max_tokens") {
    throw new Error(`agent ${agent.id} truncated — raise its maxTokens`);
  }

  const body = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  return extractJson("{" + body);
}

/**
 * المنسّق: يشغّل الوكلاء الستة على مرحلتين متوازيتين، يدمج، ثم يطبّع مرة واحدة.
 * صامد: فشل وكيل واحد لا يُسقط التحليل (قطعته تُترك فارغة وnormalize يكمّلها)،
 * ويُسجَّل في out._degraded. يرمي فقط لو فشل كل الوكلاء (مفتاح/شبكة) — فترجع
 * الواجهة للبيانات التجريبية.
 * @param {object} client عميل بواجهة { messages: { create } } (Anthropic أو محاكاة)
 * @returns {Promise<object>} كائن مطابق لشكل الواجهة بالضبط
 */
async function analyzeAgents(client, model, type, text) {
  const merged = {};
  const failed = [];

  async function runPhase(agents) {
    const results = await Promise.allSettled(
      agents.map((a) => {
        // سياق المرحلة ٢: القطع المطلوبة من المدموج حتى الآن
        const ctx = {};
        for (const key of a.needs || []) {
          if (merged[key] !== undefined) ctx[key] = merged[key];
        }
        return runAgent(client, model, a, type, text, ctx);
      })
    );
    results.forEach((r, i) => {
      if (r.status === "fulfilled") Object.assign(merged, r.value);
      else failed.push(agents[i].id);
    });
  }

  await runPhase(AGENTS.filter((a) => a.phase === 1));
  await runPhase(AGENTS.filter((a) => a.phase === 2));

  if (failed.length === AGENTS.length) {
    const err = new Error("all agents failed");
    err.allFailed = true;
    throw err;
  }

  const out = normalize(type, merged);
  if (failed.length) out._degraded = failed; // الواجهة تتجاهل المفاتيح الزائدة
  return out;
}

module.exports = { AGENTS, buildAgentPrompt, runAgent, analyzeAgents };
