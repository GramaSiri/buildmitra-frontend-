const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// Deduplicate consecutive identical declarations of issueEntry
const duplicatePattern = /const \[issueEntry,\s*setIssueEntry\]\s*=\s*useState\([^)]*\);\s*const \[issueEntry,\s*setIssueEntry\]\s*=\s*useState\([^)]*\);/g;

code = code.replace(
  duplicatePattern,
  'const [issueEntry, setIssueEntry] = useState({ materialId: "", date: new Date().toISOString().split("T")[0], quantity: "", purpose: "" });'
);

fs.writeFileSync(filePath, code, "utf8");
console.log("DUPLICATE_ISSUE_ENTRY_REMOVED");
