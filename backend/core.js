/* =========================================================
   core.js — منطق التحليل الخالص (بدون Express، بدون شبكة)
   يستقبل عميل Claude كاعتماد فيصير قابلاً للاختبار بمحاكاة.
   ========================================================= */

const fs = require("fs");
const path = require("path");

const { normalize, TYPE_LABEL } = require("./normalize");
const { extractJson } = require("./json");
const { analyzeAgents } = require("./agents");

const MAX_TEXT = 60000;      // حرف — أطول من أي عقد استهلاكي واقعي
const MIN_TEXT = 80;

// الواجهة القديمة كانت ترسل financing/investment — الملف الشامل يرسل finance/invest
const TYPE_ALIASES = { financing: "finance", investment: "invest", rent: "rental" };

function canonicalType(t) {
  const s = String(t || "").trim().toLowerCase();
  return TYPE_ALIASES[s] || s;
}

// نقرأ البرومت مرة واحدة — أي خطأ فيه يظهر عند الإقلاع لا عند أول طلب
const PROMPT_TEMPLATE = fs.readFileSync(
  path.join(__dirname, "prompts", "majhar_prompt.txt"),
  "utf8"
);

function buildPrompt(type, text) {
  // دوال بدل نصوص: لو العقد فيه $& أو $1 فـ replace يفسّرها كأنماط استبدال ويخرب البرومت
  return PROMPT_TEMPLATE.replace("{{type}}", () => type).replace("{{text}}", () => text);
}

/**
 * يتحقق من المدخلات ويرجّع خطأً منظّماً أو النوع القانوني.
 * @returns {{ ok: true, type: string } | { ok: false, status: number, error: string }}
 */
function validateInput(rawText, rawType) {
  const type = canonicalType(rawType);
  if (!rawText || !rawType) return { ok: false, status: 400, error: "أرسل نص العقد ونوعه." };
  if (!TYPE_LABEL[type]) return { ok: false, status: 400, error: "نوع العقد غير مدعوم. المدعوم: rental | finance | invest" };
  const text = String(rawText).trim();
  if (text.length < MIN_TEXT) return { ok: false, status: 400, error: "نص العقد قصير جداً للتحليل." };
  if (String(rawText).length > MAX_TEXT) return { ok: false, status: 413, error: "نص العقد أطول من الحد المسموح." };
  return { ok: true, type, text };
}

/**
 * ينفّذ التحليل: يبني البرومت، ينادي Claude، يستخرج JSON، يطبّعه.
 * @param {object} client  عميل بواجهة { messages: { create } } (Anthropic أو محاكاة)
 * @param {string} model
 * @param {string} type    نوع قانوني (rental|finance|invest)
 * @param {string} text
 * @returns {Promise<object>} كائن مطابق لشكل الواجهة
 */
async function analyze(client, model, type, text) {
  const prompt = buildPrompt(type, text);

  const res = await client.messages.create({
    model,
    max_tokens: 8000,
    temperature: 0,
    messages: [
      { role: "user", content: prompt },
      // حشو بداية الرد: يمنع النموذج من كتابة أي مقدمة قبل الـ JSON
      { role: "assistant", content: "{" },
    ],
  });

  if (res.stop_reason === "max_tokens") {
    throw new Error("model response truncated — raise max_tokens");
  }

  const body = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const raw = extractJson("{" + body);
  return normalize(type, raw);
}

/**
 * التحليل عبر الوكلاء الستة المستقلين (المسار الافتراضي).
 * غلاف رفيع حول المنسّق في agents.js — يوحّد التوقيع مع analyze().
 */
function analyzeWithAgents(client, model, type, text) {
  return analyzeAgents(client, model, type, text);
}

/** يحوّل خطأ من SDK إلى رد HTTP منظّم. */
function errorToResponse(err) {
  if (err.status === 401) return { status: 500, error: "مفتاح الـ API غير صالح." };
  if (err.status === 429) return { status: 429, error: "ضغط على الخدمة، جرّب بعد لحظات." };
  if (err.name === "APIConnectionTimeoutError") return { status: 504, error: "التحليل استغرق وقتاً أطول من المتوقع، جرّب مرة ثانية." };
  return { status: 502, error: "تعذّر تحليل العقد الآن، جرّب مرة ثانية." };
}

module.exports = {
  canonicalType,
  buildPrompt,
  validateInput,
  analyze,
  analyzeWithAgents,
  errorToResponse,
  MAX_TEXT,
  MIN_TEXT,
  PROMPT_TEMPLATE,
};
