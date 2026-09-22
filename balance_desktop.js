const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Expand maximum horizontal width slightly for comfortable desktop viewing (1260px)
code = code.replace(
  /container:\s*\{[^}]*\}/,
  `container: { 
    padding: "10px 16px", 
    backgroundColor: "#f0f2f5", 
    minHeight: "100dvh", 
    width: "100%", 
    maxWidth: "1280px", 
    margin: "0 auto", 
    boxSizing: "border-box", 
    overflowX: "hidden" 
  }`
);

// 2. Adjust grid gaps slightly for better breathing room across desktop
code = code.replace(
  /grid4:\s*\{[^}]*\}/,
  `grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "8px",
    marginBottom: "10px",
    width: "100%",
    boxSizing: "border-box"
  }`
);

code = code.replace(
  /grid2:\s*\{[^}]*\}/,
  `grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "10px",
    width: "100%",
    boxSizing: "border-box"
  }`
);

// 3. Keep stat boxes compact vertically, but give slightly more padding for the wider container
code = code.replace(
  /statBox:\s*\{[^}]*\}/,
  `statBox: {
    padding: "8px 12px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    boxSizing: "border-box",
    minHeight: "56px"
  }`
);

// 4. Slightly enhance number readability without stretching height
code = code.replace(
  /statValue:\s*\{[^}]*\}/,
  `statValue: {
    fontSize: "17px",
    fontWeight: "800",
    lineHeight: "1.2",
    margin: "0 0 2px 0"
  }`
);

fs.writeFileSync(filePath, code, "utf8");
console.log("DESKTOP_WIDTH_BALANCED_SUCCESSFULLY");
