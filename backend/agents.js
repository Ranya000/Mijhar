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
  { id: "financial", label: "الأثر المالي",      phase: 1, maxTokens: 2000, body: readPrompt("financial.txt") },
  { id: "risk",      label: "كاشف المخاطر",       phase: 1, maxTokens: 4000, body: readPrompt("risk.txt") },
  { id: "hidden",    label: "كاشف المخفي",        phase: 1, maxTokens: 3000, body: readPrompt("hidden.txt") },
  { id: "market",    label: "مقارنة السوق",       phase: 2, maxTokens: 3500, needs: ["money"], body: readPrompt("market.txt") },
  { id: "future",    label: "النظرة المستقبلية",  phase: 2, maxTokens: 5000, needs: ["money"], body: readPrompt("future.txt") },
  { id: "objection", label: "صائغ الاعتراض",      phase: 2, maxTokens: 4000, needs: ["risks", "hiddenItems"], body: readPrompt("objection.txt") },
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
    messages: [{ role: "user", content: prompt }],
  });

  if (res.stop_reason === "max_tokens") {
    throw new Error(`agent ${agent.id} truncated — raise its maxTokens`);
  }

  const body = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // extractJson يتحمّل أي مقدمة أو أسوار Markdown حول الكائن
  return extractJson(body);
}

/**
 * المنسّق الباثّ: يشغّل الوكلاء الستة على مرحلتين متوازيتين، وينادي onEvent
 * لحظة انتهاء كل وكيل (نجاحاً أو فشلاً) — فتقدر الواجهة تعرض تقدّماً حقيقياً.
 * يدمج القطع ثم يطبّع مرة واحدة.
 * صامد: فشل وكيل واحد لا يُسقط التحليل (قطعته تُترك فارغة وnormalize يكمّلها)،
 * ويُسجَّل في out._degraded. يرمي فقط لو فشل كل الوكلاء (مفتاح/شبكة).
 * @param {object}   client   عميل بواجهة { messages: { create } } (Anthropic أو محاكاة)
 * @param {function} onEvent  تُستدعى بـ { id, label, phase, ok, done, total } لكل وكيل
 * @returns {Promise<object>} كائن مطابق لشكل الواجهة بالضبط
 */
async function analyzeAgentsStream(client, model, type, text, onEvent = () => {}) {
  const merged = {};
  const failed = [];
  const total = AGENTS.length;
  let done = 0;

  async function runPhase(agents) {
    // كل وكيل يبثّ حدثه لحظة استقراره — لا ننتظر بقية الدفعة
    await Promise.all(
      agents.map(async (a) => {
        // سياق المرحلة ٢: القطع المطلوبة من المدموج حتى الآن
        const ctx = {};
        for (const key of a.needs || []) {
          if (merged[key] !== undefined) ctx[key] = merged[key];
        }
        let ok = true;
        // محاولتان: يعالج تعثّراً متقطعاً (حدّ معدّل متزامن على حساب جديد مثلاً)
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const slice = await runAgent(client, model, a, type, text, ctx);
            Object.assign(merged, slice);
            ok = true;
            break;
          } catch (_e) {
            ok = false;
            if (attempt < 2) await new Promise((r) => setTimeout(r, 900));
          }
        }
        if (!ok) failed.push(a.id);
        done++;
        try {
          onEvent({ id: a.id, label: a.label, phase: a.phase, ok, done, total });
        } catch (_e) { /* مستهلك الأحداث ما يكسر التحليل */ }
      })
    );
  }

  await runPhase(AGENTS.filter((a) => a.phase === 1));
  await runPhase(AGENTS.filter((a) => a.phase === 2));

  if (failed.length === total) {
    const err = new Error("all agents failed");
    err.allFailed = true;
    throw err;
  }

  const out = normalize(type, merged);
  if (failed.length) out._degraded = failed; // الواجهة تتجاهل المفاتيح الزائدة
  return out;
}

/** نفس المنسّق بلا أحداث — للمسار غير الباثّ (POST /api/analyze). */
function analyzeAgents(client, model, type, text) {
  return analyzeAgentsStream(client, model, type, text);
}

module.exports = { AGENTS, buildAgentPrompt, runAgent, analyzeAgents, analyzeAgentsStream };
