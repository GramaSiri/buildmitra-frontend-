const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

let depth = 0;
let parenDepth = 0;
let suspectLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Ignore string contents for a clean count
  const cleanLine = line.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "");
  for (const ch of cleanLine) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (ch === "(") parenDepth++;
    if (ch === ")") parenDepth--;
  }
  // Print status around lines 330-400 and 520-560 where the edits happened
  if ((i >= 330 && i <= 375) || (i >= 520 && i <= 560)) {
    console.log(`L${i+1} [braces:${depth}, parens:${parenDepth}]: ${line.trim().slice(0, 70)}`);
  }
}
console.log(`\nEnd of file at line ${lines.length}: Braces depth = ${depth}, Parens depth = ${parenDepth}`);
