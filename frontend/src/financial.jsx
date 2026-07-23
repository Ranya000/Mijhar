// ============================================================
// لوحة الأثر المالي — تتكيّف مع نوع العقد (إيجار/تمويل/استثمار)
// تعرض التعرّض المالي دائماً، وحاسبة تفاعلية تعيد الحساب من الباكند.
// ============================================================
import { useState, useEffect, useRef } from "react";
import { levelColors, fmt, pct, ghostBtn } from "./theme.js";
import { Icon, Card, ScoreMeter, MeterBar, Divider, CostChart } from "./ui.jsx";
import { recomputeFinancial } from "./api.js";

const TEAL = "#0EC9E0";

// ---- إعداد النِسب المعروضة حسب نوع العقد ----
function ratiosFor(contractKey, fin) {
  if (contractKey === "financing") {
    return [
      { title: "نسبة القسط من الدخل", value: fin.burden, threshold: 0.28, thresholdLabel: "المريح 28%", max: 0.7, color: TEAL },
      { title: "عبء الدين (DBR)", value: fin.dbr, threshold: 0.45, thresholdLabel: "حد ساما 45%", max: 1, color: "#8B6CFF" },
    ];
  }
  if (contractKey === "investment") {
    return [
      { title: "نسبة التركيز من ثروتك", value: fin.conc, threshold: 0.15, thresholdLabel: "الموصى ≤15%", max: 1, color: TEAL },
    ];
  }
  return [
    { title: "نسبة الإيجار من الدخل", value: fin.housing, threshold: 0.30, thresholdLabel: "السقف 30%", max: 0.7, color: TEAL },
    { title: "نسبة إجمالي الالتزامات", value: fin.dti, threshold: 0.40, thresholdLabel: "الآمن 40%", max: 1, color: "#8B6CFF" },
  ];
}

