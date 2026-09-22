const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// Constrain the container width horizontally and center it
code = code.replace(
  /container:\s*\{[^}]+\}/,
  'container: { maxWidth: "1080px", margin: "0 auto", padding: "10px 14px", width: "100%", boxSizing: "border-box" }'
);

// Also ensure the outer wrapper doesn't push edge-to-edge
code = code.replace(
  /main:\s*\{[^}]+\}/,
  'main: { maxWidth: "1080px", margin: "0 auto", padding: "8px 12px", width: "100%", boxSizing: "border-box" }'
);

fs.writeFileSync(filePath, code, "utf8");
console.log("EXACT_COMPACT_HORIZONTAL_CONTAINER_APPLIED");
