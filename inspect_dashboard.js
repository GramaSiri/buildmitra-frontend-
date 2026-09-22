const fs = require("fs");
const lines = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8").split("\n");

console.log("--- FIRST 40 LINES ---");
lines.slice(0, 40).forEach((l, i) => console.log(`${i+1}: ${l}`));

console.log("\n--- WHERE 'projects' IS DEFINED ---");
lines.forEach((l, i) => {
  if (l.includes("useState") && (l.includes("project") || l.includes("Project"))) {
    console.log(`${i+1}: ${l}`);
  }
});

console.log("\n--- WHERE 'selectedProject' OR PROJECT DROPDOWN IS RENDERED ---");
lines.forEach((l, i) => {
  if (l.includes("selectedProjectData") || l.includes("<select") && l.includes("project")) {
    console.log(`${i+1}: ${l}`);
  }
});
