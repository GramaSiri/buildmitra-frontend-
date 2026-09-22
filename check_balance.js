const fs = require("fs");
const code = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8");

let braces = 0;
let parens = 0;
const lines = code.split("\n");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === "{") braces++;
    if (ch === "}") braces--;
    if (ch === "(") parens++;
    if (ch === ")") parens--;
  }
}

console.log(`Braces balance ({ minus }): ${braces}`);
console.log(`Parentheses balance (( minus )): ${parens}`);
