const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Add state for Issue Material Modal
if (!code.includes("showIssueModal")) {
  code = code.replace(
    'const [showMaterialModal, setShowMaterialModal] = useState(false);',
    'const [showMaterialModal, setShowMaterialModal] = useState(false);\n  const [showIssueModal, setShowIssueModal] = useState(false);\n  const [issueEntry, setIssueEntry] = useState({ materialId: "", date: new Date().toISOString().split("T")[0], quantity: "", purpose: "" });'
  );
}

// 2. Add issueMaterial handler
const issueHandler = `
  const issueMaterial = () => {
    if (!selectedProjectData) return alert("Select project first.");
    if (!issueEntry.materialId) return alert("Please select a material from available stock.");
    const qty = Number(issueEntry.quantity || 0);
    if (qty <= 0) return alert("Please enter a valid issue quantity.");

    const currentInventory = selectedProjectData?.inventory || [];
    const targetItem = currentInventory.find((i: any) => String(i.id) === String(issueEntry.materialId));

    if (!targetItem) return alert("Selected material not found in inventory.");
    const currentBalance = Number(targetItem.balanceQty ?? targetItem.balance ?? (Number(targetItem.receivedQty || 0) - Number(targetItem.consumedQty || 0)));

    if (qty > currentBalance) {
      return alert(\`Cannot issue \${qty} \${targetItem.unit}. Available balance stock is only \${currentBalance} \${targetItem.unit}.\`);
    }

    const issueDate = issueEntry.date || new Date().toISOString().split("T")[0];
    const newConsumed = Number(targetItem.consumedQty ?? targetItem.consumed ?? 0) + qty;
    const newBalance = currentBalance - qty;

    const issueLogRecord = {
      id: Date.now(),
      materialId: targetItem.id,
      material: targetItem.material,
      unit: targetItem.unit,
      date: issueDate,
      issuedQty: qty,
      purpose: issueEntry.purpose || "Site Consumption",
      previousBalance: currentBalance,
      closingBalance: newBalance
    };

    const updatedInventory = currentInventory.map((item: any) => {
      if (String(item.id) === String(targetItem.id)) {
        return {
          ...item,
          consumedQty: newConsumed,
          consumed: newConsumed,
          balanceQty: newBalance,
          balance: newBalance,
          lastIssueDate: issueDate,
          issues: [...(item.issues || []), issueLogRecord]
        };
      }
      return item;
    });

    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      inventory: updatedInventory,
      inventoryLogs: [...(p.inventoryLogs || []), issueLogRecord]
    } : p);

    persistBuyerUpdates(updatedProjects);
    setIssueEntry({ materialId: "", date: new Date().toISOString().split("T")[0], quantity: "", purpose: "" });
    setShowIssueModal(false);
    alert(\`Successfully issued \${qty} \${targetItem.unit} of \${targetItem.material}! Closing balance: \${newBalance} \${targetItem.unit}.\`);
  };
`;

if (!code.includes("const issueMaterial =")) {
  code = code.replace("const addMaterial = () => {", issueHandler + "\n  const addMaterial = () => {");
}

