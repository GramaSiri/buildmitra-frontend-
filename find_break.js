const fs = require("fs");
const code = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8");
const lines = code.split("\n");

let b = 0;
let p = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let ch of line) {
    if (ch === "{") b++;
    if (ch === "}") b--;
    if (ch === "(") p++;
    if (ch === ")") p--;
  }
  if (b < 0 || p < 0) {
    console.log(`BREAKPOINT DETECTED at line ${i + 1}: b=${b}, p=${p}`);
    console.log(`Line content: ${line}`);
    break;
  }
}
console.log(`Final totals -> Braces diff: ${b}, Parens diff: ${p}, Total lines: ${lines.length}`);
