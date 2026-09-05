import { useState, useRef, useEffect } from "react";
import { C, risk, trust, THREATS, STAGES, base, mono, chip } from "./theme.js";
import { Icon, Logo, Card, Pill, Code, GlobalStyles } from "./ui.jsx";
import { SCENARIOS } from "./scenarios.js";

const STAGE_ORDER = STAGES.map((s) => s.id);

export default function App() {
  return (
    <div style={base}>
      <GlobalStyles />
      <Header />
      <Hero />
      <HowItWorks />
      <Console />
      <Threats />
      <Footer />
    </div>
  );
}

/* ======================= HEADER ======================= */
function Header() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "14px 26px",
      borderBottom: `1px solid ${C.line}`, background: "rgba(7,8,12,0.82)", backdropFilter: "blur(20px)",
    }} className="shadow-nav">
      <Logo size={34} />
      <nav className="hide-sm" style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14, fontWeight: 700, color: C.sub }}>
        <a onClick={() => go("how")} style={{ cursor: "pointer" }}>كيف يعمل</a>
        <a onClick={() => go("console")} style={{ cursor: "pointer" }}>التجربة الحيّة</a>
        <a onClick={() => go("threats")} style={{ cursor: "pointer" }}>ماذا يحرس</a>
      </nav>
      <button onClick={() => go("console")} style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px",
        background: `linear-gradient(135deg, ${C.guard}, ${C.guard2})`, border: "none",
        borderRadius: 11, color: "#04140F", fontSize: 14, fontWeight: 800, cursor: "pointer",
        boxShadow: "0 6px 22px rgba(22,224,192,0.34)",
      }}>
        <Icon name="play" size={13} color="#04140F" /> جرّب الظل
      </button>
    </header>
  );
}

