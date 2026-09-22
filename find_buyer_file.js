const fs = require("fs");
const path = require("path");

function searchFolder(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", ".git", "_backups"].includes(f)) searchFolder(full);
    } else if (f.endsWith(".tsx") || f.endsWith(".jsx")) {
      const txt = fs.readFileSync(full, "utf8");
      if (txt.includes("Recent Milestones") || txt.includes("Milestones Done")) {
        console.log("MATCH FOUND:", full);
      }
    }
  }
}

searchFolder("./pages");
searchFolder("./components");
