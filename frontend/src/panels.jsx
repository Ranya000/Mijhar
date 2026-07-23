// ============================================================
// لوحات التحليل — مبنية على مخرجات الباكند (تعمل للعقود الثلاثة)
// ============================================================
import { useState, useRef, useEffect } from "react";
import { levelColors, fmt, pct, order, ghostBtn, thCell, tdCell, AGENTS } from "./theme.js";
import {
  Icon, Card, Badge, ScoreMeter, MeterBar, Stat, Divider,
  ClauseDetail, Legend, CostChart,
} from "./ui.jsx";
import { recomputeFinancial } from "./api.js";

// ===================== OVERVIEW =====================
export function Overview({ d, goto }) {
  const overallLevel = d.safetyLevel;
  const fin = d.financial;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: `linear-gradient(135deg, ${levelColors[overallLevel].bg}14 0%, rgba(107,60,255,.08) 100%)`, border: `1px solid ${levelColors[overallLevel].bg}33` }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Badge level={d.safetyLevel}>درجة أمان العقد</Badge>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: "12px 0 8px" }}>{d.contractType}</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14.5, lineHeight: 1.8, margin: 0, maxWidth: 460 }}>{d.summary}</p>
            <div style={{ marginTop: 16, display: "flex", gap: 18, flexWrap: "wrap" }}>
              <Stat n={d.risks.filter(r => r.level === "red").length} label="بنود خطيرة" color="#FF5C5C" />
              <Stat n={d.hiddenItems.length} label="بنود مخفية" color="#B08CFF" />
              <Stat n={d.marketComparison.filter(m => m.status === "bad").length} label="أسوأ من السوق" color="#FFC847" />
            </div>
          </div>
          <ScoreMeter score={d.safetyScore} level={d.safetyLevel} size={150} />
        </div>
      </Card>

      <Card style={{ border: `1px solid ${levelColors[overallLevel].bg}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Icon name={overallLevel === "green" ? "check" : "warning"} size={18} color={levelColors[overallLevel].bg} />
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>التوصية النهائية</h3>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: levelColors[overallLevel].text, marginBottom: 8 }}>
          {overallLevel === "green" ? "العقد مناسب لك" : overallLevel === "yellow" ? "وقّع بحذر بعد التفاوض" : "لا يُنصح بالتوقيع حالياً"}
        </div>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.8, margin: 0 }}>
          قانونياً: {d.safetyLevel === "green" ? "بنود مقبولة" : "توجد بنود تستحق الاعتراض"}. مالياً: {fin.summaryLine}
        </p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {AGENTS.map((a) => (
          <button key={a.id} onClick={() => goto(a.id)} className="hover-lift" style={{
            textAlign: "right", background: "rgba(255,255,255,0.03)", border: `1px solid ${a.color}26`,
            borderRadius: 14, padding: 16, cursor: "pointer",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${a.color}0D`; e.currentTarget.style.borderColor = `${a.color}55`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = `${a.color}26`; e.currentTarget.style.transform = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}18`, border: `1px solid ${a.color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={a.icon} size={17} color={a.color} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{a.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5 }}>{a.short}</span>
              <Icon name="chevron" size={15} color={a.color} />
            </div>
          </button>
        ))}
      </div>

      <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11.5, textAlign: "center", margin: "6px 0 0" }}>
        التحليل إرشادي ولا يُعدّ استشارة قانونية أو مالية رسمية.
      </p>
    </div>
  );
}