/* ======================= HERO ======================= */
function Hero() {
  const go = () => document.getElementById("console")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "70px 24px 30px", textAlign: "center" }}>
      <div style={{ ...chip, marginBottom: 22 }}>
        <Icon name="shield" size={14} color={C.guard} /> طبقة حماية بين المستخدم والذكاء الاصطناعي
      </div>
      <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.18, letterSpacing: "-0.5px" }}>
        قبل ما ينفّذ الذكاء أي قرار مهم،
        <br />
        <span style={{ background: `linear-gradient(120deg, ${C.guard}, ${C.guard2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          الظِّلّ يجرّبه أولاً
        </span>
      </h1>
      <p style={{ color: C.sub, fontSize: 17.5, lineHeight: 1.95, maxWidth: 640, margin: "0 auto 34px" }}>
        وكيل حارس يعترض القرار، يحاكيه وهمياً في بيئة معزولة، ويتأكد من نتيجته. وإذا كان فيه خطر —
        سواء غلطة من الذكاء أو لأنه <b style={{ color: C.ink }}>مُخترَق ومخدوع</b> — يمنعه، ثم يبحث عن
        <b style={{ color: "#7CF0DC" }}> بديل آمن يحقّق نفس هدفك</b> بدل مجرّد الرفض.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 46 }}>
        <button onClick={go} className="lift" style={{
          display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 32px",
          background: `linear-gradient(135deg, ${C.guard}, ${C.guard2})`, border: "none", borderRadius: 13,
          color: "#04140F", fontSize: 17, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 8px 30px rgba(22,224,192,0.4)",
        }}>
          <Icon name="play" size={16} color="#04140F" /> شغّل التجربة الحيّة
        </button>
        <button onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 26px",
          background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, borderRadius: 13,
          color: C.ink, fontSize: 15.5, fontWeight: 700, cursor: "pointer",
        }}>
          كيف يعمل الظل؟
        </button>
      </div>

      <HeroDiagram />
    </section>
  );
}

function HeroDiagram() {
  return (
    <div style={{
      display: "flex", alignItems: "stretch", justifyContent: "center", gap: 0,
      flexWrap: "wrap", maxWidth: 820, margin: "0 auto",
    }}>
      <FlowNode icon="user" title="المستخدم" sub="الهدف الحقيقي" color={C.guard} />
      <FlowArrow />
      <div style={{
        position: "relative", flex: "1 1 260px", minWidth: 240,
        background: "linear-gradient(180deg, rgba(22,224,192,0.10), rgba(34,184,255,0.05))",
        border: `1px solid rgba(22,224,192,0.4)`, borderRadius: 18, padding: "18px 16px",
        boxShadow: "0 0 44px rgba(22,224,192,0.16)", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", insetInlineStart: 0, insetInlineEnd: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.guard}, transparent)`, animation: "scanLine 2.6s linear infinite", opacity: 0.7 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.guard}, ${C.guard2})`, display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 2.2s infinite" }}>
            <Icon name="shield" size={20} color="#04140F" />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>ظِلّ</div>
            <div style={{ fontSize: 11.5, color: "#7CF0DC", fontWeight: 700 }}>يعترض · يحاكي · يحكم</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, textAlign: "center" }}>
          كل قرار يمرّ من هنا. لا شيء يُنفَّذ قبل أن يجرّبه الظل ويتأكد من أمانه.
        </div>
      </div>
      <FlowArrow />
      <FlowNode icon="tool" title="التنفيذ" sub="أدوات · أموال · بيانات" color={C.guard2} />
    </div>
  );
}

function FlowNode({ icon, title, sub, color }) {
  return (
    <div style={{
      flex: "0 0 auto", width: 150, display: "flex", flexDirection: "column", alignItems: "center",
      gap: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.line}`,
      borderRadius: 16, padding: "18px 12px", justifyContent: "center",
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}1f`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={20} color={color} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 14.5 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: C.faint }}>{sub}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hide-sm" style={{ display: "flex", alignItems: "center", padding: "0 6px" }}>
      <Icon name="arrowl" size={22} color="rgba(22,224,192,0.6)" />
    </div>
  );
}

/* ======================= HOW IT WORKS ======================= */
function HowItWorks() {
  return (
    <section id="how" style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px" }}>
      <SectionHead
        tag="خط عمل الظل"
        title="خمس خطوات قبل أي قرار"
        sub="من لحظة اقتراح الذكاء للقرار وحتى التنفيذ الآمن — بلا استثناء."
      />
      <div className="stage-row">
        {STAGES.map((s, i) => (
          <div key={s.id} className="lift" style={{
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 15,
            padding: "18px 15px", position: "relative",
          }}>
            <div style={{ position: "absolute", top: 12, insetInlineEnd: 14, fontSize: 34, fontWeight: 900, color: "rgba(255,255,255,0.05)", fontFamily: mono }}>
              {i + 1}
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.guard}18`, border: `1px solid ${C.guard}38`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon name={s.icon} size={21} color={C.guard} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 5 }}>{s.name}</div>
            <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7 }}>{s.short}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================= CONSOLE (interactive) ======================= */
