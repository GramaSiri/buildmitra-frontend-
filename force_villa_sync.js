const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// Master seed data for Villa
const MASTER_VILLA_BLOCK = `
const MASTER_VILLA = {
  id: "1",
  name: "Villa - Planning & Construction",
  status: "In Progress",
  progress: 35,
  bua: 2400,
  floors: 2,
  costPerSqft: 2100,
  budget: 5040000,
  spent: 1250000,
  milestones: [
    { id: 1, name: "Foundation & Plinth", amount: 750000, status: "Completed", dueDate: "2026-08-15" },
    { id: 2, name: "Ground Floor Structure", amount: 1000000, status: "In Progress", dueDate: "2026-09-30" },
    { id: 3, name: "First Floor Slab", amount: 1000000, status: "Pending", dueDate: "2026-10-31" },
    { id: 4, name: "Brickwork & Plastering", amount: 850000, status: "Pending", dueDate: "2026-11-30" },
    { id: 5, name: "Finishing & Handover", amount: 1440000, status: "Pending", dueDate: "2026-12-31" }
  ],
  inventory: [
    { id: 101, material: "Tata Tiscon Fe550D TMT Steel", date: "2026-09-22", receivedQty: 1000, consumedQty: 200, balanceQty: 800, unit: "kg", rate: 67, amount: 67000, supplier: "ABCD Traders", invoiceNo: "INV-125" },
    { id: 102, material: "UltraTech PPC Cement", date: "2026-09-22", receivedQty: 200, consumedQty: 10, balanceQty: 190, unit: "bags", rate: 360, amount: 72000, supplier: "ABCD Traders", invoiceNo: "INV-123" },
    { id: 103, material: "Triple Washed M-Sand", date: "2026-09-20", receivedQty: 600, consumedQty: 150, balanceQty: 450, unit: "cft", rate: 48, amount: 28800, supplier: "Kaveri Aggregates", invoiceNo: "INV-098" }
  ],
  labourList: [
    { id: 1, name: "Ramesh Kumar", role: "Mason", dailyWage: 950, daysPresent: 6, paymentAmount: 5700, status: "Present" },
    { id: 2, name: "Suresh Gowda", role: "Barbender", dailyWage: 900, daysPresent: 5, paymentAmount: 4500, status: "Present" },
    { id: 3, name: "Manjunath", role: "Helper", dailyWage: 650, daysPresent: 6, paymentAmount: 3900, status: "Present" }
  ],
  payments: [
    { id: 1, date: "2026-08-10", milestone: "Foundation & Plinth", amount: 750000, mode: "Bank Transfer", status: "Paid", ref: "TXN-882910" },
    { id: 2, date: "2026-09-05", milestone: "Ground Floor Advance", amount: 500000, mode: "NEFT", status: "Paid", ref: "TXN-991204" }
  ],
  extraWorks: []
};
`;

if (!code.includes("MASTER_VILLA = {")) {
  code = MASTER_VILLA_BLOCK + "\n" + code;
}

// 1. Force the useState for projects to ALWAYS start with MASTER_VILLA if empty
code = code.replace(
  /const \[projects,\s*setProjects\]\s*=\s*useState<any\[\]>[\s\S]*?const \[selectedProject,\s*setSelectedProject\]\s*=\s*useState<string>\("1"\);/m,
  `const [projects, setProjects] = useState<any[]>([MASTER_VILLA]);\n  const [selectedProject, setSelectedProject] = useState<string>("1");`
);

// 2. Ensure selectedProjectData ALWAYS resolves to MASTER_VILLA if null or undefined
code = code.replace(
  /const selectedProjectData = [^;]+;/g,
  'const selectedProjectData = (projects && projects.length > 0) ? (projects.find((p: any) => String(p.id) === String(selectedProject)) || projects[0]) : MASTER_VILLA;'
);

// 3. Mount-time check that auto-populates local storage if empty
const autoSyncHook = `
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("buildmitra_buyer_projects") || localStorage.getItem("projects");
      if (!stored || stored === "[]" || stored === "null") {
        localStorage.setItem("buildmitra_buyer_projects", JSON.stringify([MASTER_VILLA]));
        localStorage.setItem("projects", JSON.stringify([MASTER_VILLA]));
        setProjects([MASTER_VILLA]);
      } else {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
          } else {
            setProjects([MASTER_VILLA]);
          }
        } catch {
          setProjects([MASTER_VILLA]);
        }
      }
    }
  }, []);
`;

// Insert the autoSyncHook right under selectedProject
code = code.replace(
  'const [selectedProject, setSelectedProject] = useState<string>("1");',
  `const [selectedProject, setSelectedProject] = useState<string>("1");\n${autoSyncHook}`
);

fs.writeFileSync(filePath, code, "utf8");
console.log("HARDCODED_MASTER_VILLA_SYNC_APPLIED");
