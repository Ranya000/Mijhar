// ============================================================
// مكوّنات الواجهة المشتركة (منقولة من تصميم الفريق الأصلي)
// ============================================================
import { levelColors, fmt } from "./theme.js";

// ===================== ICONS =====================
export function Icon({ name, size = 20, color = "currentColor", strokeWidth = 2 }) {
  const s = { width: size, height: size, display: "inline-block", flexShrink: 0 };
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "shield":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "search":   return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case "chart":    return <svg style={s} viewBox="0 0 24 24" {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case "eye":      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "lighthouse": return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M9.5 21l1-11h3l1 11" /><rect x="9.5" y="5.5" width="5" height="4.5" rx="0.5" /><path d="M12 3v2.5M7 21h10M4.5 6.5l2 1M19.5 6.5l-2 1" /></svg>;
    case "pen":      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
    case "wallet":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M20 12V8H6a2 2 0 010-4h12v4" /><path d="M4 6v12a2 2 0 002 2h14v-4" /><path d="M18 12a2 2 0 000 4h4v-4z" /></svg>;
    case "upload":   return <svg style={s} viewBox="0 0 24 24" {...p}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></svg>;
    case "file":     return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    case "calendar": return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "lock":     return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
    case "warning":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "arrow":    return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case "chevron":  return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>;
    case "copy":     return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
    case "check":    return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
    case "x":        return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "bank":     return <svg style={s} viewBox="0 0 24 24" {...p}><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>;
    case "trending": return <svg style={s} viewBox="0 0 24 24" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
    case "info":     return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
    case "sparkle":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z" /><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>;
    case "grid":     return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "plus":     return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "percent":  return <svg style={s} viewBox="0 0 24 24" {...p}><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>;
    default: return null;
  }
}

// ===================== BRAND =====================
export function Logo({ size = 32, subtitle = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: "linear-gradient(135deg, #6B3CFF 0%, #B03CFF 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(107,60,255,0.4)", flexShrink: 0,
      }}>
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2" />
          <path d="M14.5 14.5L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="2.5" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
      <div>
        <div style={{ color: "white", fontWeight: 900, fontSize: size * 0.56, lineHeight: 1.1 }}>مجهر</div>
        {subtitle && <div style={{ color: "rgba(176,140,255,0.85)", fontSize: size * 0.34, fontWeight: 600 }}>كاشف المخاطر للأفراد</div>}
      </div>
    </div>
  );
}

