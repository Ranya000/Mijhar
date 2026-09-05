// ============================================================
// ظِلّ — مكوّنات الواجهة المشتركة
// ============================================================
import { C } from "./theme.js";

// ===================== ICONS =====================
export function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.9 }) {
  const s = { width: size, height: size, display: "inline-block", flexShrink: 0 };
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "shield":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 2l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V5l7-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "hand":    return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M18 11V6a2 2 0 00-4 0M14 10V4a2 2 0 00-4 0v6M10 10.5V6a2 2 0 00-4 0v8" /><path d="M18 8a2 2 0 014 0v6a8 8 0 01-8 8h-2a8 8 0 01-7.4-5L4 17" /></svg>;
    case "flask":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M9 3h6M10 3v6l-5 8a2 2 0 002 3h10a2 2 0 002-3l-5-8V3" /><path d="M7 15h10" /></svg>;
    case "scan":    return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /><line x1="3" y1="12" x2="21" y2="12" /></svg>;
    case "gavel":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 13l-7.5 7.5a2.1 2.1 0 01-3-3L11 10" /><path d="M9.5 6.5l8 8M12.5 3.5l8 8M11 5l7 7" /><line x1="14" y1="21" x2="22" y2="21" /></svg>;
    case "wrench":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M14.7 6.3a4 4 0 00-5.4 5.2L3 18v3h3l6.5-6.3a4 4 0 005.2-5.4l-2.8 2.8-2.3-2.3 2.8-2.8z" /></svg>;
    case "bug":     return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="8" y="6" width="8" height="14" rx="4" /><path d="M9 6a3 3 0 016 0M2 12h4M18 12h4M3 7l3 2M21 7l-3 2M3 17l3-2M21 17l-3-2M12 6V3" /></svg>;
    case "inject":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M4 20l6-6M9 11l4 4M13 3l8 8-3 3-8-8zM12 7l-3 3" /></svg>;
    case "leak":    return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 2s6 5 6 10a6 6 0 01-12 0c0-2 1-4 2-5" /><path d="M2 13l4 2M2 18l5 1" /></svg>;
    case "gauge":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 14l4-4M4 20a8 8 0 1116 0" /><circle cx="12" cy="14" r="1.2" fill={color} /></svg>;
    case "user":    return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>;
    case "globe":   return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>;
    case "tool":    return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M14.7 6.3a4 4 0 00-5.4 5.2L3 18v3h3l6.5-6.3a4 4 0 005.2-5.4l-2.8 2.8-2.3-2.3 2.8-2.8z" /></svg>;
    case "arrow":   return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.4"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case "arrowl":  return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.4"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
    case "check":   return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.4"><polyline points="20 6 9 17 4 12" /></svg>;
    case "x":       return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "block":   return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><line x1="5.6" y1="5.6" x2="18.4" y2="18.4" /></svg>;
    case "warning": return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "spark":   return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z" /><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>;
    case "play":    return <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M6 4l14 8-14 8z" /></svg>;
    case "replay":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.3M3 3v4h4" /></svg>;
    case "dot":     return <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><circle cx="12" cy="12" r="5" /></svg>;
    case "target":  return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill={color} /></svg>;
    case "layers":  return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" /></svg>;
    case "lock":    return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>;
    case "chevron": return <svg style={s} viewBox="0 0 24 24" {...p} strokeWidth="2.4"><polyline points="6 9 12 15 18 9" /></svg>;
    case "eye":     return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    default: return null;
  }
}

// ===================== BRAND =====================
export function Logo({ size = 34, subtitle = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.29,
        background: `linear-gradient(135deg, ${C.guard} 0%, ${C.guard2} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 18px rgba(22,224,192,0.42)`, flexShrink: 0,
      }}>
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M12 2l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V5l7-3z" stroke="#04140F" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="#04140F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div style={{ color: C.ink, fontWeight: 900, fontSize: size * 0.56, lineHeight: 1.05 }}>ظِلّ</div>
        {subtitle && <div style={{ color: "rgba(124,240,220,0.8)", fontSize: size * 0.31, fontWeight: 600 }}>الوكيل الحارس</div>}
      </div>
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`,
      borderRadius: 16, padding: "20px 22px", ...style,
    }}>{children}</div>
  );
}

// شارة مستوى/حالة
export function Pill({ color, text, bg, children }) {
  return (
    <span style={{
      background: bg || `${color}1f`, color: color, border: `1px solid ${color}44`,
      borderRadius: 100, padding: "3px 12px", fontSize: 12, fontWeight: 800,
      display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {text || children}
    </span>
  );
}

// كتلة كود / أمر
export function Code({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "rgba(255,255,255,0.04)", bd: "rgba(255,255,255,0.09)", fg: "rgba(231,236,243,0.9)" },
    danger:  { bg: "rgba(255,77,109,0.08)",  bd: "rgba(255,77,109,0.32)",  fg: "#FFB3C2" },
    safe:    { bg: "rgba(22,224,192,0.08)",   bd: "rgba(22,224,192,0.34)",  fg: "#93F3E3" },
  }[tone];
  return (
    <div style={{
      background: map.bg, border: `1px solid ${map.bd}`, borderRadius: 11,
      padding: "12px 14px", fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
      fontSize: 12.5, lineHeight: 1.7, color: map.fg, direction: "ltr", textAlign: "left",
      overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word",
    }}>{children}</div>
  );
}

export function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      button { font-family: Tajawal, sans-serif; color: inherit; }
      ::selection { background: rgba(22,224,192,0.35); }
      ::-webkit-scrollbar { width: 9px; height: 9px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      :focus-visible { outline: 2px solid ${C.guard}; outline-offset: 2px; border-radius: 6px; }
      a { color: inherit; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(22,224,192,0.5); } 50% { transform: scale(1.04); box-shadow: 0 0 0 10px rgba(22,224,192,0); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes glowPulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
      @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
      .fade { animation: fadeUp .42s ease both; }
      .fadein { animation: fadeIn .5s ease both; }
      .lift { transition: transform .2s, box-shadow .2s, border-color .2s, background .2s; }
      .lift:hover { transform: translateY(-3px); }
      .spin { animation: spin .8s linear infinite; }
      .shadow-nav a { text-decoration: none; }
      .console-grid { display: grid; grid-template-columns: 300px 1fr; gap: 18px; }
      .stage-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
      @media (max-width: 900px) {
        .console-grid { grid-template-columns: 1fr; }
        .stage-row { grid-template-columns: 1fr 1fr; }
        .hide-sm { display: none !important; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
      }
    `}</style>
  );
}
