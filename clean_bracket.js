const fs = require("fs");
const path = "pages/buyer-dashboard.tsx";
let lines = fs.readFileSync(path, "utf8").split("\n");

// Clean any standalone stray ']' or broken lines in the state declaration section
lines = lines.filter((line, idx) => {
  if (idx < 60 && (line.trim() === "]" || line.trim() === "]);" || line.trim() === "]," || line.trim() === "];")) {
    console.log(`REMOVED_LINE_${idx + 1}: ${line}`);
    return false;
  }
  return true;
});

fs.writeFileSync(path, lines.join("\n"), "utf8");
console.log("CLEANUP_COMPLETE");
