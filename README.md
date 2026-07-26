<div align="center">

# 🔍 Mijhar — Personal Risk Detector

**Understand your contract before you sign.**

A platform that analyzes your contracts (**Rental · Financing · Investment**)
through **6 AI agents** — uncovering dangerous and hidden clauses, comparing them
to the market, calculating their financial impact, and drafting a ready-to-send
objection letter, all in seconds.

### 🌐 [Try the Site](https://mijhar-d2on.onrender.com)

### 📄 [Project Overview](https://mijhr-info.netlify.app)

</div>

---

## 🤖 The Six Agents

| # | Agent | Role |
|:---:|---|---|
| 1 | **Risk Detector** | Identifies every risky clause and classifies it (danger / warning / safe) with a simplified translation |
| 2 | **Hidden Clause Detector** | Reveals loopholes and vague clauses written to hide their impact |
| 3 | **Market Comparison** | Compares your clauses to what's standard in the Saudi market, in riyals |
| 4 | **Future Outlook** | Builds a timeline of what happens to you after signing |
| 5 | **Financial Impact** | An interactive calculator that decides whether the contract fits your finances |
| 6 | **Objection Agent** | Writes ready legal objection letters based on the other agents |

---

## 📁 Project Structure

```
Mijhar/
│
├── 📂 backend/              Server + the six agents (Node.js + Express)
│   └── src/
│       ├── agents/            One file per agent (risks, hidden, market, future, financial, object, extract)
│       ├── data/              Data for the three contract types + agent definitions
│       ├── lib/               Financial-impact engine + AI layer + utilities
│       ├── orchestrator.js    Coordinates the agents into a single report
│       └── server.js          API + serves the site
│
├── 📂 frontend/             Interface (React + Vite, Arabic RTL)
│   └── src/
│       ├── App.jsx           Flow: home → upload → analyzing → dashboard
│       ├── panels.jsx        Agent panels
│       ├── financial.jsx     Financial-impact panel + calculator
│       ├── ui.jsx            Components (icons, cards, charts)
│       └── theme.js / api.js  Colors and constants + server connection
│
├── 📂 docs/                 Project overview page
├── render.yaml             Online deployment config
└── package.json            Unified build and run scripts
```

---

## 🛠️ Tech Stack

`React (RTL)` · `Node.js + Express` · `Multi-Agent Architecture` · `Large Language Models (LLM)` · `Interactive SVG charts` · `Deployed on Render`

---

<div align="center">
<sub>Mijhar is a guidance tool for understanding contracts, not official legal or financial advice.</sub>
</div>
