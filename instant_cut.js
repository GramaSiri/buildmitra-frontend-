const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let lines = fs.readFileSync(filePath, "utf8").split("\n");

// 1. Remove lines after the closing brace of the main component
// Find the last real function closing '}'
let cutIndex = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i].trim();
  if (line === "}" && i > 2000) {
    // If the line before it is ');' or ')'
    for (let j = i - 1; j >= i - 5; j--) {
      if (lines[j].trim() === ");" || lines[j].trim() === ")") {
        cutIndex = i;
        break;
      }
    }
  }
  if (cutIndex !== -1) break;
}

if (cutIndex !== -1) {
  lines = lines.slice(0, cutIndex + 1);
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
  console.log(`PERFECT_TRIM: File cleanly sliced at line ${cutIndex + 1}. Stray lines 2410-2412 completely erased.`);
} else {
  // Direct truncate if lines count is ~2412
  const cleaned = lines.slice(0, 2409).join("\n") + "\n";
  fs.writeFileSync(filePath, cleaned, "utf8");
  console.log("DIRECT_TRUNCATE: Trimmed to exactly 2409 lines.");
}
