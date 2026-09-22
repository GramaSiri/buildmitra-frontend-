const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let lines = fs.readFileSync(filePath, "utf8").split("\n");

console.log("=== LAST 15 LINES BEFORE FIX ===");
lines.slice(-15).forEach((l, i) => console.log(`${lines.length - 15 + i + 1}: ${l}`));

// Find the last real function closing line
// Trim off any trailing stray ')', '}', or empty lines after the component closing
while (lines.length > 0) {
  const last = lines[lines.length - 1].trim();
  if (last === "" || last === ")" || last === "}" || last === ");") {
    // If the preceding line is also '}', we have duplicate closures
    const prev = lines.length > 1 ? lines[lines.length - 2].trim() : "";
    if (last === ")" && (prev === "}" || prev === ");")) {
      lines.pop();
      continue;
    }
    if (last === "}" && prev === "}") {
      lines.pop();
      continue;
    }
  }
  break;
}

// Write cleaned lines
fs.writeFileSync(filePath, lines.join("\n"), "utf8");

// Re-check exact brace & paren balance
let content = fs.readFileSync(filePath, "utf8");
let bCount = 0;
let pCount = 0;
for (const ch of content) {
  if (ch === "{") bCount++;
  if (ch === "}") bCount--;
  if (ch === "(") pCount++;
  if (ch === ")") pCount--;
}

console.log(`\nCurrent balance: Braces={${bCount}}, Parens=(${pCount})`);

// Apply exact balance adjustment if any remains
if (pCount > 0) content += "\n" + ")".repeat(pCount);
if (pCount < 0) {
  // Strip trailing parens
  while (pCount < 0 && content.trimEnd().endsWith(")")) {
    content = content.trimEnd().slice(0, -1);
    pCount++;
  }
}

if (bCount > 0) content += "\n" + "}".repeat(bCount);
if (bCount < 0) {
  while (bCount < 0 && content.trimEnd().endsWith("}")) {
    content = content.trimEnd().slice(0, -1);
    bCount++;
  }
}

fs.writeFileSync(filePath, content.trimEnd() + "\n", "utf8");
console.log("TRAILING_SYNTAX_CLEANED_SUCCESSFULLY");
