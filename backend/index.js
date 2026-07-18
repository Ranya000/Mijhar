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

const { validateInput, analyze, errorToResponse } = require("./core");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.MAJHAR_MODEL || "claude-sonnet-5";

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
  res.json({ ok: true, model: MODEL, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) })
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
    const data = await analyze(anthropic, MODEL, check.type, check.text);
    console.log(
      `[analyze] type=${check.type} score=${data.safetyScore} risks=${data.risks.length} ${Date.now() - started}ms`
    );
    return res.json(data);
  } catch (err) {
    console.error("[analyze] failed:", err.message);
    const out = errorToResponse(err);
    return res.status(out.status).json({ error: out.error });
  }
});

app.listen(PORT, () => {
  console.log(`Majhar backend -> http://localhost:${PORT}`);
  console.log(`model: ${MODEL} | key: ${process.env.ANTHROPIC_API_KEY ? "loaded" : "MISSING"}`);
});
