const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";
let code = fs.readFileSync(filePath, "utf8");

// 1. Replace the entire styles definition with compact, laptop-optimized dimensions
const oldStylesRegex = /const styles = \{[\s\S]*?\n  \};\n\n  const tabs =/m;

const newStyles = `const styles = {
    container: { padding: "8px 12px", backgroundColor: "#f0f2f5", minHeight: "100dvh", width: "100%", maxWidth: "100vw", boxSizing: "border-box", overflowX: "auto" },
    header: { backgroundColor: "#800020", color: "white", padding: "10px 14px", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "16px", fontWeight: "700" },
    headerSub: { margin: "2px 0 0", fontSize: "11px", opacity: 0.9 },
    tabContainer: { display: "flex", gap: "4px", marginBottom: "10px", borderBottom: "1px solid #ddd", flexWrap: "wrap", backgroundColor: "white", padding: "0 10px", borderRadius: "8px 8px 0 0" },
    tab: { padding: "8px 14px", cursor: "pointer", borderBottom: "2px solid transparent", fontSize: "12px", fontWeight: "600" },
    activeTab: { borderBottomColor: "#800020", color: "#800020" },
    card: { backgroundColor: "white", borderRadius: "8px", padding: "8px 12px", marginBottom: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", width: "100%", maxWidth: "100%", boxSizing: "border-box" },
    cardTitle: { fontSize: "12px", fontWeight: "700", marginBottom: "6px", borderBottom: "1.5px solid #800020", paddingBottom: "4px", color: "#0f172a" },
    grid2: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
      gap: "8px",
      marginBottom: "8px",
      width: "100%"
    },
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))", gap: "8px", marginBottom: "8px", width: "100%", boxSizing: "border-box" },
    grid4: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
      gap: "6px",
      marginBottom: "8px",
      width: "100%",
      boxSizing: "border-box"
    },
    button: { backgroundColor: "#800020", color: "white", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px", fontWeight: "600" },
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px" },
    buttonDanger: { backgroundColor: "#dc3545", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px" },
    table: {
      width: "100%",
      minWidth: "680px",
      borderCollapse: "collapse",
      fontSize: "11px"
    },
    th: {
      padding: "5px 8px",
      fontSize: "11px",
      fontWeight: "700",
      textAlign: "left",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #cbd5e1",
      whiteSpace: "nowrap"
    },
    td: {
      padding: "5px 8px",
      fontSize: "11px",
      borderBottom: "1px solid #f1f5f9",
      whiteSpace: "nowrap"
    },
    input: { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "8px", boxSizing: "border-box", fontSize: "12px" },
    label: { display: "block", marginBottom: "3px", fontWeight: "600", fontSize: "11px", color: "#475569" },
    select: { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "8px", boxSizing: "border-box", fontSize: "12px" },
    textarea: { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "8px", boxSizing: "border-box", fontFamily: "inherit", fontSize: "12px" },
    row2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "8px", marginBottom: "6px", width: "100%", boxSizing: "border-box", fontSize: "12px" },
    row3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: "8px", marginBottom: "6px", width: "100%", boxSizing: "border-box", fontSize: "12px" },
    progressBar: { height: "5px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "3px", overflow: "hidden", marginTop: "4px" },
    progressFill: { height: "100%", backgroundColor: "#ffd700", borderRadius: "3px", transition: "width 0.3s" },
    statBox: {
      padding: "6px 8px",
      borderRadius: "7px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      boxSizing: "border-box",
      minHeight: "50px"
    },
    statValue: {
      fontSize: "15px",
      fontWeight: "800",
      lineHeight: "1.15",
      margin: "0 0 1px 0"
    },
    statLabel: {
      fontSize: "10px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      opacity: 0.95,
      margin: 0
    },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "12px", padding: "16px", width: "min(500px, 94vw)", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box" },
    statusBadge: { padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "600", display: "inline-block" }
  };

  const tabs =`;

code = code.replace(oldStylesRegex, newStyles);

// 2. Reduce the Countdown Banner from 24px to 14px and padding
code = code.replace(
  'fontSize: "24px", fontWeight: "bold"',
  'fontSize: "14px", fontWeight: "800"'
);

// 3. Reduce Project Details Title from 24px to 15px
code = code.replace(
  'fontSize: "24px", fontWeight: "bold", color: "#800020"',
  'fontSize: "15px", fontWeight: "800", color: "#800020"'
);

// 4. Update the 4 Metric Stat Card Elements to use styles.statBox
code = code.replace(
  'style: { ...styles.card, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }',
  'style: { ...styles.statBox, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }'
);
code = code.replace(
  'style: { ...styles.card, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }',
  'style: { ...styles.statBox, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }'
);
code = code.replace(
  'style: { ...styles.card, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }',
  'style: { ...styles.statBox, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }'
);
code = code.replace(
  'style: { ...styles.card, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }',
  'style: { ...styles.statBox, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }'
);

fs.writeFileSync(filePath, code, "utf8");
console.log("BUYER_DASHBOARD_PERMANENTLY_COMPACTED");
