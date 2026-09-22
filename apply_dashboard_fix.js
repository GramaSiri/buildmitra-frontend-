const fs = require("fs");
const cssPath = "styles/globals.css";

const fixCSS = `

/* ==========================================================================
   BUILDMITRA DASHBOARDS — UNIVERSAL COMPACT STATS & HORIZONTAL SCROLL FIX
   ========================================================================== */

/* 1. UNLOCK PAGE AND DASHBOARD HORIZONTAL SCROLLING */
html, body {
  overflow-x: auto !important;
  max-width: 100% !important;
  width: 100% !important;
}

#__next,
#__next > div,
#__next > main,
#__next > section,
main,
.bm-dashboard-main,
div[class*="dashboard"],
div[class*="Dashboard"] {
  overflow-x: auto !important;
  max-width: 100% !important;
}

/* 2. COMPACT SUMMARY STAT BOXES (Progress, Milestones, Paid, Balance) */
/* Target stat/metric cards across all dashboard overviews */
div[class*="stat"],
div[class*="metric"],
div[class*="summary-box"],
div[class*="summaryCard"],
div[class*="summary-card"] {
  padding: 8px 12px !important;
  min-height: auto !important;
}

/* Reduce the oversized text numbers inside stat boxes */
div[class*="stat"] h2,
div[class*="stat"] h3,
div[class*="metric"] h2,
div[class*="metric"] h3,
div[class*="summary"] h2,
div[class*="summary"] h3,
div[class*="stat"] strong,
div[class*="metric"] strong {
  font-size: 16px !important;
  line-height: 1.2 !important;
  margin: 2px 0 !important;
}

/* Small labels (e.g. "Progress", "Milestones Done") */
div[class*="stat"] span,
div[class*="stat"] p,
div[class*="metric"] span,
div[class*="metric"] p {
  font-size: 11px !important;
  line-height: 1.2 !important;
  color: #64748b !important;
  margin: 0 !important;
}

/* 3. UNIVERSAL TABLE & RECENT MILESTONES HORIZONTAL SCROLL */
/* Wrap all dashboard data tables in an auto-scroll container */
table {
  width: 100% !important;
  min-width: 650px !important; /* Forces columns to stay structured, enabling horizontal scroll */
  border-collapse: collapse !important;
}

/* Force container around any table to scroll smoothly */
div:has(> table),
section:has(> table),
.table-responsive,
[class*="tableContainer"],
[class*="table-container"],
[class*="TableWrap"] {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  display: block !important;
  margin: 8px 0 16px !important;
  padding-bottom: 6px !important;
}

/* Compact table cells */
table th,
table td {
  padding: 6px 10px !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
  white-space: nowrap !important;
}

/* 4. VISIBLE SCROLLBAR STYLING ACROSS DASHBOARDS */
*::-webkit-scrollbar {
  height: 8px !important;
  width: 8px !important;
  display: block !important;
}

*::-webkit-scrollbar-track {
  background: #e2e8f0 !important;
  border-radius: 4px !important;
}

*::-webkit-scrollbar-thumb {
  background: #94a3b8 !important;
  border-radius: 4px !important;
  border: 1px solid #cbd5e1 !important;
}

*::-webkit-scrollbar-thumb:hover {
  background: #64748b !important;
}
`;

fs.appendFileSync(cssPath, fixCSS, "utf8");
console.log("UNIVERSAL_DASHBOARD_FIX_APPLIED");