function Console() {
  const [sel, setSel] = useState(0);
  const [run, setRun] = useState(idleRun());
  const timers = useRef([]);
  const sc = SCENARIOS[sel];

  useEffect(() => () => clearTimers(timers), []);

  function pick(i) {
    clearTimers(timers);
    setRun(idleRun());
    setSel(i);
  }

  function start() {
    clearTimers(timers);
    const s = SCENARIOS[sel];
    setRun({ active: true, stage: "intercept", sim: 0, find: 0, verdict: false, safe: false, done: false });
    let t = 700;
    push(timers, () => setRun((r) => ({ ...r, stage: "simulate" })), t);
    s.sim.forEach((_, i) => { t += 640; push(timers, () => setRun((r) => ({ ...r, sim: i + 1 })), t); });
    t += 480;
    push(timers, () => setRun((r) => ({ ...r, stage: "verify" })), t);
    s.findings.forEach((_, i) => { t += 560; push(timers, () => setRun((r) => ({ ...r, find: i + 1 })), t); });
    t += 520;
    push(timers, () => setRun((r) => ({ ...r, stage: "verdict", verdict: true })), t);
    if (s.verdict === "blocked" && s.safe) {
      t += 950;
      push(timers, () => setRun((r) => ({ ...r, stage: "repair" })), t);
      t += 520;
      push(timers, () => setRun((r) => ({ ...r, safe: true, done: true })), t);
    } else {
      t += 750;
      push(timers, () => setRun((r) => ({ ...r, done: true })), t);
    }
  }

  const curIdx = run.stage ? STAGE_ORDER.indexOf(run.stage) : -1;
  const isBlocked = sc.verdict === "blocked";

  return (
    <section id="console" style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 56px" }}>
      <SectionHead
        tag="التجربة الحيّة"
        title="شاهد الظل يعترض قراراً خطيراً"
        sub="اختر حالة، واضغط «شغّل الظل» لتشاهد الاعتراض والمحاكاة والحكم والبديل الآمن — خطوة بخطوة."
      />

      <div className="console-grid">
        {/* قائمة الحالات */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: C.faint, padding: "0 4px 2px", letterSpacing: 0.3 }}>الحالات الواردة</div>
          {SCENARIOS.map((s, i) => {
            const th = THREATS.find((t) => t.id === s.threat);
            const on = i === sel;
            return (
              <button key={s.id} onClick={() => pick(i)} style={{
                textAlign: "right", background: on ? "rgba(22,224,192,0.10)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${on ? "rgba(22,224,192,0.4)" : C.line}`, borderRadius: 13,
                padding: "12px 13px", cursor: "pointer", transition: "all .18s", position: "relative",
              }}>
                {on && <span style={{ position: "absolute", insetInlineStart: -1, top: 12, bottom: 12, width: 3, borderRadius: 4, background: C.guard }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: th ? `${th.color}1c` : `${risk.safe.bg}1c`, border: `1px solid ${th ? th.color : risk.safe.bg}3a`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={th ? th.icon : "check"} size={15} color={th ? th.color : risk.safe.bg} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: on ? C.ink : "rgba(231,236,243,0.85)" }}>{s.title}</div>
                </div>
                <div style={{ fontSize: 11, color: C.faint }}>{th ? th.name : "قرار سليم"}</div>
              </button>
            );
          })}
        </div>

        {/* لوحة التشغيل */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DecisionCard sc={sc} />

          {/* شريط المراحل + زر التشغيل */}
          <Card style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: run.active ? 14 : 0, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>خط عمل الظل</div>
              {!run.active ? (
                <button onClick={start} style={runBtn}>
                  <Icon name="play" size={13} color="#04140F" /> شغّل الظل
                </button>
              ) : run.done ? (
                <button onClick={start} style={{ ...runBtn, background: "rgba(255,255,255,0.06)", color: C.ink, boxShadow: "none", border: `1px solid ${C.line}` }}>
                  <Icon name="replay" size={14} color={C.ink} /> أعد التشغيل
                </button>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#7CF0DC", fontWeight: 700 }}>
                  <span className="spin" style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(22,224,192,0.3)", borderTopColor: C.guard }} />
                  الظل يعمل…
                </span>
              )}
            </div>
            {run.active && (
              <div className="stage-row">
                {STAGES.map((s, i) => {
                  const skipped = s.id === "repair" && !isBlocked && run.done;
                  const done = i < curIdx || (run.done && !skipped);
                  const active = i === curIdx && !run.done;
                  const col = skipped ? C.faint : done ? risk.safe.bg : active ? C.guard : "rgba(255,255,255,0.2)";
                  return (
                    <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: skipped ? 0.5 : done || active ? 1 : 0.45 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: (done || active) && !skipped ? `${col}1e` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${(done || active) && !skipped ? col + "55" : C.line}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: active ? "pulse 1.6s infinite" : "none",
                      }}>
                        {done && !skipped ? <Icon name="check" size={15} color={col} /> : <Icon name={s.icon} size={15} color={col} />}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: (done || active) && !skipped ? C.ink : C.faint, textAlign: "center" }}>{s.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* المحاكاة */}
          {curIdx >= 1 && <SimPanel sc={sc} shown={run.sim} />}

          {/* التحقق */}
          {curIdx >= 2 && <FindingsPanel sc={sc} shown={run.find} />}

          {/* الحكم */}
          {run.verdict && <VerdictPanel sc={sc} />}

          {/* الإصلاح */}
          {run.safe && sc.safe && <SafePanel sc={sc} />}
        </div>
      </div>
    </section>
  );
}

function DecisionCard({ sc }) {
  const src = trust[sc.source];
  const th = THREATS.find((t) => t.id === sc.threat);
  return (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="spark" size={12} color={C.guard2} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>قرار مقترَح من الذكاء الأساسي</span>
        </div>
        <Pill color={src.color} text={`${src.label} · ${src.sub}`} />
      </div>

      <Field label="هدف المستخدم" icon="target" color={C.guard}>
        {sc.userGoal}
      </Field>

      {sc.ai.injected && (
        <div style={{ margin: "12px 0", background: "rgba(255,77,109,0.07)", border: "1px dashed rgba(255,77,109,0.4)", borderRadius: 11, padding: "11px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 800, color: risk.critical.text, marginBottom: 5 }}>
            <Icon name="inject" size={13} color={risk.critical.bg} /> تعليمات مدسوسة داخل المحتوى
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,179,194,0.92)", lineHeight: 1.8 }}>{sc.ai.injected}</div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.faint }}>الإجراء الذي سيُنفّذه ({sc.ai.kind})</span>
          {th && <Pill color={th.color} text={th.name} />}
        </div>
        <Code tone={sc.verdict === "approved" ? "safe" : "danger"}>{sc.ai.action}</Code>
        <div style={{ fontSize: 12.5, color: C.sub, marginTop: 8, lineHeight: 1.7 }}>{sc.ai.summary}</div>
      </div>
    </Card>
  );
}

function Field({ label, icon, color, children }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}3a`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <Icon name={icon} size={14} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.faint, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}

function SimPanel({ sc, shown }) {
  return (
    <Card className="fade" style={{ padding: "16px 18px", animation: "fadeUp .4s ease both" }}>
      <PanelHead icon="flask" color={C.guard2} title="المحاكاة" sub="تشغيل وهمي في بيئة معزولة — لا أثر حقيقي" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {sc.sim.slice(0, shown).map((row, i) => (
          <div key={i} className="fadein" style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, lineHeight: 1.6, fontFamily: mono, direction: "rtl" }}>
            <span style={{ marginTop: 2, flexShrink: 0 }}>
              <Icon name={row.ok ? "check" : "warning"} size={14} color={row.ok ? risk.safe.bg : risk.high.bg} />
            </span>
            <span style={{ color: row.ok ? "rgba(231,236,243,0.75)" : "#FFC7A3" }}>{row.t}</span>
          </div>
        ))}
        {shown < sc.sim.length && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.faint, fontFamily: mono }}>
            <span className="spin" style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: C.guard2 }} /> يحاكي…
          </div>
        )}
      </div>
    </Card>
  );
}

function FindingsPanel({ sc, shown }) {
  return (
    <Card className="fade" style={{ padding: "16px 18px", animation: "fadeUp .4s ease both" }}>
      <PanelHead icon="scan" color={risk.high.bg} title="التحقّق" sub="ما رصده الظل من مخاطر ومصدر الأمر" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {sc.findings.slice(0, shown).map((f, i) => {
          const r = risk[f.sev];
          return (
            <div key={i} className="fadein" style={{ display: "flex", alignItems: "flex-start", gap: 10, background: r.light, border: `1px solid ${r.bg}33`, borderRadius: 10, padding: "10px 12px" }}>
              <Pill color={r.bg} text={r.label} />
              <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.65 }}>{f.t}</span>
            </div>
          );
        })}
        {shown < sc.findings.length && (
          <div style={{ fontSize: 12, color: C.faint, fontFamily: mono }}>يفحص…</div>
        )}
      </div>
    </Card>
  );
}

function VerdictPanel({ sc }) {
  const blocked = sc.verdict === "blocked";
  const col = blocked ? risk.critical : risk.safe;
  return (
    <div className="fade" style={{
      background: col.light, border: `1.5px solid ${col.bg}55`, borderRadius: 16,
      padding: "18px 20px", boxShadow: `0 0 34px ${col.bg}1f`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: `${col.bg}22`, border: `1px solid ${col.bg}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={blocked ? "block" : "check"} size={24} color={col.bg} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
            <span style={{ fontWeight: 900, fontSize: 18, color: col.text }}>{blocked ? "مُنِع القرار" : "تمّت الموافقة"}</span>
            <Pill color={col.bg} text={blocked ? "قرار خطير" : "قرار آمن"} />
          </div>
          <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.75 }}>{sc.reason}</div>
        </div>
      </div>
    </div>
  );
}

function SafePanel({ sc }) {
  return (
    <Card className="fade" style={{ padding: "18px 20px", border: `1px solid ${risk.safe.bg}44`, background: "rgba(22,224,192,0.05)", animation: "fadeUp .4s ease both" }}>
      <PanelHead icon="wrench" color={risk.safe.bg} title={sc.safe.title} sub="الظل لا يكتفي بالمنع — يقترح مساراً بديلاً يحقّق هدفك بأمان" />
      <div style={{ marginTop: 13 }}>
        <Code tone="safe">{sc.safe.action}</Code>
        <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.8, marginTop: 11 }}>{sc.safe.note}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 13, background: "rgba(22,224,192,0.12)", border: `1px solid ${risk.safe.bg}44`, borderRadius: 10, padding: "9px 13px" }}>
          <Icon name="target" size={15} color={risk.safe.bg} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#93F3E3" }}>{sc.safe.gain}</span>
        </div>
      </div>
    </Card>
  );
}