// ===================== RISKS =====================
export function RisksPanel({ d }) {
  const [expanded, setExpanded] = useState(0);
  const sorted = [...d.risks].sort((a, b) => order(b.level) - order(a.level));
  return (
    <div>
      <Legend />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {sorted.map((r, i) => {
          const c = levelColors[r.level];
          const open = expanded === i;
          return (
            <div key={i} style={{ border: `1px solid ${c.bg}33`, borderRadius: 12, overflow: "hidden" }}>
              <div onClick={() => setExpanded(open ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.light, padding: "13px 16px", cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.bg, flexShrink: 0 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{r.text}</span>
                  <span style={{ background: c.bg + "22", color: c.text, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 9px" }}>{c.label}</span>
                </div>
                <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .22s" }}><Icon name="chevron" size={16} color={c.bg} /></span>
              </div>
              {open && <ClauseDetail original={r.original} translated={r.translated} c={c} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== HIDDEN =====================
export function HiddenPanel({ d }) {
  const [expanded, setExpanded] = useState(0);
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, marginTop: 0, marginBottom: 16 }}>
        هذه بنود قد تمر عليك دون انتباه في النص الطويل، لكنها تحمل أثراً مالياً حقيقياً عليك. اضغط أي بند لرؤية النص الأصلي ومعناه المبسّط.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {d.hiddenItems.map((item, i) => {
          const c = levelColors[item.level];
          const open = expanded === i;
          return (
            <div key={i} style={{ border: `1px solid ${c.bg}33`, borderRadius: 12, overflow: "hidden", background: c.light }}>
              <div onClick={() => setExpanded(open ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.bg, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{item.title}</span>
                </div>
                <span style={{ transform: open ? "rotate(180deg)" : "none", transition: ".2s" }}><Icon name="chevron" size={16} color={c.bg} /></span>
              </div>
              {open && <ClauseDetail original={item.original} translated={item.translated} c={c} altLabel="إيش يعني؟" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== MARKET =====================
export function MarketPanel({ d }) {
  const bad = d.marketComparison.filter((m) => m.status === "bad").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, margin: 0 }}>
        بنود عقدك مقابل المعتاد في السوق السعودي — والفرق محسوباً بالريال.
      </p>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={thCell}>البند</th>
                <th style={thCell}>عقدك</th>
                <th style={thCell}>السوق</th>
                <th style={thCell}>الفرق</th>
              </tr>
            </thead>
            <tbody>
              {d.marketComparison.map((row, i) => {
                const isBad = row.status === "bad";
                const col = isBad ? "#FF6B6B" : "#1FD89E";
                return (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ ...tdCell, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{row.item}</td>
                    <td style={{ ...tdCell, fontWeight: 800, color: col }}>{row.yours}</td>
                    <td style={{ ...tdCell, color: "rgba(255,255,255,0.6)" }}>{row.market}</td>
                    <td style={tdCell}>
                      <span style={{ display: "inline-block", fontWeight: 800, fontSize: 12.5, color: col, background: col + "1A", border: `1px solid ${col}33`, borderRadius: 100, padding: "3px 11px", whiteSpace: "nowrap" }}>{row.diff}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <CostChart data={d.costProjection} />
      <Card style={{ background: bad >= 2 ? "rgba(255,59,59,0.07)" : "rgba(0,196,140,0.07)", border: `1px solid ${bad >= 2 ? "rgba(255,59,59,0.25)" : "rgba(0,196,140,0.25)"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name={bad >= 2 ? "warning" : "check"} size={18} color={bad >= 2 ? "#FF5C5C" : "#1FD89E"} />
          <span style={{ fontWeight: 800, fontSize: 14.5, color: bad >= 2 ? "#FF5C5C" : "#1FD89E" }}>الخلاصة</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 13.5, lineHeight: 1.8, margin: "8px 0 0" }}>
          عقدك أسوأ في {bad} من {d.marketComparison.length} بنود، والفرق يصل إلى نحو {fmt(d.costProjection.avgPerYear)} ريال سنوياً فوق السوق — وهي بنود قابلة للتفاوض قبل التوقيع.
        </p>
      </Card>
    </div>
  );
}

// ===================== FUTURE =====================
export function FuturePanel({ d }) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, marginTop: 0, marginBottom: 20 }}>
        ما الذي ينتظرك بعد توقيع هذا العقد؟ هذه الأحداث مرتّبة زمنياً كما ستقع فعلاً.
      </p>
      <div style={{ position: "relative", paddingInlineStart: 8 }}>
        <div style={{ position: "absolute", insetInlineStart: 23, top: 8, bottom: 8, width: 2, background: "linear-gradient(180deg, rgba(0,196,140,0.5), rgba(255,59,59,0.4))" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {d.futureTimeline.map((ev, i) => {
            const c = levelColors[ev.level];
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0A0A0F", border: `2px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 4px rgba(10,10,15,1)` }}>
                  <Icon name={ev.icon} size={15} color={c.bg} />
                </div>
                <div style={{ flex: 1, background: c.light, border: `1px solid ${c.bg}2E`, borderRadius: 12, padding: "12px 15px" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: c.text, marginBottom: 4 }}>{ev.when}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{ev.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===================== OBJECTION =====================
export function ObjectPanel({ d }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const handleCopy = (letter, idx) => {
    navigator.clipboard?.writeText(letter).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, marginTop: 0, marginBottom: 16 }}>
        رسائل اعتراض جاهزة صاغها الوكيل بناءً على ما كشفه باقي الوكلاء. انسخ أي رسالة وأرسلها للطرف الآخر كما هي.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {d.objectionLetters.map((item, i) => {
          const srcColor = item.source === "كاشف المخاطر" ? "#FF5C5C" : item.source === "كاشف المخفي" ? "#B08CFF" : item.source === "الأثر المالي" ? "#0EC9E0" : "#5C9FFF";
          return (
            <div key={i} style={{ background: "rgba(60,143,255,0.05)", border: "1px solid rgba(60,143,255,0.2)", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
                <div>
                  <span style={{ background: srcColor + "1A", color: srcColor, border: `1px solid ${srcColor}33`, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "3px 10px" }}>مصدر: {item.source}</span>
                  <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 8 }}>{item.issue}</div>
                </div>
                <button onClick={() => handleCopy(item.letter, i)} style={{
                  background: copiedIdx === i ? "rgba(0,196,140,0.15)" : "rgba(255,255,255,0.06)",
                  border: copiedIdx === i ? "1px solid rgba(0,196,140,0.35)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 9, padding: "7px 13px", cursor: "pointer",
                  color: copiedIdx === i ? "#1FD89E" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                }}>
                  <Icon name={copiedIdx === i ? "check" : "copy"} size={13} color={copiedIdx === i ? "#1FD89E" : "rgba(255,255,255,0.6)"} />
                  {copiedIdx === i ? "تم النسخ" : "نسخ"}
                </button>
              </div>
              <div style={{ background: "rgba(0,0,0,0.22)", borderRadius: 10, padding: "13px 15px", color: "rgba(255,255,255,0.78)", fontSize: 13.5, lineHeight: 1.9 }}>
                {item.letter}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
