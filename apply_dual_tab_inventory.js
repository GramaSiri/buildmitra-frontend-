const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Add sub-tab state for Inventory (Inward vs Issue)
if (!code.includes("inventorySubTab")) {
  code = code.replace(
    'const [showIssueModal, setShowIssueModal] = useState(false);',
    'const [showIssueModal, setShowIssueModal] = useState(false);\n  const [inventorySubTab, setInventorySubTab] = useState("inward");\n  const [stockSearchTerm, setStockSearchTerm] = useState("");\n  const [issueEntry, setIssueEntry] = useState({ materialId: "", date: new Date().toISOString().split("T")[0], quantity: "", purpose: "" });'
  );
}

// 2. Add Pure Stock Issue Logic
const stockIssueLogic = `
  const issueMaterialFromStock = () => {
    if (!selectedProjectData) return alert("Select project first.");
    const currentInventory = selectedProjectData?.inventory || [];

    const targetItem = currentInventory.find((i: any) => 
      String(i.id) === String(issueEntry.materialId) ||
      i.material.toLowerCase() === stockSearchTerm.trim().toLowerCase()
    );

    if (!targetItem) {
      return alert("Please select an available stock item.");
    }

    const qtyToIssue = Number(issueEntry.quantity || 0);
    if (qtyToIssue <= 0) {
      return alert("Please enter a valid issue quantity greater than 0.");
    }

    const currentBal = Number(targetItem.balanceQty ?? targetItem.balance ?? (Number(targetItem.receivedQty || 0) - Number(targetItem.consumedQty || 0)));

    if (qtyToIssue > currentBal) {
      return alert(\`Cannot issue \${qtyToIssue} \${targetItem.unit}. Available balance stock is only \${currentBal} \${targetItem.unit}.\`);
    }

    const issueDate = issueEntry.date || new Date().toISOString().split("T")[0];
    const newConsumed = Number(targetItem.consumedQty ?? targetItem.consumed ?? 0) + qtyToIssue;
    const newBal = currentBal - qtyToIssue;

    const issueRecord = {
      id: Date.now(),
      materialId: targetItem.id,
      material: targetItem.material,
      unit: targetItem.unit,
      date: issueDate,
      issuedQty: qtyToIssue,
      purpose: issueEntry.purpose || "Site Consumption",
      previousBalance: currentBal,
      closingBalance: newBal
    };

    const updatedInventory = currentInventory.map((item: any) => {
      if (String(item.id) === String(targetItem.id)) {
        return {
          ...item,
          consumedQty: newConsumed,
          consumed: newConsumed,
          balanceQty: newBal,
          balance: newBal,
          lastIssueDate: issueDate,
          issues: [issueRecord, ...(item.issues || [])]
        };
      }
      return item;
    });

    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      inventory: updatedInventory,
      issueRegister: [issueRecord, ...(p.issueRegister || [])]
    } : p);

    persistBuyerUpdates(updatedProjects);
    setIssueEntry({ materialId: "", date: new Date().toISOString().split("T")[0], quantity: "", purpose: "" });
    setStockSearchTerm("");
    setShowIssueModal(false);
    alert(\`✅ Successfully issued \${qtyToIssue} \${targetItem.unit} of \${targetItem.material}. Updated closing stock: \${newBal} \${targetItem.unit}.\`);
  };
`;

if (!code.includes("issueMaterialFromStock")) {
  code = code.replace("const addMaterial = () => {", stockIssueLogic + "\n  const addMaterial = () => {");
}

