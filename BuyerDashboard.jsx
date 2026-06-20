import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(1);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [chequeNo, setChequeNo] = useState("");
  const [utrNo, setUtrNo] = useState("");
  const [reportType, setReportType] = useState("milestones");
  const [reportFilters, setReportFilters] = useState({ startDate: "", endDate: "", supplier: "", milestoneName: "" });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState("photo");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Site work 65% completed", time: "2 hours ago", read: false },
    { id: 2, message: "Payment received of ₹5.8L", time: "Yesterday", read: false },
    { id: 3, message: "New milestone: Foundation completed", time: "2 days ago", read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Calculator states
  const [calcLength, setCalcLength] = useState("");
  const [calcWidth, setCalcWidth] = useState("");
  const [calcFloors, setCalcFloors] = useState("");
  const [calcRate, setCalcRate] = useState("1800");
  const [calcResult, setCalcResult] = useState(null);

  // Handle responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Phase-wise progress data for chart
  const phaseData = [
    { name: "Design", progress: 100, color: "#10b981" },
    { name: "Foundation", progress: 85, color: "#3b82f6" },
    { name: "Structure", progress: 45, color: "#f59e0b" },
    { name: "Finishing", progress: 20, color: "#ef4444" }
  ];

  // Timeline data
  const timelineData = [
    { month: "Jan", completed: 2, planned: 2 },
    { month: "Feb", completed: 1, planned: 2 },
    { month: "Mar", completed: 3, planned: 3 },
    { month: "Apr", completed: 2, planned: 3 },
    { month: "May", completed: 1, planned: 2 },
    { month: "Jun", completed: 0, planned: 2 }
  ];

  const calculateBUA = (length, width, floors) => {
    const setback = (length + width) / 2 * 0.1;
    const effectiveLength = length - setback;
    const effectiveWidth = width - setback;
    return Math.round(effectiveLength * effectiveWidth * floors);
  };

  const handleCalculate = () => {
    if (calcLength && calcWidth && calcFloors) {
      const setback = (parseFloat(calcLength) + parseFloat(calcWidth)) / 2 * 0.1;
      const bua = Math.round((parseFloat(calcLength) - setback) * (parseFloat(calcWidth) - setback) * parseFloat(calcFloors));
      const totalCost = bua * parseFloat(calcRate);
      setCalcResult({ bua, totalCost });
    }
  };

  const generateMilestones = (startDate, endDate, totalAmount) => {
    const templates = [
      { name: "Site Clearance & Leveling", percentage: 0.5, duration: 3, phase: "Site Prep" },
      { name: "Soil Testing & Report", percentage: 0.3, duration: 5, phase: "Design" },
      { name: "Marking & Layout", percentage: 0.2, duration: 2, phase: "Design" },
      { name: "Excavation for Foundation", percentage: 2.5, duration: 7, phase: "Foundation" },
      { name: "Foundation PCC Work", percentage: 1.5, duration: 3, phase: "Foundation" },
      { name: "Foundation Reinforcement", percentage: 2.0, duration: 4, phase: "Foundation" },
      { name: "Foundation Concreting", percentage: 2.5, duration: 3, phase: "Foundation" },
      { name: "Backfilling & Compaction", percentage: 1.0, duration: 5, phase: "Foundation" },
      { name: "Plinth Beam Work", percentage: 4.5, duration: 9, phase: "Structure" },
      { name: "Ground Floor Column", percentage: 2.5, duration: 5, phase: "Structure" },
      { name: "Ground Floor Slab", percentage: 6.5, duration: 12, phase: "Structure" },
      { name: "First Floor Column", percentage: 2.5, duration: 5, phase: "Structure" },
      { name: "First Floor Slab", percentage: 6.5, duration: 12, phase: "Structure" },
      { name: "Brick Masonry", percentage: 6.0, duration: 15, phase: "Structure" },
      { name: "Plastering", percentage: 5.0, duration: 10, phase: "Finishing" },
      { name: "Flooring & Tiling", percentage: 6.0, duration: 12, phase: "Finishing" },
      { name: "Plumbing & Electrical", percentage: 4.0, duration: 10, phase: "Finishing" },
      { name: "Woodwork", percentage: 5.0, duration: 12, phase: "Finishing" },
      { name: "Painting", percentage: 6.0, duration: 12, phase: "Finishing" },
      { name: "Fittings & Fixtures", percentage: 5.5, duration: 11, phase: "Finishing" },
      { name: "External Works", percentage: 4.0, duration: 10, phase: "Finishing" },
      { name: "Cleaning & Handover", percentage: 2.5, duration: 4, phase: "Finishing" }
    ];
    let cumulativeDays = 0;
    const start = new Date(startDate);
    return templates.map((template, idx) => {
      const plannedStart = new Date(start);
      plannedStart.setDate(start.getDate() + cumulativeDays);
      const plannedEnd = new Date(plannedStart);
      plannedEnd.setDate(plannedEnd.getDate() + template.duration);
      cumulativeDays += template.duration;
      return {
        id: idx + 1,
        name: template.name,
        percentage: template.percentage,
        phase: template.phase,
        amount: (totalAmount * template.percentage) / 100,
        plannedStartDate: plannedStart.toISOString().split("T")[0],
        plannedEndDate: plannedEnd.toISOString().split("T")[0],
        status: "Pending",
        paymentReleased: false
      };
    });
  };

  const [projects, setProjects] = useState([
    { id: 1, name: "Sunrise Villa", plotLength: 50, plotWidth: 40, floors: 2, bua: 0, ratePerSft: 1800, totalAmount: 0, contractorName: "Sharma Construction", contractorMobile: "+919876511111", contractorAddress: "Andheri, Mumbai", startDate: "2024-01-01", endDate: "2024-12-31", progress: 65, status: "In Progress", milestones: [], payments: [], inventory: [], media: [] }
  ]);

  const [newProject, setNewProject] = useState({ name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", contractorAddress: "", startDate: "", endDate: "" });
  const [inventory, setInventory] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ materialCode: "", material: "", unit: "bags", supplier: "", invoiceNo: "", receiverName: "", receivedQty: "" });
  const [siteMedia, setSiteMedia] = useState([]);

  useEffect(() => {
    if (projects[0] && projects[0].milestones.length === 0) {
      const bua = calculateBUA(projects[0].plotLength, projects[0].plotWidth, projects[0].floors);
      const totalAmount = bua * projects[0].ratePerSft;
      const milestones = generateMilestones(projects[0].startDate, projects[0].endDate, totalAmount);
      setProjects([{ ...projects[0], bua, totalAmount, milestones }]);
    }
  }, []);

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const projectMilestones = selectedProjectData?.milestones || [];
  const projectPayments = selectedProjectData?.payments || [];
  const projectInventory = inventory.filter(i => i.projectId === selectedProject);
  const projectMedia = siteMedia.filter(m => m.projectId === selectedProject);
  const completedMilestones = projectMilestones.filter(m => m.status === "Completed").length;
  const progressPercent = projectMilestones.length ? (completedMilestones / projectMilestones.length) * 100 : 0;
  const totalPaid = projectPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalContractAmount = selectedProjectData?.totalAmount || 0;

  // Payment chart data
  const paymentChartData = [
    { name: "Paid", value: totalPaid, color: "#10b981" },
    { name: "Pending", value: totalContractAmount - totalPaid, color: "#ef4444" }
  ];

  // Phase completion data
  const getPhaseCompletion = (phase) => {
    const phaseMilestones = projectMilestones.filter(m => m.phase === phase);
    if (phaseMilestones.length === 0) return 0;
    const completed = phaseMilestones.filter(m => m.status === "Completed").length;
    return (completed / phaseMilestones.length) * 100;
  };

  const phaseProgressData = [
    { name: "Design", progress: getPhaseCompletion("Design"), color: "#3b82f6" },
    { name: "Foundation", progress: getPhaseCompletion("Foundation"), color: "#8b5cf6" },
    { name: "Structure", progress: getPhaseCompletion("Structure"), color: "#f59e0b" },
    { name: "Finishing", progress: getPhaseCompletion("Finishing"), color: "#10b981" }
  ];

  const addProject = () => {
    if (!newProject.name || !newProject.plotLength || !newProject.plotWidth) { alert("Please fill all required fields"); return; }
    if (!newProject.startDate || !newProject.endDate) { alert("Please select start date and end date"); return; }
    const bua = calculateBUA(newProject.plotLength, newProject.plotWidth, newProject.floors);
    const totalAmount = bua * newProject.ratePerSft;
    const milestones = generateMilestones(newProject.startDate, newProject.endDate, totalAmount);
    setProjects([...projects, { id: projects.length + 1, ...newProject, bua, totalAmount, progress: 0, status: "Planning", milestones, payments: [], inventory: [], media: [] }]);
    setNewProject({ name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", contractorAddress: "", startDate: "", endDate: "" });
    setShowAddProject(false);
    alert("Project created!");
  };

  const releasePayment = (milestone) => {
    if (!chequeNo && !utrNo) { alert("Please enter Cheque or UTR Number"); return; }
    const payment = { id: projectPayments.length + 1, milestoneId: milestone.id, milestoneName: milestone.name, amount: milestone.amount, date: new Date().toISOString().split("T")[0], status: "Paid", chequeNo: chequeNo, utrNo: utrNo };
    setProjects(projects.map(p => p.id === selectedProject ? { ...p, milestones: p.milestones.map(m => m.id === milestone.id ? { ...m, paymentReleased: true, status: "Completed" } : m), payments: [...p.payments, payment] } : p));
    setChequeNo(""); setUtrNo(""); setShowPaymentModal(false);
    alert("Payment released!");
  };

  const sharePayment = (payment) => {
    const mobile = selectedProjectData?.contractorMobile;
    if (!mobile) return;
    const message = "*PAYMENT DETAILS - " + selectedProjectData?.name + "*%0A%0AMilestone: " + payment.milestoneName + "%0AAmount: ₹" + (payment.amount/1000).toFixed(0) + "K%0ADate: " + payment.date + "%0AReference: " + (payment.chequeNo || payment.utrNo);
    window.open("https://wa.me/" + mobile + "?text=" + message, "_blank");
  };

  const addMaterial = () => {
    if (!newMaterial.material || !newMaterial.receivedQty) { alert("Enter material name and quantity"); return; }
    setInventory([...inventory, { id: inventory.length + 1, projectId: selectedProject, materialCode: newMaterial.materialCode || ("MAT-" + String(inventory.length + 1).padStart(3, "0")), material: newMaterial.material, receivedQty: parseFloat(newMaterial.receivedQty), consumed: 0, balance: parseFloat(newMaterial.receivedQty), unit: newMaterial.unit, supplier: newMaterial.supplier, invoiceNo: newMaterial.invoiceNo, receiverName: newMaterial.receiverName, receivedDate: new Date().toISOString().split("T")[0] }]);
    setNewMaterial({ materialCode: "", material: "", unit: "bags", supplier: "", invoiceNo: "", receiverName: "", receivedQty: "" });
    setShowMaterialModal(false);
    alert("Material recorded!");
  };

  const updateConsumed = (id, consumed) => {
    const item = inventory.find(i => i.id === id);
    setInventory(inventory.map(i => i.id === id ? { ...i, consumed: parseFloat(consumed), balance: item.receivedQty - parseFloat(consumed) } : i));
  };

  const uploadMedia = () => {
    if (!mediaTitle) { alert("Enter title"); return; }
    const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : null;
    setSiteMedia([...siteMedia, { id: siteMedia.length + 1, projectId: selectedProject, type: mediaType, title: mediaTitle, url: mediaUrl, date: new Date().toISOString().split("T")[0] }]);
    setMediaTitle(""); setMediaFile(null); setMediaPreview(null); setShowMediaModal(false);
    alert("Media uploaded!");
  };

  const generateReport = () => {
    let data = [];
    if (reportType === "milestones") data = projectMilestones.map(m => ({ Milestone: m.name, Phase: m.phase, Amount: m.amount, Status: m.status, PlannedDate: m.plannedEndDate }));
    else if (reportType === "payments") data = projectPayments.map(p => ({ Milestone: p.milestoneName, Amount: p.amount, Date: p.date, Reference: p.chequeNo || p.utrNo }));
    else data = projectInventory.map(i => ({ Material: i.material, Received: i.receivedQty, Consumed: i.consumed, Balance: i.balance, Supplier: i.supplier }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);
    XLSX.writeFile(wb, reportType + "_report_" + new Date().toISOString().split("T")[0] + ".xlsx");
    alert("Report downloaded!");
  };

  const exportToPDF = () => {
    alert("PDF export feature - would generate professional PDF report");
  };

  const shareWhatsApp = () => {
    const mobile = selectedProjectData?.contractorMobile;
    if (!mobile) return;
    const message = "*🏗️ PROJECT UPDATE - " + selectedProjectData?.name + "*%0A%0A📊 Progress: " + progressPercent.toFixed(0) + "%0A💰 Paid: ₹" + (totalPaid/100000).toFixed(1) + "L%0A📉 Balance: ₹" + ((totalContractAmount - totalPaid)/100000).toFixed(1) + "L%0A✅ Milestones: " + completedMilestones + "/" + projectMilestones.length;
    window.open("https://wa.me/" + mobile + "?text=" + message, "_blank");
  };

  // AI Summary
  const getAISummary = () => {
    if (progressPercent >= 90) return "🎉 Project is near completion! Final finishing works in progress.";
    if (progressPercent >= 70) return "✅ Project is on track. Major structural work completed.";
    if (progressPercent >= 50) return "⚙️ Project is half way through. Foundation and structure work ongoing.";
    if (progressPercent >= 30) return "🏗️ Foundation work completed. Structure work in progress.";
    return "📐 Project just started. Site preparation and design phase ongoing.";
  };

  // Styles
  const styles = {
    app: { display: "flex", minHeight: "100vh", backgroundColor: darkMode ? "#0f172a" : "#f0f2f5" },
    sidebar: {
      width: sidebarOpen ? "280px" : (isMobile ? "0px" : "80px"),
      backgroundColor: darkMode ? "#1e293b" : "#800020",
      color: "white",
      transition: "all 0.3s",
      position: isMobile ? "fixed" : "relative",
      height: "100vh",
      overflowY: "auto",
      zIndex: 1000,
      left: 0,
      top: 0
    },
    sidebarHeader: { padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" },
    logo: { fontSize: "20px", fontWeight: "bold", margin: 0 },
    toggleBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" },
    navItem: { display: "flex", alignItems: "center", padding: "12px 20px", margin: "4px 12px", borderRadius: "12px", cursor: "pointer", gap: "12px", transition: "all 0.2s" },
    navItemActive: { backgroundColor: "rgba(255,255,255,0.2)" },
    navIcon: { fontSize: "20px", minWidth: "28px" },
    navText: { fontSize: "14px", fontWeight: "500" },
    mainContent: {
      flex: 1,
      marginLeft: isMobile ? 0 : (sidebarOpen ? "0px" : "0px"),
      padding: "24px",
      width: "100%",
      overflowX: "hidden"
    },
    topBar: {
      backgroundColor: darkMode ? "#1e293b" : "white",
      borderRadius: "16px",
      padding: "16px 24px",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
    },
    projectSelector: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap"
    },
    select: {
      padding: "10px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      backgroundColor: darkMode ? "#334155" : "white",
      color: darkMode ? "white" : "#333",
      fontSize: "14px"
    },
    button: {
      backgroundColor: "#800020",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      transition: "all 0.2s"
    },
    buttonOutline: {
      backgroundColor: "transparent",
      color: "#800020",
      padding: "8px 16px",
      border: "1px solid #800020",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "500"
    },
    grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px", marginBottom: "24px" },
    card: {
      backgroundColor: darkMode ? "#1e293b" : "white",
      borderRadius: "20px",
      padding: "20px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)",
      transition: "transform 0.2s, box-shadow 0.2s"
    },
    cardHover: { cursor: "pointer", transition: "transform 0.2s" },
    cardTitle: { fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: darkMode ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", gap: "8px" },
    statValue: { fontSize: "32px", fontWeight: "bold", color: darkMode ? "white" : "#800020" },
    statLabel: { fontSize: "13px", color: darkMode ? "#94a3b8" : "#666", marginTop: "4px" },
    progressBar: { height: "10px", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginTop: "12px" },
    progressFill: { height: "100%", backgroundColor: "#10b981", borderRadius: "10px", transition: "width 0.5s" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
    modalContent: { backgroundColor: "white", borderRadius: "24px", padding: "28px", width: "90%", maxWidth: "550px", maxHeight: "85vh", overflow: "auto" },
    input: { width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "16px", fontSize: "14px" },
    label: { display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#334155" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" },
    td: { padding: "12px", borderBottom: "1px solid #e2e8f0" },
    notificationBadge: { position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#ef4444", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
    mobileMenuBtn: { position: "fixed", bottom: "20px", right: "20px", backgroundColor: "#800020", color: "white", width: "56px", height: "56px", borderRadius: "28px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", border: "none", fontSize: "24px", cursor: "pointer" }
  };

  // Sidebar menu
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "projects", name: "Projects", icon: "🏗️" },
    { id: "milestones", name: "Milestones", icon: "🎯" },
    { id: "payments", name: "Payments", icon: "💰" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "progress", name: "Site Progress", icon: "📸" },
    { id: "reports", name: "Reports", icon: "📈" },
    { id: "messages", name: "Messages", icon: "💬" },
    { id: "settings", name: "Settings", icon: "⚙️" }
  ];

  // Dashboard Content
  const renderDashboard = () => (
    <div>
      {/* AI Summary Card */}
      <div style={{ ...styles.card, marginBottom: "24px", backgroundColor: darkMode ? "#1e293b" : "#fef3c7", border: "1px solid #fcd34d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🤖</span>
          <div>
            <div style={{ fontSize: "13px", color: "#92400e", fontWeight: "500" }}>AI PROJECT SUMMARY</div>
            <div style={{ fontSize: "15px", color: "#78350f", fontWeight: "500" }}>{getAISummary()}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.grid4}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>💰 Total Project Value</div>
          <div style={styles.statValue}>₹{(totalContractAmount/100000).toFixed(2)}L</div>
          <div style={styles.statLabel}>Contract Amount</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>✅ Amount Paid</div>
          <div style={styles.statValue}>₹{(totalPaid/100000).toFixed(2)}L</div>
          <div style={styles.statLabel}>Of {Math.round((totalPaid/totalContractAmount)*100)}% completed</div>
          <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${(totalPaid/totalContractAmount)*100}%` }}></div></div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>📉 Balance Remaining</div>
          <div style={styles.statValue}>₹{((totalContractAmount - totalPaid)/100000).toFixed(2)}L</div>
          <div style={styles.statLabel}>Yet to be paid</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>📊 Completion Rate</div>
          <div style={styles.statValue}>{progressPercent.toFixed(0)}%</div>
          <div style={styles.statLabel}>{completedMilestones}/{projectMilestones.length} Milestones Done</div>
          <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${progressPercent}%` }}></div></div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>📈 Phase-wise Progress</div>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progress" fill="#800020" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>💰 Payment Distribution</div>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Details & Milestones */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>🏢 Project Details</div>
          <div style={{ display: "grid", gap: "12px" }}>
            <div><strong>Project Name:</strong> {selectedProjectData?.name}</div>
            <div><strong>Plot Size:</strong> {selectedProjectData?.plotLength}' x {selectedProjectData?.plotWidth}'</div>
            <div><strong>Floors:</strong> {selectedProjectData?.floors}</div>
            <div><strong>Built-up Area:</strong> {selectedProjectData?.bua?.toLocaleString()} sq.ft</div>
            <div><strong>Contractor:</strong> {selectedProjectData?.contractorName}</div>
            <div><strong>Contact:</strong> {selectedProjectData?.contractorMobile}</div>
            <div><strong>Timeline:</strong> {selectedProjectData?.startDate} to {selectedProjectData?.endDate}</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>📅 Recent Milestones</div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {projectMilestones.slice(0, 8).map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontWeight: "500" }}>{m.name}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Due: {m.plannedEndDate}</div>
                </div>
                <div>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "500",
                    backgroundColor: m.status === "Completed" ? "#d1fae5" : m.status === "In Progress" ? "#fed7aa" : "#f1f5f9",
                    color: m.status === "Completed" ? "#065f46" : m.status === "In Progress" ? "#92400e" : "#475569"
                  }}>
                    {m.status === "Completed" ? "✅" : m.status === "In Progress" ? "🔄" : "⏳"} {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>📰 Activity Feed</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "start", padding: "12px", backgroundColor: darkMode ? "#334155" : "#f8fafc", borderRadius: "12px" }}>
            <span style={{ fontSize: "24px" }}>🏗️</span>
            <div><strong>Site work progress</strong><br />65% of structural work completed</div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "start", padding: "12px", backgroundColor: darkMode ? "#334155" : "#f8fafc", borderRadius: "12px" }}>
            <span style={{ fontSize: "24px" }}>💰</span>
            <div><strong>Payment Received</strong><br />₹5.8L received for Foundation milestone</div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "start", padding: "12px", backgroundColor: darkMode ? "#334155" : "#f8fafc", borderRadius: "12px" }}>
            <span style={{ fontSize: "24px" }}>📐</span>
            <div><strong>Drawing Update</strong><br />Floor plans uploaded for review</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div>
      <button onClick={() => setShowAddProject(true)} style={styles.button}>+ New Project</button>
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {projects.map(p => (
          <div key={p.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => { setSelectedProject(p.id); setActiveTab("dashboard"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div><h3 style={{ margin: 0 }}>{p.name}</h3><p style={{ margin: "8px 0 0", fontSize: "13px", color: "#64748b" }}>{p.contractorName}</p></div>
              <div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#800020" }}>{p.progress}%</div><div style={{ fontSize: "12px", color: "#64748b" }}>{p.status}</div></div>
            </div>
            <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${p.progress}%` }}></div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>🎯 All Milestones</div>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>#</th><th style={styles.th}>Milestone</th><th style={styles.th}>Phase</th><th style={styles.th}>Amount</th><th style={styles.th}>Due Date</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead>
          <tbody>
            {projectMilestones.map(m => (
              <tr key={m.id}>
                <td style={styles.td}>{m.id}</td>
                <td style={styles.td}>{m.name}</td>
                <td style={styles.td}><span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "11px", backgroundColor: "#e2e8f0" }}>{m.phase}</span></td>
                <td style={styles.td}>₹{(m.amount/1000).toFixed(0)}K</td>
                <td style={styles.td}>{m.plannedEndDate}</td>
                <td style={styles.td}>
                  <select value={m.status} onChange={(e) => {
                    setProjects(projects.map(p => p.id === selectedProject ? {
                      ...p, milestones: p.milestones.map(m2 => m2.id === m.id ? { ...m2, status: e.target.value } : m2),
                      progress: Math.round(p.milestones.filter(mil => mil.id === m.id ? e.target.value === "Completed" : mil.status === "Completed").length / p.milestones.length * 100)
                    } : p));
                  }} style={{ padding: "4px 8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <option>Pending</option><option>In Progress</option><option>Completed</option>
                  </select>
                </td>
                <td style={styles.td}>
                  {!m.paymentReleased && m.status === "Completed" && (
                    <button onClick={() => { setSelectedMilestone(m); setShowPaymentModal(true); }} style={styles.buttonOutline}>Release Payment</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>💰 Payment History</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "16px", textAlign: "center" }}><div style={{ fontSize: "13px", color: "#64748b" }}>Total Contract</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#800020" }}>₹{(totalContractAmount/100000).toFixed(2)}L</div></div>
        <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "16px", textAlign: "center" }}><div style={{ fontSize: "13px", color: "#64748b" }}>Total Paid</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>₹{(totalPaid/100000).toFixed(2)}L</div></div>
        <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "16px", textAlign: "center" }}><div style={{ fontSize: "13px", color: "#64748b" }}>Balance</div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>₹{((totalContractAmount - totalPaid)/100000).toFixed(2)}L</div></div>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Date</th><th style={styles.th}>Milestone</th><th style={styles.th}>Amount</th><th style={styles.th}>Reference</th><th style={styles.th}>Action</th></tr></thead>
        <tbody>
          {projectPayments.map(p => (
            <tr key={p.id}><td style={styles.td}>{p.date}</td><td style={styles.td}>{p.milestoneName}</td><td style={styles.td}>₹{(p.amount/1000).toFixed(0)}K</td><td style={styles.td}>{p.chequeNo || p.utrNo}</td><td style={styles.td}><button onClick={() => sharePayment(p)} style={styles.buttonOutline}>Share</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInventory = () => (
    <div><button onClick={() => setShowMaterialModal(true)} style={styles.button}>+ Receive Material</button><div style={styles.card}><div style={styles.cardTitle}>📦 Material Inventory</div><table style={styles.table}><thead><tr><th style={styles.th}>Code</th><th style={styles.th}>Material</th><th style={styles.th}>Received</th><th style={styles.th}>Consumed</th><th style={styles.th}>Balance</th><th style={styles.th}>Supplier</th></tr></thead><tbody>{projectInventory.map(i => (<tr key={i.id}><td style={styles.td}>{i.materialCode}</td><td style={styles.td}>{i.material}</td><td style={styles.td}>{i.receivedQty} {i.unit}</td><td style={styles.td}><input type="number" value={i.consumed} onChange={(e) => updateConsumed(i.id, e.target.value)} style={{ width: "70px", padding: "6px", borderRadius: "8px", border: "1px solid #e2e8f0" }} /></td><td style={styles.td}>{i.balance} {i.unit}</td><td style={styles.td}>{i.supplier}</td></tr>))}</tbody></table></div></div>
  );

  const renderProgress = () => (
    <div><button onClick={() => setShowMediaModal(true)} style={styles.button}>+ Upload Media</button><div style={styles.card}><div style={styles.cardTitle}>📸 Site Gallery</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "16px" }}>{projectMedia.map(m => (<div key={m.id} style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", cursor: "pointer" }} onClick={() => setSelectedMedia(m)}><img src={m.url} style={{ width: "100%", height: "140px", objectFit: "cover" }} /><div style={{ padding: "12px", fontSize: "13px", fontWeight: "500" }}>{m.title}</div></div>))}</div></div></div>
  );

  const renderReports = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>📊 Reports & Analytics</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
        <button onClick={() => { setReportType("milestones"); setShowReportModal(true); }} style={styles.button}>📋 Milestone Report</button>
        <button onClick={() => { setReportType("payments"); setShowReportModal(true); }} style={styles.button}>💰 Payment Report</button>
        <button onClick={() => { setReportType("inventory"); setShowReportModal(true); }} style={styles.button}>📦 Inventory Report</button>
        <button onClick={exportToPDF} style={{ ...styles.button, backgroundColor: "#ef4444" }}>📄 Export PDF</button>
      </div>
    </div>
  );

  const renderMessages = () => <div style={styles.card}><div style={styles.cardTitle}>💬 Messages</div><p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Coming soon - Contractor communication portal</p></div>;
  const renderSettings = () => <div style={styles.card}><div style={styles.cardTitle}>⚙️ Settings</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #e2e8f0" }}><span>Dark Mode</span><button onClick={() => setDarkMode(!darkMode)} style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", cursor: "pointer", backgroundColor: darkMode ? "#334155" : "white" }}>{darkMode ? "🌙 Dark" : "☀️ Light"}</button></div></div>;

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard": return renderDashboard();
      case "projects": return renderProjects();
      case "milestones": return renderMilestones();
      case "payments": return renderPayments();
      case "inventory": return renderInventory();
      case "progress": return renderProgress();
      case "reports": return renderReports();
      case "messages": return renderMessages();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, display: isMobile && !sidebarOpen ? "none" : "flex", flexDirection: "column" }}>
        <div style={styles.sidebarHeader}>
          {sidebarOpen ? <h2 style={styles.logo}>🏗️ BuildTrack</h2> : <h2 style={styles.logo}>🏠</h2>}
          {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleBtn}>{sidebarOpen ? "◀" : "▶"}</button>}
        </div>
        {menuItems.map(item => (
          <div key={item.id} onClick={() => { setActiveTab(item.id); if(isMobile) setSidebarOpen(false); }} style={{ ...styles.navItem, ...(activeTab === item.id ? styles.navItemActive : {}) }}>
            <span style={styles.navIcon}>{item.icon}</span>
            {sidebarOpen && <span style={styles.navText}>{item.name}</span>}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div style={styles.projectSelector}>
            <span style={{ fontWeight: "500" }}>📋 Project:</span>
            <select value={selectedProject} onChange={(e) => setSelectedProject(parseInt(e.target.value))} style={styles.select}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} - {p.status} ({p.progress}%)</option>)}
            </select>
            <button onClick={() => setShowAddProject(true)} style={styles.button}>+ New Project</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowNotifications(!showNotifications)}>
              <span style={{ fontSize: "24px" }}>🔔</span>
              {notifications.filter(n => !n.read).length > 0 && <div style={styles.notificationBadge}>{notifications.filter(n => !n.read).length}</div>}
            </div>
            <div onClick={() => setDarkMode(!darkMode)} style={{ cursor: "pointer", fontSize: "20px" }}>{darkMode ? "🌙" : "☀️"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#800020", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>JD</div>
              <span style={{ fontWeight: "500" }}>John Doe</span>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

      {/* Mobile Menu Button */}
      {isMobile && !sidebarOpen && <button onClick={() => setSidebarOpen(true)} style={styles.mobileMenuBtn}>☰</button>}

      {/* Modals */}
      {showAddProject && <div style={styles.modal} onClick={() => setShowAddProject(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>New Project</h3><input type="text" placeholder="Project Name" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} style={styles.input} /><div style={styles.row2}><input type="number" placeholder="Length (ft)" value={newProject.plotLength} onChange={(e) => setNewProject({...newProject, plotLength: parseFloat(e.target.value)})} style={styles.input} /><input type="number" placeholder="Width (ft)" value={newProject.plotWidth} onChange={(e) => setNewProject({...newProject, plotWidth: parseFloat(e.target.value)})} style={styles.input} /></div><button onClick={addProject} style={styles.button}>Create Project</button></div></div>}
      {showPaymentModal && selectedMilestone && <div style={styles.modal} onClick={() => setShowPaymentModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Release Payment - {selectedMilestone.name}</h3><input type="text" placeholder="Cheque No" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} style={styles.input} /><input type="text" placeholder="UTR No" value={utrNo} onChange={(e) => setUtrNo(e.target.value)} style={styles.input} /><button onClick={() => releasePayment(selectedMilestone)} style={styles.button}>Release Payment</button></div></div>}
      {showMaterialModal && <div style={styles.modal} onClick={() => setShowMaterialModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Add Material</h3><input type="text" placeholder="Material Name" value={newMaterial.material} onChange={(e) => setNewMaterial({...newMaterial, material: e.target.value})} style={styles.input} /><input type="number" placeholder="Quantity" value={newMaterial.receivedQty} onChange={(e) => setNewMaterial({...newMaterial, receivedQty: e.target.value})} style={styles.input} /><button onClick={addMaterial} style={styles.button}>Add Material</button></div></div>}
      {showMediaModal && <div style={styles.modal} onClick={() => setShowMediaModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Upload Media</h3><input type="text" placeholder="Title" value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} style={styles.input} /><input type="file" onChange={(e) => setMediaFile(e.target.files[0])} style={styles.input} /><button onClick={uploadMedia} style={styles.button}>Upload</button></div></div>}
      {showReportModal && <div style={styles.modal} onClick={() => setShowReportModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Generate Report</h3><button onClick={generateReport} style={styles.button}>Download Excel</button></div></div>}
      {showMediaViewer && selectedMedia && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={() => setShowMediaViewer(false)}><div><img src={selectedMedia.url} style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px" }} /><button onClick={() => setShowMediaViewer(false)} style={{ position: "absolute", top: 20, right: 30, color: "white", fontSize: 30, background: "none", border: "none", cursor: "pointer" }}>×</button></div></div>}
    </div>
  );
}
