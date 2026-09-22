const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let content = fs.readFileSync(filePath, "utf8");
let lines = content.split("\n");

console.log("=== SCANNING FUNCTION SCOPE DEPTH ===");

let depth = 0;
let componentStartLine = -1;
let prematureCloseLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("function BuyerDashboard") || line.includes("export default function")) {
    componentStartLine = i + 1;
  }

  for (const ch of line) {
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (componentStartLine !== -1 && depth === 0 && prematureCloseLine === -1 && i < 300) {
        prematureCloseLine = i + 1;
      }
    }
  }

  // Print context right around line 280
  if (i >= 275 && i <= 286) {
    console.log(`Line ${i + 1} (depth: ${depth}): ${line}`);
  }
}

console.log(`\nComponent started at line: ${componentStartLine}`);
console.log(`Premature component exit detected at line: ${prematureCloseLine}`);

// If premature close happened before line 283, remove the extra closing brace at line 281/282
if (prematureCloseLine > 0 && prematureCloseLine < 283) {
  console.log(`Fixing premature closure at line ${prematureCloseLine}...`);
  // Remove the rogue closing brace on that line
  lines[prematureCloseLine - 1] = lines[prematureCloseLine - 1].replace(/}\s*;?/, "");
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
  console.log("REPAIR_APPLIED: Removed premature component closing brace.");
} else {
  // Direct targeted fix for lines 279-282
  console.log("Applying structural cleanup between lines 275 and 284...");
  let joined = lines.join("\n");
  joined = joined.replace(/(\n\s*\}\s*;\s*)\n\s*\}\s*;\s*\n(\s*useEffect\(\(\)\s*=>\s*\{\s*\n\s*const loadSentEnquiries)/m, "$1\n$2");
  fs.writeFileSync(filePath, joined, "utf8");
}

// Check total brace balance at the end of the file
let finalContent = fs.readFileSync(filePath, "utf8");
let bCount = 0;
for (const ch of finalContent) {
  if (ch === "{") bCount++;
  if (ch === "}") bCount--;
}

console.log(`Final file brace balance ({ minus }): ${bCount}`);
if (bCount > 0) {
  finalContent = finalContent.trimEnd() + "\n" + "}".repeat(bCount) + "\n";
  fs.writeFileSync(filePath, finalContent, "utf8");
  console.log(`Appended ${bCount} missing closing brace(s) to the end of the file.`);
}