function PanelHead({ icon, color, title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}1c`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={17} color={color} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: C.faint, marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ======================= THREATS ======================= */
function Threats() {
  return (
    <section id="threats" style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px" }}>
      <SectionHead
        tag="ماذا يحرس الظل"
        title="أربع فئات من الخطر"
        sub="سواء كان الخطر غلطة من الذكاء أو اختراقاً خارجياً — الظل يوقفه قبل التنفيذ."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {THREATS.map((t) => (
          <div key={t.id} className="lift" style={{ background: C.panel, border: `1px solid ${t.color}22`, borderRadius: 16, padding: "20px" }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${t.color}18`, border: `1px solid ${t.color}3a`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 13 }}>
              <Icon name={t.icon} size={22} color={t.color} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 7 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.75 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Principle icon="layers" title="فصل البيانات عن الأوامر" text="المحتوى الخارجي (بريد/ملف/صفحة) يُقرأ كبيانات، ولا يُنفَّذ كأوامر مهما ادّعى." />
        <Principle icon="lock" title="أقل قدر من الصلاحيات والبيانات" text="لا يُرسل ولا يُحذف ولا يُصرّح إلا بالقدر الذي يحتاجه هدف المستخدم فعلاً." />
        <Principle icon="wrench" title="بديل بدل الرفض" text="عند الخطر، يبحث الظل عن مسار آمن يحقّق نفس الهدف، ويصعّد للبشر عند الحاجة." />
      </div>
    </section>
  );
}

