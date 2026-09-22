const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// Increase max-width from 1080px to 1240px (~1 inch on each side)
code = code.replace(
  'maxWidth: "1080px", margin: "0 auto", padding: "10px 14px"',
  'maxWidth: "1240px", margin: "0 auto", padding: "12px 20px"'
);

// Apply same to main if present
code = code.replace(
  'main: { maxWidth: "1080px", margin: "0 auto", padding: "8px 12px"',
  'main: { maxWidth: "1240px", margin: "0 auto", padding: "12px 20px"'
);

fs.writeFileSync(filePath, code, "utf8");
console.log("CONTAINER_WIDENED_BY_1_INCH_PER_SIDE");
