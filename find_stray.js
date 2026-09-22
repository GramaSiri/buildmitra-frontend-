const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

// Look for lines around line 20 to 45 that have a stray closing bracket
lines.forEach((line, idx) => {
  if (idx < 50 && line.trim().startsWith("]")) {
    console.log(`FOUND_STRAY_AT_LINE_${idx + 1}: ${line}`);
  }
});
