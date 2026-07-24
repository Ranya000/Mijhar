// ============================================================
// طبقة الذكاء الاصطناعي — تدعم مزوّدَين:
//   • Anthropic Claude  (عند وجود ANTHROPIC_API_KEY)
//   • Google Gemini     (عند وجود GEMINI_API_KEY — مجاني بدون بطاقة)
// إن لم يوجد أي مفتاح، تعمل الوكلاء بالمحرّك الاحتياطي دون أعطال.
// ============================================================

// اكتشاف المزوّد النشط (Claude له الأولوية إن توفّر مفتاحه)
export function activeProvider() {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
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
async function askGemini({ system, user, maxTokens }) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";
}

/**
 * يطلب من النموذج ردّاً على شكل JSON.
 * @returns {Promise<object|null>} كائن JSON أو null عند التعذّر
 */
export async function askJSON({ system, user, maxTokens = 2000 }) {
  const provider = activeProvider();
  if (!provider) return null;
  try {
    const text = provider === "anthropic"
      ? await askAnthropic({ system, user, maxTokens })
      : await askGemini({ system, user, maxTokens });
    return parseJSON(text);
  } catch (err) {
    console.warn(`[llm:${provider}] فشل نداء النموذج، سيُستخدم المحرّك الاحتياطي:`, err.message);
    return null;
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
