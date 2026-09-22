const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Add inventory date filter state
if (!code.includes("selectedInventoryDate")) {
  code = code.replace(
    'const [currentWeekOffset, setCurrentWeekOffset] = useState(0);',
    'const [currentWeekOffset, setCurrentWeekOffset] = useState(0);\n  const [selectedInventoryDate, setSelectedInventoryDate] = useState("");'
  );
}

// 2. Ensure newMaterial includes date by default
code = code.replace(
  /newMaterial,\s*setNewMaterial\]\s*=\s*useState\(\{[\s\S]*?\}\);/,
  `newMaterial, setNewMaterial] = useState({
    date: new Date().toISOString().split("T")[0],
    material: "",
    unit: "bags",
    supplier: "",
    orderedQty: "",
    receivedQty: "",
    consumedQty: "",
    rate: "",
    invoiceNo: ""
  });`
);

// 3. Ensure addMaterial captures the entry date properly
const newAddMaterial = `const addMaterial = () => {
    if (!selectedProjectData) return alert("Select project first.");
    if (!newMaterial.material || !newMaterial.receivedQty) return alert("Enter material name and received quantity.");

    const entryDate = newMaterial.date || new Date().toISOString().split("T")[0];
    const orderedQty = Number(newMaterial.orderedQty || newMaterial.receivedQty || 0);
    const receivedQty = Number(newMaterial.receivedQty || 0);
    const consumedQty = Number(newMaterial.consumedQty || 0);
    const rate = Number(newMaterial.rate || 0);
    const balanceQty = Math.max(0, receivedQty - consumedQty);
    const amount = receivedQty * rate;

    const materialEntry = {
      id: Date.now(),
      projectId: selectedProject,
      date: entryDate,
      materialCode: "MAT-" + Date.now().toString().slice(-6),
      material: newMaterial.material,
      unit: newMaterial.unit,
      orderedQty,
      receivedQty,
      consumedQty,
      consumed: consumedQty,
      balanceQty,
      balance: balanceQty,
      rate,
      amount,
      supplier: newMaterial.supplier,
      invoiceNo: newMaterial.invoiceNo,
      invoiceDate: entryDate,
      receivedDate: entryDate
    };

    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      inventory: [materialEntry, ...(p.inventory || [])]
    } : p);

    persistBuyerUpdates(updatedProjects);
    setNewMaterial({
      date: new Date().toISOString().split("T")[0],
      material: "",
      unit: "bags",
      supplier: "",
      orderedQty: "",
      receivedQty: "",
      consumedQty: "",
      rate: "",
      invoiceNo: ""
    });
    setShowMaterialModal(false);
    alert("Material entry saved successfully!");
  };`;

code = code.replace(/const addMaterial = \(\) => \{[\s\S]*?alert\("Inventory saved\."\);\s*\};/, newAddMaterial);