// 3. Dual-Tab Inventory View: [ Stock Inward (Receipts) | Site Issues (Consumption) ]
const dualInventoryComponent = `const renderInventory = () => {
    const inwardItems = selectedProjectData?.inventory || [];
    const issueRecords = selectedProjectData?.issueRegister || (inwardItems.flatMap((i: any) => i.issues || []));

    const totalReceived = inwardItems.reduce((sum: number, i: any) => sum + Number(i.receivedQty || 0), 0);
    const totalConsumed = inwardItems.reduce((sum: number, i: any) => sum + Number(i.consumedQty ?? i.consumed ?? 0), 0);
    const totalBalance = inwardItems.reduce((sum: number, i: any) => sum + Number(i.balanceQty ?? i.balance ?? 0), 0);
    const totalCost = inwardItems.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);

    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        
        // Navigation Switcher Between Inward & Issue
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" } },
          React.createElement("div", { style: { display: "flex", gap: "6px" } },
            React.createElement("button", {
              onClick: () => setInventorySubTab("inward"),
              style: {
                ...styles.button,
                padding: "8px 14px",
                fontSize: "12px",
                borderRadius: "6px",
                backgroundColor: inventorySubTab === "inward" ? "#1e40af" : "#f1f5f9",
                color: inventorySubTab === "inward" ? "#ffffff" : "#475569",
                border: "1px solid " + (inventorySubTab === "inward" ? "#1e40af" : "#cbd5e1")
              }
            }, "📥 Stock Inward (Receipts)"),
            React.createElement("button", {
              onClick: () => setInventorySubTab("issues"),
              style: {
                ...styles.button,
                padding: "8px 14px",
                fontSize: "12px",
                borderRadius: "6px",
                backgroundColor: inventorySubTab === "issues" ? "#b45309" : "#f1f5f9",
                color: inventorySubTab === "issues" ? "#ffffff" : "#475569",
                border: "1px solid " + (inventorySubTab === "issues" ? "#b45309" : "#cbd5e1")
              }
            }, "📤 Site Issues (Consumption Log)")
          ),
          React.createElement("div", null,
            inventorySubTab === "inward" ? (
              React.createElement("button", { onClick: () => setShowMaterialModal(true), style: styles.buttonSuccess }, "+ New Material Inward")
            ) : (
              React.createElement("button", { onClick: () => setShowIssueModal(true), style: { ...styles.button, backgroundColor: "#d97706" } }, "+ Issue Material from Stock")
            )
          )
        ),

        // Live Overall Stock Summary Bar
        React.createElement("div", { style: { ...styles.grid4, marginBottom: "12px" } },
          React.createElement("div", { style: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#1e40af", fontWeight: "700" } }, "TOTAL INWARD UNITS"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#1e3a8a" } }, totalReceived.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#fef3c7", border: "1px solid #fde68a", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#92400e", fontWeight: "700" } }, "TOTAL ISSUED / CONSUMED"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#78350f" } }, totalConsumed.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#065f46", fontWeight: "700" } }, "AVAILABLE STOCK BALANCE"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#047857" } }, totalBalance.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#fdf2f8", border: "1px solid #fbcfe8", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#9d174d", fontWeight: "700" } }, "TOTAL INVENTORY VALUE"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#831843" } }, "₹" + (totalCost/100000).toFixed(2) + "L")
          )
        ),

        // SUB-TAB 1: Inward Table (Receipts)
        inventorySubTab === "inward" ? (
          React.createElement("div", { style: { overflowX: "auto", width: "100%" } },
            React.createElement("table", { style: styles.table },
              React.createElement("thead", null,
                React.createElement("tr", null,
                  React.createElement("th", { style: styles.th }, "Inward Date"),
                  React.createElement("th", { style: styles.th }, "Material Name"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Total Received"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Issued / Used"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Current Stock"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Unit"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Rate (₹)"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Total Value (₹)"),
                  React.createElement("th", { style: styles.th }, "Supplier / Invoice"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Action")
                )
              ),
              React.createElement("tbody", null,
                inwardItems.map((i: any) => {
                  const bal = Number(i.balanceQty ?? i.balance ?? (Number(i.receivedQty || 0) - Number(i.consumedQty || 0)));
                  return React.createElement("tr", { key: i.id },
                    React.createElement("td", { style: { ...styles.td, fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" } }, i.date || i.receivedDate || i.invoiceDate || "-"),
                    React.createElement("td", { style: { ...styles.td, fontWeight: "800" } }, i.material),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "700", color: "#1e40af" } }, Number(i.receivedQty || 0).toLocaleString()),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "700", color: "#b45309" } }, Number(i.consumedQty ?? i.consumed ?? 0).toLocaleString()),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: bal > 0 ? "#15803d" : "#dc2626" } }, bal.toLocaleString()),
                    React.createElement("td", { style: { ...styles.td, textAlign: "center", textTransform: "uppercase", fontSize: "10.5px" } }, i.unit || "-"),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right" } }, "₹" + Number(i.rate || 0).toLocaleString()),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "800", color: "#065f46" } }, "₹" + Number(i.amount || 0).toLocaleString()),
                    React.createElement("td", { style: styles.td }, i.supplier || "-", i.invoiceNo ? " / " + i.invoiceNo : ""),
                    React.createElement("td", { style: { ...styles.td, textAlign: "center" } },
                      bal > 0 ? React.createElement("button", {
                        onClick: () => {
                          setIssueEntry({ materialId: String(i.id), date: new Date().toISOString().split("T")[0], quantity: "", purpose: "" });
                          setStockSearchTerm(i.material);
                          setShowIssueModal(true);
                        },
                        style: { ...styles.button, backgroundColor: "#d97706", padding: "3px 8px", fontSize: "10.5px" }
                      }, "📤 Issue") : React.createElement("span", { style: { fontSize: "10.5px", color: "#94a3b8" } }, "Depleted")
                    )
                  );
                }),
                inwardItems.length === 0 && React.createElement("tr", null,
                  React.createElement("td", { colSpan: 10, style: { ...styles.td, textAlign: "center", padding: "20px" } }, "No inward materials recorded yet. Click '+ New Material Inward' above.")
                )
              )
            )
          )
        ) : (
          // SUB-TAB 2: Issue Register Table (Consumption Log)
          React.createElement("div", { style: { overflowX: "auto", width: "100%" } },
            React.createElement("table", { style: styles.table },
              React.createElement("thead", null,
                React.createElement("tr", null,
                  React.createElement("th", { style: styles.th }, "Issue Date"),
                  React.createElement("th", { style: styles.th }, "Material Name"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Quantity Issued"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Unit"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Previous Stock"),
                  React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Closing Stock"),
                  React.createElement("th", { style: styles.th }, "Work Purpose / Site Location")
                )
              ),
              React.createElement("tbody", null,
                issueRecords.map((r: any) =>
                  React.createElement("tr", { key: r.id },
                    React.createElement("td", { style: { ...styles.td, fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" } }, r.date),
                    React.createElement("td", { style: { ...styles.td, fontWeight: "800", color: "#b45309" } }, r.material),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#dc2626" } }, Number(r.issuedQty || 0).toLocaleString()),
                    React.createElement("td", { style: { ...styles.td, textAlign: "center", textTransform: "uppercase", fontSize: "10.5px" } }, r.unit),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right", color: "#64748b" } }, Number(r.previousBalance || 0).toLocaleString()),
                    React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "800", color: "#15803d" } }, Number(r.closingBalance || 0).toLocaleString()),
                    React.createElement("td", { style: { ...styles.td, fontWeight: "600" } }, r.purpose || "Site Work")
                  )
                ),
                issueRecords.length === 0 && React.createElement("tr", null,
                  React.createElement("td", { colSpan: 7, style: { ...styles.td, textAlign: "center", padding: "20px" } }, "No material issues recorded yet. Click '+ Issue Material from Stock' above.")
                )
              )
            )
          )
        )
      )
    );
  };`;

