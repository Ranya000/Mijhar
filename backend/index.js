/* =========================================================
   مجهر — الباكند (طبقة Express)
   POST /api/analyze  { text, type }  →  تحليل مطابق لشكل الملف الشامل
   كل المنطق في core.js — هذا الملف توصيل فقط.
   ========================================================= */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// المشروع commonjs والحزمة تُصدَّر كـ ESM — هذا السطر يشتغل مع الحالتين
const SDK = require("@anthropic-ai/sdk");
const Anthropic = SDK.default || SDK.Anthropic || SDK;

const { validateInput, analyze, analyzeWithAgents, analyzeWithAgentsStream, errorToResponse } = require("./core");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.MAJHAR_MODEL || "claude-sonnet-5";
// افتراضياً: ٦ وكلاء مستقلين. MAJHAR_AGENTS=single يرجع لنداء واحد شامل.
const MULTI_AGENT = (process.env.MAJHAR_AGENTS || "multi").toLowerCase() !== "single";
const runAnalysis = MULTI_AGENT ? analyzeWithAgents : analyze;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json({ limit: "2mb" }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 120000,
  maxRetries: 2,
});

// ===================== المسارات =====================

app.get("/", (_req, res) => res.send("majhar backend"));

app.get("/health", (_req, res) =>
  res.json({ ok: true, model: MODEL, agents: MULTI_AGENT ? 6 : 1, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) })
);

app.post("/api/analyze", async (req, res) => {
  const started = Date.now();
  const { text, type } = req.body || {};

  const check = validateInput(text, type);
  if (!check.ok) return res.status(check.status).json({ error: check.error });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "المفتاح غير مضبوط في الخادم." });
  }

  try {
    const data = await runAnalysis(anthropic, MODEL, check.type, check.text);
    console.log(
      `[analyze] mode=${MULTI_AGENT ? "agents" : "single"} type=${check.type} score=${data.safetyScore} risks=${data.risks.length}${data._degraded ? ` degraded=${data._degraded.join(",")}` : ""} ${Date.now() - started}ms`
    );
    return res.json(data);
  } catch (err) {
    console.error("[analyze] failed:", err.message);
    const out = errorToResponse(err);
    return res.status(out.status).json({ error: out.error });
  }
});

// بثّ التقدّم: يرسل حدث "agent" لكل وكيل يخلص، ثم "done" بالنتيجة (أو "error").
// متاح فقط في وضع الوكلاء — الواجهة ترجع لـ /api/analyze لو تعذّر.
app.post("/api/analyze/stream", async (req, res) => {
  const started = Date.now();
  const { text, type } = req.body || {};

  const check = validateInput(text, type);
  if (!check.ok) return res.status(check.status).json({ error: check.error });
  if (!MULTI_AGENT) return res.status(409).json({ error: "البثّ متاح في وضع الوكلاء فقط." });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "المفتاح غير مضبوط في الخادم." });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const data = await analyzeWithAgentsStream(anthropic, MODEL, check.type, check.text, (ev) =>
      send("agent", ev)
    );
    console.log(
      `[stream] type=${check.type} score=${data.safetyScore} risks=${data.risks.length}${data._degraded ? ` degraded=${data._degraded.join(",")}` : ""} ${Date.now() - started}ms`
    );
    send("done", data);
  } catch (err) {
    console.error("[stream] failed:", err.message);
    const out = errorToResponse(err);
    send("error", { error: out.error });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Majhar backend -> http://localhost:${PORT}`);
  console.log(`model: ${MODEL} | mode: ${MULTI_AGENT ? "6 agents" : "single"} | key: ${process.env.ANTHROPIC_API_KEY ? "loaded" : "MISSING"}`);
});
