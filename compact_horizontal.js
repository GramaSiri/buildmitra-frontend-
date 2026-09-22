const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Center the dashboard container and constrain horizontal width to fit laptop screens naturally
code = code.replace(
  /container:\s*\{[^}]*\}/,
  `container: { 
    padding: "8px 12px", 
    backgroundColor: "#f0f2f5", 
    minHeight: "100dvh", 
    width: "100%", 
    maxWidth: "1120px", 
    margin: "0 auto", 
    boxSizing: "border-box", 
    overflowX: "hidden" 
  }`
);

// 2. Make horizontal grids more compact with tighter horizontal column gaps
code = code.replace(
  /grid4:\s*\{[^}]*\}/,
  `grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "6px",
    marginBottom: "8px",
    width: "100%",
    boxSizing: "border-box"
  }`
);

code = code.replace(
  /grid2:\s*\{[^}]*\}/,
  `grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
    marginBottom: "8px",
    width: "100%",
    boxSizing: "border-box"
  }`
);

// 3. Compact the navigation buttons container horizontally
code = code.replace(
  'padding: "6px",\r\n      boxSizing: "border-box",\r\n      backgroundColor: "#fff",',
  'padding: "4px 6px",\r\n      boxSizing: "border-box",\r\n      backgroundColor: "#fff",'
);

fs.writeFileSync(filePath, code, "utf8");
console.log("BUYER_DASHBOARD_HORIZONTAL_COMPACTED");
