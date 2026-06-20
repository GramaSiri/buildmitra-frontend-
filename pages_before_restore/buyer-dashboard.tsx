import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const calculateBUA = (length, width, floors) => {
    const setback = (length + width) / 2 * 0.1;
    const effectiveLength = length - setback;
    const effectiveWidth = width - setback;
    return Math.round(effectiveLength * effectiveWidth * floors);
  };

  const generateMilestones = (startDate, endDate, totalAmount) => {
    const templates = [
      { name: "Site Clearance & Leveling", percentage: 0.5, duration: 3 },
      { name: "Soil Testing & Report", percentage: 0.3, duration: 5 },
      { name: "Marking & Layout", percentage: 0.2, duration: 2 },
      { name: "Excavation for Foundation", percentage: 2.5, duration: 7 },
      { name: "Foundation PCC Work", percentage: 1.5, duration: 3 },
      { name: "Foundation Reinforcement", percentage: 2.0, duration: 4 },
      { name: "Foundation Concreting", percentage: 2.5, duration: 3 },
      { name: "Backfilling & Compaction", percentage: 1.0, duration: 5 },
      { name: "Plinth Beam Work", percentage: 4.5, duration: 9 },
      { name: "Ground Floor Column", percentage: 2.5, duration: 5 },
      { name: "Ground Floor Slab", percentage: 6.5, duration: 12 },
      { name: "First Floor Column", percentage: 2.5, duration: 5 },
      { name: "First Floor Slab", percentage: 6.5, duration: 12 },
      { name: "Brick Masonry", percentage: 6.0, duration: 15 },
      { name: "Plastering", percentage: 5.0, duration: 10 },
      { name: "Flooring & Tiling", percentage: 6.0, duration: 12 },
      { name: "Plumbing & Electrical", percentage: 4.0, duration: 10 },
      { name: "Woodwork", percentage: 5.0, duration: 12 },
      { name: "Painting", percentage: 6.0, duration: 12 },
      { name: "Fittings & Fixtures", percentage: 5.5, duration: 11 },
      { name: "External Works", percentage: 4.0, duration: 10 },
      { name: "Cleaning & Handover", percentage: 2.5, duration: 4 }
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
        amount: (totalAmount * template.percentage) / 100,
        plannedStartDate: plannedStart.toISOString().split("T")[0],
        plannedEndDate: plannedEnd.toISOString().split("T")[0],
        status: "Pending",
        paymentReleased: false
      };
    });
  };

  const [projects, setProjects] = useState([
    { id: 1, name: "Sunrise Villa", plotLength: 50, plotWidth: 40, floors: 2, bua: 0, ratePerSft: 1800, totalAmount: 0, contractorName: "Sharma Construction", contractorMobile: "+919876511111", contractorAddress: "Andheri, Mumbai", startDate: "2024-01-01", endDate: "2024-06-30", progress: 65, status: "In Progress", milestones: [], payments: [], inventory: [], media: [] }
  ]);

  const [newProject, setNewProject] = useState({ name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", contractorAddress: "", startDate: "", endDate: "" });
  const [inventory, setInventory] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ materialCode: "", material: "", unit: "bags", supplier: "", invoiceNo: "", receiverName: "", receivedQty: "" });
  const [siteMedia, setSiteMedia] = useState([]);

  React.useEffect(() => {
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
    setProjects(projects.map(p => p.id === selectedProject ? { ...p, milestones: p.milestones.map(m => m.id === milestone.id ? { ...m, paymentReleased: true } : m), payments: [...p.payments, payment] } : p));
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
    if (reportType === "milestones") data = projectMilestones.map(m => ({ Milestone: m.name, Amount: m.amount, Status: m.status }));
    else if (reportType === "payments") data = projectPayments.map(p => ({ Milestone: p.milestoneName, Amount: p.amount, Date: p.date }));
    else data = projectInventory.map(i => ({ Material: i.material, Received: i.receivedQty, Balance: i.balance }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);
    XLSX.writeFile(wb, reportType + "_report.xlsx");
    alert("Report downloaded!");
  };

  const shareWhatsApp = () => {
    const mobile = selectedProjectData?.contractorMobile;
    if (!mobile) return;
    const message = "*PROJECT UPDATE - " + selectedProjectData?.name + "*%0A%0AProgress: " + progressPercent + "%0APaid: ₹" + (totalPaid/100000).toFixed(1) + "L%0ABalance: ₹" + ((totalContractAmount - totalPaid)/100000).toFixed(1) + "L";
    window.open("https://wa.me/" + mobile + "?text=" + message, "_blank");
  };

  const styles = {
    container: { padding: "16px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#800020", color: "white", padding: "16px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    cardTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "12px", borderBottom: "2px solid #800020", paddingBottom: "8px" },
    button: { backgroundColor: "#800020", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "12px", fontSize: "12px" },
    th: { textAlign: "left", padding: "8px", borderBottom: "1px solid #eee" },
    td: { padding: "8px", borderBottom: "1px solid #eee" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "500px" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px", color: "#333" },
    select: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
    progressBar: { height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginTop: "8px" },
    progressFill: { height: "100%", backgroundColor: "#800020" },
    statValue: { fontSize: "28px", fontWeight: "bold", color: "#800020" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    projectSelector: { backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    tabContainer: { display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #eee", flexWrap: "wrap" },
    tab: { padding: "8px 16px", cursor: "pointer", borderBottom: "2px solid transparent" },
    activeTab: { borderBottomColor: "#800020", color: "#800020", fontWeight: "bold" }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "projects", name: "Projects" },
    { id: "milestones", name: "Milestones" },
    { id: "payments", name: "Payments" },
    { id: "inventory", name: "Inventory" },
    { id: "progress", name: "Site Progress" },
    { id: "reports", name: "Reports" }
  ];

  const renderDashboard = () => (
    selectedProjectData && (
      <div>
        <div style={styles.grid4}>
          <div style={styles.card}><div style={styles.statValue}>{progressPercent.toFixed(0)}%</div><div style={styles.statLabel}>Progress</div><div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${progressPercent}%` }}></div></div></div>
          <div style={styles.card}><div style={styles.statValue}>{completedMilestones}/{projectMilestones.length}</div><div style={styles.statLabel}>Milestones</div></div>
          <div style={styles.card}><div style={styles.statValue}>₹{(totalPaid/100000).toFixed(1)}L</div><div style={styles.statLabel}>Paid</div></div>
          <div style={styles.card}><div style={styles.statValue}>₹{((totalContractAmount - totalPaid)/100000).toFixed(1)}L</div><div style={styles.statLabel}>Balance</div></div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Project Details</div>
          <div style={styles.grid2}>
            <div><p><strong>Project:</strong> {selectedProjectData.name}</p><p><strong>Plot:</strong> {selectedProjectData.plotLength}' x {selectedProjectData.plotWidth}'</p><p><strong>BUA:</strong> {selectedProjectData.bua} sqft</p></div>
            <div><p><strong>Contractor:</strong> {selectedProjectData.contractorName}</p><p><strong>Mobile:</strong> {selectedProjectData.contractorMobile}</p><p><strong>Total:</strong> ₹{(selectedProjectData.totalAmount/100000).toFixed(2)}L</p></div>
          </div>
        </div>
      </div>
    )
  );

  const renderProjects = () => (
    <div>
      <button onClick={() => setShowAddProject(true)} style={styles.button}>+ New Project</button>
      {projects.map(p => (
        <div key={p.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => { setSelectedProject(p.id); setActiveTab("dashboard"); }}>
          <h3>{p.name}</h3>
          <p>Contractor: {p.contractorName} | Progress: {p.progress}%</p>
          <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${p.progress}%` }}></div></div>
        </div>
      ))}
    </div>
  );

  const renderMilestones = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Milestones</div>
      {projectMilestones.slice(0, 15).map(m => (
        <div key={m.id} style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
          <span>{m.name}</span>
          <span style={{ color: m.status === "Completed" ? "green" : m.status === "In Progress" ? "orange" : "gray" }}>{m.status}</span>
        </div>
      ))}
    </div>
  );

  const renderPayments = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Payments</div>
      {projectPayments.map(p => (
        <div key={p.id} style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
          <span>{p.milestoneName}</span>
          <span>₹{(p.amount/1000).toFixed(0)}K - {p.date}</span>
        </div>
      ))}
    </div>
  );

  const renderInventory = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Inventory</div>
      <button onClick={() => setShowMaterialModal(true)} style={styles.button}>+ Add Material</button>
      {projectInventory.map(i => (
        <div key={i.id} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
          {i.material}: {i.receivedQty} {i.unit} (Balance: {i.balance})
        </div>
      ))}
    </div>
  );

  const renderProgress = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Site Progress</div>
      <button onClick={() => setShowMediaModal(true)} style={styles.button}>+ Upload Media</button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginTop: "16px" }}>
        {projectMedia.map(m => (
          <div key={m.id} style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", cursor: "pointer" }} onClick={() => setSelectedMedia(m)}>
            <img src={m.url} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
            <div style={{ padding: "8px", fontSize: "12px" }}>{m.title}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Reports</div>
      <button onClick={() => { setReportType("milestones"); setShowReportModal(true); }} style={styles.button}>Download Report</button>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard": return renderDashboard();
      case "projects": return renderProjects();
      case "milestones": return renderMilestones();
      case "payments": return renderPayments();
      case "inventory": return renderInventory();
      case "progress": return renderProgress();
      case "reports": return renderReports();
      default: return renderDashboard();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div><h1 style={styles.headerTitle}>Buyer Dashboard</h1><p style={styles.headerSub}>Track your construction projects</p></div>
        <div><button onClick={shareWhatsApp} style={styles.buttonSuccess}> Share</button><button onClick={() => window.location.href = "/"} style={{ ...styles.button, backgroundColor: "#dc3545", marginLeft: "8px" }}>Logout</button></div>
      </div>

      <div style={styles.projectSelector}>
        <label style={styles.label}>Select Project</label>
        <select value={selectedProject} onChange={(e) => setSelectedProject(parseInt(e.target.value))} style={styles.select}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name} - {p.status} ({p.progress}%)</option>)}
        </select>
        <button onClick={() => setShowAddProject(true)} style={{ ...styles.button, marginTop: "12px" }}>+ New Project</button>
      </div>

      <div style={styles.tabContainer}>
        {tabs.map(tab => <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) }}>{tab.name}</div>)}
      </div>

      {renderContent()}

      {/* MODALS */}
      {showAddProject && <div style={styles.modal} onClick={() => setShowAddProject(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>New Project</h3><input type="text" placeholder="Name" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} style={styles.input} /><button onClick={addProject} style={styles.button}>Create</button></div></div>}
      {showMaterialModal && <div style={styles.modal} onClick={() => setShowMaterialModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Add Material</h3><input type="text" placeholder="Material" value={newMaterial.material} onChange={(e) => setNewMaterial({...newMaterial, material: e.target.value})} style={styles.input} /><input type="number" placeholder="Quantity" value={newMaterial.receivedQty} onChange={(e) => setNewMaterial({...newMaterial, receivedQty: e.target.value})} style={styles.input} /><button onClick={addMaterial} style={styles.button}>Add</button></div></div>}
      {showMediaModal && <div style={styles.modal} onClick={() => setShowMediaModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Upload Media</h3><input type="text" placeholder="Title" value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} style={styles.input} /><input type="file" onChange={(e) => setMediaFile(e.target.files[0])} style={styles.input} /><button onClick={uploadMedia} style={styles.button}>Upload</button></div></div>}
      {showPaymentModal && selectedMilestone && <div style={styles.modal} onClick={() => setShowPaymentModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Release Payment</h3><input type="text" placeholder="Cheque No" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} style={styles.input} /><input type="text" placeholder="UTR No" value={utrNo} onChange={(e) => setUtrNo(e.target.value)} style={styles.input} /><button onClick={() => releasePayment(selectedMilestone)} style={styles.button}>Pay</button></div></div>}
      {showReportModal && <div style={styles.modal} onClick={() => setShowReportModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}><h3>Download Report</h3><button onClick={generateReport} style={styles.button}>Download</button></div></div>}
      {showMediaViewer && selectedMedia && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={() => setShowMediaViewer(false)}><div onClick={(e) => e.stopPropagation()}><img src={selectedMedia.url} style={{ maxWidth: "90vw", maxHeight: "90vh" }} /><button onClick={() => setShowMediaViewer(false)} style={{ position: "absolute", top: 20, right: 30, color: "white", fontSize: 30, background: "none", border: "none" }}>×</button></div></div>}
    </div>
  );
}