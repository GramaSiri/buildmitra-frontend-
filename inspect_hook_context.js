const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

console.log("=== CONTEXT AROUND LINE 283 ===");
for (let i = Math.max(0, 260); i < Math.min(lines.length, 305); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