function Principle({ icon, title, text }) {
  return (
    <div style={{ background: "rgba(22,224,192,0.04)", border: `1px solid rgba(22,224,192,0.18)`, borderRadius: 14, padding: "17px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <Icon name={icon} size={18} color={C.guard} />
        <span style={{ fontWeight: 800, fontSize: 14.5 }}>{title}</span>
      </div>
      <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.75 }}>{text}</div>
    </div>
  );
}

/* ======================= SHARED ======================= */
function SectionHead({ tag, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 30 }}>
      <div style={{ ...chip, marginBottom: 14 }}>{tag}</div>
      <h2 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.3px" }}>{title}</h2>
      <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>{sub}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 30, padding: "30px 24px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Logo size={30} /></div>
      <p style={{ color: C.faint, fontSize: 12.5, margin: 0, maxWidth: 520, marginInline: "auto", lineHeight: 1.8 }}>
        ظِلّ — نموذج توضيحي لوكيل حارس يحمي الذكاء الاصطناعي من أخطائه ومن اختراقه. الحالات المعروضة للتوضيح.
      </p>
    </footer>
  );
}

/* ======================= run helpers ======================= */
function idleRun() {
  return { active: false, stage: null, sim: 0, find: 0, verdict: false, safe: false, done: false };
}
function clearTimers(ref) {
  ref.current.forEach(clearTimeout);
  ref.current = [];
}
function push(ref, fn, ms) {
  ref.current.push(setTimeout(fn, ms));
}

const runBtn = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px",
  background: `linear-gradient(135deg, ${C.guard}, ${C.guard2})`, border: "none",
  borderRadius: 10, color: "#04140F", fontSize: 13.5, fontWeight: 800, cursor: "pointer",
  boxShadow: "0 5px 18px rgba(22,224,192,0.32)",
};
