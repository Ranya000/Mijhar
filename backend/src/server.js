// ============================================================
// خادم مجهر — Express API
// نقاط النهاية:
//   GET  /api/health            فحص الحالة
//   GET  /api/meta              الوكلاء وأنواع العقود والعقود التجريبية
//   POST /api/analyze           تحليل عقد { contractType, text, financial? }
// ============================================================

import express from "express";
import cors from "cors";
import { analyzeContract } from "./orchestrator.js";
import { AGENTS, CONTRACT_TYPES } from "./data/agents.js";
import { SAMPLE_ANALYSES, SAMPLE_CONTRACT_TEXTS, resolveContractKey } from "./data/index.js";
import * as financialAgent from "./agents/financialAgent.js";
import { isLLMEnabled } from "./lib/llm.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "mijhar-backend", ai: isLLMEnabled() });
  });

  app.get("/api/meta", (_req, res) => {
    res.json({
      agents: AGENTS,
      contractTypes: CONTRACT_TYPES,
      sampleTexts: SAMPLE_CONTRACT_TEXTS,
      ai: isLLMEnabled(),
    });
  });

  // إعادة حساب الأثر المالي فقط (للحاسبة التفاعلية/السلايدر)
  app.post("/api/financial", (req, res) => {
    try {
      const { contractType, financial } = req.body || {};
      const contractKey = resolveContractKey(contractType);
      if (!contractKey) return res.status(400).json({ error: "نوع عقد غير مدعوم." });
      const out = financialAgent.run({ contractKey, sample: SAMPLE_ANALYSES[contractKey], financial });
      res.json(out.financial);
    } catch (err) {
      console.error("[financial]", err);
      res.status(500).json({ error: err.message || "خطأ داخلي" });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { contractType, text, financial } = req.body || {};
      const result = await analyzeContract({ contractType, text, financial });
      res.json(result);
    } catch (err) {
      const status = err.status || 500;
      if (status === 500) console.error("[analyze]", err);
      res.status(status).json({ error: err.message || "خطأ داخلي" });
    }
  });

  return app;
}

// التشغيل المباشر (وليس عند الاستيراد للاختبارات)
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const port = process.env.PORT || 8787;
  createApp().listen(port, () => {
    console.log(`مجهر backend يعمل على http://localhost:${port}`);
    console.log(`الذكاء الاصطناعي: ${isLLMEnabled() ? "مُفعّل" : "المحرّك الاحتياطي (بدون مفتاح API)"}`);
  });
}
