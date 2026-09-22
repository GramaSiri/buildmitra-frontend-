const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// We need to properly close loadAssignedProjects before the useEffect for loadSentEnquiries begins
const targetSnippet = `    } catch (err) {
      console.log("Cloud project fetch skipped, using local data.");
    }
  };

  useEffect(() => {
    const loadSentEnquiries = async () => {`;

const fixedSnippet = `    } catch (err) {
      console.log("Cloud project fetch skipped, using local data.");
    }
  };
  loadAssignedProjects();
}, []);

  useEffect(() => {
    const loadSentEnquiries = async () => {`;

if (code.includes(targetSnippet)) {
  code = code.replace(targetSnippet, fixedSnippet);
  console.log("EXACT_HOOK_CLOSURE_RESTORED");
} else {
  // Regex fallback matching the catch block right before loadSentEnquiries
  code = code.replace(
    /(console\.log\("Cloud project fetch skipped, using local data\."\);\s*\}\s*[\r\n]+\s*\};?)(\s*[\r\n]+\s*useEffect\(\(\)\s*=>\s*\{\s*[\r\n]+\s*const loadSentEnquiries)/m,
    `console.log("Cloud project fetch skipped, using local data.");
    }
  };
  loadAssignedProjects();
}, []);$2`
  );
  console.log("REGEX_HOOK_CLOSURE_RESTORED");
}

fs.writeFileSync(filePath, code, "utf8");
