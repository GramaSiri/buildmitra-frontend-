const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

let depth = 0;
for (let i = 0; i < 555; i++) {
  for (const ch of lines[i]) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
  }
}
console.log("Scope depth at line 552:", depth);
