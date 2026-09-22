const fs = require("fs");
const path = "pages/buyer-dashboard.tsx";
let lines = fs.readFileSync(path, "utf8").split("\n");

// Truncate everything after line 2409
lines = lines.slice(0, 2409);
fs.writeFileSync(path, lines.join("\n") + "\n", "utf8");
console.log("CLEANED_TO_2409");
