// ============================================================
// عميل Claude — طبقة رقيقة حول Anthropic SDK
// إن لم يوجد مفتاح API يرجع isEnabled=false فتعمل الوكلاء
// بالمحرّك الاحتياطي (بيانات نموذجية) دون أي أعطال.
// ============================================================

let clientPromise = null;

export function isLLMEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function getClient() {
  if (!isLLMEnabled()) return null;
  if (!clientPromise) {
    clientPromise = import("@anthropic-ai/sdk")
      .then(({ default: Anthropic }) => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }))
      .catch((err) => {
        console.warn("[llm] تعذّر تحميل Anthropic SDK:", err.message);
        return null;
      });
  }
  return clientPromise;
}

const MODEL = () => process.env.MIJHAR_MODEL || "claude-sonnet-5";

/**
 * يطلب من النموذج ردّاً على شكل JSON.
 * @param {object} opts
 * @param {string} opts.system  توجيه النظام (دور الوكيل)
 * @param {string} opts.user    محتوى المستخدم (نص العقد + التعليمات)
 * @param {number} [opts.maxTokens]
 * @returns {Promise<object|null>} كائن JSON أو null عند التعذّر
 */
export async function askJSON({ system, user, maxTokens = 2000 }) {
  const client = await getClient();
  if (!client) return null;

  try {
    const res = await client.messages.create({
      model: MODEL(),
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });
    const text = res.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n") || "";
    return parseJSON(text);
  } catch (err) {
    console.warn("[llm] فشل نداء النموذج، سيُستخدم المحرّك الاحتياطي:", err.message);
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
    // محاولة قصّ إلى آخر قوس مغلق
    const lastObj = slice.lastIndexOf("}");
    const lastArr = slice.lastIndexOf("]");
    const to = Math.max(lastObj, lastArr);
    if (to > 0) {
      try { return JSON.parse(slice.slice(0, to + 1)); } catch { /* ignore */ }
    }
    return null;
  }
}
