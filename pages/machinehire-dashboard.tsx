import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function MachineHireDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMsg, setQuoteMsg] = useState("");
  const [bulkData, setBulkData] = useState([]);
  const [newMachine, setNewMachine] = useState({
    name: "", category: "Earth Moving", model: "", dailyRate: 0, weeklyRate: 0, monthlyRate: 0,
    operatorRequired: false, operatorCost: 0, fuelType: "Diesel", description: ""
  });
  const [newMaintenance, setNewMaintenance] = useState({
    serviceDate: "", nextDueDate: "", serviceType: "Preventive", cost: "", mechanic: "", notes: ""
  });

  const [machines, setMachines] = useState([
    { id: 1, name: "JCB 3DX", category: "Earth Moving", model: "2023", dailyRate: 4500, weeklyRate: 28000, monthlyRate: 95000, status: "Available", operatorRequired: true, operatorCost: 800, fuelType: "Diesel", images: [], documents: [] },
    { id: 2, name: "Excavator Mini", category: "Earth Moving", model: "2022", dailyRate: 6500, weeklyRate: 40000, monthlyRate: 140000, status: "Rented", operatorRequired: true, operatorCost: 800, fuelType: "Diesel", images: [], documents: [] },
    { id: 3, name: "Concrete Mixer 10/7", category: "Concrete", model: "2023", dailyRate: 2500, weeklyRate: 15000, monthlyRate: 50000, status: "Available", operatorRequired: false, operatorCost: 0, fuelType: "Diesel", images: [], documents: [] },
    { id: 4, name: "Floor Polishing Machine", category: "Polishing", model: "2023", dailyRate: 1200, weeklyRate: 7000, monthlyRate: 25000, status: "Available", operatorRequired: false, operatorCost: 0, fuelType: "Electric", images: [], documents: [] },
    { id: 5, name: "Tile Cutter Electric", category: "Cutting", model: "2024", dailyRate: 800, weeklyRate: 4500, monthlyRate: 15000, status: "Maintenance", operatorRequired: false, operatorCost: 0, fuelType: "Electric", images: [], documents: [] },
    { id: 6, name: "Drilling Machine", category: "Drilling", model: "2023", dailyRate: 600, weeklyRate: 3500, monthlyRate: 12000, status: "Available", operatorRequired: false, operatorCost: 0, fuelType: "Electric", images: [], documents: [] },
    { id: 7, name: "Painting Compressor", category: "Painting", model: "2024", dailyRate: 1800, weeklyRate: 10000, monthlyRate: 35000, status: "Available", operatorRequired: false, operatorCost: 0, fuelType: "Electric", images: [], documents: [] },
    { id: 8, name: "Welding Machine", category: "Welding", model: "2024", dailyRate: 600, weeklyRate: 3500, monthlyRate: 12000, status: "Available", operatorRequired: false, operatorCost: 0, fuelType: "Electric", images: [], documents: [] }
  ]);

  const [clients, setClients] = useState([
    { id: 1, name: "Rajesh Sharma", project: "Sunrise Villa", location: "Andheri", mobile: "+919876511111" },
    { id: 2, name: "Priya Mehta", project: "Green Heights", location: "Bandra", mobile: "+919876522222" },
    { id: 3, name: "Business Corp", project: "Commercial Plaza", location: "Powai", mobile: "+919876533333" }
  ]);

  const [rentals, setRentals] = useState([
    { id: 1, machineId: 2, machineName: "Excavator Mini", clientId: 1, clientName: "Rajesh Sharma", projectName: "Sunrise Villa", startDate: "2024-02-01", endDate: "2024-02-15", actualEndDate: null, dailyRate: 6200, operatorIncluded: true, totalDays: 14, totalAmount: 86800, securityDeposit: 20000, status: "Active" },
    { id: 2, machineId: 5, machineName: "Tile Cutter Electric", clientId: 2, clientName: "Priya Mehta", projectName: "Green Heights", startDate: "2024-02-05", endDate: "2024-02-12", actualEndDate: null, dailyRate: 750, operatorIncluded: false, totalDays: 7, totalAmount: 5250, securityDeposit: 5000, status: "Active" }
  ]);

  const [maintenance, setMaintenance] = useState([
    { id: 1, machineId: 5, machineName: "Tile Cutter Electric", serviceDate: "2024-02-10", nextDueDate: "2024-05-10", serviceType: "Preventive", cost: 1500, mechanic: "Rajesh Repairs", notes: "Blade replacement" }
  ]);

  const [invoices, setInvoices] = useState([
    { id: "INV-001", rentalId: 1, machineName: "Excavator Mini", clientName: "Rajesh Sharma", projectName: "Sunrise Villa", period: "Feb 1-15, 2024", totalDays: 14, dailyRate: 6200, operatorCost: 800, totalAmount: 86800, status: "Pending", date: "2024-02-16", dueDate: "2024-03-02" }
  ]);

  const [enquiries, setEnquiries] = useState([
    { id: 1, client: "Ramesh Gupta", mobile: "+919876544444", machine: "JCB 3DX", duration: "15 days", message: "Need JCB for excavation work", status: "Pending", date: "2024-02-15" },
    { id: 2, client: "Construction Corp", mobile: "+919876555555", machine: "Concrete Mixer", duration: "30 days", message: "Need for commercial project", status: "Pending", date: "2024-02-16" }
  ]);

  const handleLogout = () => {
    if (confirm("Logout?")) window.location.href = "/";
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const addMachine = () => {
    if (!newMachine.name || !newMachine.dailyRate) return alert("Fill required fields");
    setMachines([...machines, { ...newMachine, id: machines.length + 1, status: "Available", images: [], documents: [] }]);
    setNewMachine({ name: "", category: "Earth Moving", model: "", dailyRate: 0, weeklyRate: 0, monthlyRate: 0, operatorRequired: false, operatorCost: 0, fuelType: "Diesel", description: "" });
    setShowAddMachineModal(false);
    alert("Machine added!");
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

  const importBulkMachines = () => {
    const newMachines = bulkData.map((item, idx) => ({
      id: machines.length + idx + 1,
      name: item.name || item.Machine,
      category: item.category || "Other",
      model: item.model || "2024",
      dailyRate: parseFloat(item.dailyRate || 1000),
      weeklyRate: parseFloat(item.weeklyRate || 6000),
      monthlyRate: parseFloat(item.monthlyRate || 20000),
      status: "Available",
      operatorRequired: item.operatorRequired === "Yes" || false,
      operatorCost: parseFloat(item.operatorCost || 0),
      fuelType: item.fuelType || "Diesel",
      images: [],
      documents: []
    }));
    setMachines([...machines, ...newMachines]);
    setBulkData([]);
    setShowBulkModal(false);
    alert(`${newMachines.length} machines imported!`);
  };

  const addRental = () => {
    if (!selectedMachine) return alert("Select machine");
    const client = clients.find(c => c.id === selectedRental?.clientId);
    const startDate = new Date(selectedRental?.startDate);
    const endDate = new Date(selectedRental?.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const dailyRate = parseFloat(selectedRental?.dailyRate) || selectedMachine.dailyRate;
    const operatorCost = selectedRental?.operatorIncluded ? (selectedMachine.operatorCost || 800) : 0;
    const totalAmount = (totalDays * dailyRate) + (totalDays * operatorCost);

    setRentals([...rentals, {
      id: rentals.length + 1,
      machineId: selectedMachine.id,
      machineName: selectedMachine.name,
      clientId: client.id,
      clientName: client.name,
      projectName: client.project,
      startDate: selectedRental.startDate,
      endDate: selectedRental.endDate,
      actualEndDate: null,
      dailyRate: dailyRate,
      operatorIncluded: selectedRental.operatorIncluded,
      totalDays: totalDays,
      totalAmount: totalAmount,
      securityDeposit: parseFloat(selectedRental.securityDeposit) || 0,
      status: "Active"
    }]);
    setMachines(machines.map(m => m.id === selectedMachine.id ? { ...m, status: "Rented" } : m));
    setSelectedMachine(null);
    setSelectedRental(null);
    setShowRentalModal(false);
    alert(`Rental created for ${selectedMachine.name}`);
  };

  const returnMachine = (rentalId) => {
    const rental = rentals.find(r => r.id === rentalId);
    const actualEndDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(rental.endDate);
    const actualEnd = new Date(actualEndDate);
    const actualDays = Math.ceil((actualEnd - new Date(rental.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = (actualDays * rental.dailyRate) + (actualDays * (rental.operatorIncluded ? 800 : 0));
    
    setRentals(rentals.map(r => r.id === rentalId ? { ...r, actualEndDate, totalAmount, status: "Completed" } : r));
    setMachines(machines.map(m => m.id === rental.machineId ? { ...m, status: "Available" } : m));
    alert(`Machine returned. Total amount: ₹${totalAmount}`);
  };

  const addMaintenance = () => {
    if (!newMaintenance.serviceDate) return alert("Select service date");
    setMaintenance([...maintenance, { ...newMaintenance, id: maintenance.length + 1, machineId: selectedMachine?.id, machineName: selectedMachine?.name }]);
    setMachines(machines.map(m => m.id === selectedMachine?.id ? { ...m, status: "Maintenance" } : m));
    setNewMaintenance({ serviceDate: "", nextDueDate: "", serviceType: "Preventive", cost: "", mechanic: "", notes: "" });
    setShowMaintenanceModal(false);
    alert("Maintenance record added");
  };

  const generateInvoice = (rental) => {
    const newInvoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      rentalId: rental.id,
      machineName: rental.machineName,
      clientName: rental.clientName,
      projectName: rental.projectName,
      period: `${rental.startDate} to ${rental.actualEndDate || rental.endDate}`,
      totalDays: rental.totalDays,
      dailyRate: rental.dailyRate,
      operatorCost: rental.operatorIncluded ? 800 : 0,
      totalAmount: rental.totalAmount,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };
    setInvoices([...invoices, newInvoice]);
    alert(`Invoice ${newInvoice.id} generated for ₹${rental.totalAmount}`);
  };

  const sendQuote = () => {
    if (!selectedEnquiry || !quotePrice) return alert("Enter rate");
    const machine = machines.find(m => m.name === selectedEnquiry.machine);
    const total = quotePrice * parseInt(selectedEnquiry.duration);
    const message = `*MACHINE RENTAL QUOTATION*%0A%0AClient: ${selectedEnquiry.client}%0AMachine: ${selectedEnquiry.machine}%0ADuration: ${selectedEnquiry.duration} days%0ARate: ₹${quotePrice}/day%0ATotal: ₹${total}%0A%0A${quoteMsg || "Please confirm"}%0A%0A- Equipment Rentals`;
    window.open(`https://wa.me/${selectedEnquiry.mobile}?text=${message}`, "_blank");
    setEnquiries(enquiries.map(e => e.id === selectedEnquiry.id ? { ...e, status: "Replied" } : e));
    setShowEnquiryModal(false);
    setQuotePrice("");
    setQuoteMsg("");
    alert("Quote sent!");
  };

  const shareCatalog = () => {
    const list = machines.filter(m => m.status === "Available").slice(0, 5).map(m => `${m.name}: ₹${m.dailyRate}/day`).join("%0A");
    window.open(`https://wa.me/?text=${list}`, "_blank");
  };

  const exportMachines = () => {
    const ws = XLSX.utils.json_to_sheet(machines);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Machines");
    XLSX.writeFile(wb, `machines_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert("Machines exported!");
  };

  const availableMachines = machines.filter(m => m.status === "Available");
  const rentedMachines = machines.filter(m => m.status === "Rented");
  const maintenanceMachines = machines.filter(m => m.status === "Maintenance");
  const activeRentals = rentals.filter(r => r.status === "Active");
  const totalRevenue = rentals.reduce((sum, r) => sum + r.totalAmount, 0);

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
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
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
    { id: "fleet", name: "Machine Fleet" },
    { id: "rentals", name: "Rentals" },
    { id: "maintenance", name: "Maintenance" },
    { id: "billing", name: "Billing" },
    { id: "enquiries", name: "Enquiries" },
    { id: "reports", name: "Reports" }
  ];

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "Machine Hire Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Manage Equipment, Rentals & Maintenance")
      ),
      React.createElement("div", { style: { display: "flex", gap: "10px" } },
        React.createElement("button", { onClick: shareCatalog, style: { ...styles.buttonSuccess } }, "Share Catalog"),
        React.createElement("button", { onClick: () => navigateTo("/marketplace"), style: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Marketplace"),
        React.createElement("button", { onClick: handleLogout, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Logout")
      )
    ),

    React.createElement("div", { style: styles.grid5 },
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, machines.length), React.createElement("div", { style: styles.statLabel }, "Total Machines")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, availableMachines.length), React.createElement("div", { style: styles.statLabel }, "Available")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, rentedMachines.length), React.createElement("div", { style: styles.statLabel }, "Rented")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, activeRentals.length), React.createElement("div", { style: styles.statLabel }, "Active Rentals")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (totalRevenue/100000).toFixed(1), "L"), React.createElement("div", { style: styles.statLabel }, "Total Revenue"))
    ),

    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),

    activeTab === "dashboard" && React.createElement("div", null,
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Machine Status"),
          React.createElement("div", null, "Available: ", availableMachines.length),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${(availableMachines.length/machines.length)*100}%` } })),
          React.createElement("div", { style: { marginTop: "8px" } }, "Rented: ", rentedMachines.length),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${(rentedMachines.length/machines.length)*100}%`, backgroundColor: "#28a745" } })),
          React.createElement("div", { style: { marginTop: "8px" } }, "Maintenance: ", maintenanceMachines.length),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${(maintenanceMachines.length/machines.length)*100}%`, backgroundColor: "#ffc107" } }))
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Active Rentals"),
          activeRentals.slice(0, 3).map(r => React.createElement("div", { key: r.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, r.machineName), " → ", r.projectName, " (₹", r.dailyRate, "/day)"
          ))
        )
      )
    ),

    activeTab === "fleet" && React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setShowAddMachineModal(true), style: styles.button }, "+ Add Machine"),
        React.createElement("button", { onClick: () => setShowBulkModal(true), style: { ...styles.buttonInfo } }, " Bulk Upload"),
        React.createElement("button", { onClick: exportMachines, style: { ...styles.buttonInfo } }, " Export Machines")
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Machine Fleet (", machines.length, ")"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Machine"), React.createElement("th", { style: styles.th }, "Category"),
                React.createElement("th", { style: styles.th }, "Daily Rate"), React.createElement("th", { style: styles.th }, "Weekly Rate"),
                React.createElement("th", { style: styles.th }, "Monthly Rate"), React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              machines.map(m => React.createElement("tr", { key: m.id },
                React.createElement("td", { style: styles.td }, React.createElement("strong", null, m.name), React.createElement("br", null), m.model),
                React.createElement("td", { style: styles.td }, m.category),
                React.createElement("td", { style: styles.td }, "₹", m.dailyRate),
                React.createElement("td", { style: styles.td }, "₹", m.weeklyRate),
                React.createElement("td", { style: styles.td }, "₹", m.monthlyRate),
                React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: m.status === "Available" ? "#d4edda" : m.status === "Rented" ? "#fff3cd" : "#f8d7da", padding: "4px 8px", borderRadius: "4px" } }, m.status)),
                React.createElement("td", { style: styles.td },
                  m.status === "Available" && React.createElement("button", { onClick: () => { setSelectedMachine(m); setShowRentalModal(true); }, style: styles.buttonSuccess }, "Rent")
                )
              ))
            )
          )
        )
      )
    ),

    activeTab === "rentals" && React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Active & Past Rentals"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Machine"), React.createElement("th", { style: styles.th }, "Client"),
                React.createElement("th", { style: styles.th }, "Project"), React.createElement("th", { style: styles.th }, "Start Date"),
                React.createElement("th", { style: styles.th }, "End Date"), React.createElement("th", { style: styles.th }, "Total Amount"),
                React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              rentals.map(r => React.createElement("tr", { key: r.id },
                React.createElement("td", { style: styles.td }, r.machineName),
                React.createElement("td", { style: styles.td }, r.clientName),
                React.createElement("td", { style: styles.td }, r.projectName),
                React.createElement("td", { style: styles.td }, r.startDate),
                React.createElement("td", { style: styles.td }, r.actualEndDate || r.endDate),
                React.createElement("td", { style: styles.td }, "₹", r.totalAmount.toLocaleString()),
                React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: r.status === "Active" ? "#d4edda" : "#e2e3e5", padding: "4px 8px", borderRadius: "4px" } }, r.status)),
                React.createElement("td", { style: styles.td },
                  r.status === "Active" && React.createElement(React.Fragment, null,
                    React.createElement("button", { onClick: () => returnMachine(r.id), style: { ...styles.buttonWarning, marginRight: "4px" } }, "Return"),
                    React.createElement("button", { onClick: () => generateInvoice(r), style: styles.buttonInfo }, "Invoice")
                  )
                )
              ))
            )
          )
        )
      )
    ),

    activeTab === "maintenance" && React.createElement("div", null,
      React.createElement("button", { onClick: () => { setSelectedMachine(machines.find(m => m.status === "Available")); setShowMaintenanceModal(true); }, style: styles.button }, "+ Schedule Maintenance"),
      React.createElement("div", { style: styles.card, marginTop: "16px" },
        React.createElement("div", { style: styles.cardTitle }, "Maintenance Records"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Machine"), React.createElement("th", { style: styles.th }, "Service Date"),
                React.createElement("th", { style: styles.th }, "Next Due"), React.createElement("th", { style: styles.th }, "Type"),
                React.createElement("th", { style: styles.th }, "Cost"), React.createElement("th", { style: styles.th }, "Mechanic")
              )
            ),
            React.createElement("tbody", null,
              maintenance.map(m => React.createElement("tr", { key: m.id },
                React.createElement("td", { style: styles.td }, m.machineName),
                React.createElement("td", { style: styles.td }, m.serviceDate),
                React.createElement("td", { style: styles.td }, m.nextDueDate),
                React.createElement("td", { style: styles.td }, m.serviceType),
                React.createElement("td", { style: styles.td }, "₹", m.cost),
                React.createElement("td", { style: styles.td }, m.mechanic)
              ))
            )
          )
        )
      )
    ),

    activeTab === "billing" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Invoices"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Invoice No"), React.createElement("th", { style: styles.th }, "Machine"),
              React.createElement("th", { style: styles.th }, "Client"), React.createElement("th", { style: styles.th }, "Period"),
              React.createElement("th", { style: styles.th }, "Amount"), React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Due Date")
            )
          ),
          React.createElement("tbody", null,
            invoices.map(i => React.createElement("tr", { key: i.id },
              React.createElement("td", { style: styles.td }, i.id),
              React.createElement("td", { style: styles.td }, i.machineName),
              React.createElement("td", { style: styles.td }, i.clientName),
              React.createElement("td", { style: styles.td }, i.period),
              React.createElement("td", { style: styles.td }, "₹", i.totalAmount.toLocaleString()),
              React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: i.status === "Paid" ? "#d4edda" : "#f8d7da", padding: "4px 8px", borderRadius: "4px" } }, i.status)),
              React.createElement("td", { style: styles.td }, i.dueDate)
            ))
          )
        )
      )
    ),

    activeTab === "enquiries" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "WhatsApp Enquiries"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Client"), React.createElement("th", { style: styles.th }, "Machine"),
              React.createElement("th", { style: styles.th }, "Duration"), React.createElement("th", { style: styles.th }, "Message"),
              React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            enquiries.filter(e => e.status === "Pending").map(e => React.createElement("tr", { key: e.id },
              React.createElement("td", { style: styles.td }, e.client),
              React.createElement("td", { style: styles.td }, e.machine),
              React.createElement("td", { style: styles.td }, e.duration),
              React.createElement("td", { style: styles.td }, e.message.substring(0, 30), "..."),
              React.createElement("td", { style: styles.td }, e.status),
              React.createElement("td", { style: styles.td },
                React.createElement("button", { onClick: () => { setSelectedEnquiry(e); setShowEnquiryModal(true); }, style: styles.buttonSuccess }, "Send Quote")
              )
            ))
          )
        )
      )
    ),

    activeTab === "reports" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Export Reports"),
      React.createElement("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: exportMachines, style: styles.buttonInfo }, "Machines Report"),
        React.createElement("button", { onClick: () => alert("Rentals exported"), style: styles.buttonInfo }, "Rentals Report"),
        React.createElement("button", { onClick: shareCatalog, style: styles.buttonSuccess }, "Share Catalog")
      )
    ),

    showAddMachineModal && React.createElement("div", { style: styles.modal, onClick: () => setShowAddMachineModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Machine"),
        React.createElement("input", { placeholder: "Machine Name", value: newMachine.name, onChange: (e) => setNewMachine({...newMachine, name: e.target.value}), style: styles.input }),
        React.createElement("select", { value: newMachine.category, onChange: (e) => setNewMachine({...newMachine, category: e.target.value}), style: styles.select },
          React.createElement("option", null, "Earth Moving"), React.createElement("option", null, "Concrete"), React.createElement("option", null, "Painting"),
          React.createElement("option", null, "Polishing"), React.createElement("option", null, "Cutting"), React.createElement("option", null, "Drilling")
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Daily Rate", value: newMachine.dailyRate, onChange: (e) => setNewMachine({...newMachine, dailyRate: parseFloat(e.target.value)}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Weekly Rate", value: newMachine.weeklyRate, onChange: (e) => setNewMachine({...newMachine, weeklyRate: parseFloat(e.target.value)}), style: styles.input })
        ),
        React.createElement("input", { type: "number", placeholder: "Monthly Rate", value: newMachine.monthlyRate, onChange: (e) => setNewMachine({...newMachine, monthlyRate: parseFloat(e.target.value)}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("label", null, React.createElement("input", { type: "checkbox", checked: newMachine.operatorRequired, onChange: (e) => setNewMachine({...newMachine, operatorRequired: e.target.checked}) }), " Operator Required"),
          newMachine.operatorRequired && React.createElement("input", { type: "number", placeholder: "Operator Cost/day", value: newMachine.operatorCost, onChange: (e) => setNewMachine({...newMachine, operatorCost: parseFloat(e.target.value)}), style: styles.input })
        ),
        React.createElement("button", { onClick: addMachine, style: styles.buttonSuccess }, "Add Machine")
      )
    ),

    showRentalModal && selectedMachine && React.createElement("div", { style: styles.modal, onClick: () => setShowRentalModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Rent Machine: ", selectedMachine.name),
        React.createElement("select", { value: selectedRental?.clientId || "", onChange: (e) => setSelectedRental({...selectedRental, clientId: parseInt(e.target.value)}) || setSelectedRental({ clientId: parseInt(e.target.value), startDate: "", endDate: "", dailyRate: "", operatorIncluded: false, securityDeposit: "" }), style: styles.select },
          React.createElement("option", { value: "" }, "Select Client"),
          clients.map(c => React.createElement("option", { key: c.id, value: c.id }, c.name, " - ", c.project))
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "date", placeholder: "Start Date", value: selectedRental?.startDate || "", onChange: (e) => setSelectedRental({...selectedRental, startDate: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", placeholder: "End Date", value: selectedRental?.endDate || "", onChange: (e) => setSelectedRental({...selectedRental, endDate: e.target.value}), style: styles.input })
        ),
        React.createElement("input", { type: "number", placeholder: "Daily Rate (₹)", value: selectedRental?.dailyRate || "", onChange: (e) => setSelectedRental({...selectedRental, dailyRate: e.target.value}), style: styles.input }),
        React.createElement("label", null, React.createElement("input", { type: "checkbox", checked: selectedRental?.operatorIncluded || false, onChange: (e) => setSelectedRental({...selectedRental, operatorIncluded: e.target.checked}) }), " Include Operator"),
        React.createElement("button", { onClick: addRental, style: styles.buttonSuccess }, "Create Rental")
      )
    ),

    showMaintenanceModal && selectedMachine && React.createElement("div", { style: styles.modal, onClick: () => setShowMaintenanceModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Schedule Maintenance for ", selectedMachine.name),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "date", placeholder: "Service Date", value: newMaintenance.serviceDate, onChange: (e) => setNewMaintenance({...newMaintenance, serviceDate: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", placeholder: "Next Due Date", value: newMaintenance.nextDueDate, onChange: (e) => setNewMaintenance({...newMaintenance, nextDueDate: e.target.value}), style: styles.input })
        ),
        React.createElement("select", { value: newMaintenance.serviceType, onChange: (e) => setNewMaintenance({...newMaintenance, serviceType: e.target.value}), style: styles.select },
          React.createElement("option", null, "Preventive"), React.createElement("option", null, "Breakdown")
        ),
        React.createElement("input", { type: "number", placeholder: "Cost (₹)", value: newMaintenance.cost, onChange: (e) => setNewMaintenance({...newMaintenance, cost: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Mechanic Name", value: newMaintenance.mechanic, onChange: (e) => setNewMaintenance({...newMaintenance, mechanic: e.target.value}), style: styles.input }),
        React.createElement("textarea", { placeholder: "Notes", value: newMaintenance.notes, onChange: (e) => setNewMaintenance({...newMaintenance, notes: e.target.value}), style: styles.textarea }),
        React.createElement("button", { onClick: addMaintenance, style: styles.buttonSuccess }, "Schedule Maintenance")
      )
    ),

    showBulkModal && React.createElement("div", { style: styles.modal, onClick: () => setShowBulkModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Bulk Upload Machines"),
        React.createElement("p", { style: { fontSize: "12px", color: "#666" } }, "Upload Excel with columns: Name, Category, DailyRate, WeeklyRate, MonthlyRate"),
        React.createElement("input", { type: "file", accept: ".xlsx,.xls", onChange: handleBulkUpload, style: styles.input }),
        bulkData.length > 0 && React.createElement("button", { onClick: importBulkMachines, style: styles.buttonSuccess }, "Import ", bulkData.length, " Machines")
      )
    ),

    showEnquiryModal && selectedEnquiry && React.createElement("div", { style: styles.modal, onClick: () => setShowEnquiryModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Send WhatsApp Quote"),
        React.createElement("p", null, React.createElement("strong", null, "Client:"), " ", selectedEnquiry.client),
        React.createElement("p", null, React.createElement("strong", null, "Request:"), " ", selectedEnquiry.machine, " for ", selectedEnquiry.duration, " days"),
        React.createElement("input", { type: "number", placeholder: "Rate per day (₹)", value: quotePrice, onChange: (e) => setQuotePrice(e.target.value), style: styles.input }),
        React.createElement("textarea", { placeholder: "Message", value: quoteMsg, onChange: (e) => setQuoteMsg(e.target.value), style: styles.textarea, rows: 3 }),
        React.createElement("button", { onClick: sendQuote, style: styles.buttonSuccess }, "Send Quote")
      )
    )
  );
}
