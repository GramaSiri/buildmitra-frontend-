import React, { useState } from "react";
import * as XLSX from "xlsx";
import { logoutToLogin } from "../utils/session";

export default function LabourSupplyDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedProject, setSelectedProject] = useState(1);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMsg, setQuoteMsg] = useState("");
  const [bulkData, setBulkData] = useState([]);
  const [newWorker, setNewWorker] = useState({ name: "", skill: "Mason", dailyWage: 800, mobile: "", experience: "2 years" });
  const [newRate, setNewRate] = useState({ skill: "", baseRate: 0, overtimeRate: 0, notes: "" });

  const [workers, setWorkers] = useState([
    { id: 1, name: "Ramesh Kumar", skill: "Mason", dailyWage: 800, mobile: "+919876511111", experience: "5 years", rating: 4.5, status: "Available", projectId: null },
    { id: 2, name: "Suresh Patel", skill: "Carpenter", dailyWage: 700, mobile: "+919876522222", experience: "4 years", rating: 4.2, status: "Available", projectId: null },
    { id: 3, name: "Mahesh Singh", skill: "Helper", dailyWage: 500, mobile: "+919876533333", experience: "2 years", rating: 4.0, status: "Deployed", projectId: 1 },
    { id: 4, name: "Amit Kumar", skill: "Electrician", dailyWage: 900, mobile: "+919876544444", experience: "6 years", rating: 4.8, status: "Available", projectId: null }
  ]);

  const [attendance, setAttendance] = useState([
    { id: 1, workerId: 3, date: "2024-02-10", present: true, hours: 8, overtime: 0 }
  ]);

  const [projects, setProjects] = useState([
    { id: 1, name: "Sunrise Villa", client: "Rajesh Sharma", location: "Andheri, Mumbai", startDate: "2024-01-01", endDate: "2024-06-30", workersNeeded: 10 },
    { id: 2, name: "Green Heights", client: "Priya Mehta", location: "Bandra, Mumbai", startDate: "2024-02-01", endDate: "2024-08-31", workersNeeded: 15 }
  ]);

  const [assignments, setAssignments] = useState([
    { id: 1, workerId: 3, workerName: "Mahesh Singh", projectId: 1, projectName: "Sunrise Villa", assignedDate: "2024-01-15", dailyRate: 500, status: "Active" }
  ]);

  const [rateCard, setRateCard] = useState([
    { id: 1, skill: "Mason", baseRate: 800, overtimeRate: 120, notes: "Minimum 8 hours" },
    { id: 2, skill: "Carpenter", baseRate: 700, overtimeRate: 105, notes: "Minimum 8 hours" },
    { id: 3, skill: "Helper", baseRate: 500, overtimeRate: 75, notes: "Minimum 8 hours" },
    { id: 4, skill: "Electrician", baseRate: 900, overtimeRate: 135, notes: "Certified only" }
  ]);

  const [enquiries, setEnquiries] = useState([
    { id: 1, client: "Ramesh Gupta", mobile: "+919876555555", requirement: "Mason", quantity: 5, duration: "15 days", message: "Need masons for foundation work", status: "Pending" },
    { id: 2, client: "Construction Corp", mobile: "+919876566666", requirement: "Electrician", quantity: 3, duration: "30 days", message: "Need certified electricians", status: "Pending" }
  ]);

  const [invoices, setInvoices] = useState([
    { id: "INV-001", client: "Rajesh Sharma", project: "Sunrise Villa", amount: 28000, date: "2024-01-31", status: "Paid" }
  ]);

  const handleLogout = () => {
    if (confirm("Logout?")) logoutToLogin();
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const addWorker = () => {
    if (!newWorker.name) return alert("Enter worker name");
    setWorkers([...workers, { ...newWorker, id: workers.length + 1, rating: 4.0, status: "Available", projectId: null }]);
    setNewWorker({ name: "", skill: "Mason", dailyWage: 800, mobile: "", experience: "2 years" });
    setShowWorkerModal(false);
    alert("Worker added!");
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setBulkData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const importBulkWorkers = () => {
    const newWorkers = bulkData.map((item, idx) => ({
      id: workers.length + idx + 1,
      name: item.name || item.Name,
      skill: item.skill || "Helper",
      dailyWage: parseFloat(item.wage || 500),
      mobile: item.mobile || "",
      experience: item.experience || "1 year",
      rating: 4.0,
      status: "Available",
      projectId: null
    }));
    setWorkers([...workers, ...newWorkers]);
    setBulkData([]);
    setShowBulkModal(false);
    alert(`${newWorkers.length} workers imported!`);
  };

  const assignWorker = () => {
    if (!selectedWorker) return alert("Select worker");
    const project = projects.find(p => p.id === selectedProject);
    setAssignments([...assignments, {
      id: assignments.length + 1,
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      projectId: project.id,
      projectName: project.name,
      assignedDate: new Date().toISOString().split("T")[0],
      dailyRate: selectedWorker.dailyWage,
      status: "Active"
    }]);
    setWorkers(workers.map(w => w.id === selectedWorker.id ? { ...w, status: "Deployed", projectId: project.id } : w));
    setSelectedWorker(null);
    setShowAssignModal(false);
    alert(`${selectedWorker.name} assigned to ${project.name}`);
  };

  const markAttendance = (workerId, present, hours = 8) => {
    const existing = attendance.find(a => a.workerId === workerId && a.date === attendanceDate);
    if (existing) {
      setAttendance(attendance.map(a => a.workerId === workerId && a.date === attendanceDate ? { ...a, present, hours } : a));
    } else {
      setAttendance([...attendance, { id: attendance.length + 1, workerId, date: attendanceDate, present, hours, overtime: 0 }]);
    }
    alert(present ? "Marked Present" : "Marked Absent");
  };

  const addRate = () => {
    if (!newRate.skill || !newRate.baseRate) return alert("Enter skill and rate");
    setRateCard([...rateCard, { ...newRate, id: rateCard.length + 1 }]);
    setNewRate({ skill: "", baseRate: 0, overtimeRate: 0, notes: "" });
    setShowRateModal(false);
    alert("Rate added!");
  };

  const sendQuote = () => {
    if (!selectedEnquiry || !quotePrice) return alert("Enter rate");
    const total = quotePrice * selectedEnquiry.quantity * parseInt(selectedEnquiry.duration);
    const message = `*LABOUR QUOTATION*%0A%0AClient: ${selectedEnquiry.client}%0ARequirement: ${selectedEnquiry.quantity} ${selectedEnquiry.requirement}(s)%0ADuration: ${selectedEnquiry.duration} days%0ARate: ₹${quotePrice}/day%0ATotal: ₹${total}%0A%0A${quoteMsg || "Please confirm"}%0A%0A- ABC Manpower Services`;
    window.open(`https://wa.me/${selectedEnquiry.mobile}?text=${message}`, "_blank");
    setEnquiries(enquiries.map(e => e.id === selectedEnquiry.id ? { ...e, status: "Replied" } : e));
    setShowEnquiryModal(false);
    setQuotePrice("");
    setQuoteMsg("");
    alert("Quote sent!");
  };

  const shareRateCard = () => {
    const list = rateCard.map(r => `${r.skill}: ₹${r.baseRate}/day (OT: ₹${r.overtimeRate}/hr)`).join("%0A");
    window.open(`https://wa.me/?text=${list}`, "_blank");
  };

  const generateInvoice = (assignment) => {
    const worker = workers.find(w => w.id === assignment.workerId);
    const daysWorked = attendance.filter(a => a.workerId === assignment.workerId && a.present).length;
    const amount = daysWorked * assignment.dailyRate;
    setInvoices([...invoices, { id: `INV-${invoices.length + 1}`, client: assignment.projectName, project: assignment.projectName, amount: amount, date: new Date().toISOString().split("T")[0], status: "Pending" }]);
    alert(`Invoice generated for ₹${amount}`);
  };

  const exportWorkers = () => {
    const ws = XLSX.utils.json_to_sheet(workers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workers");
    XLSX.writeFile(wb, `workers_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert("Workers exported!");
  };

  const exportAttendance = () => {
    const ws = XLSX.utils.json_to_sheet(attendance);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert("Attendance exported!");
  };

  const totalWorkers = workers.length;
  const availableWorkers = workers.filter(w => w.status === "Available").length;
  const deployedWorkers = workers.filter(w => w.status === "Deployed").length;
  const pendingEnquiries = enquiries.filter(e => e.status === "Pending").length;

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
    { id: "workers", name: "Workers" },
    { id: "attendance", name: "Attendance" },
    { id: "assignments", name: "Assignments" },
    { id: "ratecard", name: "Rate Card" },
    { id: "enquiries", name: "Enquiries" },
    { id: "reports", name: "Reports" }
  ];

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "Labour Supply Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Manage Workers, Attendance, Assignments & Rates")
      ),
      React.createElement("div", { style: { display: "flex", gap: "10px" } },
        React.createElement("button", { onClick: shareRateCard, style: { ...styles.buttonSuccess } }, "Share Rate Card"),
        React.createElement("button", { onClick: () => navigateTo("/marketplace"), style: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Marketplace"),
        React.createElement("button", { onClick: handleLogout, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Logout")
      )
    ),

    React.createElement("div", { style: styles.grid5 },
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, totalWorkers), React.createElement("div", { style: styles.statLabel }, "Total Workers")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, availableWorkers), React.createElement("div", { style: styles.statLabel }, "Available")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, deployedWorkers), React.createElement("div", { style: styles.statLabel }, "Deployed")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, pendingEnquiries), React.createElement("div", { style: styles.statLabel }, "Enquiries")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, rateCard.length), React.createElement("div", { style: styles.statLabel }, "Skills"))
    ),

    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),

    activeTab === "dashboard" && React.createElement("div", null,
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Recent Assignments"),
          assignments.slice(0, 3).map(a => React.createElement("div", { key: a.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, a.workerName), " → ", a.projectName, " (₹", a.dailyRate, "/day)"
          ))
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Pending Enquiries"),
          enquiries.filter(e => e.status === "Pending").slice(0, 3).map(e => React.createElement("div", { key: e.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, e.client), " needs ", e.quantity, " ", e.requirement, "(s)"
          ))
        )
      )
    ),

    activeTab === "workers" && React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setShowWorkerModal(true), style: styles.button }, "+ Add Worker"),
        React.createElement("button", { onClick: () => setShowBulkModal(true), style: { ...styles.buttonInfo } }, " Bulk Upload"),
        React.createElement("button", { onClick: exportWorkers, style: { ...styles.buttonInfo } }, " Export Workers")
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Workers List"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Name"), React.createElement("th", { style: styles.th }, "Skill"),
                React.createElement("th", { style: styles.th }, "Daily Wage"), React.createElement("th", { style: styles.th }, "Mobile"),
                React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              workers.map(w => React.createElement("tr", { key: w.id },
                React.createElement("td", { style: styles.td }, w.name),
                React.createElement("td", { style: styles.td }, w.skill),
                React.createElement("td", { style: styles.td }, "₹", w.dailyWage),
                React.createElement("td", { style: styles.td }, w.mobile),
                React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: w.status === "Available" ? "#d4edda" : "#fff3cd", padding: "4px 8px", borderRadius: "4px" } }, w.status)),
                React.createElement("td", { style: styles.td },
                  w.status === "Available" && React.createElement("button", { onClick: () => { setSelectedWorker(w); setShowAssignModal(true); }, style: styles.buttonSuccess }, "Assign")
                )
              ))
            )
          )
        )
      )
    ),

    activeTab === "attendance" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Daily Attendance"),
      React.createElement("div", { style: { marginBottom: "12px" } },
        React.createElement("label", { style: styles.label }, "Date:"),
        React.createElement("input", { type: "date", value: attendanceDate, onChange: (e) => setAttendanceDate(e.target.value), style: { ...styles.input, width: "200px" } })
      ),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Worker"), React.createElement("th", { style: styles.th }, "Skill"),
              React.createElement("th", { style: styles.th }, "Present"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            workers.filter(w => w.status === "Deployed").map(w => {
              const att = attendance.find(a => a.workerId === w.id && a.date === attendanceDate);
              return React.createElement("tr", { key: w.id },
                React.createElement("td", { style: styles.td }, w.name),
                React.createElement("td", { style: styles.td }, w.skill),
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

    activeTab === "assignments" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Active Assignments"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Worker"), React.createElement("th", { style: styles.th }, "Project"),
              React.createElement("th", { style: styles.th }, "Assigned Date"), React.createElement("th", { style: styles.th }, "Daily Rate"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            assignments.map(a => React.createElement("tr", { key: a.id },
              React.createElement("td", { style: styles.td }, a.workerName),
              React.createElement("td", { style: styles.td }, a.projectName),
              React.createElement("td", { style: styles.td }, a.assignedDate),
              React.createElement("td", { style: styles.td }, "₹", a.dailyRate),
              React.createElement("td", { style: styles.td }, React.createElement("button", { onClick: () => generateInvoice(a), style: styles.buttonInfo }, "Invoice")
              )
            ))
          )
        )
      )
    ),

    activeTab === "ratecard" && React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowRateModal(true), style: styles.button }, "+ Add Rate"),
      React.createElement("div", { style: styles.grid3, marginTop: "16px" },
        rateCard.map(r => React.createElement("div", { key: r.id, style: styles.card },
          React.createElement("h4", { style: { color: "#800020", margin: "0 0 8px 0" } }, r.skill),
          React.createElement("p", null, "Base Rate: ", React.createElement("strong", null, "₹", r.baseRate), "/day"),
          React.createElement("p", null, "Overtime: ", React.createElement("strong", null, "₹", r.overtimeRate), "/hr"),
          React.createElement("p", { style: { fontSize: "12px", color: "#666" } }, r.notes)
        ))
      )
    ),

    activeTab === "enquiries" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "WhatsApp Enquiries"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Client"), React.createElement("th", { style: styles.th }, "Requirement"),
              React.createElement("th", { style: styles.th }, "Quantity"), React.createElement("th", { style: styles.th }, "Duration"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            enquiries.filter(e => e.status === "Pending").map(e => React.createElement("tr", { key: e.id },
              React.createElement("td", { style: styles.td }, e.client),
              React.createElement("td", { style: styles.td }, e.requirement),
              React.createElement("td", { style: styles.td }, e.quantity),
              React.createElement("td", { style: styles.td }, e.duration),
              React.createElement("td", { style: styles.td },
                React.createElement("button", { onClick: () => { setSelectedEnquiry(e); setShowEnquiryModal(true); }, style: styles.buttonSuccess }, "Send Quote")
              )
            ))
          )
        )
      )
    ),

    activeTab === "reports" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Reports"),
      React.createElement("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: exportWorkers, style: styles.buttonInfo }, "Workers Report"),
        React.createElement("button", { onClick: exportAttendance, style: styles.buttonInfo }, "Attendance Report"),
        React.createElement("button", { onClick: shareRateCard, style: styles.buttonSuccess }, "Share Rate Card")
      )
    ),

    showWorkerModal && React.createElement("div", { style: styles.modal, onClick: () => setShowWorkerModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Worker"),
        React.createElement("input", { placeholder: "Worker Name", value: newWorker.name, onChange: (e) => setNewWorker({...newWorker, name: e.target.value}), style: styles.input }),
        React.createElement("select", { value: newWorker.skill, onChange: (e) => setNewWorker({...newWorker, skill: e.target.value}), style: styles.select },
          React.createElement("option", null, "Mason"), React.createElement("option", null, "Carpenter"),
          React.createElement("option", null, "Helper"), React.createElement("option", null, "Electrician"),
          React.createElement("option", null, "Plumber"), React.createElement("option", null, "Painter")
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Daily Wage", value: newWorker.dailyWage, onChange: (e) => setNewWorker({...newWorker, dailyWage: parseFloat(e.target.value)}), style: styles.input }),
          React.createElement("input", { placeholder: "Mobile Number", value: newWorker.mobile, onChange: (e) => setNewWorker({...newWorker, mobile: e.target.value}), style: styles.input })
        ),
        React.createElement("input", { placeholder: "Experience", value: newWorker.experience, onChange: (e) => setNewWorker({...newWorker, experience: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addWorker, style: styles.buttonSuccess }, "Add Worker")
      )
    ),

    showAssignModal && selectedWorker && React.createElement("div", { style: styles.modal, onClick: () => setShowAssignModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Assign Worker: ", selectedWorker.name),
        React.createElement("select", { value: selectedProject, onChange: (e) => setSelectedProject(parseInt(e.target.value)), style: styles.select },
          projects.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name, " - ", p.location))
        ),
        React.createElement("button", { onClick: assignWorker, style: styles.buttonSuccess }, "Assign to Project")
      )
    ),

    showEnquiryModal && selectedEnquiry && React.createElement("div", { style: styles.modal, onClick: () => setShowEnquiryModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Send WhatsApp Quote"),
        React.createElement("p", null, selectedEnquiry.client, " wants ", selectedEnquiry.quantity, " ", selectedEnquiry.requirement, "(s) for ", selectedEnquiry.duration, " days"),
        React.createElement("input", { type: "number", placeholder: "Rate per day (₹)", value: quotePrice, onChange: (e) => setQuotePrice(e.target.value), style: styles.input }),
        React.createElement("textarea", { placeholder: "Message", value: quoteMsg, onChange: (e) => setQuoteMsg(e.target.value), style: styles.textarea, rows: 3 }),
        React.createElement("button", { onClick: sendQuote, style: styles.buttonSuccess }, "Send Quote")
      )
    ),

    showRateModal && React.createElement("div", { style: styles.modal, onClick: () => setShowRateModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Rate"),
        React.createElement("input", { placeholder: "Skill Name", value: newRate.skill, onChange: (e) => setNewRate({...newRate, skill: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Base Rate (₹/day)", value: newRate.baseRate, onChange: (e) => setNewRate({...newRate, baseRate: parseFloat(e.target.value)}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Overtime Rate (₹/hr)", value: newRate.overtimeRate, onChange: (e) => setNewRate({...newRate, overtimeRate: parseFloat(e.target.value)}), style: styles.input })
        ),
        React.createElement("input", { placeholder: "Notes", value: newRate.notes, onChange: (e) => setNewRate({...newRate, notes: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addRate, style: styles.buttonSuccess }, "Add Rate")
      )
    ),

    showBulkModal && React.createElement("div", { style: styles.modal, onClick: () => setShowBulkModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Bulk Upload Workers"),
        React.createElement("p", { style: { fontSize: "12px", color: "#666" } }, "Upload Excel with columns: Name, Skill, Wage, Mobile, Experience"),
        React.createElement("input", { type: "file", accept: ".xlsx,.xls", onChange: handleBulkUpload, style: styles.input }),
        bulkData.length > 0 && React.createElement("button", { onClick: importBulkWorkers, style: styles.buttonSuccess }, "Import ", bulkData.length, " Workers")
      )
    )
  );
}
