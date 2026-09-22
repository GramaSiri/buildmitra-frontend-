const fs = require("fs");
const code = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8");

let b = 0;
let p = 0;
const cleanCode = code.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "");
for (const ch of cleanCode) {
  if (ch === "{") b++;
  if (ch === "}") b--;
  if (ch === "(") p++;
  if (ch === ")") p--;
}
console.log(`NEW FILE BALANCE -> Braces diff: ${b}, Parens diff: ${p}`);
