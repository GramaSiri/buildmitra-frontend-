import React, { useState } from "react";
import * as XLSX from "xlsx";
import { logoutToLogin } from "../utils/session";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [extensionDays, setExtensionDays] = useState(30);
  const [newPlan, setNewPlan] = useState({ name: "", monthly: 0, yearly: 0, features: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", mobile: "", role: "buyer" });

  const [users, setUsers] = useState([
    { id: 1, name: "Rajesh Sharma", email: "rajesh@example.com", mobile: "+919876511111", role: "Buyer", plan: "Professional", planType: "monthly", expiry: "2025-12-31", status: "Active", kyc: "Verified" },
    { id: 2, name: "ABC Suppliers", email: "abc@supplies.com", mobile: "+919876522222", role: "Supplier", plan: "Basic", planType: "monthly", expiry: "2024-11-30", status: "Active", kyc: "Pending" },
    { id: 3, name: "Sharma Construction", email: "sharma@construction.com", mobile: "+919876533333", role: "Vendor", plan: "None", expiry: null, status: "Active", kyc: "Pending" },
    { id: 4, name: "Manpower Services", email: "manpower@service.com", mobile: "+919876544444", role: "Labour", plan: "Enterprise", planType: "yearly", expiry: "2025-12-15", status: "Active", kyc: "Verified" },
    { id: 5, name: "Equipment Rentals", email: "rental@equipment.com", mobile: "+919876555555", role: "Machine", plan: "Professional", planType: "yearly", expiry: "2026-01-31", status: "Active", kyc: "Verified" }
  ]);

  const [plans, setPlans] = useState([
    { id: 1, name: "Basic", monthly: 250, yearly: 2500, features: ["Export reports", "Basic support", "1 user account"], status: "active" },
    { id: 2, name: "Professional", monthly: 350, yearly: 3500, features: ["Export reports", "WhatsApp integration", "Analytics", "5 user accounts", "Priority support"], status: "active" },
    { id: 3, name: "Enterprise", monthly: 450, yearly: 4500, features: ["All features", "API access", "Dedicated manager", "White-label reports", "24/7 support"], status: "active" }
  ]);

  const [transactions, setTransactions] = useState([
    { id: "TXN-001", userId: 1, userName: "Rajesh Sharma", amount: 350, plan: "Professional", type: "monthly", date: "2024-01-15", status: "Approved", paymentMode: "UPI" },
    { id: "TXN-002", userId: 4, userName: "Manpower Services", amount: 4500, plan: "Enterprise", type: "yearly", date: "2024-01-10", status: "Approved", paymentMode: "UPI" },
    { id: "TXN-003", userId: 5, userName: "Equipment Rentals", amount: 3500, plan: "Professional", type: "yearly", date: "2024-01-05", status: "Approved", paymentMode: "UPI" }
  ]);

  const [pendingPayments, setPendingPayments] = useState([
    { id: 1, userId: 2, userName: "ABC Suppliers", planId: 1, planName: "Basic", amount: 250, type: "monthly", date: "2024-02-10", status: "Pending" }
  ]);

  const [tickets, setTickets] = useState([
    { id: 1, userId: 1, userName: "Rajesh Sharma", subject: "Payment not reflecting", description: "Paid but subscription not active", status: "Open", priority: "High", createdAt: "2024-02-08", assignedTo: "Admin" },
    { id: 2, userId: 2, userName: "ABC Suppliers", subject: "KYC verification", description: "Please verify my documents", status: "In Progress", priority: "Medium", createdAt: "2024-02-07", assignedTo: "Support" }
  ]);

  const [activities, setActivities] = useState([
    { id: 1, user: "Rajesh Sharma", action: "Logged in", time: "2 hours ago", type: "login" },
    { id: 2, user: "ABC Suppliers", action: "Subscription renewed", time: "5 hours ago", type: "subscription" },
    { id: 3, user: "Admin", action: "Updated rates", time: "1 day ago", type: "settings" }
  ]);

  const [qrImage, setQrImage] = useState(null);
  const [upiId, setUpiId] = useState("buildmitra@okhdfcbank");
  const [showQRModal, setShowQRModal] = useState(false);

  const handleLogout = () => {
    if (confirm("Logout?")) logoutToLogin();
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const addPlan = () => {
    if (!newPlan.name || !newPlan.monthly) return alert("Fill required fields");
    const featuresArray = newPlan.features.split(",").map(f => f.trim());
    setPlans([...plans, { ...newPlan, id: plans.length + 1, features: featuresArray, status: "active" }]);
    setNewPlan({ name: "", monthly: 0, yearly: 0, features: "" });
    setShowPlanModal(false);
    alert("Subscription plan added!");
  };

  const updateUserStatus = (userId, status) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
    alert(`User status updated to ${status}`);
  };

  const extendSubscription = () => {
    if (!selectedUser) return;
    const newExpiry = new Date(selectedUser.expiry);
    newExpiry.setDate(newExpiry.getDate() + extensionDays);
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, expiry: newExpiry.toISOString().split("T")[0], status: "Active" } : u));
    alert(`Subscription extended by ${extensionDays} days for ${selectedUser.name}`);
    setShowExtendModal(false);
    setSelectedUser(null);
    setExtensionDays(30);
  };

  const updatePlan = (userId, planId, planType) => {
    const plan = plans.find(p => p.id === planId);
    const newExpiry = new Date();
    if (planType === "monthly") newExpiry.setMonth(newExpiry.getMonth() + 1);
    else newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    setUsers(users.map(u => u.id === userId ? { ...u, plan: plan.name, planType, expiry: newExpiry.toISOString().split("T")[0], status: "Active" } : u));
    alert(`Plan updated to ${plan.name}`);
  };

  const approveKYC = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, kyc: "Verified" } : u));
    alert("KYC approved!");
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) return alert("Fill details");
    setUsers([...users, { ...newUser, id: users.length + 1, plan: "None", planType: null, expiry: null, status: "Active", kyc: "Pending" }]);
    setNewUser({ name: "", email: "", mobile: "", role: "buyer" });
    setShowUserModal(false);
    alert("User added!");
  };

  const approvePayment = (paymentId) => {
    const payment = pendingPayments.find(p => p.id === paymentId);
    const plan = plans.find(p => p.id === payment.planId);
    const expiryDate = new Date();
    if (payment.type === "monthly") expiryDate.setMonth(expiryDate.getMonth() + 1);
    else expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    setTransactions([...transactions, {
      id: `TXN-${String(transactions.length + 1).padStart(3, "0")}`,
      userId: payment.userId,
      userName: payment.userName,
      amount: payment.amount,
      plan: payment.planName,
      type: payment.type,
      date: new Date().toISOString().split("T")[0],
      status: "Approved",
      paymentMode: "UPI"
    }]);
    
    setUsers(users.map(u => u.id === payment.userId ? {
      ...u,
      plan: payment.planName,
      planType: payment.type,
      expiry: expiryDate.toISOString().split("T")[0],
      status: "Active"
    } : u));
    
    setPendingPayments(pendingPayments.filter(p => p.id !== paymentId));
    alert(`Payment of ₹${payment.amount} approved!`);
  };

  const rejectPayment = (paymentId) => {
    setPendingPayments(pendingPayments.filter(p => p.id !== paymentId));
    alert("Payment rejected.");
  };

  const updateTicketStatus = (ticketId, status) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status } : t));
    alert(`Ticket status updated to ${status}`);
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImage(reader.result);
        alert("QR code uploaded successfully!");
        setShowQRModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateUpiId = () => {
    const newUpi = prompt("Enter new UPI ID:", upiId);
    if (newUpi) setUpiId(newUpi);
  };

  const exportReport = (type) => {
    let data = [];
    if (type === "users") data = users.map(u => ({ Name: u.name, Email: u.email, Mobile: u.mobile, Role: u.role, Plan: u.plan, Expiry: u.expiry, Status: u.status }));
    else if (type === "payments") data = transactions.map(t => ({ Transaction: t.id, User: t.userName, Amount: t.amount, Plan: t.plan, Date: t.date, Status: t.status }));
    else if (type === "subscriptions") data = users.filter(u => u.plan !== "None").map(u => ({ User: u.name, Plan: u.plan, Type: u.planType, Expiry: u.expiry }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `${type}_report_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert(`${type} report exported!`);
  };

  const totalUsers = users.length;
  const activeSubscriptions = users.filter(u => u.plan !== "None" && u.status === "Active").length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingKYC = users.filter(u => u.kyc === "Pending").length;

  const styles = {
    container: { padding: "16px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#800020", color: "white", padding: "16px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" },
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
    statValue: { fontSize: "24px", fontWeight: "bold", color: "#800020" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    qrBox: { border: "2px dashed #800020", borderRadius: "12px", padding: "20px", textAlign: "center", backgroundColor: "#f8f9fa", marginBottom: "16px" },
    upiIdBox: { backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "8px", textAlign: "center", fontSize: "18px", fontWeight: "bold", fontFamily: "monospace" }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "users", name: "Users" },
    { id: "subscriptions", name: "Subscriptions" },
    { id: "payments", name: "Payments & QR" },
    { id: "crm", name: "CRM" },
    { id: "reports", name: "Reports" }
  ];

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "Admin Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Manage Platform, Users, Subscriptions & Payments")
      ),
      React.createElement("div", { style: { display: "flex", gap: "10px" } },
        React.createElement("button", { onClick: () => navigateTo("/marketplace"), style: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Marketplace"),
        React.createElement("button", { onClick: handleLogout, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Logout")
      )
    ),

    React.createElement("div", { style: styles.grid4 },
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, totalUsers), React.createElement("div", { style: styles.statLabel }, "Total Users")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, activeSubscriptions), React.createElement("div", { style: styles.statLabel }, "Active Subs")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (totalRevenue/1000).toFixed(0), "K"), React.createElement("div", { style: styles.statLabel }, "Revenue")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, pendingKYC), React.createElement("div", { style: styles.statLabel }, "Pending KYC"))
    ),

    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),

    activeTab === "dashboard" && React.createElement("div", null,
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Platform Overview"),
          React.createElement("div", null, React.createElement("strong", null, "Total Users:"), " ", totalUsers),
          React.createElement("div", null, React.createElement("strong", null, "Active Subscriptions:"), " ", activeSubscriptions),
          React.createElement("div", null, React.createElement("strong", null, "Monthly Revenue:"), " ₹", totalRevenue.toLocaleString()),
          React.createElement("div", null, React.createElement("strong", null, "Pending KYC:"), " ", pendingKYC),
          React.createElement("div", null, React.createElement("strong", null, "Pending Payments:"), " ", pendingPayments.length)
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Recent Activities"),
          activities.slice(0, 3).map(a => React.createElement("div", { key: a.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, a.user), " - ", a.action,
            React.createElement("div", { style: { fontSize: "10px", color: "#999" } }, a.time)
          ))
        )
      )
    ),

    activeTab === "users" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "User Management"),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" } },
        React.createElement("button", { onClick: () => setShowUserModal(true), style: styles.button }, "+ Add User"),
        React.createElement("button", { onClick: () => exportReport("users"), style: { ...styles.buttonInfo } }, " Export Users")
      ),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Name"), React.createElement("th", { style: styles.th }, "Role"),
              React.createElement("th", { style: styles.th }, "Plan"), React.createElement("th", { style: styles.th }, "Expiry"),
              React.createElement("th", { style: styles.th }, "KYC"), React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            users.map(u => React.createElement("tr", { key: u.id },
              React.createElement("td", { style: styles.td }, u.name),
              React.createElement("td", { style: styles.td }, u.role),
              React.createElement("td", { style: styles.td },
                React.createElement("select", { value: u.plan, onChange: (e) => updatePlan(u.id, parseInt(e.target.value), "monthly"), style: { padding: "4px", borderRadius: "4px" } },
                  React.createElement("option", { value: "None" }, "None"),
                  plans.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name))
                )
              ),
              React.createElement("td", { style: styles.td }, u.expiry || "-"),
              React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: u.kyc === "Verified" ? "#d4edda" : "#f8d7da", padding: "4px 8px", borderRadius: "4px" } }, u.kyc)),
              React.createElement("td", { style: styles.td },
                React.createElement("select", { value: u.status, onChange: (e) => updateUserStatus(u.id, e.target.value), style: { padding: "4px", borderRadius: "4px" } },
                  React.createElement("option", null, "Active"), React.createElement("option", null, "Inactive"), React.createElement("option", null, "Blocked")
                )
              ),
              React.createElement("td", { style: styles.td },
                u.kyc === "Pending" && React.createElement("button", { onClick: () => approveKYC(u.id), style: { ...styles.buttonSuccess, marginRight: "4px", marginBottom: "4px" } }, "Approve KYC"),
                React.createElement("button", { onClick: () => { setSelectedUser(u); setShowExtendModal(true); }, style: styles.buttonInfo }, "Extend")
              )
            ))
          )
        )
      )
    ),

    activeTab === "subscriptions" && React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowPlanModal(true), style: styles.button }, "+ Add Plan"),
      React.createElement("div", { style: styles.grid3, marginTop: "16px" },
        plans.map(p => React.createElement("div", { key: p.id, style: styles.card },
          React.createElement("h3", { style: { color: "#800020", margin: "0 0 8px 0" } }, p.name),
          React.createElement("p", null, React.createElement("span", { style: { fontSize: "24px", fontWeight: "bold" } }, "₹", p.monthly), " /month"),
          React.createElement("p", null, "₹", p.yearly, " /year"),
          React.createElement("ul", { style: { paddingLeft: "20px", fontSize: "12px" } },
            p.features.map((f, idx) => React.createElement("li", { key: idx }, "✓ ", f))
          ),
          React.createElement("p", { style: { marginTop: "8px" } }, "Status: ", React.createElement("span", { style: { color: p.status === "active" ? "#28a745" : "#dc3545" } }, p.status))
        ))
      )
    ),

    activeTab === "payments" && React.createElement("div", null,
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "UPI Payment Gateway"),
          React.createElement("div", { style: styles.qrBox },
            qrImage ? React.createElement("img", { src: qrImage, alt: "UPI QR Code", style: { width: "200px", height: "200px", objectFit: "contain" } }) :
              React.createElement("div", { style: { padding: "40px", textAlign: "center" } },
                React.createElement("div", { style: { fontSize: "48px" } }, "📱"),
                React.createElement("p", null, "No QR code uploaded")
              ),
            React.createElement("button", { onClick: () => setShowQRModal(true), style: { ...styles.button, marginTop: "12px" } }, "Upload QR Code")
          ),
          React.createElement("div", { style: styles.upiIdBox },
            React.createElement("strong", null, "UPI ID:"), " ", upiId,
            React.createElement("button", { onClick: updateUpiId, style: { ...styles.buttonInfo, marginLeft: "12px", padding: "4px 12px" } }, "Edit")
          )
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Pending Payments (", pendingPayments.length, ")"),
          pendingPayments.length === 0 ? React.createElement("div", { style: { textAlign: "center", padding: "40px", color: "#666" } }, "No pending payments") :
            pendingPayments.map(p => React.createElement("div", { key: p.id, style: { border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px" } },
              React.createElement("div", null, React.createElement("strong", null, p.userName), " - ", p.planName, " Plan (", p.type, ")"),
              React.createElement("div", null, "Amount: ₹", p.amount),
              React.createElement("div", null, "Date: ", p.date),
              React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "8px" } },
                React.createElement("button", { onClick: () => approvePayment(p.id), style: styles.buttonSuccess }, "Approve"),
                React.createElement("button", { onClick: () => rejectPayment(p.id), style: styles.buttonDanger }, "Reject")
              )
            ))
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Transaction History"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "TXN ID"), React.createElement("th", { style: styles.th }, "User"),
                React.createElement("th", { style: styles.th }, "Amount"), React.createElement("th", { style: styles.th }, "Plan"),
                React.createElement("th", { style: styles.th }, "Date"), React.createElement("th", { style: styles.th }, "Status")
              )
            ),
            React.createElement("tbody", null,
              transactions.map(t => React.createElement("tr", { key: t.id },
                React.createElement("td", { style: styles.td }, t.id),
                React.createElement("td", { style: styles.td }, t.userName),
                React.createElement("td", { style: styles.td }, "₹", t.amount.toLocaleString()),
                React.createElement("td", { style: styles.td }, t.plan),
                React.createElement("td", { style: styles.td }, t.date),
                React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: "#d4edda", padding: "4px 8px", borderRadius: "4px" } }, t.status))
              ))
            )
          )
        )
      )
    ),

    activeTab === "crm" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Support Tickets (", tickets.length, ")"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "ID"), React.createElement("th", { style: styles.th }, "User"),
              React.createElement("th", { style: styles.th }, "Subject"), React.createElement("th", { style: styles.th }, "Priority"),
              React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Created"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            tickets.map(t => React.createElement("tr", { key: t.id },
              React.createElement("td", { style: styles.td }, "#", t.id),
              React.createElement("td", { style: styles.td }, t.userName),
              React.createElement("td", { style: styles.td }, t.subject),
              React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: t.priority === "High" ? "#f8d7da" : "#fff3cd", padding: "4px 8px", borderRadius: "4px" } }, t.priority)),
              React.createElement("td", { style: styles.td },
                React.createElement("select", { value: t.status, onChange: (e) => updateTicketStatus(t.id, e.target.value), style: { padding: "4px", borderRadius: "4px" } },
                  React.createElement("option", null, "Open"), React.createElement("option", null, "In Progress"),
                  React.createElement("option", null, "Resolved"), React.createElement("option", null, "Closed")
                )
              ),
              React.createElement("td", { style: styles.td }, t.createdAt),
              React.createElement("td", { style: styles.td }, React.createElement("button", { onClick: () => alert(t.description), style: styles.buttonInfo }, "View"))
            ))
          )
        )
      )
    ),

    activeTab === "reports" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Generate Reports"),
      React.createElement("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => exportReport("users"), style: styles.buttonInfo }, "User Report"),
        React.createElement("button", { onClick: () => exportReport("payments"), style: styles.buttonInfo }, "Payment Report"),
        React.createElement("button", { onClick: () => exportReport("subscriptions"), style: styles.buttonInfo }, "Subscription Report")
      )
    ),

    showPlanModal && React.createElement("div", { style: styles.modal, onClick: () => setShowPlanModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Subscription Plan"),
        React.createElement("input", { placeholder: "Plan Name", value: newPlan.name, onChange: (e) => setNewPlan({...newPlan, name: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Monthly Price", value: newPlan.monthly, onChange: (e) => setNewPlan({...newPlan, monthly: parseFloat(e.target.value)}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Yearly Price", value: newPlan.yearly, onChange: (e) => setNewPlan({...newPlan, yearly: parseFloat(e.target.value)}), style: styles.input })
        ),
        React.createElement("textarea", { placeholder: "Features (comma separated)", value: newPlan.features, onChange: (e) => setNewPlan({...newPlan, features: e.target.value}), style: styles.textarea }),
        React.createElement("button", { onClick: addPlan, style: styles.buttonSuccess }, "Add Plan")
      )
    ),

    showExtendModal && selectedUser && React.createElement("div", { style: styles.modal, onClick: () => setShowExtendModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Extend Subscription - ", selectedUser.name),
        React.createElement("p", null, "Current Plan: ", selectedUser.plan),
        React.createElement("p", null, "Current Expiry: ", selectedUser.expiry),
        React.createElement("label", { style: styles.label }, "Extension Days"),
        React.createElement("input", { type: "number", value: extensionDays, onChange: (e) => setExtensionDays(parseInt(e.target.value)), style: styles.input, min: "1", max: "365" }),
        React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "16px" } },
          React.createElement("button", { onClick: extendSubscription, style: styles.buttonSuccess }, "Extend"),
          React.createElement("button", { onClick: () => setShowExtendModal(false), style: { ...styles.button, backgroundColor: "#6c757d" } }, "Cancel")
        )
      )
    ),

    showUserModal && React.createElement("div", { style: styles.modal, onClick: () => setShowUserModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add New User"),
        React.createElement("input", { placeholder: "Full Name", value: newUser.name, onChange: (e) => setNewUser({...newUser, name: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Email", value: newUser.email, onChange: (e) => setNewUser({...newUser, email: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Mobile Number", value: newUser.mobile, onChange: (e) => setNewUser({...newUser, mobile: e.target.value}), style: styles.input }),
        React.createElement("select", { value: newUser.role, onChange: (e) => setNewUser({...newUser, role: e.target.value}), style: styles.select },
          React.createElement("option", { value: "buyer" }, "Buyer"), React.createElement("option", { value: "supplier" }, "Supplier"),
          React.createElement("option", { value: "vendor" }, "Vendor"), React.createElement("option", { value: "labour" }, "Labour"),
          React.createElement("option", { value: "machine" }, "Machine"), React.createElement("option", { value: "admin" }, "Admin")
        ),
        React.createElement("button", { onClick: addUser, style: styles.buttonSuccess }, "Add User")
      )
    ),

    showQRModal && React.createElement("div", { style: styles.modal, onClick: () => setShowQRModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Upload UPI QR Code"),
        React.createElement("p", { style: { fontSize: "12px", color: "#666", marginBottom: "16px" } }, "Upload GPay, PhonePe, or Paytm QR code for subscription payments"),
        React.createElement("input", { type: "file", accept: "image/*", onChange: handleQRUpload, style: styles.input }),
        React.createElement("button", { onClick: () => setShowQRModal(false), style: { ...styles.button, backgroundColor: "#6c757d", marginTop: "16px" } }, "Cancel")
      )
    )
  );
}
