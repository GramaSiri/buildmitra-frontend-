const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

// Test line by line accumulation to locate the exact syntax error line
let accumulated = "";
for (let i = 0; i < lines.length; i++) {
  accumulated += lines[i].replace(/import .*/, "").replace(/export .*/, "") + "\n";
  try {
    new Function(accumulated);
  } catch (e) {
    if (e.message.includes("Unexpected token ']'")) {
      console.log(`\n>>> EXACT ERROR AT LINE ${i + 1}:`);
      for (let j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 4); j++) {
        console.log(`${j + 1}: ${lines[j]}`);
      }
      break;
    }
  }
}
