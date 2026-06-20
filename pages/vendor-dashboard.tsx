import DashboardHeader from "../components/DashboardHeader";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { logoutToLogin } from "../utils/session";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(1);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [claimAmount, setClaimAmount] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [labourAttendance, setLabourAttendance] = useState([]);

  const [projects, setProjects] = useState([
    { id: 1, name: "Sunrise Villa", client: "Rajesh Sharma", clientMobile: "+919876511111", location: "Andheri, Mumbai", bua: 2500, totalAmount: 4500000, startDate: "2024-01-01", endDate: "2024-06-30", progress: 65, status: "In Progress", paymentReceived: 2925000, balancePayment: 1575000, contractRate: 1800 },
    { id: 2, name: "Green Heights", client: "Priya Mehta", clientMobile: "+919876522222", location: "Bandra, Mumbai", bua: 5000, totalAmount: 9000000, startDate: "2024-02-01", endDate: "2024-08-31", progress: 40, status: "In Progress", paymentReceived: 3600000, balancePayment: 5400000, contractRate: 1800 }
  ]);

  const [newProject, setNewProject] = useState({ name: "", client: "", clientMobile: "", location: "", bua: 0, contractRate: 1800, startDate: "", endDate: "" });

  const [milestones, setMilestones] = useState([
    { id: 1, projectId: 1, name: "Site Clearance", plannedDate: "2024-01-10", actualDate: "2024-01-08", status: "Completed", claimAmount: 300000, paymentReceived: true },
    { id: 2, projectId: 1, name: "Foundation", plannedDate: "2024-01-25", actualDate: "2024-01-22", status: "Completed", claimAmount: 500000, paymentReceived: true },
    { id: 3, projectId: 1, name: "Ground Floor Slab", plannedDate: "2024-02-15", actualDate: null, status: "In Progress", claimAmount: 700000, paymentReceived: false }
  ]);

  const [workers, setWorkers] = useState([
    { id: 1, name: "Ramesh Kumar", role: "Mason", dailyWage: 800, mobile: "+919876511111", projectId: 1 },
    { id: 2, name: "Suresh Patel", role: "Carpenter", dailyWage: 700, mobile: "+919876522222", projectId: 1 }
  ]);

  const [newWorker, setNewWorker] = useState({ name: "", role: "Mason", dailyWage: 800, mobile: "", projectId: 1 });

  const [inventory, setInventory] = useState([
    { id: 1, projectId: 1, name: "Cement", required: 500, received: 450, consumed: 400, balance: 50, unit: "bags", supplier: "ABC Supplies" }
  ]);

  const [newMaterial, setNewMaterial] = useState({ name: "", required: "", unit: "bags", supplier: "" });

  const [claims, setClaims] = useState([
    { id: 1, projectId: 1, milestoneId: 3, milestoneName: "Ground Floor Slab", amount: 700000, date: "2024-02-01", status: "Pending" }
  ]);

  const [changeOrders, setChangeOrders] = useState([
    { id: 1, projectId: 1, description: "Additional bathroom flooring", quantity: 200, rate: 150, amount: 30000, status: "Approved", date: "2024-01-20" }
  ]);

  const [newChange, setNewChange] = useState({ description: "", quantity: 0, rate: 0, amount: 0 });

  const [siteMedia, setSiteMedia] = useState([
    { id: 1, projectId: 1, type: "photo", title: "Foundation Work", date: "2024-01-25" }
  ]);

  const [mediaData, setMediaData] = useState({ type: "photo", title: "" });

  const handleLogout = () => {
    if (confirm("Logout?")) logoutToLogin();
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const projectMilestones = milestones.filter(m => m.projectId === selectedProject);
  const projectWorkers = workers.filter(w => w.projectId === selectedProject);
  const projectInventory = inventory.filter(i => i.projectId === selectedProject);
  const projectClaims = claims.filter(c => c.projectId === selectedProject);
  const projectChanges = changeOrders.filter(c => c.projectId === selectedProject);
  const projectMedia = siteMedia.filter(m => m.projectId === selectedProject);
  const completedMilestones = projectMilestones.filter(m => m.status === "Completed").length;
  const progressPercent = projectMilestones.length ? (completedMilestones / projectMilestones.length) * 100 : 0;

  const addProject = () => {
    if (!newProject.name || !newProject.client) return alert("Fill required fields");
    const totalAmount = newProject.bua * newProject.contractRate;
    setProjects([...projects, { id: projects.length + 1, ...newProject, totalAmount, progress: 0, status: "Planning", paymentReceived: 0, balancePayment: totalAmount }]);
    setNewProject({ name: "", client: "", clientMobile: "", location: "", bua: 0, contractRate: 1800, startDate: "", endDate: "" });
    setShowAddProject(false);
    alert("Project added!");
  };

  const addWorker = () => {
    if (!newWorker.name) return alert("Enter worker name");
    setWorkers([...workers, { ...newWorker, id: workers.length + 1 }]);
    setNewWorker({ name: "", role: "Mason", dailyWage: 800, mobile: "", projectId: 1 });
    setShowWorkerModal(false);
    alert("Worker added!");
  };

  const markAttendance = (workerId, isPresent) => {
    const existing = labourAttendance.find(a => a.workerId === workerId && a.date === attendanceDate);
    if (existing) {
      setLabourAttendance(labourAttendance.map(a => a.workerId === workerId && a.date === attendanceDate ? { ...a, present: isPresent } : a));
    } else {
      setLabourAttendance([...labourAttendance, { id: labourAttendance.length + 1, workerId, date: attendanceDate, present: isPresent }]);
    }
    alert(`Marked as ${isPresent ? "Present" : "Absent"}`);
  };

  const addMaterial = () => {
    if (!newMaterial.name) return alert("Enter material name");
    setInventory([...inventory, { id: inventory.length + 1, projectId: selectedProject, ...newMaterial, required: parseFloat(newMaterial.required), received: 0, consumed: 0, balance: 0 }]);
    setNewMaterial({ name: "", required: "", unit: "bags", supplier: "" });
    setShowMaterialModal(false);
    alert("Material added!");
  };

  const updateMaterialReceived = (id, received) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, received: parseFloat(received), balance: parseFloat(received) - item.consumed } : item));
  };

  const submitClaim = () => {
    if (!claimAmount) return alert("Enter amount");
    setClaims([...claims, { id: claims.length + 1, projectId: selectedProject, milestoneId: selectedMilestone?.id, milestoneName: selectedMilestone?.name, amount: parseFloat(claimAmount), date: new Date().toISOString().split("T")[0], status: "Pending" }]);
    setClaimAmount("");
    setSelectedMilestone(null);
    setShowClaimModal(false);
    alert("Claim submitted!");
  };

  const addChangeOrder = () => {
    if (!newChange.description) return alert("Enter description");
    const amount = newChange.quantity * newChange.rate;
    setChangeOrders([...changeOrders, { id: changeOrders.length + 1, projectId: selectedProject, ...newChange, amount, status: "Pending", date: new Date().toISOString().split("T")[0] }]);
    setNewChange({ description: "", quantity: 0, rate: 0, amount: 0 });
    setShowChangeModal(false);
    alert("Change order submitted!");
  };

  const addMedia = () => {
    if (!mediaData.title) return alert("Enter title");
    setSiteMedia([...siteMedia, { id: siteMedia.length + 1, projectId: selectedProject, type: mediaData.type, title: mediaData.title, date: new Date().toISOString().split("T")[0] }]);
    setMediaData({ type: "photo", title: "" });
    setShowMediaModal(false);
    alert("Media uploaded!");
  };

  const updateMilestoneStatus = (id, status) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, status, actualDate: status === "Completed" ? new Date().toISOString().split("T")[0] : m.actualDate } : m));
    // Update project progress
    const updatedProject = projects.find(p => p.id === selectedProject);
    const updatedMilestones = milestones.map(m => m.projectId === selectedProject ? (m.id === id ? { ...m, status } : m) : m);
    const newCompleted = updatedMilestones.filter(m => m.status === "Completed").length;
    const newProgress = (newCompleted / updatedMilestones.length) * 100;
    setProjects(projects.map(p => p.id === selectedProject ? { ...p, progress: newProgress } : p));
    alert(`Milestone updated to ${status}`);
  };

  const shareWhatsApp = () => {
    const message = `PROJECT UPDATE - ${selectedProjectData?.name}%0AProgress: ${progressPercent}%0AMilestones: ${completedMilestones}/${projectMilestones.length}%0ABalance: ₹${(selectedProjectData?.balancePayment/100000).toFixed(1)}L`;
    window.open(`https://wa.me/${selectedProjectData?.clientMobile}?text=${message}`, "_blank");
  };

  const styles = {
    container: { padding: "16px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#800020", color: "white", padding: "16px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" },
    grid5: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "16px", marginBottom: "20px" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px" },
    cardTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "12px", borderBottom: "2px solid #800020", paddingBottom: "8px" },
    button: { backgroundColor: "#800020", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonDanger: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "12px", fontSize: "12px" },
    th: { textAlign: "left", padding: "8px", borderBottom: "1px solid #eee", fontWeight: "bold" },
    td: { padding: "8px", borderBottom: "1px solid #eee" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "550px", maxHeight: "80vh", overflow: "auto" },
    tabContainer: { display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #eee", flexWrap: "wrap" },
    tab: { padding: "8px 16px", cursor: "pointer", borderBottom: "2px solid transparent" },
    activeTab: { borderBottomColor: "#800020", color: "#800020", fontWeight: "bold" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px" },
    select: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    textarea: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", minHeight: "80px", marginBottom: "12px" },
    row2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "16px" },
    progressBar: { height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginTop: "8px" },
    progressFill: { height: "100%", backgroundColor: "#800020", borderRadius: "4px" },
    statValue: { fontSize: "24px", fontWeight: "bold", color: "#800020" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "projects", name: "Projects" },
    { id: "milestones", name: "Milestones" },
    { id: "labour", name: "Labour" },
    { id: "inventory", name: "Inventory" },
    { id: "claims", name: "Claims" },
    { id: "changes", name: "Change Orders" },
    { id: "progress", name: "Site Progress" }
  ];

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "Contractor Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Manage Projects, Milestones, Labour & Inventory")
      ),
      React.createElement("div", { style: { display: "flex", gap: "10px" } },
        React.createElement("button", { onClick: shareWhatsApp, style: { ...styles.buttonSuccess } }, " WhatsApp"),
        React.createElement("button", { onClick: () => navigateTo("/marketplace"), style: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Marketplace"),
        React.createElement("button", { onClick: handleLogout, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Logout")
      )
    ),

    React.createElement("div", { style: styles.grid5 },
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, projects.length), React.createElement("div", { style: styles.statLabel }, "Projects")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, workers.length), React.createElement("div", { style: styles.statLabel }, "Workers")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, projectClaims.filter(c => c.status === "Pending").length), React.createElement("div", { style: styles.statLabel }, "Pending Claims")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (projects.reduce((s,p)=>s+p.paymentReceived,0)/100000).toFixed(1), "L"), React.createElement("div", { style: styles.statLabel }, "Received")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (projects.reduce((s,p)=>s+p.balancePayment,0)/100000).toFixed(1), "L"), React.createElement("div", { style: styles.statLabel }, "Balance"))
    ),

    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: styles.label }, "Select Project"),
          React.createElement("select", { value: selectedProject, onChange: (e) => setSelectedProject(parseInt(e.target.value)), style: styles.select },
            projects.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name, " - ", p.status, " (", p.progress, "%)"))
          )
        ),
        React.createElement("button", { onClick: () => setShowAddProject(true), style: { ...styles.button, marginTop: "24px" } }, "+ Add Project")
      )
    ),

    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),

    activeTab === "dashboard" && selectedProjectData && React.createElement("div", null,
      React.createElement("div", { style: styles.grid4 },
        React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, progressPercent.toFixed(0), "%"), React.createElement("div", { style: styles.statLabel }, "Progress"), React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${progressPercent}%` } }))),
        React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, completedMilestones, "/", projectMilestones.length), React.createElement("div", { style: styles.statLabel }, "Milestones")),
        React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (selectedProjectData.paymentReceived/100000).toFixed(1), "L"), React.createElement("div", { style: styles.statLabel }, "Received")),
        React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (selectedProjectData.balancePayment/100000).toFixed(1), "L"), React.createElement("div", { style: styles.statLabel }, "Balance"))
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Project Details"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null, React.createElement("strong", null, "Project:"), " ", selectedProjectData.name),
          React.createElement("div", null, React.createElement("strong", null, "Client:"), " ", selectedProjectData.client),
          React.createElement("div", null, React.createElement("strong", null, "Location:"), " ", selectedProjectData.location),
          React.createElement("div", null, React.createElement("strong", null, "BUA:"), " ", selectedProjectData.bua, " sqft"),
          React.createElement("div", null, React.createElement("strong", null, "Total Amount:"), " ₹", (selectedProjectData.totalAmount/100000).toFixed(2), "L"),
          React.createElement("div", null, React.createElement("strong", null, "Status:"), " ", selectedProjectData.status)
        )
      )
    ),

    activeTab === "projects" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "All Projects"),
      projects.map(p => React.createElement("div", { key: p.id, style: { border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px", cursor: "pointer" }, onClick: () => { setSelectedProject(p.id); setActiveTab("dashboard"); } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
          React.createElement("div", null, React.createElement("strong", null, p.name), React.createElement("br", null), p.client),
          React.createElement("div", null, React.createElement("div", { style: { fontSize: "20px", fontWeight: "bold", color: "#800020" } }, p.progress, "%"), React.createElement("div", null, p.status))
        ),
        React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${p.progress}%` } })),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null, "BUA: ", p.bua, " sqft"),
          React.createElement("div", null, "Amount: ₹", (p.totalAmount/100000).toFixed(1), "L"),
          React.createElement("div", null, "Balance: ₹", (p.balancePayment/100000).toFixed(1), "L")
        )
      ))
    ),

    activeTab === "milestones" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Milestones"),
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Milestone"),
            React.createElement("th", { style: styles.th }, "Planned Date"),
            React.createElement("th", { style: styles.th }, "Status"),
            React.createElement("th", { style: styles.th }, "Amount"),
            React.createElement("th", { style: styles.th }, "Action")
          )
        ),
        React.createElement("tbody", null,
          projectMilestones.map(m => React.createElement("tr", { key: m.id },
            React.createElement("td", { style: styles.td }, m.name),
            React.createElement("td", { style: styles.td }, m.plannedDate),
            React.createElement("td", { style: styles.td },
              React.createElement("select", { value: m.status, onChange: (e) => updateMilestoneStatus(m.id, e.target.value), style: { padding: "4px", borderRadius: "4px" } },
                React.createElement("option", null, "Pending"),
                React.createElement("option", null, "In Progress"),
                React.createElement("option", null, "Completed")
              )
            ),
            React.createElement("td", { style: styles.td }, "₹", (m.claimAmount/1000).toFixed(0), "K"),
            React.createElement("td", { style: styles.td },
              m.status === "Completed" && !m.paymentReceived && React.createElement("button", { onClick: () => { setSelectedMilestone(m); setShowClaimModal(true); }, style: styles.buttonSuccess }, "Claim")
            )
          ))
        )
      )
    ),

    activeTab === "labour" && React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowWorkerModal(true), style: styles.button }, "+ Add Worker"),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Daily Attendance - ", attendanceDate),
        React.createElement("input", { type: "date", value: attendanceDate, onChange: (e) => setAttendanceDate(e.target.value), style: { ...styles.input, width: "200px", marginBottom: "12px" } }),
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Worker"),
              React.createElement("th", { style: styles.th }, "Role"),
              React.createElement("th", { style: styles.th }, "Daily Wage"),
              React.createElement("th", { style: styles.th }, "Present"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            projectWorkers.map(w => {
              const att = labourAttendance.find(a => a.workerId === w.id && a.date === attendanceDate);
              return React.createElement("tr", { key: w.id },
                React.createElement("td", { style: styles.td }, w.name),
                React.createElement("td", { style: styles.td }, w.role),
                React.createElement("td", { style: styles.td }, "₹", w.dailyWage),
                React.createElement("td", { style: styles.td }, att?.present ? "Yes" : "No"),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => markAttendance(w.id, true), style: { ...styles.buttonSuccess, marginRight: "4px" } }, "Present"),
                  React.createElement("button", { onClick: () => markAttendance(w.id, false), style: styles.buttonDanger }, "Absent")
                )
              );
            })
          )
        )
      )
    ),

    activeTab === "inventory" && React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowMaterialModal(true), style: styles.button }, "+ Add Material"),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Material Inventory"),
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Material"),
              React.createElement("th", { style: styles.th }, "Required"),
              React.createElement("th", { style: styles.th }, "Received"),
              React.createElement("th", { style: styles.th }, "Consumed"),
              React.createElement("th", { style: styles.th }, "Balance"),
              React.createElement("th", { style: styles.th }, "Supplier"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            projectInventory.map(item => React.createElement("tr", { key: item.id },
              React.createElement("td", { style: styles.td }, item.name),
              React.createElement("td", { style: styles.td }, item.required, " ", item.unit),
              React.createElement("td", { style: styles.td }, React.createElement("input", { type: "number", value: item.received, onChange: (e) => updateMaterialReceived(item.id, e.target.value), style: { width: "80px" } })),
              React.createElement("td", { style: styles.td }, item.consumed),
              React.createElement("td", { style: styles.td }, item.balance),
              React.createElement("td", { style: styles.td }, item.supplier),
              React.createElement("td", { style: styles.td }, React.createElement("button", { onClick: () => { const qty = prompt("Consumed quantity:"); if(qty) updateMaterialReceived(item.id, item.received - parseFloat(qty)); }, style: styles.buttonInfo }, "Consume"))
            ))
          )
        )
      )
    ),

    activeTab === "claims" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Claims"),
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Milestone"),
            React.createElement("th", { style: styles.th }, "Amount"),
            React.createElement("th", { style: styles.th }, "Date"),
            React.createElement("th", { style: styles.th }, "Status")
          )
        ),
        React.createElement("tbody", null,
          projectClaims.map(c => React.createElement("tr", { key: c.id },
            React.createElement("td", { style: styles.td }, c.milestoneName),
            React.createElement("td", { style: styles.td }, "₹", c.amount.toLocaleString()),
            React.createElement("td", { style: styles.td }, c.date),
            React.createElement("td", { style: styles.td }, c.status)
          ))
        )
      )
    ),

    activeTab === "changes" && React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowChangeModal(true), style: styles.button }, "+ New Change Order"),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Change Orders"),
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Description"),
              React.createElement("th", { style: styles.th }, "Amount"),
              React.createElement("th", { style: styles.th }, "Status"),
              React.createElement("th", { style: styles.th }, "Date")
            )
          ),
          React.createElement("tbody", null,
            projectChanges.map(c => React.createElement("tr", { key: c.id },
              React.createElement("td", { style: styles.td }, c.description),
              React.createElement("td", { style: styles.td }, "₹", c.amount.toLocaleString()),
              React.createElement("td", { style: styles.td }, c.status),
              React.createElement("td", { style: styles.td }, c.date)
            ))
          )
        )
      )
    ),

    activeTab === "progress" && React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowMediaModal(true), style: styles.button }, "+ Upload Photo/Video"),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Site Gallery"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" } },
          projectMedia.map(m => React.createElement("div", { key: m.id, style: { border: "1px solid #ddd", borderRadius: "8px", padding: "8px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "32px" } }, m.type === "photo" ? "📷" : "🎥"),
            React.createElement("div", null, m.title),
            React.createElement("div", { style: { fontSize: "10px", color: "#666" } }, m.date)
          ))
        )
      )
    ),

    showAddProject && React.createElement("div", { style: styles.modal, onClick: () => setShowAddProject(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Project"),
        React.createElement("input", { placeholder: "Project Name", value: newProject.name, onChange: (e) => setNewProject({...newProject, name: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Client Name", value: newProject.client, onChange: (e) => setNewProject({...newProject, client: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Client Mobile", value: newProject.clientMobile, onChange: (e) => setNewProject({...newProject, clientMobile: e.target.value}), style: styles.input }),
        React.createElement("input", { type: "number", placeholder: "BUA (sqft)", value: newProject.bua, onChange: (e) => setNewProject({...newProject, bua: parseFloat(e.target.value)}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "date", placeholder: "Start Date", value: newProject.startDate, onChange: (e) => setNewProject({...newProject, startDate: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", placeholder: "End Date", value: newProject.endDate, onChange: (e) => setNewProject({...newProject, endDate: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addProject, style: styles.buttonSuccess }, "Create Project")
      )
    ),

    showClaimModal && selectedMilestone && React.createElement("div", { style: styles.modal, onClick: () => setShowClaimModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Submit Claim"),
        React.createElement("p", null, "Milestone: ", selectedMilestone.name),
        React.createElement("input", { type: "number", placeholder: "Claim Amount", value: claimAmount, onChange: (e) => setClaimAmount(e.target.value), style: styles.input }),
        React.createElement("button", { onClick: submitClaim, style: styles.buttonSuccess }, "Submit")
      )
    ),

    showWorkerModal && React.createElement("div", { style: styles.modal, onClick: () => setShowWorkerModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Worker"),
        React.createElement("input", { placeholder: "Worker Name", value: newWorker.name, onChange: (e) => setNewWorker({...newWorker, name: e.target.value}), style: styles.input }),
        React.createElement("select", { value: newWorker.role, onChange: (e) => setNewWorker({...newWorker, role: e.target.value}), style: styles.select },
          React.createElement("option", null, "Mason"), React.createElement("option", null, "Carpenter"),
          React.createElement("option", null, "Helper"), React.createElement("option", null, "Electrician")
        ),
        React.createElement("input", { type: "number", placeholder: "Daily Wage", value: newWorker.dailyWage, onChange: (e) => setNewWorker({...newWorker, dailyWage: parseFloat(e.target.value)}), style: styles.input }),
        React.createElement("input", { placeholder: "Mobile", value: newWorker.mobile, onChange: (e) => setNewWorker({...newWorker, mobile: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addWorker, style: styles.buttonSuccess }, "Add Worker")
      )
    ),

    showMaterialModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMaterialModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Material"),
        React.createElement("input", { placeholder: "Material Name", value: newMaterial.name, onChange: (e) => setNewMaterial({...newMaterial, name: e.target.value}), style: styles.input }),
        React.createElement("input", { type: "number", placeholder: "Required Quantity", value: newMaterial.required, onChange: (e) => setNewMaterial({...newMaterial, required: e.target.value}), style: styles.input }),
        React.createElement("select", { value: newMaterial.unit, onChange: (e) => setNewMaterial({...newMaterial, unit: e.target.value}), style: styles.select },
          React.createElement("option", null, "bags"), React.createElement("option", null, "kg"), React.createElement("option", null, "tons")
        ),
        React.createElement("input", { placeholder: "Supplier", value: newMaterial.supplier, onChange: (e) => setNewMaterial({...newMaterial, supplier: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addMaterial, style: styles.buttonSuccess }, "Add Material")
      )
    ),

    showChangeModal && React.createElement("div", { style: styles.modal, onClick: () => setShowChangeModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Change Order"),
        React.createElement("textarea", { placeholder: "Description", value: newChange.description, onChange: (e) => setNewChange({...newChange, description: e.target.value}), style: styles.textarea }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Quantity", value: newChange.quantity, onChange: (e) => setNewChange({...newChange, quantity: parseFloat(e.target.value)}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Rate", value: newChange.rate, onChange: (e) => setNewChange({...newChange, rate: parseFloat(e.target.value)}), style: styles.input })
        ),
        React.createElement("div", null, "Total: ₹", newChange.quantity * newChange.rate),
        React.createElement("button", { onClick: addChangeOrder, style: styles.buttonSuccess }, "Submit")
      )
    ),

    showMediaModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMediaModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Upload Media"),
        React.createElement("select", { value: mediaData.type, onChange: (e) => setMediaData({...mediaData, type: e.target.value}), style: styles.select },
          React.createElement("option", null, "photo"), React.createElement("option", null, "video")
        ),
        React.createElement("input", { placeholder: "Title", value: mediaData.title, onChange: (e) => setMediaData({...mediaData, title: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addMedia, style: styles.buttonSuccess }, "Upload")
      )
    )
  );
}