code = code.replace(/const renderInventory = \(\) => \{[\s\S]*?\n  \};\n\n  const renderQuotations/m, dualInventoryComponent + "\n\n  const renderQuotations");

// 4. Modal Form for Issuing Material with 3-Letter Search
const issueModalJSX = `
    // Pure Issue / Consumption Modal with 3-Letter Stock Auto-Suggest
    showIssueModal && React.createElement("div", { style: styles.modal, onClick: () => setShowIssueModal(false) },
      React.createElement("div", { style: { ...styles.modalContent, width: "min(460px, 94vw)", maxWidth: "460px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#b45309", margin: "0 0 14px 0", fontSize: "16px", borderBottom: "1.5px solid #b45309", paddingBottom: "6px" } }, "📤 Issue Material from Available Stock"),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" } },
          
          // Date
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Issue Date *"),
            React.createElement("input", {
              type: "date",
              value: issueEntry.date,
              onChange: (e) => setIssueEntry({ ...issueEntry, date: e.target.value }),
              style: styles.input
            })
          ),

          // Stock Auto-Suggest Field
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Search Material in Stock (Type 3 letters) *"),
            React.createElement("input", {
              placeholder: "Type e.g. ste, cem, blo...",
              value: stockSearchTerm,
              onChange: (e) => {
                const term = e.target.value;
                setStockSearchTerm(term);
                const match = (selectedProjectData?.inventory || []).find((i: any) => i.material.toLowerCase().includes(term.toLowerCase().trim()));
                if (match) setIssueEntry(prev => ({ ...prev, materialId: String(match.id) }));
              },
              style: styles.input
            }),

            // Filtered Stock Dropdown
            React.createElement("div", { style: { marginTop: "4px" } },
              React.createElement("select", {
                value: issueEntry.materialId,
                onChange: (e) => {
                  const mId = e.target.value;
                  const selected = (selectedProjectData?.inventory || []).find((i: any) => String(i.id) === String(mId));
                  setIssueEntry(prev => ({ ...prev, materialId: mId }));
                  if (selected) setStockSearchTerm(selected.material);
                },
                style: styles.select
              },
                React.createElement("option", { value: "" }, "-- Select Stock Item to Issue --"),
                (selectedProjectData?.inventory || [])
                  .filter((i: any) => {
                    const bal = Number(i.balanceQty ?? i.balance ?? (Number(i.receivedQty || 0) - Number(i.consumedQty || 0)));
                    if (bal <= 0) return false;
                    if (!stockSearchTerm || stockSearchTerm.length < 2) return true;
                    return i.material.toLowerCase().includes(stockSearchTerm.toLowerCase().trim());
                  })
                  .map((i: any) => {
                    const bal = Number(i.balanceQty ?? i.balance ?? (Number(i.receivedQty || 0) - Number(i.consumedQty || 0)));
                    return React.createElement("option", { key: i.id, value: String(i.id) },
                      i.material + " (Stock Available: " + bal.toLocaleString() + " " + i.unit + ")"
                    );
                  })
              )
            )
          ),

          // Quantity to Issue
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Issue Quantity *"),
            React.createElement("input", {
              type: "number",
              min: 1,
              placeholder: "e.g. 200",
              value: issueEntry.quantity,
              onChange: (e) => setIssueEntry({ ...issueEntry, quantity: e.target.value }),
              style: styles.input
            })
          ),

          // Purpose / Site location
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Work Purpose / Site Location *"),
            React.createElement("input", {
              placeholder: "e.g. Column Casting, Plinth Beam, Slab Reinforcement",
              value: issueEntry.purpose,
              onChange: (e) => setIssueEntry({ ...issueEntry, purpose: e.target.value }),
              style: styles.input
            })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" } },
          React.createElement("button", { onClick: () => { setShowIssueModal(false); setStockSearchTerm(""); }, style: { ...styles.buttonDanger, padding: "6px 14px" } }, "Cancel"),
          React.createElement("button", { onClick: issueMaterialFromStock, style: { ...styles.button, backgroundColor: "#d97706", padding: "6px 20px", fontWeight: "bold" } }, "Save Issue Entry")
        )
      )
    ),
`;

if (code.includes("showIssueModal &&")) {
  code = code.replace(/showIssueModal && React\.createElement\("div"[\s\S]*?Save Issue Entry"\)\s*\)\s*\)\s*\),?/m, issueModalJSX);
} else {
  code = code.replace("showExtraWorkModal &&", issueModalJSX + "\n    showExtraWorkModal &&");
}

fs.writeFileSync(filePath, code, "utf8");
console.log("DUAL_TAB_INVENTORY_SYSTEM_APPLIED");
