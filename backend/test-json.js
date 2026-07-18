/* اختبار مستخرج الـ JSON — أسوأ ما يمكن أن يرجعه النموذج.
   node test-json.js  */

const { extractJson } = require("./json");

let fails = 0;
const ok = (label, fn, expect) => {
  let pass = false, got;
  try { got = fn(); pass = expect ? expect(got) : true; }
  catch (e) { got = e.message; pass = false; }
  console.log(`${pass ? "✅" : "❌"} ${label}${pass ? "" : `  ← ${JSON.stringify(got)}`}`);
  if (!pass) fails++;
};
const throws = (label, fn) => {
  let pass = false;
  try { fn(); } catch { pass = true; }
  console.log(`${pass ? "✅" : "❌"} ${label}`);
  if (!pass) fails++;
};

console.log("\n──────── استخراج JSON ────────");

// الحالة الطبيعية مع الحشو: الباكند يضيف "{" لأننا حشونا بداية رد النموذج
ok('حشو البداية "{"', () => extractJson('{' + '"safetyScore": 42}'), (r) => r.safetyScore === 42);

// النموذج تجاهل التعليمات ولف الرد بأسوار Markdown
ok("أسوار ```json", () => extractJson('```json\n{"safetyScore": 42}\n```'), (r) => r.safetyScore === 42);
ok("أسوار ``` بدون كلمة json", () => extractJson('```\n{"a":1}\n```'), (r) => r.a === 1);

// النموذج كتب مقدمة قبل الـ JSON
ok("مقدمة نصية قبل الـ JSON", () => extractJson('تفضل التحليل:\n{"safetyScore": 42}'), (r) => r.safetyScore === 42);
ok("كلام بعد الـ JSON", () => extractJson('{"a":1}\nأتمنى يفيدك!'), (r) => r.a === 1);

// ☠️ الحالة الخطيرة: أقواس داخل نص عربي — الـ regex الساذج ينكسر هنا
ok(
  "قوس { داخل نص عربي",
  () => extractJson('{"summary": "العقد فيه بند { غامض } يحتاج مراجعة", "safetyScore": 42}'),
  (r) => r.safetyScore === 42 && r.summary.includes("{")
);

// اقتباسات مهرّبة داخل النص
ok(
  'اقتباس مهرّب \\" داخل النص',
  () => extractJson('{"translated": "يقول \\"العائد مضمون\\" وهذا غير واقعي", "n": 7}'),
  (r) => r.n === 7 && r.translated.includes('"')
);

// كائنات متداخلة عميقة (شكل مجهر الحقيقي)
ok(
  "تداخل عميق + مصفوفات",
  () => extractJson('{"exposure":{"scenarios":{"best":1,"expected":2,"worst":0},"sources":[{"label":"رسوم","yr":100}]}}'),
  (r) => r.exposure.scenarios.worst === 0 && r.exposure.sources[0].yr === 100
);

// شرطة مائلة قبل قوس داخل نص
ok("شرطة مائلة في النص", () => extractJson('{"a":"C:\\\\path\\\\x","b":2}'), (r) => r.b === 2);

// حالات الفشل — لازم ترمي خطأ واضح بدل ما ترجع بيانات ناقصة
throws("رد بلا JSON إطلاقاً", () => extractJson("عذراً، لا أستطيع تحليل هذا العقد."));
throws("JSON مقطوع (max_tokens)", () => extractJson('{"summary":"نص طويل","risks":[{"text":"خطر"'));
throws("JSON غير صالح", () => extractJson('{"a": undefined}'));

console.log(`\n${fails === 0 ? "🎉 المستخرج صامد" : `⚠️  ${fails} اختبار فشل`}\n`);
process.exit(fails === 0 ? 0 : 1);
