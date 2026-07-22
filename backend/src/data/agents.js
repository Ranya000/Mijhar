// ============================================================
// تعريف الوكلاء الستة — بيانات مشتركة بين الباكند والواجهة
// ============================================================

export const AGENTS = [
  { id: "risks",     name: "كاشف المخاطر",      short: "يحدد كل بند خطير ويصنّفه",           color: "#FF3B3B", icon: "shield" },
  { id: "hidden",    name: "كاشف المخفي",       short: "يكشف الثغرات والبنود الغامضة",        color: "#B03CFF", icon: "search" },
  { id: "market",    name: "مقارنة السوق",      short: "يقارن بنودك بالمعتاد في السوق",       color: "#FFB800", icon: "chart" },
  { id: "future",    name: "النظرة المستقبلية", short: "يوضح وش بيصير لك بعد التوقيع",         color: "#00C48C", icon: "lighthouse" },
  { id: "financial", name: "الأثر المالي",      short: "يحلل دخلك ويقرر إذا العقد يناسبك",    color: "#0EC9E0", icon: "wallet" },
  { id: "object",    name: "وكيل الاعتراض",     short: "يكتب لك رسالة اعتراض قانونية جاهزة",  color: "#3C8FFF", icon: "pen" },
];

export const AGENT_IDS = AGENTS.map((a) => a.id);

// أنواع العقود المدعومة (المفتاح البرمجي ← الاسم العربي)
export const CONTRACT_TYPES = {
  rental:     "عقد إيجار",
  financing:  "عقد تمويل",
  investment: "عقد استثماري",
};

export const CONTRACT_KEYS = Object.keys(CONTRACT_TYPES);

// مستويات الخطورة الموحّدة
export const LEVELS = ["red", "yellow", "green"];