// 4. Smart renderInventory with Day-Wise Navigator and Totals Footer
const smartInventoryComponent = `const renderInventory = () => {
    const allItems = projectInventory || [];
    const displayedItems = selectedInventoryDate 
      ? allItems.filter((i: any) => (i.date || i.receivedDate || i.invoiceDate || "").startsWith(selectedInventoryDate))
      : allItems;

    const totalOrdered = displayedItems.reduce((sum: number, i: any) => sum + Number(i.orderedQty || i.receivedQty || 0), 0);
    const totalReceived = displayedItems.reduce((sum: number, i: any) => sum + Number(i.receivedQty || 0), 0);
    const totalConsumed = displayedItems.reduce((sum: number, i: any) => sum + Number(i.consumedQty ?? i.consumed ?? 0), 0);
    const totalBalance = displayedItems.reduce((sum: number, i: any) => sum + Number(i.balanceQty ?? i.balance ?? 0), 0);
    const totalCost = displayedItems.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);

    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        // Header
        React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" } },
          React.createElement("span", null, "📦 Material Inventory & Consumption Register - ", selectedProjectData?.name || "Villa"),
          React.createElement("button", { onClick: () => setShowMaterialModal(true), style: styles.buttonSuccess }, "+ Add Material Entry")
        ),

        // Day-Wise Filter Bar
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
            selectedInventoryDate ? "Showing Entries for: " + selectedInventoryDate : "Showing All Recorded Material Receipts (" + allItems.length + " entries)"
          )
        ),

        // Summary Metric Badges
        React.createElement("div", { style: { ...styles.grid4, marginBottom: "10px" } },
          React.createElement("div", { style: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#1e40af", fontWeight: "700" } }, "TOTAL RECEIVED"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#1e3a8a" } }, totalReceived.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#fef3c7", border: "1px solid #fde68a", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#92400e", fontWeight: "700" } }, "TOTAL CONSUMED"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#78350f" } }, totalConsumed.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#065f46", fontWeight: "700" } }, "STOCK BALANCE"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#047857" } }, totalBalance.toLocaleString())
          ),
          React.createElement("div", { style: { backgroundColor: "#fdf2f8", border: "1px solid #fbcfe8", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "10.5px", color: "#9d174d", fontWeight: "700" } }, "TOTAL MATERIAL VALUE"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#831843" } }, "₹" + (totalCost/100000).toFixed(2) + "L")
          )
        ),

        // Table with Date column & Totals Footer
        React.createElement("div", { style: { overflowX: "auto", width: "100%" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Date"),
                React.createElement("th", { style: styles.th }, "Material Name"),
                React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Unit"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Ordered"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Received"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Consumed"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Balance"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Rate (₹)"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Total Cost (₹)"),
                React.createElement("th", { style: styles.th }, "Supplier / Invoice")
              )
            ),
            React.createElement("tbody", null,
              displayedItems.map((i: any) =>
                React.createElement("tr", { key: i.id },
                  React.createElement("td", { style: { ...styles.td, fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" } }, i.date || i.receivedDate || i.invoiceDate || "-"),
                  React.createElement("td", { style: { ...styles.td, fontWeight: "700" } }, i.material),
                  React.createElement("td", { style: { ...styles.td, textAlign: "center", textTransform: "uppercase", fontSize: "10px" } }, i.unit || "-"),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right" } }, Number(i.orderedQty ?? i.receivedQty ?? 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "700", color: "#1e40af" } }, Number(i.receivedQty || 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", color: "#92400e" } }, Number(i.consumedQty ?? i.consumed ?? 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "700", color: "#15803d" } }, Number(i.balanceQty ?? i.balance ?? 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right" } }, "₹" + Number(i.rate || 0).toLocaleString()),
                  React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "800", color: "#065f46" } }, "₹" + Number(i.amount || 0).toLocaleString()),
                  React.createElement("td", { style: styles.td }, i.supplier || "-", i.invoiceNo ? " / " + i.invoiceNo : "")
                )
              ),
              displayedItems.length === 0 && React.createElement("tr", null,
                React.createElement("td", { colSpan: 10, style: { ...styles.td, textAlign: "center", padding: "20px" } }, "No inventory entries found for the selected date.")
              )
            ),
            displayedItems.length > 0 && React.createElement("tfoot", null,
              React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderTop: "2px solid #cbd5e1" } },
                React.createElement("td", { colSpan: 3, style: { ...styles.td, fontWeight: "800", color: "#0f172a" } }, "TOTALS:"),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "800" } }, totalOrdered.toLocaleString()),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#1e40af" } }, totalReceived.toLocaleString()),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "800", color: "#92400e" } }, totalConsumed.toLocaleString()),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#15803d" } }, totalBalance.toLocaleString()),
                React.createElement("td", { style: styles.td }, "-"),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#065f46", fontSize: "13px" } }, "₹" + totalCost.toLocaleString()),
                React.createElement("td", { style: styles.td }, "")
              )
            )
          )
        )
      )
    );
  };`;

code = code.replace(/const renderInventory = \(\) => \{[\s\S]*?\n  \};\n\n  const renderQuotations/m, smartInventoryComponent + "\n\n  const renderQuotations");

