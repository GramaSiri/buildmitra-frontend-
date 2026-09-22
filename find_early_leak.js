const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

let depth = 0;
let parenDepth = 0;

for (let i = 0; i < 335; i++) {
  const line = lines[i];
  const prevB = depth;
  const prevP = parenDepth;
  const cleanLine = line.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "");
  for (const ch of cleanLine) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (ch === "(") parenDepth++;
    if (ch === ")") parenDepth--;
  }
  // Print any line where depth increased and did not drop back down
  if (i > 140 && (depth !== prevB || parenDepth !== prevP)) {
    console.log(`L${i+1} [B:${depth}, P:${parenDepth}]: ${line.trim().slice(0, 75)}`);
  }
}
