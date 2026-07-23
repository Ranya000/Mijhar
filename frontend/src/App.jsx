import { useState, useRef, useEffect } from "react";
import {
  AGENTS, CONTRACT_TYPES, levelColors, baseStyle, headerStyle,
  ghostBtn, labelStyle, fileBtn,
} from "./theme.js";
import { Icon, Logo, Badge, Card, RailItem, GlobalStyles } from "./ui.jsx";
import { Overview, RisksPanel, HiddenPanel, MarketPanel, FuturePanel, ObjectPanel } from "./panels.jsx";
import { FinancialPanel } from "./financial.jsx";
import { fetchMeta, analyzeContract } from "./api.js";

export default function App() {
  const [page, setPage] = useState("home");           // home | upload | analyzing | dashboard
  const [section, setSection] = useState("overview");
  const [contractType, setContractType] = useState("");
  const [text, setText] = useState("");
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [meta, setMeta] = useState(null);
  const [data, setData] = useState(null);              // نتيجة التحليل من الباكند
  const [error, setError] = useState("");

  const fileRef = useRef();

  useEffect(() => { fetchMeta().then(setMeta).catch(() => {}); }, []);

  const selectedType = CONTRACT_TYPES.find((t) => t.label === contractType);

  const reset = () => {
    setPage("upload"); setText(""); setAnalyzeStep(0);
    setSection("overview"); setSidebarOpen(false); setData(null); setError("");
  };

  const handleAnalyze = async () => {
    if (!text.trim() || !selectedType) return;
    setError("");
    setPage("analyzing");
    setAnalyzeStep(0);
    const per = 540;
    AGENTS.forEach((_, i) => setTimeout(() => setAnalyzeStep(i + 1), per * (i + 1)));

    try {
      const [result] = await Promise.all([
        analyzeContract({ contractType: selectedType.key, text }),
        new Promise((r) => setTimeout(r, per * AGENTS.length + 700)),
      ]);
      setData(result);
      setPage("dashboard");
      setSection("overview");
    } catch (e) {
      setError(e.message || "تعذّر تحليل العقد");
      setPage("upload");
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(String(ev.target.result));
    reader.readAsText(file);
  };

  const loadSample = () => {
    const key = selectedType?.key;
    if (meta?.sampleTexts?.[key]) setText(meta.sampleTexts[key]);
  };

  // ---------- HOME ----------
  if (page === "home") return (
    <div style={baseStyle}>
      <GlobalStyles />
      <div style={headerStyle}><Logo size={34} /></div>

      <div style={{ textAlign: "center", padding: "76px 24px 56px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 30, display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 92, height: 92, borderRadius: 26,
            background: "linear-gradient(135deg, rgba(107,60,255,0.22), rgba(176,60,255,0.22))",
            border: "1px solid rgba(107,60,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 60px rgba(107,60,255,0.25)",
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
              <path d="M9 2h6v9H9z" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="12" cy="5.5" r="1.5" fill="rgba(176,60,255,0.9)" />
              <path d="M12 11v3" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 14c-2 1-3 3-3 3h16s-1-2-3-3" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 20h6" stroke="rgba(176,140,255,0.95)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="11" r="3" stroke="rgba(176,60,255,0.5)" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(107,60,255,0.12)", border: "1px solid rgba(107,60,255,0.28)", borderRadius: 100, padding: "5px 14px", marginBottom: 22, fontSize: 13, color: "rgba(196,176,255,0.95)", fontWeight: 700 }}>
          <Icon name="sparkle" size={14} color="#B08CFF" /> ٦ وكلاء ذكاء اصطناعي يعملون معاً
        </div>
        <h1 style={{ fontSize: 46, fontWeight: 900, margin: "0 0 14px", lineHeight: 1.2 }}>افهم عقدك قبل ما توقّع</h1>
        <div style={{ width: 60, height: 3, background: "linear-gradient(90deg, #6B3CFF, #B03CFF)", borderRadius: 10, margin: "0 auto 22px" }} />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, lineHeight: 1.9, margin: "0 0 40px", maxWidth: 580, marginInline: "auto" }}>
          ارفع عقدك، وخلّ مجهر يكشف لك البنود الخطيرة والمخفية، يقارنها بالسوق، يحسب أثرها على محفظتك، ويجهّز لك رسالة اعتراض جاهزة — كل ذلك في ثوانٍ.
        </p>
        <button onClick={() => setPage("upload")} className="hover-lift" style={{
          display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 38px",
          background: "linear-gradient(135deg, #6B3CFF, #B03CFF)", border: "none", borderRadius: 14,
          color: "white", fontSize: 18, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 8px 32px rgba(107,60,255,0.45)",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
          <Icon name="arrow" size={20} color="white" /> ابدأ بتحليل عقدك
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 90px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>تعرّف على الوكلاء الستة</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>كل وكيل متخصص في زاوية مختلفة من عقدك</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {AGENTS.map((a) => (
            <div key={a.id} className="hover-lift" style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${a.color}26`,
              borderRadius: 16, padding: 20, textAlign: "right",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${a.color}18`, border: `1px solid ${a.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={a.icon} size={19} color={a.color} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{a.name}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{a.short}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ---------- UPLOAD ----------
  if (page === "upload") return (
    <div style={baseStyle}>
      <GlobalStyles />
      <div style={headerStyle}>
        <Logo size={32} />
        <button onClick={() => setPage("home")} style={ghostBtn}>← رجوع</button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 24px 70px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px" }}>أرفق عقدك</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0 }}>الصق النص أو ارفع ملف، وخلّ الوكلاء يشتغلون</p>
        </div>

        {error && (
          <Card style={{ marginBottom: 16, background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#FF5C5C", fontWeight: 700, fontSize: 14 }}>
              <Icon name="warning" size={16} color="#FF5C5C" /> {error}
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>نوع العقد</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {CONTRACT_TYPES.map((t) => {
                const on = contractType === t.label;
                return (
                  <button key={t.label} onClick={() => setContractType(t.label)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: on ? "linear-gradient(135deg,#6B3CFF,#B03CFF)" : "rgba(107,60,255,0.1)",
                    border: on ? "1px solid #6B3CFF" : "1px solid rgba(107,60,255,0.3)",
                    color: on ? "white" : "rgba(196,176,255,0.9)",
                    borderRadius: 12, padding: "10px 18px", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", transition: "all .2s", boxShadow: on ? "0 4px 16px rgba(107,60,255,0.35)" : "none",
                  }}>
                    <Icon name={t.icon} size={15} color={on ? "white" : "rgba(196,176,255,0.9)"} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={!contractType} placeholder={contractType ? "الصق نص العقد هنا..." : "اختر نوع العقد أولاً قبل كتابة أو لصق النص..."}
            style={{
              width: "100%", minHeight: 200, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 1.8,
              padding: "14px 16px", resize: "vertical", outline: "none", direction: "rtl",
            }} />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => fileRef.current.click()} disabled={!contractType} style={fileBtn}><Icon name="upload" size={16} color="rgba(255,255,255,0.6)" /> رفع ملف</button>
            <button onClick={loadSample} disabled={!contractType} style={fileBtn}><Icon name="file" size={16} color="rgba(255,255,255,0.6)" /> تجربة بعقد جاهز</button>
          </div>
          <input ref={fileRef} type="file" accept=".txt" style={{ display: "none" }} onChange={handleFile} />

          <button onClick={handleAnalyze} disabled={!text.trim() || !contractType} style={{
            width: "100%", marginTop: 14, padding: "15px", border: "none", borderRadius: 12,
            background: (text.trim() && contractType) ? "linear-gradient(135deg,#6B3CFF,#B03CFF)" : "rgba(255,255,255,0.06)",
            color: (text.trim() && contractType) ? "white" : "rgba(255,255,255,0.25)",
            fontSize: 16, fontWeight: 800, cursor: (text.trim() && contractType) ? "pointer" : "not-allowed",
            transition: "all .2s", boxShadow: (text.trim() && contractType) ? "0 8px 32px rgba(107,60,255,0.35)" : "none",
          }}>حلّل العقد الآن</button>
        </Card>

        <div style={{ marginTop: 30 }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", marginBottom: 14 }}>الوكلاء الذين سيحللون عقدك</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {AGENTS.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${a.color}22`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${a.color}18`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={a.icon} size={15} color={a.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{a.short}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- ANALYZING ----------
  if (page === "analyzing") {
    const total = AGENTS.length;
    const pctDone = Math.round((analyzeStep / total) * 100);
    return (
      <div style={{ ...baseStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <GlobalStyles />
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: 22, background: "linear-gradient(135deg, #6B3CFF, #B03CFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 36px rgba(107,60,255,0.5)", animation: "pulse 1.6s infinite" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2" />
                <path d="M14.5 14.5L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", textAlign: "center" }}>الوكلاء يحلّلون عقدك...</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, margin: "0 0 26px", textAlign: "center" }}>نفحص كل بند، نكشف المخفي، ونحسب الكلفة بالريال</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
            {AGENTS.map((a, i) => {
              const done = i < analyzeStep;
              const active = i === analyzeStep;
              return (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: done ? `${a.color}14` : active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${done ? a.color + "3D" : active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 13, padding: "11px 14px",
                  opacity: done || active ? 1 : 0.5, transition: "all .4s ease",
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${a.color}1A`, border: `1px solid ${a.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={a.icon} size={16} color={a.color} />
                  </div>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: done || active ? "white" : "rgba(255,255,255,0.6)" }}>{a.name}</span>
                  {done ? (
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="check" size={13} color="#0A0A0F" />
                    </span>
                  ) : active ? (
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${a.color}40`, borderTopColor: a.color, animation: "spin .8s linear infinite", flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctDone}%`, borderRadius: 100, background: "linear-gradient(90deg,#6B3CFF,#B03CFF)", transition: "width .5s cubic-bezier(.4,0,.2,1)", boxShadow: "0 0 12px rgba(176,60,255,0.6)" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#B08CFF", minWidth: 38, textAlign: "left" }}>{pctDone}%</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  const d = data;
  if (!d) return null;
  const activeAgent = AGENTS.find((a) => a.id === section);
  const concerns = d.risks.filter((r) => r.level !== "green").length;
  const badMarket = d.marketComparison.filter((m) => m.status === "bad").length;
  const railStats = {
    risks: `${concerns} مخاطر`,
    hidden: `${d.hiddenItems.length} بنود`,
    market: `${badMarket}/${d.marketComparison.length} أسوأ`,
    future: `${d.futureTimeline.length} مراحل`,
    financial: null,
    object: `${d.objectionLetters.length} رسائل`,
  };

  return (
    <div style={baseStyle}>
      <GlobalStyles />

      <aside className={"dash-rail" + (sidebarOpen ? " rail-open" : "")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 6, marginBottom: 2 }}>
          <Logo size={28} />
          <button className="mobile-rail-close" onClick={() => setSidebarOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, width: 32, height: 32, cursor: "pointer", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={15} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 13px" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>العقد قيد التحليل</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{d.contractType}</div>
            <Badge level={d.safetyLevel}>{d.safetyScore}/100</Badge>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.32)", padding: "4px 10px 6px", letterSpacing: 0.4 }}>لوحة التحليل</div>
          <RailItem active={section === "overview"} onClick={() => { setSection("overview"); setSidebarOpen(false); }}
            color="#8B6CFF" icon="grid" name="نظرة عامة" stat="ملخص" />
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.32)", padding: "10px 10px 6px", letterSpacing: 0.4 }}>الوكلاء الستة</div>
          {AGENTS.map((a) => (
            <RailItem key={a.id} active={section === a.id} onClick={() => { setSection(a.id); setSidebarOpen(false); }}
              color={a.color} icon={a.icon} name={a.name} stat={railStats[a.id]} />
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          <button onClick={reset} className="hover-lift" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", borderRadius: 11, padding: "11px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            <Icon name="plus" size={14} color="rgba(255,255,255,0.7)" /> تحليل عقد جديد
          </button>
        </div>
      </aside>

      <div className={"rail-backdrop" + (sidebarOpen ? " show" : "")} onClick={() => setSidebarOpen(false)} />

      <div className="dash-main">
        <div style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button className="mobile-rail-toggle" onClick={() => setSidebarOpen(true)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, width: 36, height: 36, cursor: "pointer", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="grid" size={16} color="rgba(255,255,255,0.7)" />
            </button>
            <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {section === "overview" ? "نظرة عامة" : activeAgent ? activeAgent.name : ""}
            </div>
          </div>
          <Badge level={d.safetyLevel}>{d.contractType}</Badge>
        </div>

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 20px 70px" }}>
          {section !== "overview" && activeAgent && (
            <div className="fade-section" key={"h-" + section} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: `${activeAgent.color}18`, border: `1px solid ${activeAgent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={activeAgent.icon} size={24} color={activeAgent.color} />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{activeAgent.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, margin: "3px 0 0" }}>{activeAgent.short}</p>
              </div>
            </div>
          )}

          <div className="fade-section" key={section}>
            {section === "overview" && <Overview d={d} goto={setSection} />}
            {section === "risks" && <RisksPanel d={d} />}
            {section === "hidden" && <HiddenPanel d={d} />}
            {section === "market" && <MarketPanel d={d} />}
            {section === "future" && <FuturePanel d={d} />}
            {section === "financial" && (
              <FinancialPanel d={d} contractType={d.contractKey} contractKey={d.contractKey} goto={setSection} />
            )}
            {section === "object" && <ObjectPanel d={d} />}
          </div>
        </div>
      </div>
    </div>
  );
}