// 5. Clean Vertical Modal Form (Row over Row) with Date picker at top
const oldMaterialModalRegex = /showMaterialModal && React\.createElement\("div", \{ style: styles\.modal[\s\S]*?Save Material"\)\s*\)\s*\)\s*\)/;

const newVerticalMaterialModal = `showMaterialModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMaterialModal(false) },
      React.createElement("div", { style: { ...styles.modalContent, width: "min(460px, 94vw)", maxWidth: "460px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#2d6a4f", margin: "0 0 14px 0", fontSize: "16px", borderBottom: "1.5px solid #2d6a4f", paddingBottom: "6px" } }, "📦 Material Inventory Entry"),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Receipt Date *"),
            React.createElement("input", {
              type: "date",
              value: newMaterial.date || new Date().toISOString().split("T")[0],
              onChange: (e) => setNewMaterial({...newMaterial, date: e.target.value}),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Material Name *"),
            React.createElement("input", {
              placeholder: "e.g. UltraTech Cement, Tata Tiscon Steel, M-Sand",
              value: newMaterial.material,
              onChange: (e) => setNewMaterial({...newMaterial, material: e.target.value}),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Unit of Measure *"),
            React.createElement("select", {
              value: newMaterial.unit,
              onChange: (e) => setNewMaterial({...newMaterial, unit: e.target.value}),
              style: styles.select
            },
              React.createElement("option", { value: "bags" }, "Bags (Cement)"),
              React.createElement("option", { value: "kg" }, "Kg (Steel/Iron)"),
              React.createElement("option", { value: "cft" }, "CFT (Sand/Aggregate)"),
              React.createElement("option", { value: "nos" }, "Nos (Blocks/Bricks)"),
              React.createElement("option", { value: "litres" }, "Litres (Paint/Chemicals)"),
              React.createElement("option", { value: "cu.m" }, "Cu.m (RMC Concrete)")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Ordered Quantity"),
            React.createElement("input", {
              type: "number",
              min: 0,
              placeholder: "e.g. 100",
              value: newMaterial.orderedQty,
              onChange: (e) => setNewMaterial({...newMaterial, orderedQty: e.target.value}),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Received Quantity * (up to 6+ digits)"),
            React.createElement("input", {
              type: "number",
              min: 0,
              placeholder: "e.g. 100",
              value: newMaterial.receivedQty,
              onChange: (e) => setNewMaterial({...newMaterial, receivedQty: e.target.value}),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Consumed Quantity"),
            React.createElement("input", {
              type: "number",
              min: 0,
              placeholder: "e.g. 20 (leave blank or 0 if stored)",
              value: newMaterial.consumedQty,
              onChange: (e) => setNewMaterial({...newMaterial, consumedQty: e.target.value}),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Rate per Unit (₹) *"),
            React.createElement("input", {
              type: "number",
              min: 0,
              placeholder: "e.g. 365",
              value: newMaterial.rate,
              onChange: (e) => setNewMaterial({...newMaterial, rate: e.target.value}),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Supplier / Vendor Name"),
            React.createElement("input", {
              placeholder: "e.g. Sri Balaji Traders",
              value: newMaterial.supplier,
              onChange: (e) => setNewMaterial({...newMaterial, supplier: e.target.value}),
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Invoice / Delivery Challan No."),
            React.createElement("input", {
              placeholder: "e.g. INV-2026-089",
              value: newMaterial.invoiceNo,
              onChange: (e) => setNewMaterial({...newMaterial, invoiceNo: e.target.value}),
              style: styles.input
            })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" } },
          React.createElement("button", { onClick: () => setShowMaterialModal(false), style: { ...styles.buttonDanger, padding: "6px 14px" } }, "Cancel"),
          React.createElement("button", { onClick: addMaterial, style: { ...styles.buttonSuccess, padding: "6px 20px", fontWeight: "bold" } }, "Save Material Entry")
        )
      )
    )`;

code = code.replace(oldMaterialModalRegex, newVerticalMaterialModal);

fs.writeFileSync(filePath, code, "utf8");
console.log("INVENTORY_DATE_WISE_AND_VERTICAL_FORM_APPLIED");
