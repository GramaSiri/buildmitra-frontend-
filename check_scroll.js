const fs = require("fs");

function checkFile(path) {
  if (!fs.existsSync(path)) return;
  console.log(`\n================ Checking: ${path} ================`);
  const content = fs.readFileSync(path, "utf8");
  const lines = content.split("\n");
  lines.forEach((l, idx) => {
    if (/overflow|scroll|100vw|max-width/i.test(l)) {
      console.log(`Line ${idx + 1}: ${l.trim()}`);
    }
  });
}

checkFile("styles/globals.css");
checkFile("components/DashboardLayout.tsx");
