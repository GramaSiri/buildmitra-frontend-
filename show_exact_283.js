const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");
console.log("=== ACTUAL FILE LINES 270-295 ===");
for (let i = 269; i < Math.min(lines.length, 295); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
