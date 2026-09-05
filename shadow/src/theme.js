// ============================================================
// ظِلّ (Shadow Agent) — الثوابت والهوية البصرية
// هوية مستقلة: قاعدة سوداء باردة + توهّج فيروزي/سماوي للحارس
// ============================================================

export const C = {
  bg: "#07080C",
  bg2: "#0B0D13",
  guard: "#16E0C0",   // لون الحارس (الظل) — فيروزي
  guard2: "#22B8FF",  // سماوي مكمّل
  ink: "#E7ECF3",
  sub: "rgba(231,236,243,0.55)",
  faint: "rgba(231,236,243,0.34)",
  line: "rgba(255,255,255,0.08)",
  panel: "rgba(255,255,255,0.035)",
};

// مستويات الحكم / الخطورة
export const risk = {
  critical: { bg: "#FF4D6D", light: "rgba(255,77,109,0.12)", text: "#FF6B85", label: "حرج" },
  high:     { bg: "#FF7A45", light: "rgba(255,122,69,0.12)", text: "#FF9466", label: "مرتفع" },
  medium:   { bg: "#FFB020", light: "rgba(255,176,32,0.12)", text: "#FFC24D", label: "متوسط" },
  safe:     { bg: "#16E0C0", light: "rgba(22,224,192,0.12)", text: "#3DEBCE", label: "آمن" },
};

// مصادر الأمر (منطقة الثقة)
export const trust = {
  user:     { label: "المستخدم", sub: "مصدر موثوق", color: "#16E0C0", icon: "user" },
  untrusted:{ label: "محتوى خارجي", sub: "غير موثوق — بريد/ملف/صفحة", color: "#FF4D6D", icon: "globe" },
  tool:     { label: "أداة/نظام", sub: "مصدر داخلي", color: "#22B8FF", icon: "tool" },
};

// فئات التهديد التي يحرسها الظل
export const THREATS = [
  { id: "mistake",   name: "خطأ من الذكاء",     desc: "قرار كارثي ناتج عن سوء فهم أو هلوسة", icon: "bug",     color: "#FF7A45" },
  { id: "injection", name: "حقن أوامر واختراق", desc: "تعليمات خبيثة مخبّأة في محتوى خارجي", icon: "inject",  color: "#FF4D6D" },
  { id: "exfil",     name: "تسريب بيانات",       desc: "إرسال بيانات حساسة خارج حدود الثقة",   icon: "leak",    color: "#B36BFF" },
  { id: "overreach", name: "تجاوز الصلاحيات",    desc: "إجراء مالي أو حسّاس فوق حدود السياسة",  icon: "gauge",   color: "#FFB020" },
];

// مراحل خط عمل الظل
export const STAGES = [
  { id: "intercept", name: "الاعتراض",  short: "إيقاف القرار قبل التنفيذ",            icon: "hand" },
  { id: "simulate",  name: "المحاكاة",  short: "تشغيل وهمي في بيئة معزولة (Sandbox)", icon: "flask" },
  { id: "verify",    name: "التحقّق",    short: "فحص النتيجة والمصدر والمخاطر",        icon: "scan" },
  { id: "verdict",   name: "الحكم",      short: "تمرير آمن أو منع",                    icon: "gavel" },
  { id: "repair",    name: "الإصلاح",    short: "بديل آمن يحقق نفس الهدف",             icon: "wrench" },
];

// أنماط مشتركة
export const base = {
  minHeight: "100vh", background: C.bg,
  backgroundImage: "radial-gradient(ellipse 75% 45% at 50% -10%, rgba(22,224,192,0.10) 0%, transparent 58%)",
  fontFamily: "Tajawal, sans-serif", direction: "rtl", color: C.ink,
};

export const mono = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export const chip = {
  display: "inline-flex", alignItems: "center", gap: 7,
  background: "rgba(22,224,192,0.10)", border: "1px solid rgba(22,224,192,0.28)",
  borderRadius: 100, padding: "5px 14px", fontSize: 13, color: "#7CF0DC", fontWeight: 700,
};