export function ScoreMeter({ score, level, size = 140 }) {
  const color = levelColors[level];
  const r = size * 0.385;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.085} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color.bg} strokeWidth={size * 0.085}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color.bg})` }} />
        <text x="50%" y="46%" textAnchor="middle" fill="white" fontSize={size * 0.2} fontWeight="900" fontFamily="Tajawal, sans-serif">{score}</text>
        <text x="50%" y="62%" textAnchor="middle" fill={color.bg} fontSize={size * 0.093} fontWeight="700" fontFamily="Tajawal, sans-serif">{color.label}</text>
      </svg>
    </div>
  );
}

export function Badge({ level, children }) {
  const c = levelColors[level];
  return (
    <span style={{
      background: c.light, color: c.text, border: `1px solid ${c.bg}33`,
      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.bg }} />
      {children}
    </span>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 22px", ...style,
    }}>{children}</div>
  );
}

export function MeterBar({ value, max = 1, color, threshold, thresholdLabel }) {
  const w = Math.min(100, (value / max) * 100);
  const tPos = threshold != null ? Math.min(100, (threshold / max) * 100) : null;
  return (
    <div style={{ paddingBottom: thresholdLabel ? 18 : 0 }}>
      <div style={{ position: "relative", width: "100%", height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "visible" }}>
        <div style={{ position: "absolute", insetInlineStart: 0, top: 0, height: "100%", width: `${w}%`, background: color, borderRadius: 100, transition: "width .7s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 10px ${color}88` }} />
        {tPos != null && (
          <div style={{ position: "absolute", insetInlineStart: `${tPos}%`, top: -4, bottom: -4, width: 2, background: "rgba(255,255,255,0.6)", borderRadius: 2 }}>
            {thresholdLabel && (
              <span style={{ position: "absolute", top: 14, transform: "translateX(50%)", insetInlineStart: 0, whiteSpace: "nowrap", fontSize: 9.5, color: "rgba(255,255,255,0.5)" }}>{thresholdLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function RailItem({ active, onClick, color, icon, name, stat, dotLevel, isNew }) {
  return (
    <button onClick={onClick} className="rail-item" style={{
      width: "100%", display: "flex", alignItems: "center", gap: 11,
      background: active ? `${color}1A` : "transparent",
      border: active ? `1px solid ${color}44` : "1px solid transparent",
      borderRadius: 12, padding: "11px 12px", cursor: "pointer", textAlign: "right", marginBottom: 3,
      position: "relative",
    }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {active && <span style={{ position: "absolute", insetInlineStart: -12, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: color, borderRadius: 4 }} />}
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}1A`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: active ? "white" : "rgba(255,255,255,0.82)", fontWeight: 700, fontSize: 14 }}>{name}</div>
      </div>
      {dotLevel && <span style={{ width: 9, height: 9, borderRadius: "50%", background: levelColors[dotLevel].bg, boxShadow: `0 0 8px ${levelColors[dotLevel].bg}`, flexShrink: 0 }} />}
      {isNew && <span style={{ background: `${color}22`, color, fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 8px", flexShrink: 0 }}>جديد</span>}
      {stat && !isNew && !dotLevel && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>{stat}</span>}
    </button>
  );
}

export function Stat({ n, label, color }) {
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      <span style={{ fontSize: 13.5, fontWeight: 800, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
    </div>
  );
}

export function ClauseDetail({ original, translated, c, altLabel = "الترجمة التبسيطية" }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.22)", padding: "12px 16px" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 9, padding: "10px 12px", marginBottom: 9 }}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginBottom: 4 }}>النص الأصلي</div>
        <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 13, lineHeight: 1.85 }}>"{original}"</div>
      </div>
      <div style={{ background: `${c.bg}18`, borderRadius: 9, padding: "10px 12px", border: `1px solid ${c.bg}33` }}>
        <div style={{ color: c.text, fontSize: 11, fontWeight: 800, marginBottom: 4 }}>{altLabel}</div>
        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13.5, lineHeight: 1.85 }}>{translated}</div>
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
      {["red", "yellow", "green"].map((l) => (
        <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: levelColors[l].bg }} /> {levelColors[l].label}
        </span>
      ))}
    </div>
  );
}

export function LegendDot({ color, label, dash }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>
      <span style={{ width: 16, height: 0, borderTop: dash ? `2.5px dotted ${color}` : `3px solid ${color}`, borderRadius: 2 }} />
      {label}
    </span>
  );
}

// مخطط تراكم التكلفة (عقدك مقابل السوق)
export function CostChart({ data, title = "كيف تتراكم التكلفة (مقارنة بالسوق)" }) {
  const W = 600, H = 270, PL = 46, PR = 46, PT = 40, PB = 28;
  const n = data.labels.length;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const allVals = [...data.yours, ...data.market];
  const vMax = Math.max(...allVals), vMin = Math.min(...allVals), span = vMax - vMin || 1;
  const top = vMax + span * 0.30, bot = vMin - span * 0.34;
  const xFor = (i) => (W - PR) - (i / (n - 1)) * plotW;
  const yFor = (v) => PT + ((top - v) / (top - bot)) * plotH;
  const yoursPts = data.yours.map((v, i) => [xFor(i), yFor(v)]);
  const marketPts = data.market.map((v, i) => [xFor(i), yFor(v)]);
  const line = (pts) => pts.map((p) => p.map((x) => Math.round(x)).join(",")).join(" ");
  const areaPts = line(yoursPts) + " " + line([...marketPts].reverse());
  const CY = "#22D3EE", GAP = "#F5C84B";
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 14.5 }}>{title}</span>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <LegendDot color={CY} label="عقدك" />
          <LegendDot color="rgba(255,255,255,0.8)" label="السوق العادل" dash />
          <LegendDot color={GAP} label="الفرق الذي تدفعه زيادة" />
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }} fontFamily="Tajawal, sans-serif">
        <defs>
          <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GAP} stopOpacity="0.32" />
            <stop offset="100%" stopColor={GAP} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((g, i) => (
          <line key={i} x1={PL} x2={W - PR} y1={PT + g * plotH} y2={PT + g * plotH} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        <polygon points={areaPts} fill="url(#gapFill)" />
        <polyline points={line(marketPts)} fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />
        <polyline points={line(yoursPts)} fill="none" stroke={CY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${CY}88)` }} />
        {data.gaps.map((g, i) => {
          const my = (yoursPts[i][1] + marketPts[i][1]) / 2;
          return <text key={i} x={Math.round(xFor(i))} y={Math.round(my) + 4} fill={GAP} fontSize="14" fontWeight="800" textAnchor="middle">{fmt(g)}+</text>;
        })}
        {yoursPts.map((p, i) => (
          <g key={i}>
            <circle cx={Math.round(p[0])} cy={Math.round(p[1])} r="4.5" fill={CY} stroke="#0A0A0F" strokeWidth="2" />
            <text x={Math.round(p[0])} y={Math.round(p[1]) - 12} fill={CY} fontSize="13.5" fontWeight="800" textAnchor="middle">{fmt(data.yours[i])}</text>
          </g>
        ))}
        {marketPts.map((p, i) => (
          <g key={i}>
            <circle cx={Math.round(p[0])} cy={Math.round(p[1])} r="4.5" fill="#fff" stroke="#0A0A0F" strokeWidth="2" />
            <text x={Math.round(p[0])} y={Math.round(p[1]) + 20} fill="rgba(255,255,255,0.75)" fontSize="13" fontWeight="700" textAnchor="middle">{fmt(data.market[i])}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 34px 0", color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>
        {data.labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </Card>
  );
}

// أنماط عامة (خطوط، حركات، الشريط الجانبي)
export function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      button { font-family: Tajawal, sans-serif; }
      input { font-family: Tajawal, sans-serif; }
      ::selection { background: rgba(107,60,255,0.4); }
      ::-webkit-scrollbar { width: 9px; height: 9px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      :focus-visible { outline: 2px solid #8B6CFF; outline-offset: 2px; border-radius: 6px; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .fade-section { animation: fadeUp .4s ease both; }
      .rail-item { transition: background .18s, border-color .18s; }
      .hover-lift { transition: transform .2s, box-shadow .2s, background .2s, border-color .2s; }
      input[type=range] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 100px; outline: none; }
      input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.5); border: 3px solid #0EC9E0; }
      input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: white; cursor: pointer; border: 3px solid #0EC9E0; }
      .dash-rail {
        position: fixed; top: 0; right: 0; height: 100vh; width: 286px;
        background: rgba(16,15,24,0.94); backdrop-filter: blur(18px);
        border-left: 1px solid rgba(255,255,255,0.08);
        overflow-y: auto; z-index: 60; padding: 16px 14px 24px;
        display: flex; flex-direction: column; gap: 12px;
      }
      .dash-main { margin-right: 286px; min-width: 0; }
      .rail-backdrop { display: none; }
      .mobile-rail-toggle, .mobile-rail-close { display: none; }
      @media (max-width: 880px) {
        .dash-rail { width: 84%; max-width: 320px; transform: translateX(100%); transition: transform .28s cubic-bezier(.4,0,.2,1); box-shadow: -20px 0 60px rgba(0,0,0,0.55); }
        .dash-rail.rail-open { transform: translateX(0); }
        .dash-main { margin-right: 0; }
        .rail-backdrop.show { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 55; }
        .mobile-rail-toggle, .mobile-rail-close { display: flex; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
      }
    `}</style>
  );
}
