const fs = require("fs");
const cssPath = "styles/globals.css";

const fixRule = `

/* ==========================================================================
   BUILDMITRA — DASHBOARD HORIZONTAL SCREEN SCROLLBAR PERMANENT FIX
   Enables natural left-to-right screen scrolling with visible scrollbars
   ========================================================================== */
html, body {
  overflow-x: auto !important;
  max-width: 100% !important;
  scrollbar-width: auto !important;
}

#__next, main, .bm-dashboard-main, div[class*="DashboardLayout"], div[class*="dashboard"] {
  overflow-x: auto !important;
  max-width: none !important;
  min-width: min-content;
}

/* Force visible horizontal scrollbar for the entire screen */
::-webkit-scrollbar {
  height: 10px !important;
  width: 10px !important;
}

::-webkit-scrollbar-track {
  background: #f1f5f9 !important;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8 !important;
  border-radius: 5px !important;
  border: 2px solid #f1f5f9 !important;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b !important;
}
`;

fs.appendFileSync(cssPath, fixRule, "utf8");
console.log("SCROLLBAR_FIX_APPLIED_PERMANENTLY");
