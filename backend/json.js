/* =========================================================
   json.js — استخراج JSON من رد النموذج
   يتحمّل: أسوار ```json، مقدمة نصية، أقواس داخل النصوص العربية
   ========================================================= */

/** @returns {object} أول كائن JSON كامل في النص */
function extractJson(text) {
  let s = String(text).trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const start = s.indexOf("{");
  if (start === -1) throw new Error("no JSON object in model response");

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(s.slice(start, i + 1));
    }
  }
  throw new Error("unterminated JSON object (response may be truncated)");
}

module.exports = { extractJson };
