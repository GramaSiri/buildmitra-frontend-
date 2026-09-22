const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

console.log("=== LINES 290 TO 455 OF BUYER-DASHBOARD.TSX ===");
for (let i = 289; i < Math.min(lines.length, 455); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
