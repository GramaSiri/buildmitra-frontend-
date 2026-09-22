const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// Add week offset state to BuyerDashboard component
if (!code.includes("currentWeekOffset")) {
  code = code.replace(
    'const [activeTab, setActiveTab] = useState("dashboard");',
    'const [activeTab, setActiveTab] = useState("dashboard");\n  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);'
  );
}

// Smart attendance table with dynamic date headers, week selector, and total footer summary
const smartLabourComponent = `  const toggleLabourDay = (labourId: any, dayIndex: number) => {
    const updatedProjects = projects.map(p => {
      if (String(p.id) !== String(selectedProject)) return p;
      const currentLabourList = (p.labour && p.labour.length > 0) ? p.labour : getContractorLabourForProject(p);
      const updatedLabour = currentLabourList.map((l: any) => {
        if (String(l.id) === String(labourId)) {
          const currentDays = Number(l.daysPresent || 0);
          const currentWeek = Array.isArray(l.week) ? [...l.week] : [true, true, true, true, true, true, false];
          currentWeek[dayIndex] = !currentWeek[dayIndex];
          const newDaysPresent = currentWeek.filter(Boolean).length;
          const wage = Number(l.dailyWage || l.wage || 0);
          return {
            ...l,
            week: currentWeek,
            daysPresent: newDaysPresent,
            totalPayment: wage * newDaysPresent
          };
        }
        return l;
      });
      return { ...p, labour: updatedLabour };
    });
    persistBuyerUpdates(updatedProjects);
  };

  const getWeekDays = (offsetWeeks = 0) => {
    const curr = new Date();
    const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1 + (offsetWeeks * 7)));
    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      days.push({
        dayName: dayNames[i],
        dateStr: \`\${dayNum} \${monthShort}\`,
        fullDate: d.toISOString().split("T")[0]
      });
    }
    return days;
  };

  const renderLabour = () => {
    const weekDays = getWeekDays(currentWeekOffset);
    const weekRangeText = \`\${weekDays[0].dateStr} - \${weekDays[6].dateStr}\`;

    const rows = projectLabour.map((labour: any) => {
      const daysPresent = Number(labour.daysPresent ?? 6);
      const wage = Number(labour.dailyWage || labour.wage || 0);
      const week = Array.isArray(labour.week) && labour.week.length === 7 
        ? labour.week 
        : [true, true, true, true, true, true, false];
      const amount = wage * week.filter(Boolean).length;
      return {
        ...labour,
        role: labour.role || labour.category || "General",
        wage,
        daysPresent: week.filter(Boolean).length,
        amount,
        week
      };
    });

    const totalDaysAllLabours = rows.reduce((sum: number, r: any) => sum + r.daysPresent, 0);
    const grandTotalCost = rows.reduce((sum: number, r: any) => sum + r.amount, 0);
    const dailyPresents = [0, 1, 2, 3, 4, 5, 6].map(colIdx => rows.filter(r => r.week[colIdx]).length);

    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        // Header with Title & Action
        React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" } },
          React.createElement("span", null, "👷 Labour Attendance & Wage Register - ", selectedProjectData?.name || "Villa"),
          React.createElement("button", { onClick: () => setShowLabourModal(true), style: styles.buttonSuccess }, "+ Add Labour")
        ),

        // Smart Calendar Week Navigator
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", marginBottom: "10px" } },
          React.createElement("button", {
            onClick: () => setCurrentWeekOffset(prev => prev - 1),
            style: { ...styles.button, padding: "4px 10px", fontSize: "11px", backgroundColor: "#475569" }
          }, "◀ Previous Week"),
          React.createElement("div", { style: { fontWeight: "800", fontSize: "13px", color: "#1e293b" } },
            "📅 Week: ", weekRangeText
          ),
          React.createElement("button", {
            onClick: () => setCurrentWeekOffset(prev => prev + 1),
            style: { ...styles.button, padding: "4px 10px", fontSize: "11px", backgroundColor: "#475569" }
          }, "Next Week ▶")
        ),

        // Summary Stat Bar
        React.createElement("div", { style: { ...styles.grid3, marginBottom: "10px" } },
          React.createElement("div", { style: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "11px", color: "#1e40af", fontWeight: "700" } }, "TOTAL WORKERS"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#1e3a8a" } }, rows.length)
          ),
          React.createElement("div", { style: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "11px", color: "#166534", fontWeight: "700" } }, "TOTAL MANDAYS"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#14532d" } }, totalDaysAllLabours, " Days")
          ),
          React.createElement("div", { style: { backgroundColor: "#fefce8", border: "1px solid #fef08a", padding: "6px 10px", borderRadius: "6px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "11px", color: "#854d0e", fontWeight: "700" } }, "WEEKLY LABOUR COST"),
            React.createElement("strong", { style: { fontSize: "15px", color: "#713f12" } }, "₹", grandTotalCost.toLocaleString())
          )
        ),

        // Table with Exact Dates in Headers & Summary Totals in Footer
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: { ...styles.th, width: "160px" } }, "Worker Name"),
                React.createElement("th", { style: styles.th }, "Trade"),
                React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Wage (₹)"),
                ...weekDays.map(w =>
                  React.createElement("th", { key: w.fullDate, style: { ...styles.th, textAlign: "center", padding: "4px" } },
                    React.createElement("div", { style: { fontWeight: "800", color: "#0f172a" } }, w.dayName),
                    React.createElement("div", { style: { fontSize: "9.5px", color: "#64748b", fontWeight: "600" } }, w.dateStr)
                  )
                ),
                React.createElement("th", { style: { ...styles.th, textAlign: "center" } }, "Days"),
                React.createElement("th", { style: { ...styles.th, textAlign: "right" } }, "Payout (₹)")
              )
            ),
            React.createElement("tbody", null,
              rows.map((l: any) => React.createElement("tr", { key: l.id },
                React.createElement("td", { style: { ...styles.td, fontWeight: "700", color: "#0f172a" } }, l.name),
                React.createElement("td", { style: styles.td }, l.role),
                React.createElement("td", { style: { ...styles.td, textAlign: "center" } }, "₹", l.wage.toLocaleString()),
                ...l.week.map((present: boolean, idx: number) =>
                  React.createElement("td", { key: idx, style: { ...styles.td, textAlign: "center" } },
                    React.createElement("input", {
                      type: "checkbox",
                      checked: !!present,
                      onChange: () => toggleLabourDay(l.id, idx),
                      style: { cursor: "pointer", width: "16px", height: "16px", accentColor: "#059669" },
                      title: \`\${weekDays[idx].dayName} (\${weekDays[idx].dateStr}) - \${present ? 'Present' : 'Absent'}\`
                    })
                  )
                ),
                React.createElement("td", { style: { ...styles.td, textAlign: "center", fontWeight: "800", color: "#2563eb" } }, l.daysPresent),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "800", color: "#166534" } }, "₹", l.amount.toLocaleString())
              )),
              rows.length === 0 && React.createElement("tr", null,
                React.createElement("td", { colSpan: 12, style: { ...styles.td, textAlign: "center", padding: "20px" } }, "No labour entries yet. Click '+ Add Labour' above.")
              )
            ),
            // Grand Total Footer Row
            rows.length > 0 && React.createElement("tfoot", null,
              React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderTop: "2px solid #cbd5e1" } },
                React.createElement("td", { colSpan: 3, style: { ...styles.td, fontWeight: "800", color: "#0f172a" } }, "Daily Present Count:"),
                ...dailyPresents.map((cnt, i) =>
                  React.createElement("td", { key: i, style: { ...styles.td, textAlign: "center", fontWeight: "800", color: cnt > 0 ? "#15803d" : "#94a3b8" } }, cnt)
                ),
                React.createElement("td", { style: { ...styles.td, textAlign: "center", fontWeight: "900", color: "#1e40af", fontSize: "13px" } }, totalDaysAllLabours),
                React.createElement("td", { style: { ...styles.td, textAlign: "right", fontWeight: "900", color: "#065f46", fontSize: "14px" } }, "₹", grandTotalCost.toLocaleString())
              )
            )
          )
        )
      )
    );
  };`;

// Replace the existing renderLabour function cleanly
code = code.replace(
  /const toggleLabourDay[\s\S]*?const renderReports/m,
  smartLabourComponent + "\n\n  const renderReports"
);

fs.writeFileSync(filePath, code, "utf8");
console.log("SMART_DATE_CALENDAR_AND_TOTAL_LABOUR_COST_APPLIED");
