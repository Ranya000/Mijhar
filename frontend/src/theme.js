// ============================================================
// الثوابت والأنماط المشتركة (مستخرجة من تصميم الفريق الأصلي)
// ============================================================

export const AGENTS = [
  { id: "risks",     name: "كاشف المخاطر",      short: "يحدد كل بند خطير ويصنّفه",           color: "#FF3B3B", icon: "shield" },
  { id: "hidden",    name: "كاشف المخفي",       short: "يكشف الثغرات والبنود الغامضة",        color: "#B03CFF", icon: "search" },
  { id: "market",    name: "مقارنة السوق",      short: "يقارن بنودك بالمعتاد في السوق",       color: "#FFB800", icon: "chart" },
  { id: "future",    name: "النظرة المستقبلية", short: "يوضح وش بيصير لك بعد التوقيع",         color: "#00C48C", icon: "lighthouse" },
  { id: "financial", name: "الأثر المالي",      short: "يحلل دخلك ويقرر إذا العقد يناسبك",    color: "#0EC9E0", icon: "wallet" },
  { id: "object",    name: "وكيل الاعتراض",     short: "يكتب لك رسالة اعتراض قانونية جاهزة",  color: "#3C8FFF", icon: "pen" },
];

export const CONTRACT_TYPES = [
  { label: "عقد إيجار", key: "rental", icon: "file" },
  { label: "عقد تمويل", key: "financing", icon: "chart" },
  { label: "عقد استثماري", key: "investment", icon: "shield" },
];

export const levelColors = {
  red:    { bg: "#FF3B3B", light: "rgba(255,59,59,0.12)",  text: "#FF5C5C", label: "خطر" },
  yellow: { bg: "#FFB800", light: "rgba(255,184,0,0.12)",  text: "#FFC847", label: "تنبيه" },
  green:  { bg: "#00C48C", light: "rgba(0,196,140,0.12)",  text: "#1FD89E", label: "آمن" },
};

export const fmt = (n) => Math.round(n).toLocaleString("en-US");
export const pct = (x) => Math.round(x * 100) + "%";
export const pct1 = (x) => (x * 100).toFixed(1).replace(/\.0$/, "") + "%";
export const order = (l) => (l === "red" ? 3 : l === "yellow" ? 2 : 1);

// أنماط مشتركة
export const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 7,
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "8px 16px",
  fontSize: 13, cursor: "pointer", fontWeight: 600,
};
export const labelStyle = { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, marginBottom: 10 };
export const fileBtn = {
  flex: 1, padding: "11px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
  color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
};
export const thCell = { textAlign: "right", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" };
export const tdCell = { textAlign: "right", padding: "13px 16px", fontSize: 13.5, verticalAlign: "middle" };

export const baseStyle = {
  minHeight: "100vh", background: "#0A0A0F",
  backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,60,255,0.18) 0%, transparent 60%)",
  fontFamily: "Tajawal, sans-serif", direction: "rtl", color: "white",
};
export const headerStyle = {
  borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 28px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  position: "sticky", top: 0, zIndex: 100,
  background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)",
};
