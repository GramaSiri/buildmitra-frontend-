const fs = require("fs");
const code = fs.readFileSync("pages/buyer-dashboard.tsx", "utf8");

// Search for all occurrences where localStorage.setItem or getItem is called
const setMatches = [...code.matchAll(/localStorage\.(?:setItem|getItem)\(["']([^"']+)["']/g)].map(m => m[1]);
console.log("ALL STORAGE KEYS USED IN BUYER DASHBOARD:");
console.log([...new Set(setMatches)]);
