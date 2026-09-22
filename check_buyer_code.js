const fs = require("fs");
const content = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8");
const lines = content.split("\n");

lines.forEach((line, idx) => {
  if (line.includes("Milestones Done") || line.includes("Balance Amount") || line.includes("Recent Milestones")) {
    console.log(`--- Match near Line ${idx + 1} ---`);
    const start = Math.max(0, idx - 12);
    const end = Math.min(lines.length, idx + 12);
    for (let i = start; i < end; i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
});
