// ============================================================
// طبقة الاتصال بالباكند
// ============================================================

const BASE = import.meta.env.VITE_API_BASE || "";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `فشل الطلب (${res.status})`);
  }
  return res.json();
}

export async function fetchMeta() {
  const res = await fetch(`${BASE}/api/meta`);
  if (!res.ok) throw new Error("تعذّر جلب بيانات الخادم");
  return res.json();
}

export function analyzeContract({ contractType, text, financial }) {
  return post("/api/analyze", { contractType, text, financial });
}

export function recomputeFinancial({ contractType, financial }) {
  return post("/api/financial", { contractType, financial });
}
