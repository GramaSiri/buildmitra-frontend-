const fs = require("fs");
const path = "pages/buyer-dashboard.tsx";
let lines = fs.readFileSync(path, "utf8").split("\n");

// Locate the line index where useEffect is called for loadSentEnquiries
let targetIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("loadSentEnquiries") && lines[Math.max(0, i - 1)].includes("useEffect")) {
    targetIdx = Math.max(0, i - 1);
    break;
  }
}

if (targetIdx !== -1) {
  console.log(`Found hook at line ${targetIdx + 1}`);
  // Check the lines immediately before targetIdx
  for (let j = targetIdx - 5; j < targetIdx; j++) {
    console.log(`Preceding line ${j + 1}: ${lines[j]}`);
  }
} else {
  console.log("Hook target not found by exact string, checking line 280-285");
}