export function FinancialPanel({ d, contractType, contractKey, goto }) {
  const exp = d.exposure;
  const schema = d.financial.schema;
  const [a, setA] = useState(d.financial.input.a);
  const [b, setB] = useState(d.financial.input.b);
  const [fin, setFin] = useState(d.financial);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState(null);       // null | "bank" | "manual"
  const [connecting, setConnecting] = useState(false);
  const debounce = useRef(null);

  // إعادة الحساب لحظياً عند تغيير المدخلات (بعد ظهور النتيجة)
  useEffect(() => {
    if (!ready) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      recomputeFinancial({ contractType, financial: { a, b } })
        .then(setFin).catch(() => {});
    }, 220);
    return () => clearTimeout(debounce.current);
  }, [a, b, ready, contractType]);

  const connectBank = () => {
    setConnecting(true); setMode("bank");
    setTimeout(() => { setConnecting(false); setReady(true); }, 1800);
  };

  const c = levelColors[fin.level];
  const ratios = ratiosFor(contractKey, fin);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ===== التعرّض المالي (يظهر دائماً) ===== */}
      <ExposureHero exp={exp} />
      <ScenarioBar exp={exp} />
      <CostChart data={d.costProjection} />
      <SourcesBreakdown exp={exp} />
      {exp.conditional && <ConditionalCards exp={exp} />}

      {/* ===== القدرة على التحمّل ===== */}
      <Divider label="هل يناسب وضعك المالي؟" />

      {!ready && (
        <>
          <Card>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.85, margin: 0 }}>
              عشان نعرف إذا هذا العقد يناسب وضعك، نحتاج نفهم {schema.aLabel.includes("ثروة") ? "ثروتك ومبلغ الاستثمار" : "دخلك والتزاماتك"}. اختر الطريقة الأنسب:
            </p>
          </Card>

          {!mode && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
              <ChoiceCard color={TEAL} icon="bank" title="ربط حساب بنكي" desc="نقرأ بياناتك المالية تلقائياً (محاكاة)" badge="الأسرع" onClick={connectBank} />
              <ChoiceCard color="#8B6CFF" icon="pen" title="إدخال يدوي" desc="أدخل أرقامك بنفسك في خطوة واحدة" onClick={() => setMode("manual")} />
            </div>
          )}

          {mode === "bank" && connecting && (
            <Card style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ width: 56, height: 56, margin: "0 auto 18px", borderRadius: "50%", border: `3px solid ${TEAL}33`, borderTopColor: TEAL, animation: "spin .9s linear infinite" }} />
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>جاري الربط الآمن مع البنك...</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>نقرأ بياناتك المالية لتحديد قدرتك</div>
            </Card>
          )}

          {mode === "manual" && (
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <SliderField label={`${schema.aLabel} (${schema.aUnit || "ر.س"})`} value={a} setValue={setA} min={schema.aMin} max={schema.aMax} step={500} color={TEAL} />
                <SliderField label={`${schema.bLabel} (${schema.bUnit || "ر.س"})`} value={b} setValue={setB} min={schema.bMin} max={schema.bMax} step={250} color="#8B6CFF" />
                <button onClick={() => setReady(true)} className="hover-lift" style={{ background: `linear-gradient(135deg, ${TEAL}, #12A8C4)`, border: "none", color: "#04222A", fontWeight: 900, fontSize: 16, borderRadius: 12, padding: "14px", cursor: "pointer", boxShadow: `0 8px 28px ${TEAL}44` }}>
                  حلّل قدرتي المالية
                </button>
              </div>
            </Card>
          )}
        </>
      )}

      {ready && (
        <>
          {/* verdict hero */}
          <Card style={{ background: `linear-gradient(135deg, ${c.bg}14, ${TEAL}0A)`, border: `1px solid ${c.bg}38` }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                {mode === "bank" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: TEAL + "1A", border: `1px solid ${TEAL}33`, color: TEAL, fontSize: 11, fontWeight: 700, borderRadius: 100, padding: "3px 10px", marginBottom: 10 }}>
                    <Icon name="bank" size={12} color={TEAL} /> مرتبط بحساب بنكي (محاكاة)
                  </span>
                )}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>هل توقّع هذا العقد؟</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: c.text, lineHeight: 1.15 }}>{fin.verdict}</div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.8, margin: "10px 0 0", maxWidth: 420 }}>
                  {fin.summaryLine}
                </p>
              </div>
              <ScoreMeter score={fin.score} level={fin.level} size={150} />
            </div>
          </Card>

          {/* live adjust */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Icon name="trending" size={16} color={TEAL} />
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>جرّب أرقامك — التوصية تتغير لحظياً</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SliderField label={`${schema.aLabel} (${schema.aUnit || "ر.س"})`} value={a} setValue={setA} min={schema.aMin} max={schema.aMax} step={500} color={TEAL} />
              <SliderField label={`${schema.bLabel} (${schema.bUnit || "ر.س"})`} value={b} setValue={setB} min={schema.bMin} max={schema.bMax} step={250} color="#8B6CFF" />
            </div>
          </Card>

          {/* ratio meters */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {ratios.map((r, i) => (
              <RatioCard key={i} title={r.title} value={r.value} threshold={r.threshold} thresholdLabel={r.thresholdLabel} good={r.value <= r.threshold} color={r.color} max={r.max} />
            ))}
          </div>

          {/* cash flow */}
          <CashFlow contractKey={contractKey} fin={fin} a={a} />

          {/* reasons */}
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>لماذا هذه التوصية؟</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fin.reasons.map((r, i) => {
                const col = r.ok === true ? "#1FD89E" : r.ok === false ? "#FF5C5C" : "#FFC847";
                const ic = r.ok === true ? "check" : r.ok === false ? "x" : "info";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, background: col + "0F", border: `1px solid ${col}26`, borderRadius: 10, padding: "11px 13px" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: col + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Icon name={ic} size={13} color={col} />
                    </div>
                    <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>{r.text}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => goto("object")} className="hover-lift" style={{ marginTop: 16, width: "100%", background: "rgba(60,143,255,0.1)", border: "1px solid rgba(60,143,255,0.35)", color: "#5C9FFF", borderRadius: 12, padding: "12px", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon name="pen" size={15} color="#5C9FFF" /> اطلب رسالة اعتراض على القيمة المالية
            </button>
          </Card>

          <button onClick={() => { setReady(false); setMode(null); }} style={{ ...ghostBtn, alignSelf: "center", padding: "9px 18px" }}>
            إعادة إدخال البيانات المالية
          </button>
        </>
      )}

      <PrivacyNote />
    </div>
  );
}

// ---- التدفق النقدي المتكيّف حسب النوع ----
function CashFlow({ contractKey, fin, a }) {
  if (contractKey === "investment") {
    return (
      <Card>
        <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>توزيع رأس المال</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <MoneyTile label="صافي ثروتك" value={fin.netWorth} color="#1FD89E" />
          <MoneyTile label="مبلغ الاستثمار" value={-fin.investAmount} color="#FFC847" />
          <MoneyTile label="السيولة المتبقية" value={fin.remaining} color={fin.remaining < fin.netWorth * 0.4 ? "#FF5C5C" : "#0EC9E0"} strong />
        </div>
      </Card>
    );
  }
  const payLabel = contractKey === "financing" ? "قسط هذا التمويل" : "إيجار هذا العقد";
  const pay = contractKey === "financing" ? fin.installment : fin.rent;
  const upfrontLabel = contractKey === "financing" ? "رسوم ابتدائية (إدارية + تأمين)" : "دفعة التوقيع (إيجار + تأمين)";
  const penaltyLabel = contractKey === "financing" ? "غرامة السداد المبكر" : "غرامة الخروج المبكر";
  const penalty = contractKey === "financing" ? fin.earlySettle : fin.penalty;
  return (
    <Card>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>التدفق النقدي الشهري</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <MoneyTile label="الدخل" value={a} color="#1FD89E" />
        <MoneyTile label={payLabel} value={-pay} color="#FFC847" />
        <MoneyTile label="التزامات أخرى" value={-(fin.totalObl - pay)} color="#B08CFF" />
        <MoneyTile label="المتبقي لك" value={fin.remaining} color={fin.remaining < a * 0.25 ? "#FF5C5C" : "#0EC9E0"} strong />
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <InfoPill label={upfrontLabel} value={`${fmt(fin.upfront)} ر.س`} />
        <InfoPill label={penaltyLabel} value={`${fmt(penalty)} ر.س`} danger />
      </div>
    </Card>
  );
}

// ===================== EXPOSURE SUB-COMPONENTS =====================
function ExposureHero({ exp }) {
  return (
    <Card style={{ background: "linear-gradient(135deg, rgba(245,200,75,0.10), rgba(255,255,255,0.02))", border: "1px solid rgba(245,200,75,0.30)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon name="wallet" size={16} color="#F5C84B" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#F5C84B" }}>إجمالي التعرّض المتوقع</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: "#FFD56A", lineHeight: 1 }}>{fmt(exp.total3y)}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>ريال / 3 سنوات</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13.5, lineHeight: 1.8, margin: "10px 0 0" }}>
        بمعدل ~{fmt(exp.avgPerYear)} ريال سنوياً فوق ما يدفعه السوق على عقد مماثل.
      </p>
    </Card>
  );
}

function ScenarioBar({ exp }) {
  const s = exp.scenarios;
  return (
    <Card>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>سيناريوهات التعرّض</div>
      <div style={{ height: 12, borderRadius: 100, background: "linear-gradient(90deg, #FF5C5C, #F5C84B 50%, #1FD89E)", marginBottom: 16 }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, textAlign: "center" }}>
        <ScenarioCell value={s.best} color="#1FD89E" label="أفضل حالة" sub="بلا مفاجآت" />
        <ScenarioCell value={s.expected} color="#FFD56A" label="المتوقع" sub="على مدى 3 سنوات" />
        <ScenarioCell value={s.worst} color="#FF5C5C" label="أسوأ حالة" sub="مفاجآت وغرامات" />
      </div>
    </Card>
  );
}

function ScenarioCell({ value, color, label, sub }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{fmt(value)}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{sub}</div>
    </div>
  );
}

function SourcesBreakdown({ exp }) {
  const maxY3 = Math.max(...exp.sources.map((s) => s.y3));
  const colorOf = (lvl) => (lvl === "red" ? "#FF6B6B" : lvl === "yellow" ? "#FFC847" : "#1FD89E");
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 18 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 44, textAlign: "left" }}>3 سنوات</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 44, textAlign: "left" }}>سنوياً</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>من وين تطلع الفلوس؟</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {exp.sources.map((s, i) => {
          const col = colorOf(s.level);
          const w = Math.max(8, (s.y3 / maxY3) * 100);
          return (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 18, alignItems: "baseline", flexShrink: 0, paddingTop: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", minWidth: 44, textAlign: "left" }}>{fmt(s.y3)}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: col, minWidth: 44, textAlign: "left" }}>{fmt(s.yr)}</span>
                </div>
                <div style={{ minWidth: 0, textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: col, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    {s.rising && <span style={{ fontSize: 10.5, color: "#FFC847" }}>↗ متزايد</span>}{s.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 100, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${w}%`, borderRadius: 100, background: `linear-gradient(90deg, ${col}55, ${col})` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 16, paddingTop: 14 }}>
        <div style={{ display: "flex", gap: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#FFD56A", minWidth: 44, textAlign: "left" }}>{fmt(exp.total3y)}</span>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#FFD56A", minWidth: 44, textAlign: "left" }}>{fmt(exp.avgPerYear)}</span>
        </div>
        <span style={{ fontWeight: 900, fontSize: 14.5 }}>الإجمالي</span>
      </div>
    </Card>
  );
}

function ConditionalCards({ exp }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>تعرّض مشروط — إن حصل</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {exp.conditional.map((cc, i) => {
          const lc = levelColors[cc.level];
          return (
            <div key={i} style={{ background: lc.light, border: `1px solid ${lc.bg}44`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: lc.bg + "22", color: lc.text, border: `1px solid ${lc.bg}44`, fontSize: 11, fontWeight: 800, borderRadius: 100, padding: "3px 10px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: lc.bg }} /> {lc.label}
                </span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{cc.title}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: lc.text, marginBottom: 8 }}>{cc.amount}</div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, lineHeight: 1.8, margin: 0 }}>{cc.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== SMALL PIECES =====================
function ChoiceCard({ color, icon, title, desc, badge, onClick }) {
  return (
    <button onClick={onClick} className="hover-lift" style={{
      textAlign: "right", background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`,
      borderRadius: 16, padding: 20, cursor: "pointer", position: "relative",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}0D`; e.currentTarget.style.borderColor = `${color}66`; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.transform = "none"; }}>
      {badge && <span style={{ position: "absolute", insetInlineEnd: 16, top: 16, background: color + "22", color, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 9px" }}>{badge}</span>}
      <div style={{ width: 48, height: 48, borderRadius: 13, background: `${color}1A`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon name={icon} size={22} color={color} />
      </div>
      <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 6 }}>{title}</div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </button>
  );
}

function SliderField({ label, value, setValue, min, max, step, color }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 17, fontWeight: 900, color }}>{fmt(value)} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>ر.س</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%", background: `linear-gradient(90deg, ${color} ${fill}%, rgba(255,255,255,0.1) ${fill}%)` }} />
    </div>
  );
}

function RatioCard({ title, value, threshold, thresholdLabel, good, color, max = 0.7 }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: good ? "#1FD89E" : "#FF5C5C" }}>{pct(value)}</span>
      </div>
      <MeterBar value={Math.min(value, max)} max={max} color={good ? "#1FD89E" : "#FF5C5C"} threshold={threshold} thresholdLabel={thresholdLabel} />
      <div style={{ marginTop: 14, fontSize: 12, color: good ? "#1FD89E" : "#FF5C5C", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name={good ? "check" : "warning"} size={13} color={good ? "#1FD89E" : "#FF5C5C"} />
        {good ? "ضمن الحد الصحي" : "يتجاوز الحد الموصى به"}
      </div>
    </Card>
  );
}

function MoneyTile({ label, value, color, strong }) {
  const sign = value < 0 ? "−" : "";
  return (
    <div style={{ background: strong ? color + "12" : "rgba(255,255,255,0.03)", border: `1px solid ${strong ? color + "40" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "13px 14px" }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color }}>{sign}{fmt(Math.abs(value))} <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>ر.س</span></div>
    </div>
  );
}

function InfoPill({ label, value, danger }) {
  const col = danger ? "#FF5C5C" : "rgba(255,255,255,0.7)";
  return (
    <div style={{ flex: 1, minWidth: 160, background: danger ? "rgba(255,59,59,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${danger ? "rgba(255,59,59,0.22)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "10px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: col, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function PrivacyNote() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "0 4px" }}>
      <Icon name="lock" size={13} color="rgba(255,255,255,0.35)" />
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, lineHeight: 1.7, margin: 0 }}>
        نموذج تجريبي: لا نجمع أرقام بطاقات أو بيانات بنكية حقيقية. كل الأرقام التي تدخلها تبقى على جهازك وتُستخدم للحساب فقط.
      </p>
    </div>
  );
}
