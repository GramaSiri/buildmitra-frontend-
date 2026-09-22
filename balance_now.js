const fs = require("fs");
const file = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(file, "utf8");

let braces = 0;
let parens = 0;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  if (c === "{") braces++;
  else if (c === "}") braces--;
  else if (c === "(") parens++;
  else if (c === ")") parens--;
}

console.log("Missing braces:", braces);
console.log("Missing parens:", parens);

if (parens > 0) {
  code = code.trimEnd() + "\n" + ")".repeat(parens);
}
if (braces > 0) {
  code = code.trimEnd() + "\n" + "}".repeat(braces) + "\n";
}

fs.writeFileSync(file, code, "utf8");
console.log("SYNTAX_BALANCED");
