import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { themeTokens, PrimaryButton, SecondaryButton, Card, Badge, LoadingSpinner, EmptyState, BuildMitraHeader } from "../components/ui/DesignSystem";
import MarketRateTrend from "../components/ui/MarketRateTrend";
import { normalizeImageUrl, resolveListingImage } from "../utils/imageUrl";
const API = getApiBase() + "/api";
import { getBuildMitraUser, logoutToLogin } from "../utils/session";

import { getApiBase } from "../utils/apiConfig";
export default function AdminDashboard() {
  React.useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
      const role = String(user.role || sessionStorage.getItem("userRole") || "").toLowerCase();
      if (role !== "admin") {
        alert("Admin access only");
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const loadLocalData = (key: string, fallback: any) => {
    if (typeof window === "undefined") return fallback;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showBOQModal, setShowBOQModal] = useState(false);
  const [editingBOQItem, setEditingBOQItem] = useState<any>({
    masterItemCode: "",
    linkedLabourItemCode: "",
    itemName: "",
    category: "",
    unit: "NOS",
    materialRate: 0,
    labourRate: 0,
    totalUnitRate: 0,
    city: "Bengaluru",
    effectiveDate: new Date().toISOString().split("T")[0],
    remarks: ""
  });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [extensionDays, setExtensionDays] = useState(30);
  const [newPlan, setNewPlan] = useState({ name: "", monthly: 0, yearly: 0, features: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", mobile: "", role: "buyer" });
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [mongoEnquiries, setMongoEnquiries] = useState([]);
  const [enquiryActionBusy, setEnquiryActionBusy] = useState("");

  const [users, setUsers] = useState(() => loadLocalData("users", []));

    const API_BASE = getApiBase();

  useEffect(() => {
    const loadMongoUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/mongo-users`, {
          headers: { "x-user-role": "admin" },
        });

        const data = await res.json();

        if (data.success && Array.isArray(data.users)) {
          const mappedUsers = data.users.map((u, index) => ({
            id: u._id || index + 1,
            name: u.name || "",
            email: u.email || "",
            mobile: u.phone || u.mobile || "",
            role: u.businessRole || u.role || "",
            userCode: u.userCode || u.uniqueCode || "",
            status: !u.isActive
              ? "Blocked"
              : (u.subscriptionStatus === "expired" ? "Expired" : "Active"),
            kyc: u.isVerified ? "Verified" : "Pending",
            subscriptionStatus: u.subscriptionStatus || "inactive",
            paymentStatus: u.paymentStatus || "",
            activationType: u.activationType || "",
            plan: u.subscriptionPlan || "None",
            planType: u.subscriptionBilling || "",
            expiry: u.subscriptionExpiry
              ? new Date(u.subscriptionExpiry).toLocaleDateString()
              : null,
            assignedProjects: u.assignedProjects || [],
            marketplace: u.isMarketplaceVisible ? "Visible" : "Hidden",
          }));

          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error("Mongo users load failed:", err);
      }
    };

    loadMongoUsers();
  }, []);

  const loadMongoEnquiries = async () => {
    try {
      const currentAdmin = getBuildMitraUser() || {};
      const res = await fetch(`${API_BASE}/api/enquiry/admin/all`, {
        headers: {
          "x-user-role": "admin",
          "x-user-code": currentAdmin.userCode || currentAdmin.uniqueCode || "admin",
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to load Admin enquiries");
      }

      setMongoEnquiries((data.enquiries || []).map((e) => ({
        id: e._id,
        enquiryCode: e.enquiryCode || "",
        category: e.enquiryCategory || "general",
        buyer: e.buyerName || "",
        buyerPhone: e.buyerPhone || "",
        provider: e.providerName || "",
        providerRole: e.providerRole || "",
        providerUserCode: e.providerUserCode || "",
        assignedProviderName: e.assignedProviderName || "",
        assignedProviderUserCode: e.assignedProviderUserCode || "",
        itemName: e.itemName || e.itemType || "",
        location: e.location || "",
        status: e.status || "Pending Admin",
        adminApprovalStatus: e.adminApprovalStatus || "pending_admin",
        contactReleased: Boolean(e.contactReleased),
        adminRemarks: e.adminRemarks || "",
        date: e.createdAt ? e.createdAt.split("T")[0] : "",
      })));
    } catch (err) {
      console.error("Admin enquiries load failed:", err);
      alert(err.message || "Unable to load enquiries");
    }
  };

  useEffect(() => {
    loadMongoEnquiries();
  }, []);

  const runAdminEnquiryAction = async (enquiryCode, action) => {
    try {
      setEnquiryActionBusy(`${enquiryCode}:${action}`);
      const currentAdmin = getBuildMitraUser() || {};
      let endpoint = `${API_BASE}/api/enquiry/admin/${encodeURIComponent(enquiryCode)}/${action}`;
      let body = {
        reviewedBy: currentAdmin.userCode || currentAdmin.uniqueCode || "admin",
        assignedBy: currentAdmin.userCode || currentAdmin.uniqueCode || "admin",
      };

      if (action === "assign") {
        const assignedProviderUserCode = window.prompt("Enter registered user code to assign this enquiry:");
        if (!assignedProviderUserCode) return;
        const adminRemarks = window.prompt("Admin remarks (optional):") || "";
        body = { ...body, assignedProviderUserCode: assignedProviderUserCode.trim(), adminRemarks };
      }

      if (action === "hold" || action === "reject") {
        const adminRemarks = window.prompt(
          action === "reject" ? "Reason for rejection:" : "Reason for placing this enquiry on hold:"
        );
        if (adminRemarks === null) return;
        body = { ...body, adminRemarks };
      }

      if (action === "approve-uploader") {
        body.adminRemarks = window.prompt("Approval remarks (optional):") || "";
      }

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
          "x-user-code": currentAdmin.userCode || currentAdmin.uniqueCode || "admin",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Enquiry action failed");

      alert(data.message || "Enquiry updated successfully");
      await loadMongoEnquiries();
    } catch (err) {
      alert(err.message || "Enquiry action failed");
    } finally {
      setEnquiryActionBusy("");
    }
  };
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
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [marketplaceStatus, setMarketplaceStatus] = useState("pending");
  const [realEstateListings, setRealEstateListings] = useState([]);
  const [marketplaceSearch, setMarketplaceSearch] = useState("");
  const [selectedListingCodes, setSelectedListingCodes] = useState({});
  const [newItemRequests, setNewItemRequests] = useState([]);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [projects, setProjects] = useState(() => loadLocalData("bm_admin_projects", []));

  const [masterSupplierItems, setMasterSupplierItems] = useState<any[]>([]);
  const [liveCounts, setLiveCounts] = useState<any>({ totalMasterItems: 2884, masterMaterials: 2880, masterLabour: 2, masterServices: 0, masterMachines: 2, approvedMarketRates: 2995, missingRateItems: 0 });
  const [masterSearch, setMasterSearch] = useState("");
  const [masterCategoryFilter, setMasterCategoryFilter] = useState("all");
  const [loadingMasterItems, setLoadingMasterItems] = useState(false);

  const loadMasterSupplierDatabase = async () => {
    try {
      setLoadingMasterItems(true);
      const [itemsRes, countsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/master-items?limit=10000`, { headers: { "x-user-role": "admin" } }),
        fetch(`${API_BASE}/api/admin/master-counts`, { headers: { "x-user-role": "admin" } })
      ]);

      const itemsData = await itemsRes.json();
      const countsData = await countsRes.json();

      if (itemsData && Array.isArray(itemsData.items) && itemsData.items.length > 0) {
        setMasterSupplierItems(itemsData.items);
      }

      if (countsData && countsData.success && countsData.counts) {
        setLiveCounts(countsData.counts);
      }
    } catch (err) {
      console.warn("Could not load master items or live counts from backend API:", err);
    } finally {
      setLoadingMasterItems(false);
    }
  };

  useEffect(() => {
    loadMasterSupplierDatabase();
  }, []);

  const displayMasterRates = React.useMemo(() => {
    const map = new Map<string, any>();

    (masterSupplierItems || []).forEach((m: any) => {
      const code = String(m.masterItemCode || m.code || m.itemCode || "").toUpperCase();
      if (code) {
        const rateVal = Number(m.referenceRate ?? m.currentRate ?? m.rate ?? m.price ?? 0);
        map.set(code, {
          id: m._id || code,
          code: code,
          masterItemCode: code,
          category: m.category || m.itemType || "Material",
          item: m.itemName || m.title || "Master Item",
          itemName: m.itemName || m.title || "Master Item",
          brand: m.brand || "",
          specification: m.specification || "",
          unit: m.unit || "NOS",
          rate: rateVal,
          currentRate: rateVal,
          referenceRate: rateVal,
          status: m.status === "inactive" ? "Inactive" : "Active",
          primaryMasterItemCode: m.primaryMasterItemCode,
          linkedLabourItemCode: m.linkedLabourItemCode,
          rateComponent: m.rateComponent
        });
      }
    });

    (materialRates || []).forEach((r: any) => {
      const code = String(r.code || r.masterItemCode || "").toUpperCase();
      if (code && !map.has(code)) {
        const rateVal = Number(r.rate ?? r.currentRate ?? r.referenceRate ?? 0);
        map.set(code, {
          id: r.id || code,
          code: code,
          masterItemCode: code,
          category: r.category || "Material",
          item: r.item || r.itemName || "Master Item",
          itemName: r.item || r.itemName || "Master Item",
          brand: r.brand || "",
          specification: r.specification || "",
          unit: r.unit || "NOS",
          rate: rateVal,
          currentRate: rateVal,
          referenceRate: rateVal,
          status: r.status || "Active",
          primaryMasterItemCode: r.primaryMasterItemCode,
          linkedLabourItemCode: r.linkedLabourItemCode,
          rateComponent: r.rateComponent
        });
      }
    });

    const combined = Array.from(map.values());

    return combined.filter((r: any) => {
      const searchMatch = !masterSearch.trim() || [
        r.code, r.masterItemCode, r.item, r.itemName, r.category, r.brand, r.specification
      ].some(field => String(field || "").toLowerCase().includes(masterSearch.trim().toLowerCase()));

      const categoryMatch = masterCategoryFilter === "all" || String(r.category || "").toLowerCase() === masterCategoryFilter.toLowerCase();

      return searchMatch && categoryMatch;
    });
  }, [materialRates, masterSupplierItems, masterSearch, masterCategoryFilter]);

  const loadMarketplaceApprovals = async () => {
    try {
      const params = new URLSearchParams();
      if (marketplaceStatus && marketplaceStatus !== "all") params.set("status", marketplaceStatus);
      if (marketplaceSearch) params.set("search", marketplaceSearch);
      const [listingsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/marketplace-listings?${params.toString()}`, { headers: { "x-user-role": "admin" } }),
        fetch(`${API_BASE}/api/admin/new-item-requests`, { headers: { "x-user-role": "admin" } }),
      ]);
      const listingsData = await listingsRes.json();
      const requestsData = await requestsRes.json();
      setMarketplaceListings(listingsData.listings || []);
      setNewItemRequests(requestsData.requests || []);
    } catch (error) {
      setApprovalMessage("Could not load marketplace approvals.");
    }
  };

  useEffect(() => {
  loadMarketplaceApprovals();
  loadRealEstateApprovals();
}, [marketplaceStatus, marketplaceSearch]);

  const updateListingStatus = async (listingCode, status) => {
    const path = status === "approved" ? "approve" : "reject";
    const res = await fetch(`${API_BASE}/api/admin/marketplace-listings/${listingCode}/${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ approvedBy: "admin", rejectedReason: "Rejected by admin" }),
    });
    const data = await res.json();
    setApprovalMessage(data.success ? `Listing ${status}.` : data.message || "Action failed.");
    loadMarketplaceApprovals();
  };

  const bulkListingStatus = async (status) => {
    const ids = Object.keys(selectedListingCodes).filter((code) => selectedListingCodes[code]);
    if (!ids.length) return alert("Select listings first.");
    const res = await fetch(`${API_BASE}/api/admin/marketplace-listings/bulk/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ ids, status, approvedBy: "admin", rejectedReason: "Rejected by admin" }),
    });
    const data = await res.json();
    setApprovalMessage(data.success ? `${data.modified || 0} listing(s) updated.` : data.message || "Bulk action failed.");
    setSelectedListingCodes({});
    loadMarketplaceApprovals();
  };

  const editListingRate = async (listing) => {
  const rate = Number(prompt("Rate:", listing.rate));

  if (!rate) return;

  await fetch(`${API_BASE}/api/admin/marketplace-listings/${listing.listingCode}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "admin",
    },
    body: JSON.stringify({ rate }),
  });

  loadMarketplaceApprovals();
};  const loadRealEstateApprovals = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/realestate/admin/all`, {
      headers: {
        "x-user-role": "admin",
      },
    });

    const data = await res.json();

    if (data.success && Array.isArray(data.properties)) {
      setRealEstateListings(data.properties);
    } else {
      setRealEstateListings([]);
      console.error(data.message || "Could not load Real Estate approvals.");
    }
  } catch (err) {
    console.error("Real Estate approvals load failed:", err);
    setRealEstateListings([]);
  }
};

const approveRealEstate = async (propertyCode) => {
  try {
    const res = await fetch(
      `${API_BASE}/api/realestate/admin/${propertyCode}/approve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify({
          approvedBy: "admin",
        }),
      }
    );

    const data = await res.json();

    alert(
      data.success
        ? `Property ${propertyCode} approved.`
        : data.message || "Property approval failed."
    );

    if (data.success) {
      loadRealEstateApprovals();
    }
  } catch (err) {
    console.error("Real Estate approval failed:", err);
    alert("Property approval failed.");
  }
};

