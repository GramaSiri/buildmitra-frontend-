const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");
for (let i = 15; i <= 65; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
