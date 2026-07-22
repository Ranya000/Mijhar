// دوال تنسيق مشتركة (مطابقة لما في الواجهة)
export const fmt = (n) => Math.round(n).toLocaleString("en-US");
export const pct = (x) => Math.round(x * 100) + "%";
export const pct1 = (x) => (x * 100).toFixed(1).replace(/\.0$/, "") + "%";

// اشتقاق مستوى الخطورة من درجة الأمان (0..100)
export function levelFromScore(score) {
  return score >= 70 ? "green" : score >= 45 ? "yellow" : "red";
}
