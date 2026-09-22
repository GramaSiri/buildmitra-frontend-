const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Make grid4 compact and auto-responsive
code = code.replace(/grid4:\s*\{[^}]*\}/g, `grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px",
    marginBottom: "10px",
    width: "100%"
  }`);

// 2. Make grid2 compact and responsive
code = code.replace(/grid2:\s*\{[^}]*\}/g, `grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "10px",
    marginBottom: "10px",
    width: "100%"
  }`);

// 3. Compact statValue (numbers: 0%, 0/30, ₹0.05L, ₹138.55L)
code = code.replace(/statValue:\s*\{[^}]*\}/g, `statValue: {
    fontSize: "17px",
    fontWeight: "800",
    lineHeight: "1.2",
    margin: "0 0 2px 0"
  }`);

// 4. Compact statLabel (Progress, Milestones Done, etc.)
code = code.replace(/statLabel:\s*\{[^}]*\}/g, `statLabel: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    opacity: 0.9,
    margin: 0
  }`);

// 5. Compact card padding across the entire dashboard
code = code.replace(/card:\s*\{([^}]*padding:[^;}]*)[^}]*\}/g, (match) => {
  return match.replace(/padding:\s*["'][^"']+["']|\bpadding:\s*\d+/g, 'padding: "10px 12px"');
});

// 6. Ensure the Recent Milestones table maintains a readable minimum width for horizontal scrolling
code = code.replace(/table:\s*\{([^}]*)\}/g, `table: {
    width: "100%",
    minWidth: "680px",
    borderCollapse: "collapse",
    fontSize: "12px"
  }`);

// 7. Compact table th/td padding
code = code.replace(/th:\s*\{[^}]*\}/g, `th: {
    padding: "6px 8px",
    fontSize: "11px",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap"
  }`);

code = code.replace(/td:\s*\{[^}]*\}/g, `td: {
    padding: "6px 8px",
    fontSize: "11.5px",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap"
  }`);

fs.writeFileSync(filePath, code, "utf8");
console.log("BUYER_DASHBOARD_COMPACT_STYLES_APPLIED");