// 3. Update renderInventory to feature both "+ Receive Material" and "📤 Issue / Consume Material"
const updatedRenderInventory = `const renderInventory = () => {
    const allItems = projectInventory || [];
    const displayedItems = selectedInventoryDate 
      ? allItems.filter((i: any) => (i.date || i.receivedDate || i.invoiceDate || "").startsWith(selectedInventoryDate))
      : allItems;

    const totalReceived = displayedItems.reduce((sum: number, i: any) => sum + Number(i.receivedQty || 0), 0);
    const totalConsumed = displayedItems.reduce((sum: number, i: any) => sum + Number(i.consumedQty ?? i.consumed ?? 0), 0);
    const totalBalance = displayedItems.reduce((sum: number, i: any) => sum + Number(i.balanceQty ?? i.balance ?? 0), 0);
    const totalCost = displayedItems.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);

    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        // Header with Dual Actions
        React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" } },
          React.createElement("span", null, "📦 Material Stock & Issue Register - ", selectedProjectData?.name || "Villa"),
          React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
            React.createElement("button", { onClick: () => setShowMaterialModal(true), style: styles.buttonSuccess }, "+ Receive / Inward Material"),
            React.createElement("button", { onClick: () => setShowIssueModal(true), style: { ...styles.button, backgroundColor: "#d97706" } }, "📤 Issue / Consume Stock")
          )
        ),

        // Date Filter Bar
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "8px", marginBottom: "10px", flexWrap: "wrap", gap: "8px" } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "6px" } },
            React.createElement("label", { style: { ...styles.label, margin: 0, fontWeight: "800", color: "#1e293b" } }, "📅 Filter by Date:"),
            React.createElement("input", {
              type: "date",
              value: selectedInventoryDate,
              onChange: (e) => setSelectedInventoryDate(e.target.value),
              style: { ...styles.input, width: "auto", margin: 0, padding: "4px 8px", height: "30px", fontSize: "12px" }
            }),
            selectedInventoryDate && React.createElement("button", {
              onClick: () => setSelectedInventoryDate(""),
              style: { ...styles.button, padding: "4px 8px", fontSize: "11px", backgroundColor: "#64748b" }
            }, "Show All Dates")
          ),
          React.createElement("div", { style: { fontSize: "12px", fontWeight: "700", color: "#0f172a" } },
            selectedInventoryDate ? "Showing items for: " + selectedInventoryDate : "All Inventory Stock Items (" + allItems.length + " types)"
          )
        ),

        // Summary Metric Badges
        React.createElement("div", { style: { ...styles.grid4, marginBottom: "10px" } },
          React.createElement("div", { style: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#1e40af", fontWeight: "700" } }, "TOTAL INWARD UNITS"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#1e3a8a" } }, totalReceived.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#fef3c7", border: "1px solid #fde68a", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#92400e", fontWeight: "700" } }, "TOTAL ISSUED / CONSUMED"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#78350f" } }, totalConsumed.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#065f46", fontWeight: "700" } }, "CLOSING STOCK BALANCE"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#047857" } }, totalBalance.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#fdf2f8", border: "1px solid #fbcfe8", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#9d174d", fontWeight: "700" } }, "TOTAL VALUE"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#831843" } }, "₹" + (totalCost/100000).toFixed(2) + "L")
          )
        ),

        // Table with Action Column to Issue Directly
        React.createElement("div", { style: { overflowX: "auto", width: "100%" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Material"),
                React.createElement("th", { style: styles.th }, "Last Inward Date"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Received"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Issued / Consumed"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Closing Balance"),
                React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Unit"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Rate (₹)"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Amount (₹)"),
                React.createElement("th", { style: styles.th }, "Supplier / Invoice"),
                React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Action")
              )
            ),
            React.createElement("tbody", null,
              displayedItems.map((i: any) => {
                const bal = Number(i.balanceQty ?? i.balance ?? (Number(i.receivedQty || 0) - Number(i.consumedQty || 0)));
                return React.createElement("tr", { key: i.id },
                  React.createElement("td", { style: { ...styles.td, fontWeight: "800", color: "#0f172a" } }, i.material),
                  React.createElement("td", { style: styles.td }, i.date || i.receivedDate || i.invoiceDate || "-"),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "700", color: "#1e40af" } }, Number(i.receivedQty || 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "700", color: "#b45309" } }, Number(i.consumedQty ?? i.consumed ?? 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: bal > 0 ? "#15803d" : "#dc2626" } },
                    bal.toLocaleString() + (bal === 0 ? " (Out of stock)" : "")
                  ),
                  React.createElement("td", { style: { ...styles.td, textAlign: "center", textTransform: "uppercase", fontSize: "10.5px" } }, i.unit || "-"),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right" } }, "₹" + Number(i.rate || 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "800", color: "#065f46" } }, "₹" + Number(i.amount || 0).toLocaleString()),
                  React.createElement("td", { style: styles.td }, i.supplier || "-", i.invoiceNo ? " / " + i.invoiceNo : ""),
                  React.createElement("td", { style: { ...styles.td, textAlign: "center" } },
                    bal > 0 ? React.createElement("button", {
                      onClick: () => {
                        setIssueEntry({ materialId: String(i.id), date: new Date().toISOString().split("T")[0], quantity: "", purpose: "" });
                        setShowIssueModal(true);
                      },
                      style: { ...styles.button, backgroundColor: "#d97706", padding: "3px 8px", fontSize: "10.5px" }
                    }, "📤 Issue") : React.createElement("span", { style: { fontSize: "10.5px", color: "#94a3b8" } }, "Depleted")
                  )
                );
              }),
              displayedItems.length === 0 && React.createElement("tr", null,
                React.createElement("td", { colSpan: 10, style: { ...styles.td, textAlign: "center", padding: "20px" } }, "No inventory entries found.")
              )
            ),
            displayedItems.length > 0 && React.createElement("tfoot", null,
              React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderTop: "2px solid #cbd5e1" } },
                React.createElement("td", { colSpan: 2, style: { ...styles.td, fontWeight: "800", color: "#0f172a" } }, "TOTALS:"),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#1e40af" } }, totalReceived.toLocaleString()),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#b45309" } }, totalConsumed.toLocaleString()),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#15803d" } }, totalBalance.toLocaleString()),
                React.createElement("td", { style: styles.td }, "-"),
                React.createElement("td", { style: styles.td }, "-"),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#065f46", fontSize: "13px" } }, "₹" + totalCost.toLocaleString()),
                React.createElement("td", { colSpan: 2, style: styles.td }, "")
              )
            )
          )
        )
      )
    );
  };`;

