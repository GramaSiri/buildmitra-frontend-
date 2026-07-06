const fs = require("fs");

const file = "pages/_app.tsx";
let text = fs.readFileSync(file, "utf8");

if (!text.includes("ClientErrorBoundary")) {
  text = text.replace(
    /import\s+['"]\.\.\/styles\/globals\.css['"];?/,
    (m) => m + '\nimport ClientErrorBoundary from "../components/ClientErrorBoundary";'
  );

  text = text.replace(
    /return\s*\(([\s\S]*?)\);?\s*}/m,
    (match) => {
      if (match.includes("<ClientErrorBoundary>")) return match;
      return match.replace("return (", "return (\n    <ClientErrorBoundary>").replace(/\n\s*\);\s*}/, "\n    </ClientErrorBoundary>\n  );\n}");
    }
  );
}

fs.writeFileSync(file, text, "utf8");
console.log("_app.tsx wrapped with ClientErrorBoundary");
