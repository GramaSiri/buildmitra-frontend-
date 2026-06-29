import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
const API = "http://localhost:5000/api";
import { logoutToLogin } from "../utils/session";

export default function AdminDashboard() {
  const loadLocalData = (key, fallback) => {
    if (typeof window === "undefined") return fallback;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [extensionDays, setExtensionDays] = useState(30);
  const [newPlan, setNewPlan] = useState({ name: "", monthly: 0, yearly: 0, features: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", mobile: "", role: "buyer" });

  const [users, setUsers] = useState(() => loadLocalData("users", []));

  const [plans, setPlans] = useState([
    { id: 1, name: "Basic", monthly: 250, yearly: 2500, features: ["Export reports", "Basic support", "1 user account"], status: "active" },
    { id: 2, name: "Professional", monthly: 350, yearly: 3500, features: ["Export reports", "WhatsApp integration", "Analytics", "5 user accounts", "Priority support"], status: "active" },
    { id: 3, name: "Enterprise", monthly: 450, yearly: 4500, features: ["All features", "API access", "Dedicated manager", "White-label reports", "24/7 support"], status: "active" }
  ]);

  const [transactions, setTransactions] = useState(() => loadLocalData("bm_admin_transactions", []));

  const [pendingPayments, setPendingPayments] = useState(() => loadLocalData("bm_admin_pending_payments", []));

  const [tickets, setTickets] = useState(() => loadLocalData("bm_admin_tickets", []));

  const [activities, setActivities] = useState(() => loadLocalData("bm_admin_activities", []));

  const [qrImage, setQrImage] = useState(null);
  const [upiId, setUpiId] = useState("buildmitra@okhdfcbank");
  const [showQRModal, setShowQRModal] = useState(false);

  const [materialRates, setMaterialRates] = useState(() => loadLocalData("bm_material_rates", [
    { id: 1, category: "Cement", item: "OPC 53 Grade Cement", unit: "Bag", rate: 420, gst: 28, status: "Active" },
    { id: 2, category: "Steel", item: "TMT Fe500 Steel", unit: "Kg", rate: 62, gst: 18, status: "Active" },
    { id: 3, category: "Sand", item: "River Sand", unit: "CFT", rate: 58, gst: 5, status: "Active" },
    { id: 4, category: "Aggregate", item: "20mm Aggregate", unit: "CFT", rate: 42, gst: 5, status: "Active" }
  ]));

  const [labourRates, setLabourRates] = useState(() => loadLocalData("bm_labour_rates", [
    { id: 1, trade: "Mason", unit: "Day", rate: 1200, status: "Active" },
    { id: 2, trade: "Helper", unit: "Day", rate: 700, status: "Active" },
    { id: 3, trade: "Carpenter", unit: "Day", rate: 1500, status: "Active" },
    { id: 4, trade: "Bar Bender", unit: "Day", rate: 1400, status: "Active" },
    { id: 5, trade: "Electrician", unit: "Day", rate: 1300, status: "Active" },
    { id: 6, trade: "Plumber", unit: "Day", rate: 1300, status: "Active" }
  ]));

  const [equipmentRates, setEquipmentRates] = useState(() => loadLocalData("bm_equipment_rates", [
    { id: 1, item: "JCB", unit: "Hour", rate: 1800, status: "Active" },
    { id: 2, item: "Concrete Mixer", unit: "Day", rate: 2500, status: "Active" },
    { id: 3, item: "Vibrator", unit: "Day", rate: 900, status: "Active" }
  ]));

  const [serviceRates, setServiceRates] = useState(() => loadLocalData("bm_service_rates", [
    { id: 1, module: "Paint Calculator", service: "Fresh Paint Labour", unit: "SFT", rate: 5, status: "Active" },
    { id: 2, module: "Paint Calculator", service: "Repaint Labour", unit: "SFT", rate: 3, status: "Active" },
    { id: 3, module: "Tile Calculator", service: "Tile Fixing Labour", unit: "SFT", rate: 35, status: "Active" },
    { id: 4, module: "Steel Calculator", service: "Fabrication Labour", unit: "Kg", rate: 8, status: "Active" }
  ]));

  const [supplierApprovals, setSupplierApprovals] = useState(() => loadLocalData("bm_supplier_approvals", []));
  const [projects, setProjects] = useState(() => loadLocalData("bm_admin_projects", []));

  useEffect(() => { localStorage.setItem("users", JSON.stringify(users)); localStorage.setItem("bm_admin_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("bm_admin_transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("bm_admin_pending_payments", JSON.stringify(pendingPayments)); }, [pendingPayments]);
  useEffect(() => { localStorage.setItem("bm_admin_tickets", JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem("bm_material_rates", JSON.stringify(materialRates)); }, [materialRates]);
  useEffect(() => { localStorage.setItem("bm_labour_rates", JSON.stringify(labourRates)); }, [labourRates]);
  useEffect(() => { localStorage.setItem("bm_equipment_rates", JSON.stringify(equipmentRates)); }, [equipmentRates]);
useEffect(() => { localStorage.setItem("bm_service_rates", JSON.stringify(serviceRates)); }, [serviceRates]);
  useEffect(() => {
    const hasCode = (r) => r && r.code && String(r.code).trim() !== "";

    setMaterialRates(prev => prev.filter(hasCode));
    setLabourRates(prev => prev.filter(hasCode));
    setServiceRates(prev => prev.filter(hasCode));
    setEquipmentRates(prev => prev.filter(hasCode));

    localStorage.setItem("bm_material_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_material_rates") || "[]")).filter(hasCode)));
    localStorage.setItem("bm_labour_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_labour_rates") || "[]")).filter(hasCode)));
    localStorage.setItem("bm_service_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_service_rates") || "[]")).filter(hasCode)));
    localStorage.setItem("bm_equipment_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_equipment_rates") || "[]")).filter(hasCode)));
  }, []);
  useEffect(() => { localStorage.setItem("bm_supplier_approvals", JSON.stringify(supplierApprovals)); }, [supplierApprovals]);
  useEffect(() => { localStorage.setItem("bm_admin_projects", JSON.stringify(projects)); }, [projects]);

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

  const addMaterialRate = () => {
    const category = prompt("Category:", "Cement");
    const item = prompt("Item Name:", "New Material");
    const unit = prompt("Unit:", "Nos");
    const rate = Number(prompt("Rate:", "0"));
    if (!category || !item || !unit || !rate) return alert("Invalid material rate");
    setMaterialRates([...materialRates, { id: Date.now(), category, item, unit, rate, gst: 18, status: "Active" }]);
  };

  const addLabourRate = () => {
    const trade = prompt("Trade:", "Mason");
    const unit = prompt("Unit:", "Day");
    const rate = Number(prompt("Rate:", "0"));
    if (!trade || !unit || !rate) return alert("Invalid labour rate");
    setLabourRates([...labourRates, { id: Date.now(), trade, unit, rate, status: "Active" }]);
  };

  const addServiceRate = () => {
    const module = prompt("Module:", "Paint Calculator");
    const service = prompt("Service Name:", "Fresh Paint Labour");
    const unit = prompt("Unit:", "SFT");
    const rate = Number(prompt("Rate:", "0"));
    if (!module || !service || !unit || !rate) return alert("Invalid service rate");
    setServiceRates([...serviceRates, { id: Date.now(), module, service, unit, rate, status: "Active" }]);
  };

  const addEquipmentRate = () => {
    const item = prompt("Equipment:", "JCB");
    const unit = prompt("Unit:", "Hour");
    const rate = Number(prompt("Rate:", "0"));
    if (!item || !unit || !rate) return alert("Invalid equipment rate");
    setEquipmentRates([...equipmentRates, { id: Date.now(), item, unit, rate, status: "Active" }]);
  };

  const updateRate = (type, id, currentRate) => {
    const rate = Number(prompt("Enter new rate:", currentRate));
    if (!rate) return;
    if (type === "material") setMaterialRates(materialRates.map(r => r.id === id ? { ...r, rate } : r));
    if (type === "labour") setLabourRates(labourRates.map(r => r.id === id ? { ...r, rate } : r));
    if (type === "equipment") setEquipmentRates(equipmentRates.map(r => r.id === id ? { ...r, rate } : r));
    if (type === "service") setServiceRates(serviceRates.map(r => r.id === id ? { ...r, rate } : r));
  };

  const downloadTemplate = (type) => {
    let data = [];
    if (type === "materials") data = [{ Category: "Cement", SubCategory: "OPC", ItemName: "OPC 53 Grade", Brand: "UltraTech", Unit: "Bag", Rate: 420, GST: 28, Status: "Active" }];
    if (type === "labour") data = [{ Trade: "Mason", Category: "Skilled", Unit: "Day", Rate: 1200, Status: "Active" }];
    if (type === "services") data = [{ Module: "Paint Calculator", Service: "Fresh Paint Labour", Unit: "SFT", Rate: 5, Status: "Active" }];
    if (type === "equipment") data = [{ Equipment: "JCB", Unit: "Hour", Rate: 1800, Status: "Active" }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "template");
    XLSX.writeFile(wb, type + "_template.xlsx");
  };

  const bulkUploadRates = (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const pick = (r, keys) => {
      for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== "") return r[k];
      }
      return "";
    };

    const toNumber = (v) => {
      const n = Number(String(v || "0").replace(/[^0-9.-]/g, ""));
      return isNaN(n) ? 0 : n;
    };

    const mergeByCode = (prev, mapped) => {
      const old = Array.isArray(prev) ? prev : [];
      const out = [...old];
      mapped.forEach((row) => {
        const code = String(row.code || "").trim();
        const idx = code ? out.findIndex(x => String(x.code || "").trim().toLowerCase() === code.toLowerCase()) : -1;
        if (idx >= 0) out[idx] = { ...out[idx], ...row, id: out[idx].id };
        else out.push(row);
      });
      return out;
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      let imported = 0;

      if (type === "materials") {
        const mapped = rows.map((r, i) => {
          const code = pick(r, ["Code", "code", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Item", "item", "Description", "Material", "Service"]);
          const category = pick(r, ["Category", "category", "Module", "module"]) || "General";
          const subCategory = pick(r, ["SubCategory", "Sub Category", "subCategory"]);
          const brand = pick(r, ["Brand", "brand"]);
          const specification = pick(r, ["Specification", "Spec", "specification", "Specs"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom", "Units", "units"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "Material Rate", "MaterialRate", "UnitRate", "Unit Rate", "Basic Rate"]));
          const status = pick(r, ["Status", "status"]) || "Active";

          return {
            id: Date.now() + i,
            code,
            category,
            subCategory,
            item: itemName,
            itemName,
            brand,
            specification,
            unit,
            rate,
            gst: toNumber(pick(r, ["GST", "gst"])),
            status
          };
        }).filter(r => r.code && r.item && r.unit && r.rate >= 0);

        imported = mapped.length;
        setMaterialRates(prev => mergeByCode(prev, mapped));
      }

      if (type === "labour") {
        const mapped = rows.map((r, i) => {
          const code = pick(r, ["Code", "code", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Item", "Trade", "trade", "Description", "Service"]);
          const category = pick(r, ["Category", "category", "Module", "module"]) || "General";
          const description = pick(r, ["Description", "description", "Work Description"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "Labour Rate", "LabourRate", "UnitRate", "Unit Rate"]));
          const status = pick(r, ["Status", "status"]) || "Active";

          return {
            id: Date.now() + i,
            code,
            trade: itemName,
            itemName,
            category,
            description,
            unit,
            rate,
            status
          };
        }).filter(r => r.code && r.trade && r.unit && r.rate >= 0);

        imported = mapped.length;
        setLabourRates(prev => mergeByCode(prev, mapped));
      }

      if (type === "services") {
        const mapped = rows.map((r, i) => {
          const code = pick(r, ["Code", "code", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Service", "service", "Item", "Description", "Material"]);
          const module = pick(r, ["Module", "module", "Category", "category"]) || "BOQ";
          const category = pick(r, ["Category", "category"]) || module;
          const description = pick(r, ["Description", "description"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "Labour Rate", "LabourRate", "Service Rate", "ServiceRate", "UnitRate", "Unit Rate"]));
          const status = pick(r, ["Status", "status"]) || "Active";

          return {
            id: Date.now() + i,
            code,
            module,
            category,
            service: itemName,
            itemName,
            description,
            unit,
            rate,
            status
          };
        }).filter(r => r.code && r.service && r.unit && r.rate >= 0);

        imported = mapped.length;
        setServiceRates(prev => mergeByCode(prev, mapped));
      }

      if (type === "equipment") {
        const mapped = rows.map((r, i) => {
          const code = pick(r, ["Code", "code", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Equipment", "Item", "Description"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "UnitRate", "Unit Rate"]));
          const status = pick(r, ["Status", "status"]) || "Active";

          return {
            id: Date.now() + i,
            code,
            item: itemName,
            itemName,
            unit,
            rate,
            status
          };
        }).filter(r => r.item && r.unit && r.rate >= 0);

        imported = mapped.length;
        setEquipmentRates(prev => mergeByCode(prev, mapped));
      }

      console.log("Bulk Upload Type:", type, "Rows:", rows, "Imported:", imported);
      alert("Bulk upload completed for " + type + ". Imported " + imported + " rows out of " + rows.length + " rows.");
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  const updateUpiId = () => {
    const newUpi = prompt("Enter new UPI ID:", upiId);
    if (newUpi) setUpiId(newUpi);
  };

  const cleanLegacyRates = () => {
    const ok = confirm("Remove all Material, Labour, Service and Equipment rows without Code?");
    if (!ok) return;

    const hasCode = (r) => r && r.code && String(r.code).trim() !== "";

    setMaterialRates(prev => prev.filter(hasCode));
    setLabourRates(prev => prev.filter(hasCode));
    setServiceRates(prev => prev.filter(hasCode));
    setEquipmentRates(prev => prev.filter(hasCode));

    localStorage.setItem("bm_material_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_material_rates") || "[]")).filter(hasCode)));
    localStorage.setItem("bm_labour_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_labour_rates") || "[]")).filter(hasCode)));
    localStorage.setItem("bm_service_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_service_rates") || "[]")).filter(hasCode)));
    localStorage.setItem("bm_equipment_rates", JSON.stringify((JSON.parse(localStorage.getItem("bm_equipment_rates") || "[]")).filter(hasCode)));

    alert("Legacy rows without Code removed. Only coded master rates remain.");
  };
  const exportReport = (type) => {
    let data = [];
    if (type === "users") data = users.map(u => ({ Name: u.name, Email: u.email, Mobile: u.mobile, Role: u.role, Plan: u.plan, Expiry: u.expiry, Status: u.status }));
    else if (type === "payments") data = transactions.map(t => ({ Transaction: t.id, User: t.userName, Amount: t.amount, Plan: t.plan, Date: t.date, Status: t.status }));
    else if (type === "subscriptions") data = users.filter(u => u.plan !== "None").map(u => ({ User: u.name, Plan: u.plan, Type: u.planType, Expiry: u.expiry }));
    else if (type === "materials") data = materialRates;
    else if (type === "labour") data = labourRates;
    else if (type === "equipment") data = equipmentRates;
    else if (type === "services") data = serviceRates;
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
  const totalMasterRates = materialRates.length + labourRates.length + equipmentRates.length + serviceRates.length;

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

  { id: "masterRates", name: "Master Rates" },
  { id: "marketplaceApproval", name: "Marketplace Approval" },
  { id: "projectControl", name: "Project Control" },

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
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, pendingKYC), React.createElement("div", { style: styles.statLabel }, "Pending KYC")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, totalMasterRates), React.createElement("div", { style: styles.statLabel }, "Master Rates"))
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


    activeTab === "masterRates" && React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Master Rate Management - Single Source for BOQ, Calculators & Marketplace"),
        React.createElement("p", { style: { color: "#666", fontSize: "13px" } }, "All material, labour and equipment rates should come from this admin master sheet. Backend API will later replace localStorage."),

        React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" } },
          React.createElement("button", { onClick: addMaterialRate, style: styles.button }, "+ Material Rate"),
          React.createElement("button", { onClick: addLabourRate, style: styles.buttonInfo }, "+ Labour Rate"),
          React.createElement("button", { onClick: addServiceRate, style: styles.buttonSuccess }, "+ Service Rate"),
          React.createElement("button", { onClick: addEquipmentRate, style: styles.buttonWarning }, "+ Equipment Rate"),
          React.createElement("button", { onClick: cleanLegacyRates, style: styles.buttonDanger }, "Clean Legacy No-Code Rates"),
          React.createElement("button", { onClick: () => exportReport("materials"), style: styles.buttonInfo }, "Export Materials"),
          React.createElement("button", { onClick: () => exportReport("labour"), style: styles.buttonInfo }, "Export Labour"),
          React.createElement("button", { onClick: () => exportReport("services"), style: styles.buttonInfo }, "Export Services"),
          React.createElement("button", { onClick: () => exportReport("equipment"), style: styles.buttonInfo }, "Export Equipment")
        ),

        React.createElement("h3", null, "Bulk Upload / Templates"),
        React.createElement("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" } },
          React.createElement("button", { onClick: () => downloadTemplate("materials"), style: styles.buttonInfo }, "Download Material Format"),
          React.createElement("label", { style: styles.button }, "Upload Materials", React.createElement("input", { type: "file", accept: ".xlsx,.xls,.csv", onChange: (e) => bulkUploadRates(e, "materials"), style: { display: "none" } })),
          React.createElement("button", { onClick: () => downloadTemplate("labour"), style: styles.buttonInfo }, "Download Labour Format"),
          React.createElement("label", { style: styles.button }, "Upload Labour", React.createElement("input", { type: "file", accept: ".xlsx,.xls,.csv", onChange: (e) => bulkUploadRates(e, "labour"), style: { display: "none" } })),
          React.createElement("button", { onClick: () => downloadTemplate("services"), style: styles.buttonInfo }, "Download Service Format"),
          React.createElement("label", { style: styles.button }, "Upload Services", React.createElement("input", { type: "file", accept: ".xlsx,.xls,.csv", onChange: (e) => bulkUploadRates(e, "services"), style: { display: "none" } })),
          React.createElement("button", { onClick: () => downloadTemplate("equipment"), style: styles.buttonInfo }, "Download Equipment Format"),
          React.createElement("label", { style: styles.button }, "Upload Equipment", React.createElement("input", { type: "file", accept: ".xlsx,.xls,.csv", onChange: (e) => bulkUploadRates(e, "equipment"), style: { display: "none" } }))
        ),

        React.createElement("h3", null, "Material Rates"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Code"),
                React.createElement("th", { style: styles.th }, "Category"),
                React.createElement("th", { style: styles.th }, "Item Name"),
                React.createElement("th", { style: styles.th }, "Brand"),
                React.createElement("th", { style: styles.th }, "Specification"),
                React.createElement("th", { style: styles.th }, "Unit"),
                React.createElement("th", { style: styles.th }, "Rate"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              materialRates.map(r => React.createElement("tr", { key: r.id },
                React.createElement("td", { style: styles.td }, r.code || "-"),
                React.createElement("td", { style: styles.td }, r.category || "-"),
                React.createElement("td", { style: styles.td }, r.item || r.itemName || "-"),
                React.createElement("td", { style: styles.td }, r.brand || "-"),
                React.createElement("td", { style: styles.td }, r.specification || "-"),
                React.createElement("td", { style: styles.td }, r.unit || "-"),
                React.createElement("td", { style: styles.td }, "₹", r.rate),
                React.createElement("td", { style: styles.td }, r.status || "Active"),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => updateRate("material", r.id, r.rate), style: styles.buttonInfo }, "Edit")
                )
              ))
            )
          )
        ),

        React.createElement("h3", { style: { marginTop: "20px" } }, "Labour Rates"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Code"),
                React.createElement("th", { style: styles.th }, "Category"),
                React.createElement("th", { style: styles.th }, "Labour Item"),
                React.createElement("th", { style: styles.th }, "Description"),
                React.createElement("th", { style: styles.th }, "Unit"),
                React.createElement("th", { style: styles.th }, "Rate"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              labourRates.map(r => React.createElement("tr", { key: r.id },
                React.createElement("td", { style: styles.td }, r.code || "-"),
                React.createElement("td", { style: styles.td }, r.category || "-"),
                React.createElement("td", { style: styles.td }, r.trade || r.itemName || "-"),
                React.createElement("td", { style: styles.td }, r.description || "-"),
                React.createElement("td", { style: styles.td }, r.unit || "-"),
                React.createElement("td", { style: styles.td }, "₹", r.rate),
                React.createElement("td", { style: styles.td }, r.status || "Active"),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => updateRate("labour", r.id, r.rate), style: styles.buttonInfo }, "Edit")
                )
              ))
            )
          )
        ),

        React.createElement("h3", { style: { marginTop: "20px" } }, "Service Rates"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Code"),
                React.createElement("th", { style: styles.th }, "Category"),
                React.createElement("th", { style: styles.th }, "Service Item"),
                React.createElement("th", { style: styles.th }, "Description"),
                React.createElement("th", { style: styles.th }, "Unit"),
                React.createElement("th", { style: styles.th }, "Rate"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              serviceRates.map(r => React.createElement("tr", { key: r.id },
                React.createElement("td", { style: styles.td }, r.code || "-"),
                React.createElement("td", { style: styles.td }, r.category || r.module || "-"),
                React.createElement("td", { style: styles.td }, r.service || r.itemName || "-"),
                React.createElement("td", { style: styles.td }, r.description || "-"),
                React.createElement("td", { style: styles.td }, r.unit || "-"),
                React.createElement("td", { style: styles.td }, "₹", r.rate),
                React.createElement("td", { style: styles.td }, r.status || "Active"),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => updateRate("service", r.id, r.rate), style: styles.buttonInfo }, "Edit")
                )
              ))
            )
          )
        ),

        React.createElement("h3", { style: { marginTop: "20px" } }, "Equipment Rates"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Code"),
                React.createElement("th", { style: styles.th }, "Equipment"),
                React.createElement("th", { style: styles.th }, "Unit"),
                React.createElement("th", { style: styles.th }, "Rate"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              equipmentRates.map(r => React.createElement("tr", { key: r.id },
                React.createElement("td", { style: styles.td }, r.code || "-"),
                React.createElement("td", { style: styles.td }, r.item || r.itemName || "-"),
                React.createElement("td", { style: styles.td }, r.unit || "-"),
                React.createElement("td", { style: styles.td }, "₹", r.rate),
                React.createElement("td", { style: styles.td }, r.status || "Active"),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => updateRate("equipment", r.id, r.rate), style: styles.buttonInfo }, "Edit")
                )
              ))
            )
          )
        )
      )
    ),

    activeTab === "marketplaceApproval" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Marketplace Approval Control"),
      React.createElement("p", null, "Supplier/contractor products will be verified here before marketplace display."),
      React.createElement("p", { style: { color: "#666" } }, "Current pending approvals: ", supplierApprovals.length),
      React.createElement("div", null, "Rule: product names and base rates should come from Admin Master Rates. Supplier can provide stock, location, delivery time, images and discount/premium only.")
    ),

    activeTab === "projectControl" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Project Control & Permission Engine"),
      React.createElement("p", null, "This will control which user can see which project."),
      React.createElement("p", { style: { color: "#666" } }, "Example: Master Villa → Reddy only, Test Villa → Raju only."),
      React.createElement("p", null, "Backend will later enforce these permissions permanently.")
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