code = code.replace(/const renderInventory = \(\) => \{[\s\S]*?\n  \};\n\n  const renderQuotations/m, updatedRenderInventory + "\n\n  const renderQuotations");

// 4. Inject Issue Stock Modal into the JSX
const issueModalJSX = `
    // Issue / Consume Stock Modal (Single-Column Vertical Excel Sheet)
    showIssueModal && React.createElement("div", { style: styles.modal, onClick: () => setShowIssueModal(false) },
      React.createElement("div", { style: { ...styles.modalContent, width: "min(460px, 94vw)", maxWidth: "460px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#b45309", margin: "0 0 14px 0", fontSize: "16px", borderBottom: "1.5px solid #b45309", paddingBottom: "6px" } }, "📤 Issue / Consume Material from Stock"),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Select Stock Material *"),
            React.createElement("select", {
              value: issueEntry.materialId,
              onChange: (e) => setIssueEntry({ ...issueEntry, materialId: e.target.value }),
              style: styles.select
            },
              React.createElement("option", { value: "" }, "-- Choose from Available Stock --"),
              (projectInventory || []).filter((i: any) => {
                const bal = Number(i.balanceQty ?? i.balance ?? (Number(i.receivedQty || 0) - Number(i.consumedQty || 0)));
                return bal > 0;
              }).map((i: any) => {
                const bal = Number(i.balanceQty ?? i.balance ?? (Number(i.receivedQty || 0) - Number(i.consumedQty || 0)));
                return React.createElement("option", { key: i.id, value: String(i.id) },
                  \`\${i.material} (Available: \${bal.toLocaleString()} \${i.unit})\`
                );
              })
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Issue / Consumption Date *"),
            React.createElement("input", {
              type: "date",
              value: issueEntry.date,
              onChange: (e) => setIssueEntry({ ...issueEntry, date: e.target.value }),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Quantity to Issue *"),
            React.createElement("input", {
              type: "number",
              min: 1,
              placeholder: "e.g. 200",
              value: issueEntry.quantity,
              onChange: (e) => setIssueEntry({ ...issueEntry, quantity: e.target.value }),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Work Purpose / Site Location *"),
            React.createElement("input", {
              placeholder: "e.g. Ground floor column reinforcement / Plinth bed",
              value: issueEntry.purpose,
              onChange: (e) => setIssueEntry({ ...issueEntry, purpose: e.target.value }),
              style: styles.input
            })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" } },
          React.createElement("button", { onClick: () => setShowIssueModal(false), style: { ...styles.buttonDanger, padding: "6px 14px" } }, "Cancel"),
          React.createElement("button", { onClick: issueMaterial, style: { ...styles.button, backgroundColor: "#d97706", padding: "6px 20px", fontWeight: "bold" } }, "Confirm Issue")
        )
      )
    ),
`;

if (!code.includes("showIssueModal &&")) {
  code = code.replace("showExtraWorkModal &&", issueModalJSX + "\n    showExtraWorkModal &&");
}

fs.writeFileSync(filePath, code, "utf8");
console.log("INVENTORY_ISSUE_AND_CONSUMPTION_STOCK_REGISTER_APPLIED");
