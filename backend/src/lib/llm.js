// ============================================================
// طبقة الذكاء الاصطناعي — تدعم مزوّدَين:
//   • Anthropic Claude  (عند وجود ANTHROPIC_API_KEY)
//   • Google Gemini     (عند وجود GEMINI_API_KEY — مجاني بدون بطاقة)
// إن لم يوجد أي مفتاح، تعمل الوكلاء بالمحرّك الاحتياطي دون أعطال.
// ============================================================

// اكتشاف المزوّد النشط (الأولوية: Claude ← Gemini ← Groq)
export function activeProvider() {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  return null;
}

export function isLLMEnabled() {
  return activeProvider() !== null;
}

// ---------- Anthropic (Claude) ----------
let anthropicPromise = null;
async function getAnthropic() {
  if (!anthropicPromise) {
    anthropicPromise = import("@anthropic-ai/sdk")
      .then(({ default: Anthropic }) => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }))
      .catch((err) => {
        console.warn("[llm] تعذّر تحميل Anthropic SDK:", err.message);
        return null;
      });
  }
  return anthropicPromise;
}

async function askAnthropic({ system, user, maxTokens }) {
  const client = await getAnthropic();
  if (!client) return null;
  const model = process.env.MIJHAR_MODEL || "claude-sonnet-5";
  const res = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return res.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
}

// ---------- Google Gemini (مجاني) ----------
// يجرّب عدة موديلات بالترتيب؛ إن كان أحدها بلا حصة مجانية (429/404) ينتقل للتالي.
const GEMINI_MODELS = () =>
  (process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL]
    : ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"]);

async function askGemini({ system, user, maxTokens }) {
  const key = process.env.GEMINI_API_KEY;
  let lastErr = "";
  for (const model of GEMINI_MODELS()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4, responseMimeType: "application/json" },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";
    }
    const body = await res.text().catch(() => "");
    lastErr = `Gemini ${model} ${res.status}: ${body.slice(0, 160)}`;
    // 429/404: جرّب الموديل التالي؛ أخطاء أخرى (مثل مفتاح غير صالح) لا فائدة من المتابعة
    if (res.status !== 429 && res.status !== 404) throw new Error(lastErr);
  }
  throw new Error(lastErr || "Gemini: كل الموديلات بلا حصة");
}

// ---------- Groq (مجاني، بدون بطاقة) — واجهة متوافقة مع OpenAI ----------
async function askGroq({ system, user, maxTokens }) {
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// يوجّه النداء للمزوّد المناسب
function callProvider(provider, args) {
  if (provider === "anthropic") return askAnthropic(args);
  if (provider === "gemini") return askGemini(args);
  if (provider === "groq") return askGroq(args);
  throw new Error(`مزوّد غير معروف: ${provider}`);
}

/**
 * يطلب من النموذج ردّاً على شكل JSON.
 * @returns {Promise<object|null>} كائن JSON أو null عند التعذّر
 */
export async function askJSON({ system, user, maxTokens = 2000 }) {
  const provider = activeProvider();
  if (!provider) return null;
  try {
    const text = await callProvider(provider, { system, user, maxTokens });
    return parseJSON(text);
  } catch (err) {
    console.warn(`[llm:${provider}] فشل نداء النموذج، سيُستخدم المحرّك الاحتياطي:`, err.message);
    return null;
  }
}

/**
 * فحص تشخيصي: يجري نداءً حقيقياً ويعيد الخطأ الفعلي إن فشل.
 * @returns {Promise<{provider:string|null, ok:boolean, error:string|null, sample?:string}>}
 */
export async function probe() {
  const provider = activeProvider();
  if (!provider) return { provider: null, ok: false, error: "لا يوجد مفتاح" };
  const args = { system: "أجب بصيغة JSON فقط.", user: 'أعِد: {"ok":true}', maxTokens: 50 };
  try {
    const text = await callProvider(provider, args);
    return { provider, ok: true, error: null, sample: String(text || "").slice(0, 120) };
  } catch (err) {
    return { provider, ok: false, error: String(err.message || err).slice(0, 300) };
  }
}

// يستخرج أول كتلة JSON صالحة من نص النموذج
export function parseJSON(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const startArr = raw.indexOf("[");
  const from = start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  if (from === -1) return null;
  const slice = raw.slice(from);
  try {
    return JSON.parse(slice);
  } catch {
    const lastObj = slice.lastIndexOf("}");
    const lastArr = slice.lastIndexOf("]");
    const to = Math.max(lastObj, lastArr);
    if (to > 0) {
      try { return JSON.parse(slice.slice(0, to + 1)); } catch { /* ignore */ }
    }
    return null;
  }
}