const rejectRealEstate = async (propertyCode) => {
  const reason =
    prompt("Enter rejection reason:", "Rejected by admin") ||
    "Rejected by admin";

  try {
    const res = await fetch(
      `${API_BASE}/api/realestate/admin/${propertyCode}/reject`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify({
          rejectedReason: reason,
          reason,
        }),
      }
    );

    const data = await res.json();

    alert(
      data.success
        ? `Property ${propertyCode} rejected.`
        : data.message || "Property rejection failed."
    );

    if (data.success) {
      loadRealEstateApprovals();
    }
  } catch (err) {
    console.error("Real Estate rejection failed:", err);
    alert("Property rejection failed.");
  }
};
  const loadDefaultMasterItems = async () => {
    const res = await fetch(`${API_BASE}/api/admin/master-items/default-load`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ adminCode: "admin" }),
    });
    const data = await res.json();
    alert(data.success ? `${data.count} default master items loaded.` : data.message || "Default load failed.");
  };

  const approveNewItemRequest = async (request) => {
    const category = prompt("Category:", request.itemType === "material" ? "Cement" : request.itemType) || "";
    const unit = prompt("Unit:", request.itemType === "labour" ? "Day" : "Unit") || "";
    const res = await fetch(`${API_BASE}/api/admin/new-item-requests/${request.requestCode}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ category, unit, gst: 0, hsnCode: "", status: "active", adminCode: "admin" }),
    });
    const data = await res.json();
    alert(data.success ? `Master item ${data.item.masterItemCode} created.` : data.message || "Request approval failed.");
    loadMarketplaceApprovals();
  };

  
      const openBOQRateModal = async (item: any) => {
    let code = (item.code || item.masterItemCode || item.itemCode || "").toUpperCase();
    
    // Mapped primary code if clicked on linked labour row
    if (item.primaryMasterItemCode && item.primaryMasterItemCode !== code) {
      code = item.primaryMasterItemCode.toUpperCase();
    } else if (item.rateComponent === "labour" || code.startsWith("LAB-")) {
      const candidateCode = code.replace(/^LAB-?/, "");
      const matched = (masterSupplierItems || []).find((m: any) => 
        m.linkedLabourItemCode === code || m.masterItemCode === `MAT-${candidateCode}` || m.masterItemCode === `SRV-${candidateCode}`
      );
      if (matched && matched.masterItemCode) {
        code = matched.masterItemCode.toUpperCase();
      } else if (["WTR-TNK", "PLB-18", "ELEC-15", "FCL-12"].includes(candidateCode)) {
        code = `MAT-${candidateCode}`;
      } else if (candidateCode === "PCC-01") {
        code = `SRV-${candidateCode}`;
      }
    }

    let matRate = Number(item.materialRate ?? item.referenceRate ?? item.rate ?? item.currentRate ?? 0);
    let labRate = Number(item.labourRate ?? 0);
    let linkedLabourCode = item.linkedLabourItemCode || `LAB-${code.replace(/^(MAT|SRV|SER|PLB|ELEC|FCL)-?/, "")}`;
    let unit = item.unit || "NOS";
    let itemName = item.item || item.itemName || "";

    try {
      const res = await fetch(`${API_BASE}/api/rates/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: { masterItemCode: code, itemName } })
      });
      const data = await res.json();
      if (data && data.success && data.resolvedItem) {
        const r = data.resolvedItem;
        code = r.masterItemCode || code;
        matRate = Number(r.materialRate ?? matRate);
        labRate = Number(r.labourRate ?? labRate);
        linkedLabourCode = r.linkedLabourItemCode || linkedLabourCode;
        unit = r.unit || unit;
        itemName = r.itemName || itemName;
      }
    } catch (err) {
      console.warn("Could not fetch resolved BOQ rates for editor modal:", err);
    }

    setEditingBOQItem({
      masterItemCode: code,
      linkedLabourItemCode: linkedLabourCode,
      itemName: itemName,
      category: item.category || "General",
      unit: unit,
      materialRate: matRate,
      labourRate: labRate,
      totalUnitRate: matRate + labRate,
      city: item.city || "Bengaluru",
      effectiveDate: item.effectiveDate || new Date().toISOString().split("T")[0],
      remarks: item.specification || item.remarks || ""
    });
    setShowBOQModal(true);
  };

  const saveBOQCombinedRates = async () => {
    try {
      const code = editingBOQItem.masterItemCode;
      if (!code) return alert("Invalid Master Item Code");

      const res = await fetch(`${API_BASE}/api/admin/boq-rates/${code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({
          masterItemCode: code,
          linkedLabourItemCode: editingBOQItem.linkedLabourItemCode,
          itemName: editingBOQItem.itemName,
          category: editingBOQItem.category,
          unit: editingBOQItem.unit,
          materialRate: Number(editingBOQItem.materialRate || 0),
          labourRate: Number(editingBOQItem.labourRate || 0),
          city: editingBOQItem.city,
          effectiveDate: editingBOQItem.effectiveDate,
          remarks: editingBOQItem.remarks
        })
      });

      const data = await res.json();
      if (data && data.success) {
        await syncApprovedRatesFromBackend();
        setShowBOQModal(false);
        await loadMasterSupplierDatabase();
      } else {
        alert("Save failed: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Save failed: " + err.message);
    }
  };

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

  const updateUserStatus = async (userId, status) => {
  try {
    const endpoint = status === "Blocked" ? "block" : "unblock";
    await fetch(`${API_BASE}/api/admin/mongo-users/${userId}/${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ blockedReason: status === "Blocked" ? "Blocked by admin" : "" })
    });
    setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
  } catch (err) {
    alert("Failed to update user status");
    console.error(err);
  }
};

  const updateSubscription = async (userId, payload, successMessage) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/mongo-users/${userId}/admin-control`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": "admin"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Subscription update failed");
      }

      const updatedUser = data.user || {};

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId
            ? {
                ...u,
                status: updatedUser.isActive === false
                  ? "Blocked"
                  : "Active",
                subscriptionStatus:
                  updatedUser.subscriptionStatus || "inactive",
                paymentStatus:
                  updatedUser.paymentStatus || "",
                activationType:
                  updatedUser.activationType || "",
                plan:
                  updatedUser.subscriptionPlan || u.plan || "None",
                planType:
                  updatedUser.subscriptionBilling || u.planType || "",
                expiry: updatedUser.subscriptionExpiry
                  ? new Date(updatedUser.subscriptionExpiry).toLocaleDateString()
                  : u.expiry
              }
            : u
        )
      );

      alert(successMessage);
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message || "Subscription update failed");
      return false;
    }
  };
  
  const activateFreeBeta = async (user) => {
    const start = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    await updateSubscription(
      user.id,
      {
        isActive: true,
        subscriptionPlan: user.plan !== "None" ? user.plan : "Beta",
        subscriptionBilling: user.planType || "annual",
        subscriptionStatus: "active",
        paymentStatus: "not_required",
        activationType: "beta_free",
        subscriptionStart: start.toISOString(),
        subscriptionExpiry: expiry.toISOString(),
        adminRemarks: "Free beta access activated by admin"
      },
      `Free Beta activated for ${user.name}`
    );
  };

  const requestSubscriptionPayment = async (user) => {
    await updateSubscription(
      user.id,
      {
        isActive: false,
        subscriptionStatus: "pending",
        paymentStatus: "pending",
        activationType: "paid",
        adminRemarks: "Subscription payment requested by admin"
      },
      `Payment requested from ${user.name}`
    );
  };

  const approvePaidSubscription = async (user) => {
    const start = new Date();
    const expiry = new Date();
    const billing = user.planType || "annual";

    if (billing === "monthly") {
      expiry.setMonth(expiry.getMonth() + 1);
    } else {
      expiry.setFullYear(expiry.getFullYear() + 1);
    }

    await updateSubscription(
      user.id,
      {
        isActive: true,
        subscriptionPlan: user.plan !== "None" ? user.plan : "Standard",
        subscriptionBilling: billing,
        subscriptionStatus: "active",
        paymentStatus: "paid",
        activationType: "paid",
        subscriptionStart: start.toISOString(),
        subscriptionExpiry: expiry.toISOString(),
        lastPaymentDate: start.toISOString(),
        adminRemarks: "Paid subscription approved by admin"
      },
      `Paid subscription approved for ${user.name}`
    );
  };

  const deactivateSubscription = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.name}?`
    );

    if (!confirmed) return;

    await updateSubscription(
      user.id,
      {
        isActive: false,
        subscriptionStatus: "inactive",
        adminRemarks: "Subscription deactivated by admin"
      },
      `${user.name} subscription deactivated`
    );
  };
  const extendSubscription = async () => {
    if (!selectedUser) return;

    const days = Number(extensionDays);

    if (!days || days < 1) {
      alert("Enter valid extension days");
      return;
    }

    const today = new Date();

    const existingExpiry = selectedUser.expiry
      ? new Date(selectedUser.expiry)
      : today;

    const validExpiry = isNaN(existingExpiry.getTime())
      ? today
      : existingExpiry;

    const baseDate =
      validExpiry > today ? validExpiry : today;

    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + days);

    const success = await updateSubscription(
      selectedUser.id,
      {
        isActive: true,
        subscriptionStatus: "active",
        subscriptionExpiry: newExpiry.toISOString(),
        adminRemarks: `Subscription extended by ${days} days`
      },
      `Subscription extended by ${days} days for ${selectedUser.name}`
    );

    if (success) {
      setShowExtendModal(false);
      setSelectedUser(null);
      setExtensionDays(30);
    }
  };

  const updatePlan = (userId, planId, planType) => {
    const plan = plans.find(p => p.id === planId);
    const newExpiry = new Date();
    if (planType === "monthly") newExpiry.setMonth(newExpiry.getMonth() + 1);
    else newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    setUsers(users.map(u => u.id === userId ? { ...u, plan: plan.name, planType, expiry: newExpiry.toISOString().split("T")[0], status: "Active" } : u));
    alert(`Plan updated to ${plan.name}`);
  };

  const approveKYC = async (userId) => {
  try {
    await fetch(`${API_BASE}/api/admin/mongo-users/${userId}/admin-control`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ isVerified: true })
    });
    setUsers(users.map(u => u.id === userId ? { ...u, kyc: "Verified" } : u));
  } catch (err) {
    alert("Failed to verify user");
    console.error(err);
  }
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
    alert(`Payment of â‚¹${payment.amount} approved!`);
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
    if (type === "materials") data = [
  { Code: "", Category: "Cement", SubCategory: "OPC", ItemName: "Cement UltraTech OPC 53 Grade", Brand: "UltraTech", Specification: "OPC 53 Grade", Unit: "Bag", Rate: 420, GST: 28, Status: "Active" },
  { Code: "", Category: "Cement", SubCategory: "OPC", ItemName: "Cement Birla Super OPC 53 Grade", Brand: "Birla", Specification: "OPC 53 Grade", Unit: "Bag", Rate: 415, GST: 28, Status: "Active" },
  { Code: "", Category: "Steel", SubCategory: "TMT", ItemName: "TMT Steel Tata Fe500", Brand: "Tata", Specification: "Fe500", Unit: "Kg", Rate: 62, GST: 18, Status: "Active" }
];
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
      let backendRows = [];

      if (type === "materials") {
        const mapped = rows.map((r, i) => {
          let code = pick(r, ["Code", "code", "Material Code", "MaterialCode", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Item", "item", "Description", "Material", "Service"]);
          const category = pick(r, ["Category", "category", "Module", "module"]) || "General";
          const subCategory = pick(r, ["SubCategory", "Sub Category", "subCategory"]);
          const brand = pick(r, ["Brand", "brand", "Make", "make", "Company", "company", "Manufacturer", "manufacturer"]);
          const specification = pick(r, ["Specification", "Spec", "specification", "Specs", "Description", "description", "Grade", "grade"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom", "Units", "units"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "Basic Rate", "BasicRate", "Unit Rate", "UnitRate", "Material Rate", "MaterialRate", "Price", "price", "Amount", "amount", "Unit Price", "UnitPrice"]));
          const status = pick(r, ["Status", "status"]) || "Active";
          if (!code) {
            const clean = (v) => String(v || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
            const itemPart = clean(itemName || category).slice(0, 3).padEnd(3, "X");
            const brandPart = clean(brand || itemName).slice(0, 1).padEnd(1, "X");
            code = itemPart + brandPart + String(Date.now() + i).slice(-6);
          }

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
            hsnCode: pick(r, ["HSN", "HSN Code", "hsn", "hsnCode"]),
            imageUrl: pick(r, ["Image URL", "ImageUrl", "imageUrl", "Image"]),
            status
          };
        }).filter(r => r.item && r.unit && r.rate >= 0);

        imported = mapped.length;
        backendRows = mapped.map(r => ({
          masterItemCode: r.code,
          itemType: "material",
          category: r.category,
          subCategory: r.subCategory,
          itemName: r.itemName,
          brand: r.brand,
          specification: r.specification,
          unit: r.unit,
          gst: r.gst,
          hsnCode: r.hsnCode,
          imageUrl: r.imageUrl,
          referenceRate: r.rate,
          status: String(r.status || "active").toLowerCase() === "inactive" ? "inactive" : "active",
        }));
        setMaterialRates(prev => mergeByCode(prev, mapped));
      }

      if (type === "labour") {
        const mapped = rows.map((r, i) => {
          let code = pick(r, ["Code", "code", "Material Code", "MaterialCode", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Item", "Trade", "trade", "Description", "Service"]);
          const category = pick(r, ["Category", "category", "Module", "module"]) || "General";
          const description = pick(r, ["Description", "description", "Work Description"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "Labour Rate", "LabourRate", "UnitRate", "Unit Rate"]));
          const status = pick(r, ["Status", "status"]) || "Active";
          if (!code) {
            const clean = (v) => String(v || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
            const itemPart = clean(itemName || category).slice(0, 3).padEnd(3, "X");
            const brandPart = clean(itemName).slice(0, 1).padEnd(1, "X");
            code = itemPart + brandPart + String(Date.now() + i).slice(-6);
          }

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
        }).filter(r => r.trade && r.unit && r.rate >= 0);

        imported = mapped.length;
        backendRows = mapped.map(r => ({
          masterItemCode: r.code,
          itemType: "labour",
          category: r.category,
          itemName: r.itemName,
          specification: r.description,
          unit: r.unit,
          referenceRate: r.rate,
          status: String(r.status || "active").toLowerCase() === "inactive" ? "inactive" : "active",
        }));
        setLabourRates(prev => mergeByCode(prev, mapped));
      }

      if (type === "services") {
        const mapped = rows.map((r, i) => {
          let code = pick(r, ["Code", "code", "Material Code", "MaterialCode", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Service", "service", "Item", "Description", "Material"]);
          const module = pick(r, ["Module", "module", "Category", "category"]) || "BOQ";
          const category = pick(r, ["Category", "category"]) || module;
          const description = pick(r, ["Description", "description"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "Labour Rate", "LabourRate", "Service Rate", "ServiceRate", "UnitRate", "Unit Rate"]));
          const status = pick(r, ["Status", "status"]) || "Active";
          if (!code) {
            const clean = (v) => String(v || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
            const itemPart = clean(itemName || category).slice(0, 3).padEnd(3, "X");
            const brandPart = clean(itemName).slice(0, 1).padEnd(1, "X");
            code = itemPart + brandPart + String(Date.now() + i).slice(-6);
          }

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
        }).filter(r => r.service && r.unit && r.rate >= 0);

        imported = mapped.length;
        backendRows = mapped.map(r => ({
          masterItemCode: r.code,
          itemType: "service",
          category: r.category,
          itemName: r.itemName,
          specification: r.description,
          unit: r.unit,
          referenceRate: r.rate,
          status: String(r.status || "active").toLowerCase() === "inactive" ? "inactive" : "active",
        }));
        setServiceRates(prev => mergeByCode(prev, mapped));
      }

      if (type === "equipment") {
        const mapped = rows.map((r, i) => {
          let code = pick(r, ["Code", "code", "Material Code", "MaterialCode", "Item Code", "ItemCode"]);
          const itemName = pick(r, ["Item Name", "ItemName", "Equipment", "Item", "Description"]);
          const unit = pick(r, ["Unit", "unit", "UOM", "uom"]);
          const rate = toNumber(pick(r, ["Rate", "rate", "UnitRate", "Unit Rate"]));
          const status = pick(r, ["Status", "status"]) || "Active";
          if (!code) {
            const clean = (v) => String(v || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
            const itemPart = clean(itemName || "Machine").slice(0, 3).padEnd(3, "X");
            const brandPart = clean(itemName).slice(0, 1).padEnd(1, "X");
            code = itemPart + brandPart + String(Date.now() + i).slice(-6);
          }

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
        backendRows = mapped.map(r => ({
          masterItemCode: r.code,
          itemType: "machine",
          category: "Machinery",
          itemName: r.itemName,
          unit: r.unit,
          referenceRate: r.rate,
          status: String(r.status || "active").toLowerCase() === "inactive" ? "inactive" : "active",
        }));
        setEquipmentRates(prev => mergeByCode(prev, mapped));
      }

      console.log("Bulk Upload Type:", type, "Rows:", rows, "Imported:", imported);
      if (backendRows.length) {
        fetch(`${API_BASE}/api/admin/master-items/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-role": "admin" },
          body: JSON.stringify({ adminCode: "admin", items: backendRows }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && (data.inserted > 0 || data.updated > 0)) {
              alert(`Bulk Upload Successful!\n• Total rows: ${data.totalRows || imported}\n• Inserted: ${data.inserted || 0}\n• Updated: ${data.updated || 0}\n• Skipped: ${data.skipped || 0}\n• Failed: ${data.failed || 0}`);
              loadMasterSupplierDatabase();
            } else {
              alert(`Upload Failed! \n${data.message || "No records were inserted or updated in the canonical Master database."}`);
            }
          })
          .catch(() => alert("Local upload completed, but backend master sync failed."));
      } else {
        alert("Bulk upload completed for " + type + ". Imported " + imported + " rows out of " + rows.length + " rows.");
      }
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

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(u.name || "").toLowerCase().includes(q) ||
      String(u.email || "").toLowerCase().includes(q) ||
      String(u.mobile || "").toLowerCase().includes(q) ||
      String(u.userCode || "").toLowerCase().includes(q);

    const matchesRole =
      roleFilter === "all" ||
      String(u.role || "").toLowerCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeSubscriptions = users.filter(u => u.plan !== "None" && u.status === "Active").length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const blockedUsers = users.filter(u => u.status === "Blocked").length;
  const verifiedUsers = users.filter(u => u.kyc === "Verified").length;
  const marketplaceVisibleUsers = users.filter(u => u.marketplace === "Visible").length;
  const totalEnquiries = mongoEnquiries.length;
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
  { id: "enquiries", name: "Enquiries" },

  { id: "masterRates", name: "Master Rates" },
  { id: "marketplaceApproval", name: "Marketplace Approval" },
  { id: "realEstateApproval", name: "Real Estate Approval" },
  { id: "projectControl", name: "Project Control" },

  { id: "reports", name: "Reports" }
];

  return React.createElement("div", { style: styles.container },
    React.createElement(BuildMitraHeader, {
      moduleTitle: "Admin Module",
      pageTitle: "Admin Dashboard",
      subtitle: "Manage Platform, Users, Subscriptions, Market Rates & Payments",
      showBackToDashboard: false
    }),
    React.createElement("div", { style: { display: "flex", gap: "10px", marginBottom: "20px" } },
      React.createElement("button", { onClick: () => navigateTo("/marketplace"), style: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Marketplace"),
      React.createElement("button", { onClick: handleLogout, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Logout")
    ),

    React.createElement("div", { style: styles.grid4 },
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, totalUsers), React.createElement("div", { style: styles.statLabel }, "Total Users")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, activeSubscriptions), React.createElement("div", { style: styles.statLabel }, "Active Subs")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "â‚¹", (totalRevenue/1000).toFixed(0), "K"), React.createElement("div", { style: styles.statLabel }, "Revenue")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, pendingKYC), React.createElement("div", { style: styles.statLabel }, "Pending KYC")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, activeUsers), React.createElement("div", { style: styles.statLabel }, "Active Users")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, blockedUsers), React.createElement("div", { style: styles.statLabel }, "Blocked Users")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, verifiedUsers), React.createElement("div", { style: styles.statLabel }, "Verified Users")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, marketplaceVisibleUsers), React.createElement("div", { style: styles.statLabel }, "Marketplace Visible")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, totalEnquiries), React.createElement("div", { style: styles.statLabel }, "Enquiries")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, totalMasterRates), React.createElement("div", { style: styles.statLabel }, "Master Rates"))
    ),

    React.createElement(MarketRateTrend, null),

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

    activeTab === "enquiries" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" } },
        React.createElement("div", { style: styles.cardTitle }, "Admin Enquiry Control Centre"),
        React.createElement("button", { onClick: loadMongoEnquiries, style: styles.buttonInfo }, "Refresh")
      ),
      React.createElement("p", { style: { color: "#666", marginTop: "4px" } },
        "Every marketplace, real-estate and general enquiry stays with Admin until approved or assigned. Buyer contact is released only after Admin action."
      ),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Code / Date"),
              React.createElement("th", { style: styles.th }, "Buyer"),
              React.createElement("th", { style: styles.th }, "Requirement"),
              React.createElement("th", { style: styles.th }, "Original Uploader"),
              React.createElement("th", { style: styles.th }, "Assigned To"),
              React.createElement("th", { style: styles.th }, "Admin Status"),
              React.createElement("th", { style: styles.th }, "Contact"),
              React.createElement("th", { style: styles.th }, "Admin Action")
            )
          ),
          React.createElement("tbody", null,
            mongoEnquiries.length === 0 ? React.createElement("tr", null,
              React.createElement("td", { colSpan: 8, style: { ...styles.td, textAlign: "center" } }, "No enquiries found in the Admin queue.")
            ) : mongoEnquiries.map((e) => {
              const locked = ["approved", "assigned", "rejected"].includes(e.adminApprovalStatus);
              const busy = enquiryActionBusy.startsWith(`${e.enquiryCode}:`);
              return React.createElement("tr", { key: e.id },
                React.createElement("td", { style: styles.td },
                  React.createElement("strong", null, e.enquiryCode),
                  React.createElement("br", null),
                  React.createElement("span", { style: { fontSize: "10px", color: "#666" } }, e.date)
                ),
                React.createElement("td", { style: styles.td },
                  e.buyer,
                  React.createElement("br", null),
                  React.createElement("span", { style: { fontSize: "10px" } }, e.buyerPhone || "Not provided")
                ),
                React.createElement("td", { style: styles.td },
                  React.createElement("strong", null, e.itemName),
                  React.createElement("br", null),
                  React.createElement("span", { style: { fontSize: "10px" } }, `${e.category} â€¢ ${e.location || "Location not supplied"}`)
                ),
                React.createElement("td", { style: styles.td },
                  e.provider || "Not specified",
                  React.createElement("br", null),
                  React.createElement("span", { style: { fontSize: "10px" } }, `${e.providerUserCode || "-"} • ${e.providerRole || "-"}`)
                ),
                React.createElement("td", { style: styles.td },
                  e.assignedProviderName || "Not assigned",
                  React.createElement("br", null),
                  React.createElement("span", { style: { fontSize: "10px" } }, e.assignedProviderUserCode || "-")
                ),
                React.createElement("td", { style: styles.td },
                  React.createElement("strong", null, e.status),
                  React.createElement("br", null),
                  React.createElement("span", { style: { fontSize: "10px" } }, e.adminApprovalStatus),
                  e.adminRemarks && React.createElement("div", { style: { fontSize: "10px", color: "#666", marginTop: "4px" } }, e.adminRemarks)
                ),
                React.createElement("td", { style: styles.td }, e.contactReleased ? "Released" : "Admin only"),
                React.createElement("td", { style: { ...styles.td, minWidth: "310px" } },
                  React.createElement("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" } },
                    React.createElement("button", {
                      disabled: busy || locked,
                      onClick: () => runAdminEnquiryAction(e.enquiryCode, "approve-uploader"),
                      style: { ...styles.buttonSuccess, opacity: busy || locked ? 0.5 : 1 }
                    }, "Approve Uploader"),
                    React.createElement("button", {
                      disabled: busy || e.adminApprovalStatus === "rejected",
                      onClick: () => runAdminEnquiryAction(e.enquiryCode, "assign"),
                      style: { ...styles.buttonInfo, opacity: busy || e.adminApprovalStatus === "rejected" ? 0.5 : 1 }
                    }, "Assign User"),
                    React.createElement("button", {
                      disabled: busy || locked,
                      onClick: () => runAdminEnquiryAction(e.enquiryCode, "hold"),
                      style: { ...styles.button, opacity: busy || locked ? 0.5 : 1 }
                    }, "Hold"),
                    React.createElement("button", {
                      disabled: busy || locked,
                      onClick: () => runAdminEnquiryAction(e.enquiryCode, "reject"),
                      style: { ...styles.buttonDanger, opacity: busy || locked ? 0.5 : 1 }
                    }, "Reject")
                  )
                )
              );
            })
          )
        )
      )
    ),

    activeTab === "users" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "User Management"),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" } },
        React.createElement("button", { onClick: () => setShowUserModal(true), style: styles.button }, "+ Add User"),
        React.createElement("button", { onClick: () => exportReport("users"), style: { ...styles.buttonInfo } }, " Export Users"),
        React.createElement("div", { style: { display: "flex", gap: "10px", marginTop: "12px", marginBottom: "12px", flexWrap: "wrap" } },
          React.createElement("input", {
            placeholder: "Search name, phone, email, user code",
            value: userSearch,
            onChange: (e) => setUserSearch(e.target.value),
            style: { padding: "10px", border: "1px solid #ddd", borderRadius: "6px", minWidth: "280px" }
          }),
          React.createElement("select", {
            value: roleFilter,
            onChange: (e) => setRoleFilter(e.target.value),
            style: { padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }
          },
            React.createElement("option", { value: "all" }, "All Roles"),
            React.createElement("option", { value: "admin" }, "Admin"),
            React.createElement("option", { value: "buyer" }, "Buyer"),
            React.createElement("option", { value: "contractor" }, "Contractor"),
            React.createElement("option", { value: "supplier" }, "Supplier"),
            React.createElement("option", { value: "labour" }, "Labour"),
            React.createElement("option", { value: "machinery" }, "Machinery"),
            React.createElement("option", { value: "realestate" }, "Real Estate")
          ),
          React.createElement("span", { style: { padding: "10px", fontWeight: "bold" } }, "Showing: ", filteredUsers.length, " / ", users.length)
        )
      ),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Name"), React.createElement("th", { style: styles.th }, "User Code"), React.createElement("th", { style: styles.th }, "Phone"), React.createElement("th", { style: styles.th }, "Role"),
              React.createElement("th", { style: styles.th }, "Plan"), React.createElement("th", { style: styles.th }, "Expiry"),
              React.createElement("th", { style: styles.th }, "KYC"), React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Marketplace"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            filteredUsers.map(u => React.createElement("tr", { key: u.id },
              React.createElement("td", { style: styles.td }, u.name || "-"),
              React.createElement("td", { style: styles.td }, u.userCode || "-"),
              React.createElement("td", { style: styles.td }, u.mobile || "-"),
              React.createElement("td", { style: styles.td }, u.role || "-"),
              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: { fontWeight: "600" } }, u.plan || "None"),
                u.planType && React.createElement("div", { style: { fontSize: "12px", color: "#666", textTransform: "capitalize" } }, u.planType)
              ),
              React.createElement("td", { style: styles.td }, u.expiry || "-"),
              React.createElement("td", { style: styles.td },
                React.createElement("span", { style: { backgroundColor: u.kyc === "Verified" ? "#d4edda" : "#f8d7da", padding: "4px 8px", borderRadius: "4px", whiteSpace: "nowrap" } }, u.kyc)
              ),
              React.createElement("td", { style: styles.td },
                React.createElement("span", { style: { backgroundColor: u.status === "Active" ? "#d4edda" : u.status === "Expired" ? "#fff3cd" : "#f8d7da", padding: "4px 8px", borderRadius: "4px", whiteSpace: "nowrap" } }, u.status)
              ),
              React.createElement("td", { style: styles.td }, u.marketplace || "Hidden"),
              React.createElement("td", { style: { ...styles.td, minWidth: "280px" } },
                String(u.role || "").toLowerCase() === "admin"
                  ? React.createElement("span", { style: { fontWeight: "600", color: "#666" } }, "Admin Account")
                  : React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" } },
                      u.kyc === "Pending" && React.createElement("button", { onClick: () => approveKYC(u.id), style: styles.buttonSuccess }, "Approve KYC"),
                      React.createElement("button", { onClick: () => activateFreeBeta(u), style: styles.buttonSuccess }, "Free Beta"),
                      React.createElement("button", { onClick: () => requestSubscriptionPayment(u), style: styles.button }, "Request Payment"),
                      React.createElement("button", { onClick: () => approvePaidSubscription(u), style: styles.buttonSuccess }, "Approve Paid"),
                      React.createElement("button", { onClick: () => { setSelectedUser(u); setShowExtendModal(true); }, style: styles.buttonInfo }, "Extend"),
                      React.createElement("button", { onClick: () => deactivateSubscription(u), style: { ...styles.button, backgroundColor: "#dc3545" } }, "Deactivate")
                    )
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
      React.createElement("div", { style: styles.cardTitle }, "CRM - Live User Directory"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "User Code"),
              React.createElement("th", { style: styles.th }, "Name"),
              React.createElement("th", { style: styles.th }, "Phone"),
              React.createElement("th", { style: styles.th }, "Role"),
              React.createElement("th", { style: styles.th }, "Status"),
              React.createElement("th", { style: styles.th }, "KYC"),
              React.createElement("th", { style: styles.th }, "Marketplace"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            users.map(u => React.createElement("tr", { key: "crm-"+u.id },
              React.createElement("td", { style: styles.td }, u.userCode || "-"),
              React.createElement("td", { style: styles.td }, u.name || "-"),
              React.createElement("td", { style: styles.td }, u.mobile || "-"),
              React.createElement("td", { style: styles.td }, u.role || "-"),
              React.createElement("td", { style: styles.td }, u.status || "-"),
              React.createElement("td", { style: styles.td }, u.kyc || "-"),
              React.createElement("td", { style: styles.td }, u.marketplace || "-"),
              React.createElement("td", { style: styles.td },
                React.createElement("button", { onClick: () => window.open("tel:" + (u.mobile || "")), style: styles.buttonInfo }, "Call"),
                React.createElement("button", { onClick: () => window.open("https://wa.me/91" + String(u.mobile || "").replace(/\D/g, "")), style: { ...styles.buttonSuccess, marginLeft: "6px" } }, "WhatsApp")
              )
            ))
          )
        )
      )
    ),

    activeTab === "masterRates" && React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" } },
          React.createElement("div", { style: styles.cardTitle }, "Master Items & Rates Management"),
          React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
            React.createElement("button", { onClick: () => window.location.href = "/admin-master-image-library", style: styles.buttonSuccess }, "🖼️ Master Image Library"),
            React.createElement("button", { onClick: () => exportReport("materials"), style: styles.buttonInfo }, "📊 Export Rates")
          )
        ),
        React.createElement("p", { style: { color: "#666", fontSize: "13px", marginTop: "4px" } },
          "Central Master Item Library — Single source of truth for Engineering Calculators, BOQ Costing, Labour Rates, and BuildMitra Reference Rates."
        ),

        React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", margin: "14px 0" } },
          React.createElement("button", {
            onClick: async () => {
              const code = prompt("Enter Master Item Code (or search term):");
              if (!code) return;
              const rate = Number(prompt("Enter Admin Master Rate (₹):", "0"));
              if (!rate || rate <= 0) return alert("Valid rate required");
              const city = prompt("City / Region:", "Bengaluru") || "Bengaluru";
              const unit = prompt("Unit (e.g. BAG, KG, CFT, SQFT, NOS):", "NOS") || "NOS";

              try {
                const res = await fetch(`${API_BASE}/api/rates/add`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "x-user-role": "admin" },
                  body: JSON.stringify({ masterItemCode: code, itemCode: code, currentRate: rate, city, unit })
                });
                const data = await res.json();
                if (data.success) {
                  alert(`Admin Master Rate saved for ${code} (₹${rate}/${unit} - ${city}).`);
                  window.location.reload();
                } else {
                  alert(data.message || "Failed to add rate");
                }
              } catch (err: any) {
                alert(err.message || "Error adding rate");
              }
            },
            style: styles.button
          }, "➕ Add Master Rate"),

          React.createElement("label", { style: { ...styles.buttonInfo, cursor: "pointer", display: "inline-block" } },
            "📁 Bulk Upload Rates",
            React.createElement("input", {
              type: "file",
              accept: ".xlsx,.xls,.csv",
              style: { display: "none" },
              onChange: (e) => bulkUploadRates(e, "materials")
            })
          ),

          React.createElement("button", {
            onClick: () => {
              const template = [
                {
                  "Master Item Code": "MAT-CEM-01",
                  "Master Item Name": "Cement OPC 53 Grade",
                  "Category": "Cement",
                  "Subcategory": "Structural",
                  "Specification": "OPC 53 Grade IS 12269",
                  "Rate": 410,
                  "Unit": "BAG",
                  "City": "Bengaluru",
                  "State": "Karnataka",
                  "Region": "South",
                  "Effective Date": new Date().toISOString().split("T")[0],
                  "GST": 28,
                  "Source": "BuildMitra Approved",
                  "Active Status": "Active",
                  "Approval Status": "Approved",
                  "Remarks": "Standard reference rate"
                },
                {
                  "Master Item Code": "MAT-STL-01",
                  "Master Item Name": "TMT Steel Fe500D",
                  "Category": "Steel",
                  "Subcategory": "Structural",
                  "Specification": "Fe500D TMT Rebar IS 1786",
                  "Rate": 67,
                  "Unit": "KG",
                  "City": "Bengaluru",
                  "State": "Karnataka",
                  "Region": "South",
                  "Effective Date": new Date().toISOString().split("T")[0],
                  "GST": 18,
                  "Source": "BuildMitra Approved",
                  "Active Status": "Active",
                  "Approval Status": "Approved",
                  "Remarks": "Standard reference rate"
                }
              ];
              const ws = XLSX.utils.json_to_sheet(template);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "AdminRatesTemplate");
              XLSX.writeFile(wb, "BuildMitra_Admin_Master_Rates_Template.xlsx");
            },
            style: styles.buttonSuccess
          }, "📥 Download 16-Column Template"),

          React.createElement("button", { onClick: cleanLegacyRates, style: styles.buttonDanger }, "🧹 Clean Legacy No-Code Rates"),
          React.createElement("button", { onClick: loadMasterSupplierDatabase, style: styles.buttonInfo }, loadingMasterItems ? "⏳ Loading Supplier DB..." : "🔄 Sync Master Items")
        ),

        React.createElement("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", margin: "16px 0 12px 0" } },
          React.createElement("input", {
            placeholder: "🔍 Search master items by code, name, category, brand, spec",
            value: masterSearch,
            onChange: (e) => setMasterSearch(e.target.value),
            style: { padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", width: "340px", maxWidth: "100%", fontSize: "13px" }
          }),
          React.createElement("select", {
            value: masterCategoryFilter,
            onChange: (e) => setMasterCategoryFilter(e.target.value),
            style: { padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }
          },
            React.createElement("option", { value: "all" }, "All Categories"),
            React.createElement("option", { value: "Sanitaryware & CP Fittings" }, "Sanitaryware & CP Fittings"),
            React.createElement("option", { value: "Hardware, Locks & Fasteners" }, "Hardware, Locks & Fasteners"),
            React.createElement("option", { value: "Plywood & Laminates" }, "Plywood & Laminates"),
            React.createElement("option", { value: "Cement, RMC & Aggregates" }, "Cement, RMC & Aggregates"),
            React.createElement("option", { value: "Cement" }, "Cement"),
            React.createElement("option", { value: "TMT Steel & Structural Steel" }, "TMT Steel & Structural Steel"),
            React.createElement("option", { value: "Steel" }, "Steel"),
            React.createElement("option", { value: "Electrical Wires & Switches" }, "Electrical Wires & Switches"),
            React.createElement("option", { value: "Plumbing Pipes & Fittings" }, "Plumbing Pipes & Fittings"),
            React.createElement("option", { value: "Paints & Waterproofing" }, "Paints & Waterproofing"),
            React.createElement("option", { value: "Tiles, Granite & Marble" }, "Tiles, Granite & Marble"),
            React.createElement("option", { value: "Doors, Frames & Windows" }, "Doors, Frames & Windows"),
            React.createElement("option", { value: "Glass & Architectural Items" }, "Glass & Architectural Items"),
            React.createElement("option", { value: "Machinery & Tools" }, "Machinery & Tools")
          ),
          React.createElement("span", { style: { fontSize: "13px", fontWeight: "bold", color: "#0f766e" } },
            `Showing: ${displayMasterRates.length} Master Items`
          )
        ),

        React.createElement("h3", { style: { marginTop: "12px" } }, "Active Supplier Database & Master Rates Library"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Master Code"),
                React.createElement("th", { style: styles.th }, "Category"),
                React.createElement("th", { style: styles.th }, "Item Name"),
                React.createElement("th", { style: styles.th }, "Brand / Spec"),
                React.createElement("th", { style: styles.th }, "Unit"),
                React.createElement("th", { style: styles.th }, "Admin Rate"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Actions")
              )
            ),
            React.createElement("tbody", null,
              displayMasterRates.length === 0 ? React.createElement("tr", null,
                React.createElement("td", { colSpan: 8, style: { ...styles.td, textAlign: "center", color: "#666" } }, "No master items match your search filter.")
              ) : displayMasterRates.slice(0, 200).map((r: any, idx: number) => React.createElement("tr", { key: r.id || r.code || idx },
                React.createElement("td", { style: styles.td }, React.createElement("strong", null, r.code || r.masterItemCode || "-")),
                React.createElement("td", { style: styles.td }, r.category || "-"),
                React.createElement("td", { style: styles.td }, r.item || r.itemName || "-"),
                React.createElement("td", { style: styles.td }, `${r.brand || ''} ${r.specification || ''}`.trim() || "-"),
                React.createElement("td", { style: styles.td }, r.unit || "-"),
                React.createElement("td", { style: { ...styles.td, fontWeight: "bold", color: "#0f766e" } }, "₹", (r.rate || r.currentRate || r.referenceRate || 0).toLocaleString()),
                React.createElement("td", { style: styles.td },
                  React.createElement("span", { style: { backgroundColor: r.status === "Inactive" ? "#f8d7da" : "#d4edda", padding: "3px 8px", borderRadius: "4px" } }, r.status || "Active")
                ),
                React.createElement("td", { style: { ...styles.td, display: "flex", gap: "4px" } },
                  React.createElement("button", { onClick: () => openBOQRateModal(r), title: "Edit BOQ Rates", style: { backgroundColor: "#0f766e", border: "none", color: "#ffffff", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" } }, "✏️"),
                  React.createElement("button", {
                    onClick: async () => {
                      if (!confirm(`Deactivate rate for ${r.code || r.item}?`)) return;
                      setMaterialRates(materialRates.map((x: any) => x.id === r.id ? { ...x, status: "Inactive" } : x));
                    },
                    style: styles.buttonDanger
                  }, "Deactivate")
                )
              ))
            )
          )
        )
      )
    ),

    activeTab === "marketplaceApproval" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Marketplace Approval"),
      React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" } },
        ["pending", "approved", "rejected", "all"].map(status =>
          React.createElement("button", { key: status, onClick: () => setMarketplaceStatus(status), style: marketplaceStatus === status ? styles.buttonSuccess : styles.buttonInfo }, status.toUpperCase())
        ),
        React.createElement("input", { placeholder: "Search provider, item, category, city", value: marketplaceSearch, onChange: (e) => setMarketplaceSearch(e.target.value), style: { ...styles.input, width: "280px", marginBottom: 0 } }),
        React.createElement("button", { onClick: () => bulkListingStatus("approved"), style: styles.buttonSuccess }, "Bulk Approve"),
        React.createElement("button", { onClick: () => bulkListingStatus("rejected"), style: styles.buttonDanger }, "Bulk Reject"),
        React.createElement("button", { onClick: loadDefaultMasterItems, style: styles.buttonWarning }, "Load Default Master Items")
      ),
      approvalMessage && React.createElement("p", { style: { color: "#2d6a4f" } }, approvalMessage),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Select"),
              React.createElement("th", { style: styles.th }, "Photo"),
              React.createElement("th", { style: styles.th }, "Listing"),
              React.createElement("th", { style: styles.th }, "Provider"),
              React.createElement("th", { style: styles.th }, "Master Item"),
              React.createElement("th", { style: styles.th }, "Category"),
              React.createElement("th", { style: styles.th }, "City"),
              React.createElement("th", { style: styles.th }, "Rate"),
              React.createElement("th", { style: styles.th }, "Status"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            marketplaceListings.map(listing =>
              React.createElement("tr", { key: listing._id || listing.listingCode },
                React.createElement("td", { style: styles.td }, React.createElement("input", { type: "checkbox", checked: Boolean(selectedListingCodes[listing.listingCode]), onChange: (e) => setSelectedListingCodes({ ...selectedListingCodes, [listing.listingCode]: e.target.checked }) })),
                React.createElement("td", { style: styles.td },
                  resolveListingImage(listing)
                    ? React.createElement("img", {
                        src: resolveListingImage(listing) || "",
                        alt: listing.itemName,
                        style: { width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover", border: "1px solid #ddd", cursor: "pointer" },
                        onClick: () => window.open(resolveListingImage(listing) || "", "_blank"),
                        onError: (e: any) => { e.currentTarget.style.display = "none"; }
                      })
                    : React.createElement("span", { style: { fontSize: "11px", color: "#888" } }, "No product image")
                ),
                React.createElement("td", { style: styles.td }, listing.listingCode),
                React.createElement("td", { style: styles.td }, React.createElement("strong", null, listing.providerName), React.createElement("br"), listing.providerUserCode),
                React.createElement("td", { style: styles.td }, React.createElement("strong", null, listing.itemName), React.createElement("br"), listing.masterItemCode),
                React.createElement("td", { style: styles.td }, listing.category || "-"),
                React.createElement("td", { style: styles.td }, listing.providerCity || listing.location || "-"),
                React.createElement("td", { style: styles.td }, "Rs ", Number(listing.rate || 0).toLocaleString(), " / ", listing.unit || "unit"),
                React.createElement("td", { style: styles.td }, listing.status),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => updateListingStatus(listing.listingCode, "approved"), style: { ...styles.buttonSuccess, marginRight: "4px", marginBottom: "4px" } }, "Approve"),
                  React.createElement("button", { onClick: () => updateListingStatus(listing.listingCode, "rejected"), style: { ...styles.buttonDanger, marginRight: "4px", marginBottom: "4px" } }, "Reject"),
                  React.createElement("button", { onClick: () => editListingRate(listing), style: styles.buttonInfo }, "Edit Rate")
                )
              )
            )
          )
        )
      ),
      React.createElement("div", { style: { marginTop: "18px" } },
        React.createElement("div", { style: styles.cardTitle }, "New Item Requests"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Request"),
                React.createElement("th", { style: styles.th }, "Provider"),
                React.createElement("th", { style: styles.th }, "Proposed Item"),
                React.createElement("th", { style: styles.th }, "Type"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              newItemRequests.map(req =>
                React.createElement("tr", { key: req.requestCode },
                  React.createElement("td", { style: styles.td }, req.requestCode),
                  React.createElement("td", { style: styles.td }, req.providerName, React.createElement("br"), req.providerUserCode),
                  React.createElement("td", { style: styles.td }, React.createElement("strong", null, req.proposedItemName), React.createElement("br"), req.brand || "-", " ", req.specification || ""),
                  React.createElement("td", { style: styles.td }, req.itemType),
                  React.createElement("td", { style: styles.td }, req.status),
                  React.createElement("td", { style: styles.td },
                    req.status === "pending" && React.createElement("button", { onClick: () => approveNewItemRequest(req), style: { ...styles.buttonSuccess, marginRight: "4px" } }, "Create Master"),
                    req.status === "pending" && React.createElement("button", { onClick: async () => { await fetch(`${API_BASE}/api/admin/new-item-requests/${req.requestCode}/reject`, { method: "PUT", headers: { "Content-Type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ reason: "Rejected by admin" }) }); loadMarketplaceApprovals(); }, style: styles.buttonDanger }, "Reject")
                  )
                )
              )
            )
          )
        )
      )
    ),
    activeTab === "realEstateApproval" &&
  React.createElement(
    "div",
    { style: styles.card },

    React.createElement(
      "div",
      { style: styles.cardTitle },
      "Real Estate Property Approval"
    ),

    React.createElement(
      "p",
      { style: { color: "#666", marginBottom: "12px" } },
      "Approve or reject properties uploaded by Real Estate providers."
    ),

    React.createElement(
      "button",
      {
        onClick: loadRealEstateApprovals,
        style: { ...styles.buttonInfo, marginBottom: "12px" },
      },
      "Refresh Properties"
    ),

    React.createElement(
      "div",
      { style: { overflowX: "auto" } },

      React.createElement(
        "table",
        { style: styles.table },

        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", { style: styles.th }, "Property Code"),
            React.createElement("th", { style: styles.th }, "Title"),
            React.createElement("th", { style: styles.th }, "Property Type"),
            React.createElement("th", { style: styles.th }, "Location"),
            React.createElement("th", { style: styles.th }, "Price"),
            React.createElement("th", { style: styles.th }, "Provider"),
            React.createElement("th", { style: styles.th }, "Status"),
            React.createElement("th", { style: styles.th }, "Action")
          )
        ),

        React.createElement(
          "tbody",
          null,

          realEstateListings.length === 0 &&
            React.createElement(
              "tr",
              null,
              React.createElement(
                "td",
                {
                  colSpan: 8,
                  style: {
                    ...styles.td,
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  },
                },
                "No Real Estate properties found."
              )
            ),

          realEstateListings.map((property) =>
            React.createElement(
              "tr",
              {
                key:
                  property.propertyCode ||
                  property._id ||
                  `${property.title}-${property.createdAt}`,
              },

              React.createElement(
                "td",
                { style: styles.td },
                property.propertyCode || "-"
              ),

              React.createElement(
                "td",
                { style: styles.td },
                property.title ||
                  property.propertyName ||
                  property.name ||
                  "-"
              ),

              React.createElement(
                "td",
                { style: styles.td },
                property.propertyType ||
                  property.type ||
                  property.category ||
                  "-"
              ),

              React.createElement(
                "td",
                { style: styles.td },
                property.location ||
                  property.city ||
                  property.area ||
                  "-"
              ),

              React.createElement(
                "td",
                { style: styles.td },
                property.price
                  ? `â‚¹${Number(property.price).toLocaleString("en-IN")}`
                  : property.expectedPrice
                  ? `â‚¹${Number(property.expectedPrice).toLocaleString("en-IN")}`
                  : "-"
              ),

              React.createElement(
                "td",
                { style: styles.td },
                property.providerName ||
                  property.ownerName ||
                  property.providerUserCode ||
                  "-"
              ),

              React.createElement(
                "td",
                { style: styles.td },
                property.status || "pending"
              ),

              React.createElement(
                "td",
                { style: styles.td },

                String(property.status || "pending").toLowerCase() ===
                  "pending" &&
                  React.createElement(
                    "button",
                    {
                      onClick: () =>
                        approveRealEstate(property.propertyCode),
                      style: {
                        ...styles.buttonSuccess,
                        marginRight: "6px",
                        marginBottom: "4px",
                      },
                    },
                    "Approve"
                  ),

                String(property.status || "pending").toLowerCase() ===
                  "pending" &&
                  React.createElement(
                    "button",
                    {
                      onClick: () =>
                        rejectRealEstate(property.propertyCode),
                      style: styles.buttonDanger,
                    },
                    "Reject"
                  ),

                String(property.status || "").toLowerCase() !== "pending" &&
                  React.createElement(
                    "span",
                    { style: { fontWeight: "bold" } },
                    String(property.status || "-").toUpperCase()
                  )
              )
            )
          )
        )
      )
    )
  ),

    activeTab === "marketplaceApproval" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Marketplace Approval - Providers"),
      React.createElement("p", { style: { color: "#666" } }, "Control provider marketplace visibility."),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "User Code"),
              React.createElement("th", { style: styles.th }, "Provider"),
              React.createElement("th", { style: styles.th }, "Phone"),
              React.createElement("th", { style: styles.th }, "Role"),
              React.createElement("th", { style: styles.th }, "KYC"),
              React.createElement("th", { style: styles.th }, "Marketplace"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            users.filter(u => ["supplier","contractor","labour","machinery","realestate"].includes(String(u.role || "").toLowerCase())).map(u =>
              React.createElement("tr", { key: "mp-"+u.id },
                React.createElement("td", { style: styles.td }, u.userCode || "-"),
                React.createElement("td", { style: styles.td }, u.name || "-"),
                React.createElement("td", { style: styles.td }, u.mobile || "-"),
                React.createElement("td", { style: styles.td }, u.role || "-"),
                React.createElement("td", { style: styles.td }, u.kyc || "-"),
                React.createElement("td", { style: styles.td }, u.marketplace || "Hidden"),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => toggleMarketplace(u.id, u.marketplace), style: u.marketplace === "Visible" ? styles.buttonDanger : styles.buttonSuccess }, u.marketplace === "Visible" ? "Hide" : "Show")
                )
              )
            )
          )
        )
      )
    ),

    activeTab === "projectControl" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Project Control & Permission Engine"),
      React.createElement("p", { style: { color: "#666" } }, "Live project assignments from MongoDB users."),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "User Code"),
              React.createElement("th", { style: styles.th }, "Name"),
              React.createElement("th", { style: styles.th }, "Phone"),
              React.createElement("th", { style: styles.th }, "Role"),
              React.createElement("th", { style: styles.th }, "Assigned Projects"),
              React.createElement("th", { style: styles.th }, "Access Role")
            )
          ),
          React.createElement("tbody", null,
            users.map(u => React.createElement("tr", { key: "proj-"+u.id },
              React.createElement("td", { style: styles.td }, u.userCode || "-"),
              React.createElement("td", { style: styles.td }, u.name || "-"),
              React.createElement("td", { style: styles.td }, u.mobile || "-"),
              React.createElement("td", { style: styles.td }, u.role || "-"),
              React.createElement("td", { style: styles.td }, (u.assignedProjects || []).length ? (u.assignedProjects || []).map(p => p.projectName || p.projectCode).join(", ") : "No Project"),
              React.createElement("td", { style: styles.td }, (u.assignedProjects || []).length ? (u.assignedProjects || []).map(p => p.accessRole || "-").join(", ") : "-")
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
    ),

    showBOQModal && editingBOQItem && React.createElement("div", { style: styles.modal, onClick: () => setShowBOQModal(false) },
      React.createElement("div", { style: { ...styles.modalContent, maxWidth: "520px", borderRadius: "14px", padding: "24px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" } },
          React.createElement("h3", { style: { margin: 0, color: "#800020", fontSize: "18px", fontWeight: "800" } }, "Combined BOQ Rate Editor"),
          React.createElement("button", { onClick: () => setShowBOQModal(false), style: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" } }, "✕")
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "12px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Master Code"),
            React.createElement("input", { value: editingBOQItem.masterItemCode || "", readOnly: true, style: { ...styles.input, backgroundColor: "#f1f5f9", fontWeight: "bold" } })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Item Name"),
            React.createElement("input", { value: editingBOQItem.itemName || "", onChange: (e) => setEditingBOQItem({ ...editingBOQItem, itemName: e.target.value }), style: styles.input })
          ),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } },
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Unit"),
              React.createElement("input", { value: editingBOQItem.unit || "NOS", onChange: (e) => setEditingBOQItem({ ...editingBOQItem, unit: e.target.value }), style: styles.input })
            ),
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Linked Labour Code"),
              React.createElement("input", { value: editingBOQItem.linkedLabourItemCode || "", readOnly: true, style: { ...styles.input, backgroundColor: "#f1f5f9" } })
            )
          ),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } },
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Material / Service Rate (₹)"),
              React.createElement("input", {
                type: "number",
                value: editingBOQItem.materialRate ?? "",
                onChange: (e) => {
                  const mRate = parseFloat(e.target.value) || 0;
                  setEditingBOQItem({
                    ...editingBOQItem,
                    materialRate: mRate,
                    totalUnitRate: mRate + (editingBOQItem.labourRate || 0)
                  });
                },
                style: styles.input
              })
            ),
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Labour Rate (₹)"),
              React.createElement("input", {
                type: "number",
                value: editingBOQItem.labourRate ?? "",
                onChange: (e) => {
                  const lRate = parseFloat(e.target.value) || 0;
                  setEditingBOQItem({
                    ...editingBOQItem,
                    labourRate: lRate,
                    totalUnitRate: (editingBOQItem.materialRate || 0) + lRate
                  });
                },
                style: styles.input
              })
            )
          ),
          React.createElement("div", { style: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", marginTop: "4px" } },
            React.createElement("span", { style: { fontSize: "12px", color: "#166534", fontWeight: "700" } }, "Total Unit Rate (Material + Labour): "),
            React.createElement("strong", { style: { fontSize: "16px", color: "#15803d" } }, `₹${((editingBOQItem.materialRate || 0) + (editingBOQItem.labourRate || 0)).toLocaleString()}`)
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" } },
          React.createElement("button", { onClick: () => setShowBOQModal(false), style: { ...styles.button, backgroundColor: "#64748b" } }, "Cancel"),
          React.createElement("button", { onClick: saveBOQCombinedRates, style: styles.buttonSuccess }, "Save")
        )
      )
    )
  );
}

