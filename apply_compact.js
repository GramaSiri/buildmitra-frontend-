const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Compact card: reduce padding from 20px to 10px 14px, marginBottom from 20px to 10px
code = code.replace(
  'card: { backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", overflowX: "auto" }',
  'card: { backgroundColor: "white", borderRadius: "10px", padding: "10px 14px", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflowX: "auto" }'
);

// 2. Compact statValue: reduce font from 28px down to 18px
code = code.replace(
  'statValue: { fontSize: "28px", fontWeight: "bold", color: "#800020" }',
  'statValue: { fontSize: "18px", fontWeight: "700", color: "#800020", lineHeight: "1.2" }'
);

// 3. Compact statLabel: tight margin
code = code.replace(
  'statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" }',
  'statLabel: { fontSize: "11px", fontWeight: "500", color: "#555", marginTop: "2px" }'
);

// 4. Compact grid4 (the 4 top stat boxes): minmax 130px with 8px gap so all 4 fit side-by-side cleanly
code = code.replace(
  'grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "20px", marginBottom: "20px" }',
  'grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(130px, 100%), 1fr))", gap: "8px", marginBottom: "10px" }'
);

// 5. Compact grid2 & grid3: 10px gap and 10px margin
code = code.replace(
  'grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "20px", marginBottom: "20px" }',
  'grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "10px", marginBottom: "10px" }'
);

code = code.replace(
  'grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "20px", marginBottom: "20px" }',
  'grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: "8px", marginBottom: "10px" }'
);

// 6. Compact cardTitle: reduce font and padding
code = code.replace(
  'cardTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #800020", paddingBottom: "10px" }',
  'cardTitle: { fontSize: "15px", fontWeight: "700", marginBottom: "8px", borderBottom: "2px solid #800020", paddingBottom: "6px" }'
);

fs.writeFileSync(filePath, code, "utf8");
console.log("COMPACT_DASHBOARD_STYLES_APPLIED_CLEANLY");
