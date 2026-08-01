import React, { useState, useEffect } from "react";
import { generateBuildMitraDocument } from "../utils/documentGenerator";
import { themeTokens, PrimaryButton, SecondaryButton, Card, Badge, LoadingSpinner, EmptyState, BuildMitraHeader } from "../components/ui/DesignSystem";
import MarketRateTrend from "../components/ui/MarketRateTrend";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
import { exportProjectReport } from "../utils/reporting";
import { downloadBuildMitraPDF } from "../utils/pdfExport";
import {
  DEFAULT_PROJECT_PERMISSIONS,
  findBuyerByCode,
  getLoggedInUser,
  migrateLegacyProjects,
  saveProjectsForContractor, getAllProjects
} from "../utils/projectStorage";
import { logoutToLogin } from "../utils/session";
import { generateCivilMilestones } from "../utils/milestoneEngine";
export default function ContractorDashboard() {

  
const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSharePermissionModal, setShowSharePermissionModal] = useState(false);
  const [shareBuyerCodeInput, setShareBuyerCodeInput] = useState("");
  const [shareSelectedProjectId, setShareSelectedProjectId] = useState<any>(null);
  const [sharePermissionsState, setSharePermissionsState] = useState({
    projectSummary: true,
    milestones: true,
    inventory: true,
    labour: true,
    geofence: true,
    siteMedia: true,
    payments: true,
    quotations: true,
    reports: true
  });
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [labourSubTab, setLabourSubTab] = useState("master");
  const [labourFilterProject, setLabourFilterProject] = useState("");
  const [labourFilterWorker, setLabourFilterWorker] = useState("");
  const [labourFilterPeriod, setLabourFilterPeriod] = useState("yesterday");
  const [customLocations, setCustomLocations] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("contractorCustomLocations") || "[]");
    } catch {
      return ["Site #4, Hosur Road Basement Quarry", "Villa 204, Sarjapur Outer Ring Road"];
    }
  });
  const [isManualLocationInput, setIsManualLocationInput] = useState(false);
  const [manualLocationText, setManualLocationText] = useState("");

  const [newLabourMaster, setNewLabourMaster] = useState({
    name: "",
    age: "",
    mobile: "",
    address: "",
    category: "Civil Mason",
    jobAllotted: "Foundation & Brickwork Masonry",
    projectId: "",
    dailyWage: "",
    salaryMode: "Weekly",
    pfAmount: "0",
    esiAmount: "0",
    conveyance: "0",
    otRate: "0",
    accommodation: "Site Shed Provided",
    otherPerks: "Medical & Safety Gear",
    joinDate: new Date().toISOString().split("T")[0]
  });

  const [labourMasterList, setLabourMasterList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("contractorLabourMasterList");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "LAB-1001",
        name: "Ramesh Kumar",
        age: "34",
        mobile: "9876543210",
        address: "Hobli, Whitefield, Bengaluru",
        category: "Civil Mason",
        jobAllotted: "Brickwork & Plastering",
        projectId: "1",
        projectName: "Green Valley Villa",
        projectCode: "PRJ-101",
        dailyWage: 950,
        salaryMode: "Weekly",
        pfAmount: 120,
        esiAmount: 50,
        conveyance: 100,
        otRate: 150,
        accommodation: "Site Shed Provided",
        otherPerks: "Safety Gear",
        joinDate: "2026-01-15",
        status: "Active",
        punchLink: "/labour-attendance?workerCode=LAB-1001&code=PRJ-101&mode=restricted"
      },
      {
        id: "LAB-1002",
        name: "Suresh Naik",
        age: "29",
        mobile: "9123456789",
        address: "Kethaganahalli, Hoskote",
        category: "Barbender Steel",
        jobAllotted: "Column & Beam Rebar Binding",
        projectId: "1",
        projectName: "Green Valley Villa",
        projectCode: "PRJ-101",
        dailyWage: 900,
        salaryMode: "Weekly",
        pfAmount: 110,
        esiAmount: 45,
        conveyance: 80,
        otRate: 140,
        accommodation: "Travel Allowance",
        otherPerks: "Lunch Pass",
        joinDate: "2026-02-01",
        status: "Active",
        punchLink: "/labour-attendance?workerCode=LAB-1002&code=PRJ-101&mode=restricted"
      }
    ];
  });
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showPaymentEntryModal, setShowPaymentEntryModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showProjectQuoteModal, setShowProjectQuoteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quoteResponse, setQuoteResponse] = useState({
  amount: "",
  message: "",
  deliveryDate: "",
  paymentTerms: "",
  gstIncluded: false,
  transportCharges: ""
});
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [reportType, setReportType] = useState("payments");
  const [reportFilters, setReportFilters] = useState({ startDate: "", endDate: "", projectId: "", material: "", supplier: "", labour: "", payment: "", milestone: "", quotation: "", extraWork: "" });
  
  // Media upload states
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaSelectionMessage, setMediaSelectionMessage] = useState("");
  const [mediaType, setMediaType] = useState("photo");
  const [mediaCategory, setMediaCategory] = useState("progress"); // progress, document, invoice
  
  // Portfolio states
  const [portfolioImage, setPortfolioImage] = useState(null);
  const [portfolioData, setPortfolioData] = useState({ name: "", clientName: "", location: "", completionDate: "", totalValue: "", testimonial: "" });
  const [editPortfolioId, setEditPortfolioId] = useState(null);
  const [storageReady, setStorageReady] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [newInventoryItem, setNewInventoryItem] = useState({ material: "", supplier: "", invoiceNo: "", invoiceDate: "", orderedQty: "", receivedQty: "", consumedQty: "", unit: "bags", rate: "" });
  const [newProjectQuote, setNewProjectQuote] = useState({ quoteNo: "", date: new Date().toISOString().split("T")[0], description: "", amount: "", status: "Draft", remarks: "" });
  const [companyDocs, setCompanyDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("contractorCompanyDocs") || "[]"); } catch { return []; }
  });
  const [companyQuotes, setCompanyQuotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("contractorCompanyQuotes") || "[]"); } catch { return []; }
  });

  const [companyProfile, setCompanyProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("contractorCompanyProfile") || "null") || {
        companyName: "",
        ownerName: "",
        companyType: "Proprietorship",
        establishedYear: "",
        experience: "",
        employees: "",
        officeAddress: "",
        branchAddress: "",
        officePhone: "",
        mobile1: "",
        mobile2: "",
        email: "",
        website: "",
        gstNo: "",
        panNo: "",
        workingHours: "",
        googleMap: "",
        about: "",
        visibility: "Public"
      };
    } catch {
      return {};
    }
  });
  const [newPayment, setNewPayment] = useState({ milestoneName: "", amount: "", date: new Date().toISOString().split("T")[0], status: "Received", reference: "" });
  const [newMilestone, setNewMilestone] = useState({ name: "", amount: "", plannedEndDate: "", status: "Pending" });

  const [newProject, setNewProject] = useState({
    name: "", buyerCode: "", clientName: "", clientMobile: "", clientEmail: "",
    plotLength: "", plotWidth: "", floors: "", ratePerSft: "", startDate: "", endDate: "", agreementUrl: null
  });

 const [contractorInfo, setContractorInfo] = useState({
  companyName: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  uniqueCode: "",
  since: "",
  rating: 0,
  completedProjects: 0,
  totalRevenue: 0
  });

  // Projects with unique IDs for linking with buyer dashboard
  const [projects, setProjects] = useState<any[]>([]);
    
  // Load and safely migrate legacy project data into the canonical collection.
  useEffect(() => {
    const user = getLoggedInUser();
    setLoggedInUser(user);
    if (!user || user.role !== "contractor") {
      setProjects([]);
      setStorageReady(true);
      return;
    }

    const allProjects = migrateLegacyProjects(user);
    const contractorId = user.userId ?? user.id;
    const ownedProjects = allProjects.filter(
      (project) => String(project.contractorId) === String(user.userId ?? user.id) ||
        (Boolean(user.uniqueCode) && String(project.contractorCode || "").toUpperCase() === String(user.uniqueCode).toUpperCase())
    ).map((project) => ({
      ...project,
      contractorId,
      contractorCode: project.contractorCode || user.uniqueCode || ""
    }));
    setProjects(ownedProjects);
    setSelectedProject(ownedProjects[0]?.id ?? null);

    try {
      const savedInfo = JSON.parse(localStorage.getItem("contractorInfo") || "null");
      if (savedInfo) setContractorInfo(savedInfo);
    } catch {}
    setStorageReady(true);
  }, []);

useEffect(() => {
  if (!selectedProject && projects.length > 0) {
    setSelectedProject(projects[0].id);
  }
}, [projects]);

// Auto save projects
useEffect(() => {
  if (!storageReady || !loggedInUser) return;
  const contractorId = loggedInUser.userId ?? loggedInUser.id;
  saveProjectsForContractor(contractorId, projects);
}, [projects, storageReady, loggedInUser]);

  const [completedProjects, setCompletedProjects] = useState<any[]>([]);

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  const [myQuotes, setMyQuotes] = useState<any[]>([]);

  const getCurrentAppUser = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("currentUser") || sessionStorage.getItem("loggedInUser") || sessionStorage.getItem("user") || "{}");
      const identityText = [
        user.userCode,
        user.uniqueCode,
        user.name,
        user.companyName,
        user.email,
        user.phone
      ].join(" ").toLowerCase();
      if (identityText.includes("9343726656") || identityText.includes("rr construction") || identityText.includes("rrbeta") || identityText.includes("con-000001")) {
        return { ...user, userCode: "CON-000001", businessRole: user.businessRole || "contractor", role: user.role || "contractor" };
      }
      return user;
    } catch {
      return {};
    }
  };

  const mapMongoEnquiry = (e) => ({
    id: e._id,
    enquiryCode: e.enquiryCode,
    date: e.createdAt ? e.createdAt.split("T")[0] : "",
    projectType: e.itemName || e.itemType || "Construction Work",
    itemType: e.itemType || "",
    itemName: e.itemName || "",
    location: e.location || "",
    customerName: e.buyerName || "",
    customerMobile: e.buyerPhone || "",
    budget: e.quantity || "Call",
    quantity: e.quantity || "",
    unit: e.unit || "",
    status: e.status === "quoted" ? "Quoted" : e.status || "Pending",
    requirement: e.specification || e.message || "",
    quotedAmount: e.quotedAmount || "",
    quoteMessage: e.quoteMessage || ""
  });

  const fetchLiveEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const user = getLoggedInUser();
      const currentUser = getCurrentAppUser();
      const providerUserCode = user?.uniqueCode || user?.userCode || currentUser.userCode || currentUser.userId || currentUser.uniqueCode || "";
      if (!providerUserCode) {
        setEnquiries([]);
        setEnquiriesLoading(false);
        return;
      }

      let res = await fetch(
        API_BASE + "/api/enquiry/provider/my?providerUserCode=" + encodeURIComponent(providerUserCode),
        {
          headers: {
            "x-user-code": providerUserCode
          }
        }
      );
      let data = await res.json().catch(() => ({}));

      if (!data.success) {
        res = await fetch(
          API_BASE + "/api/enquiry?providerUserCode=" + encodeURIComponent(providerUserCode),
          {
            headers: {
              "x-user-code": providerUserCode
            }
          }
        );
        data = await res.json().catch(() => ({}));
      }

      if (data.success) {
        const liveRows = data.enquiries || [];
        console.log("BuildMitra contractor enquiry debug", {
          loggedInContractor: currentUser,
          contractorUserCode: providerUserCode,
          fetchedEnquiryCount: liveRows.length,
          matchingEnquiryCount: liveRows.length,
          firstProviderUserCodes: (data.enquiries || []).slice(0, 3).map((e) => e.providerUserCode)
        });
        setEnquiries(liveRows.map(mapMongoEnquiry));
      }
    } catch (err) {
      console.log("Mongo enquiries not loaded", err);
      setEnquiries([]);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  // Load saved contractor data
  useEffect(() => {
  try {
    const savedCompletedProjects = localStorage.getItem("contractorCompletedProjects");
    if (savedCompletedProjects) {
      setCompletedProjects(JSON.parse(savedCompletedProjects));
    }

    fetchLiveEnquiries();

    const savedQuotes = localStorage.getItem("contractorQuotes");
    if (savedQuotes) {
      setMyQuotes(JSON.parse(savedQuotes));
    }
  } catch (err) {
    console.log("Contractor storage load error", err);
  }
}, []);
    
// Auto Save
useEffect(() => {
  localStorage.setItem(
    "contractorCompletedProjects",
    JSON.stringify(completedProjects)
  );
}, [completedProjects]);

// MongoDB enquiries are loaded from backend.
useEffect(() => {
  localStorage.setItem(
    "contractorQuotes",
    JSON.stringify(myQuotes)
  );
}, [myQuotes]);

  const styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#2d6a4f", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    tabContainer: { display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #ddd", flexWrap: "wrap", backgroundColor: "white", padding: "0 16px", borderRadius: "12px 12px 0 0" },
    tab: { padding: "12px 20px", cursor: "pointer", borderBottom: "3px solid transparent", fontSize: "14px", fontWeight: "500" },
    activeTab: { borderBottomColor: "#2d6a4f", color: "#2d6a4f" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    cardTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #2d6a4f", paddingBottom: "10px" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "20px" },
    button: { backgroundColor: "#2d6a4f", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonDanger: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", overflowX: "auto" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #ddd", backgroundColor: "#f8f9fa" },
    td: { padding: "12px", borderBottom: "1px solid #eee" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" },
    progressBar: { height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginTop: "8px" },
    progressFill: { height: "100%", backgroundColor: "#2d6a4f", borderRadius: "4px", transition: "width 0.3s" },
    statValue: { fontSize: "28px", fontWeight: "bold", color: "#2d6a4f" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "700px", maxHeight: "85vh", overflow: "auto" },
    statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", display: "inline-block" },
    presentBtn: { backgroundColor: "#28a745", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", border: "none" },
    absentBtn: { backgroundColor: "#dc3545", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", border: "none" },
    mediaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" },
    mediaCard: { border: "1px solid #ddd", borderRadius: "8px", padding: "12px", textAlign: "center", backgroundColor: "#f8f9fa" },
    mediaIcon: { fontSize: "48px", marginBottom: "8px" }
  };

  const tabs = [
    { id: "companyprofile", name: "Company Profile", icon: "🏢" },
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "projects", name: "Projects & Access Control", icon: "🏗️" },
    { id: "labour", name: "Labour Attendance", icon: "👷" },
    { id: "milestones", name: "Milestones", icon: "🎯" },
    { id: "portfolio", name: "Portfolio", icon: "📸" },
    { id: "siteprogress", name: "Site Progress", icon: "📷" },
    { id: "enquiries", name: "Enquiries", icon: "💬" },
    { id: "quotes", name: "My Quotes", icon: "📋" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "payments", name: "Payments (Read-Only)", icon: "💰" },
    { id: "reports", name: "Reports", icon: "📈" }
  ];

  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);

  const getFallbackConstructionImage = (title: string) => {
    const safeTitle = encodeURIComponent(title || "Construction Progress Work");
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e3a8a"/><rect x="40" y="60" width="520" height="280" fill="%230f766e" rx="16"/><text x="300" y="180" font-family="sans-serif" font-size="32" font-weight="bold" fill="%23ffffff" text-anchor="middle">🏗️ BuildMitra Site Photo</text><text x="300" y="230" font-family="sans-serif" font-size="20" fill="%23fef08a" text-anchor="middle">${safeTitle}</text></svg>`;
  };

  // Add Site Media (Photos/Documents/Invoices) - Links to Buyer Dashboard via projectUniqueId
  const addSiteMedia = () => {
    if (!mediaTitle || !mediaTitle.trim()) {
      alert("Please enter a title or description for the progress photo update.");
      return;
    }
    const uploadDate = new Date().toISOString();
    const finalUrl = mediaDataUrl || (mediaFile ? URL.createObjectURL(mediaFile) : null) || getFallbackConstructionImage(mediaTitle.trim());

    const newMedia = {
      id: `MEDIA-${Date.now()}`,
      fileName: mediaFile ? mediaFile.name : `${mediaTitle.trim()}.webp`,
      fileSize: mediaFile ? mediaFile.size : 15360,
      fileType: mediaFile ? mediaFile.type : "image/webp",
      url: finalUrl,
      fileDataUrl: finalUrl,
      previewUrl: finalUrl,
      fileUrl: finalUrl,
      uploadDate,
      description: mediaTitle.trim(),
      mediaType: mediaType || "photo",
      projectId: selectedProjectData?.projectUniqueId || selectedProjectData?.projectId || selectedProject,
      type: mediaType || "photo",
      title: mediaTitle.trim(),
      category: mediaCategory || "progress",
      date: uploadDate.split("T")[0],
      uploadedBy: "Contractor"
    };
    
    const updatedProjects = projects.map(p => 
      p.id === selectedProject ? { ...p, siteMedia: [...(p.siteMedia || []), newMedia] } : p
    );
    setProjects(updatedProjects);
    if (loggedInUser) {
      saveProjectsForContractor(loggedInUser.userId ?? loggedInUser.id, updatedProjects);
    }
    setMediaTitle("");
    setMediaFile(null);
    setMediaDataUrl(null);
    setMediaSelectionMessage("");
    setMediaType("photo");
    setMediaCategory("progress");
    setShowMediaModal(false);
    alert("Progress photo saved! Live image preview active in Contractor and Buyer Dashboards.");
  };

  const deleteSiteMedia = (mediaId) => {
    if (window.confirm("Delete this media? Buyer will no longer see it.")) {
      const updatedProjects = projects.map(p => 
        p.id === selectedProject ? { ...p, siteMedia: p.siteMedia.filter(m => m.id !== mediaId) } : p
      );
      setProjects(updatedProjects);
      alert("Media deleted successfully!");
    }
  };

  // Portfolio CRUD Operations
  const addPortfolio = () => {
    if (!portfolioData.name || !portfolioData.clientName) {
      alert("Please fill project name and client name");
      return;
    }
    const imageUrl = portfolioImage ? URL.createObjectURL(portfolioImage) : null;
    const newPortfolio = {
      id: completedProjects.length + 1,
      projectUniqueId: `COMP-${String(completedProjects.length + 1).padStart(3, "0")}`,
      ...portfolioData,
      totalValue: parseFloat(portfolioData.totalValue) || 0,
      images: imageUrl ? [imageUrl] : [],
      documents: []
    };
    setCompletedProjects([...completedProjects, newPortfolio]);
    setPortfolioData({ name: "", clientName: "", location: "", completionDate: "", totalValue: "", testimonial: "" });
    setPortfolioImage(null);
    setShowPortfolioModal(false);
    alert("Portfolio added successfully!");
  };

  const editPortfolio = (portfolio) => {
    setEditPortfolioId(portfolio.id);
    setPortfolioData({
      name: portfolio.name,
      clientName: portfolio.clientName,
      location: portfolio.location,
      completionDate: portfolio.completionDate,
      totalValue: portfolio.totalValue,
      testimonial: portfolio.testimonial
    });
    setShowPortfolioModal(true);
  };

  const updatePortfolio = () => {
    const updatedPortfolios = completedProjects.map(p => 
      p.id === editPortfolioId ? { ...p, ...portfolioData, totalValue: parseFloat(portfolioData.totalValue) || 0 } : p
    );
    setCompletedProjects(updatedPortfolios);
    setPortfolioData({ name: "", clientName: "", location: "", completionDate: "", totalValue: "", testimonial: "" });
    setEditPortfolioId(null);
    setShowPortfolioModal(false);
    alert("Portfolio updated successfully!");
  };

  const deletePortfolio = (portfolioId) => {
    if (window.confirm("Delete this portfolio item?")) {
      setCompletedProjects(completedProjects.filter(p => p.id !== portfolioId));
      alert("Portfolio deleted!");
    }
  };

  const plotArea = Number(newProject.plotLength || 0) * Number(newProject.plotWidth || 0);
  const calculatedFloors = Math.max(1, Number(newProject.floors) || 0);
  const calculatedBua = Number((plotArea * 0.9 * calculatedFloors).toFixed(2));
  const calculatedTotalAmount = Number((calculatedBua * Number(newProject.ratePerSft || 0)).toFixed(2));
  const matchedBuyer = null;

  const addProject = () => {
    if (!newProject.name.trim() || !newProject.startDate || !newProject.endDate) {
      alert("Project name, start date, and end date are required.");
      return;
    }
    if (new Date(newProject.endDate).getTime() < new Date(newProject.startDate).getTime()) {
      alert("End date cannot be before start date.");
      return;
    }
    const bua = calculatedBua;
    const floors = calculatedFloors;
    const totalAmount = calculatedTotalAmount;
    if (!Number(newProject.plotLength) || !Number(newProject.plotWidth) || !Number(newProject.floors) || !Number(newProject.ratePerSft) || bua <= 0 || totalAmount <= 0) {
      alert("Plot length, plot width, number of floors, and rate per sqft must all be greater than zero.");
      return;
    }
    const buyer = newProject.buyerCode?.trim() ? findBuyerByCode(newProject.buyerCode) : null;
    if (newProject.buyerCode?.trim() && !buyer) {
      alert("Buyer Unique Code was not found. You can create project without buyer code, or enter a registered buyer code.");
      return;
    }
    if (!loggedInUser || loggedInUser.role !== "contractor") {
      alert("Please log in with a contractor account to create a project.");
      return;
    }
    const existingProjectIds = new Set([...projects, ...getAllProjects()].map((p) => String(p.projectUniqueId || p.projectId || p.id || "").toUpperCase()));
    let projectId = "";
    do {
      projectId = `BM-PROJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (existingProjectIds.has(projectId.toUpperCase()));
    const milestones = generateCivilMilestones({
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      bua,
      floors,
      totalAmount
    });
    const newProjectObj = {
      id: projectId,
      projectId,
      projectUniqueId: projectId,
      ...newProject,
      name: newProject.name.trim(),
      projectName: newProject.name.trim(),
      buyerCode: buyer?.uniqueCode || "",
      buyerName: buyer?.name || "",
      contractorId: loggedInUser.userId ?? loggedInUser.id,
      contractorName: loggedInUser.name || contractorInfo.companyName,
      contractorCode: (loggedInUser.uniqueCode || loggedInUser.userCode) || contractorInfo.uniqueCode,
      plotLength: parseFloat(newProject.plotLength) || 0,
      plotWidth: parseFloat(newProject.plotWidth) || 0,
      plotArea,
      floors,
      ratePerSft: Number(newProject.ratePerSft),
      bua,
      totalAmount,
      progress: 0,
      status: "Planning",
      agreementUrl: newProject.agreementUrl,
      milestones,
      payments: [],
      labour: [],
      labourAttendance: [],
      siteMedia: [],
      inventory: [],
      suppliers: [],
      extraWorks: [],
      quotations: [],
      permissions: { projectSummary: true, milestones: true, inventory: true, labour: true, siteMedia: true, payments: true, quotations: true, reports: true }
    };
    setProjects([...projects, newProjectObj]);
    setSelectedProject(projectId);
    setNewProject({ name: "", buyerCode: "", clientName: "", clientMobile: "", clientEmail: "", plotLength: "", plotWidth: "", floors: "", ratePerSft: "", startDate: "", endDate: "", agreementUrl: null });
    setShowProjectModal(false);
    alert(`Project created privately with ${milestones.length} civil milestones. Use Share Project to link buyer code.`);
  };

  const updatePermission = (permission: string, enabled: boolean, projectId = selectedProject) => {
    setProjects(projects.map((project) => project.id === projectId ? {
      ...project,
      permissions: { ...DEFAULT_PROJECT_PERMISSIONS, ...(project.permissions || {}), [permission]: enabled }
    } : project));
  };

  const addProjectQuotation = () => {
    const amount = Number(newProjectQuote.amount);
    if (!selectedProjectData || !newProjectQuote.quoteNo.trim() || !newProjectQuote.date || !newProjectQuote.description.trim() || amount <= 0 || !newProjectQuote.status) {
      alert("Quote number, project, date, description, amount, and status are required.");
      return;
    }
    const quote = { id: `QUOTE-${Date.now()}`, ...newProjectQuote, amount, projectId: selectedProjectData.id, projectName: selectedProjectData.name };
    setProjects(projects.map((project) => project.id === selectedProject ? { ...project, quotations: [...(project.quotations || []), quote] } : project));
    setNewProjectQuote({ quoteNo: "", date: new Date().toISOString().split("T")[0], description: "", amount: "", status: "Draft", remarks: "" });
    setShowProjectQuoteModal(false);
  };

  const addPayment = () => {
    const amount = Number(newPayment.amount);
    if (!selectedProjectData || !newPayment.milestoneName || !amount || amount < 0) {
      alert("Enter a milestone/payment description and valid amount");
      return;
    }
    setProjects(projects.map((project) => project.id === selectedProject ? {
      ...project,
      payments: [...(project.payments || []), {
        id: `PAY-${Date.now()}`,
        ...newPayment,
        amount,
        chequeNo: newPayment.reference,
        utrNo: newPayment.reference
      }]
    } : project));
    setNewPayment({ milestoneName: "", amount: "", date: new Date().toISOString().split("T")[0], status: "Received", reference: "" });
    setShowPaymentEntryModal(false);
  };

  const addInventoryItem = () => {
    if (!newInventoryItem.material || !newInventoryItem.invoiceDate || !newInventoryItem.orderedQty || !newInventoryItem.receivedQty) {
      alert("Material, invoice date, ordered quantity, and received quantity are required.");
      return;
    }
    const receivedQty = Number(newInventoryItem.receivedQty);
    const orderedQty = Number(newInventoryItem.orderedQty);
    const consumedQty = Number(newInventoryItem.consumedQty || 0);
    const rate = Number(newInventoryItem.rate || 0);
    if (orderedQty < 0 || receivedQty < 0 || consumedQty < 0 || receivedQty > orderedQty || consumedQty > receivedQty || rate < 0) {
      alert("Consumed quantity must be between zero and received quantity");
      return;
    }
    setProjects(projects.map((project) => project.id === selectedProject ? {
      ...project,
      inventory: [...(project.inventory || []), {
        id: `INV-${Date.now()}`,
        ...newInventoryItem,
        orderedQty,
        receivedQty,
        consumedQty,
        consumed: consumedQty,
        balanceQty: receivedQty - consumedQty,
        balance: receivedQty - consumedQty,
        rate,
        amount: receivedQty * rate,
        receivedDate: newInventoryItem.invoiceDate
      }]
    } : project));
    setNewInventoryItem({ material: "", supplier: "", invoiceNo: "", invoiceDate: "", orderedQty: "", receivedQty: "", consumedQty: "", unit: "bags", rate: "" });
    setShowInventoryModal(false);
  };

  const addMilestone = () => {
    if (!selectedProjectData || !newMilestone.name) {
      alert("Enter a milestone name");
      return;
    }
    setProjects(projects.map((project) => project.id === selectedProject ? {
      ...project,
      milestones: [...(project.milestones || []), {
        id: `MS-${Date.now()}`,
        ...newMilestone,
        amount: Number(newMilestone.amount || 0),
        contractorStatus: newMilestone.status
      }]
    } : project));
    setNewMilestone({ name: "", amount: "", plannedEndDate: "", status: "Pending" });
    setShowMilestoneModal(false);
  };

  const updateMilestoneStatus = (milestoneId, status) => {
    const today = new Date().toISOString().split("T")[0];
    setProjects(projects.map((project) => project.id === selectedProject ? {
      ...project,
      milestones: (project.milestones || []).map((milestone) => milestone.id === milestoneId
        ? milestone.ownerApproved || milestone.invoiceRaised || milestone.paymentStatus === "Paid"
          ? milestone
          : {
            ...milestone,
            status,
            contractorStatus: status,
            contractorCompleted: status === "Completed",
            completionDate: status === "Completed" ? today : null,
            ownerRejected: false,
            ownerRejectionDate: null
          }
        : milestone),
      progress: (project.milestones || []).length
        ? Math.round((project.milestones.filter((milestone) => milestone.id === milestoneId ? status === "Completed" : milestone.contractorCompleted || milestone.ownerApproved).length / project.milestones.length) * 100)
        : 0
    } : project));
  };

  const updateInventoryConsumed = (inventoryId, value) => {
    const consumed = Number(value);
    setProjects(projects.map((project) => project.id === selectedProject ? {
      ...project,
      inventory: (project.inventory || []).map((item) =>
        item.id === inventoryId && consumed >= 0 && consumed <= Number(item.receivedQty)
          ? { ...item, consumedQty: consumed, consumed, balanceQty: Number(item.receivedQty) - consumed, balance: Number(item.receivedQty) - consumed, amount: Number(item.receivedQty) * Number(item.rate || 0) }
          : item
      )
    } : project));
  };

  const raiseInvoice = (milestone) => {
    if (!milestone.ownerApproved || milestone.status !== "Approved") {
      alert("Invoice can be raised only after buyer approval.");
      return;
    }
    if (milestone.invoiceRaised) {
      alert("Invoice has already been raised for this milestone.");
      return;
    }
    const finalInvoiceAmount = Number(invoiceAmount || milestone.amount);
    if (!finalInvoiceAmount || finalInvoiceAmount <= 0 || finalInvoiceAmount > Number(milestone.amount)) {
      alert("Invoice amount must be greater than zero and cannot exceed the milestone amount.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const updatedProjects = projects.map(p => 
      p.id === selectedProject ? {
        ...p,
        milestones: p.milestones.map(m => 
          m.id === milestone.id ? { ...m, invoiceRaised: true, invoiceDate: today, invoiceAmount: finalInvoiceAmount, paymentStatus: "Due" } : m
        ),
        siteMedia: [...(p.siteMedia || []), {
          id: (p.siteMedia?.length || 0) + 1,
          type: "document",
          title: `Invoice - ${milestone.name}`,
          url: null,
          category: "invoice",
          date: new Date().toISOString().split("T")[0],
          uploadedBy: "Contractor",
          milestoneName: milestone.name,
          amount: finalInvoiceAmount
        }]
      } : p
    );
    setProjects(updatedProjects);
    setShowInvoiceModal(false);
    setInvoiceAmount("");
    alert(`Invoice raised for ${milestone.name}. Buyer can view in dashboard.`);
  };

  const addLabour = (labourData) => {
    const selectedProjectData = projects.find(p => p.id === selectedProject);
    const newLabour = {
      id: (selectedProjectData?.labour?.length || 0) + 1,
      name: labourData.name,
      role: labourData.role,
      dailyWage: parseFloat(labourData.dailyWage),
      joinDate: new Date().toISOString().split("T")[0]
    };
    const updatedProjects = projects.map(p => 
      p.id === selectedProject ? { ...p, labour: [...(p.labour || []), newLabour] } : p
    );
    setProjects(updatedProjects);
    alert("Labour added successfully!");
    setShowLabourModal(false);
  };

  const toggleAttendance = (labourId, date) => {
    const selectedProjectData = projects.find(p => p.id === selectedProject);
    const existingAttendance = selectedProjectData?.labourAttendance || [];
    const existing = existingAttendance.find(a => a.labourId === labourId && a.date === date);
    
    let newAttendance;
    if (existing) {
      newAttendance = existingAttendance.map(a => 
        a.labourId === labourId && a.date === date ? { ...a, status: a.status === "Present" ? "Absent" : "Present" } : a
      );
    } else {
      newAttendance = [...existingAttendance, { labourId, date, status: "Present" }];
    }
    
    const updatedProjects = projects.map(p => 
      p.id === selectedProject ? { ...p, labourAttendance: newAttendance } : p
    );
    setProjects(updatedProjects);
  };

  const getAttendanceStatus = (labourId, date) => {
    const selectedProjectData = projects.find(p => p.id === selectedProject);
    const record = selectedProjectData?.labourAttendance?.find(a => a.labourId === labourId && a.date === date);
    return record ? record.status : "Not Marked";
  };

  const calculateWeeklyPayment = (labour) => {
    const selectedProjectData = projects.find(p => p.id === selectedProject);
    const weeklyDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + i);
      weeklyDates.push(d.toISOString().split("T")[0]);
    }
    const attendance = weeklyDates.filter(date => {
      const record = selectedProjectData?.labourAttendance?.find(a => a.labourId === labour.id && a.date === date);
      return record?.status === "Present";
    });
    const daysPresent = attendance.length;
    const totalPayment = daysPresent * labour.dailyWage;
    return { daysPresent, totalPayment };
  };

  const sendQuote = async (enquiryId) => {
    if (!quoteResponse.amount) {
      alert("Please enter quote amount");
      return;
    }
    try {
      const res = await fetch(API_BASE + "/api/enquiry/" + enquiryId + "/quote", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-code": providerUserCode
        },
        body: JSON.stringify({
  quotedAmount: Number(quoteResponse.amount),
  quoteMessage:
    quoteResponse.message || "Please contact us for quote details",
  quoteValidityDate: quoteResponse.deliveryDate || "",
  paymentTerms: quoteResponse.paymentTerms || "",
  gstIncluded: quoteResponse.gstIncluded,
  transportCharges: Number(quoteResponse.transportCharges) || 0
})
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Quote could not be sent");
        return;
      }
      setMyQuotes([...myQuotes, {
        id: myQuotes.length + 1,
        projectType: enquiries.find(e => e.id === enquiryId)?.projectType,
        quoteAmount: parseFloat(quoteResponse.amount),
        validity: quoteResponse.deliveryDate,
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0]
      }]);
      setShowQuoteModal(false);
      setQuoteResponse({
  amount: "",
  message: "",
  deliveryDate: "",
  paymentTerms: "",
  gstIncluded: false,
  transportCharges: ""
});
      await fetchLiveEnquiries();
      alert("Quote sent successfully!");
    } catch (err) {
      console.log("Quote update failed", err);
      alert("Quote could not be sent");
    }
  };

  const whatsAppResponse = (enquiry: any) => {
    const raw = String(enquiry.customerMobile || enquiry.buyerPhone || enquiry.phone || enquiry.mobile || "").replace(/\D/g, "");
    const cleanNum = raw.replace(/^91/, "");
    if (!cleanNum) {
      alert("No valid phone number found for WhatsApp sharing.");
      return;
    }
    const message = `🏗️ BUILDMITRA INFRA — ENQUIRY & QUOTATION\nNo:378, JP Nagar 9th Phase, Bengaluru- 560062 | 📱 +91 76769 42386\n\nHello ${enquiry.customerName || enquiry.buyerName || "Customer"},\n\nThank you for your enquiry regarding ${enquiry.projectType || enquiry.itemName || "Construction Work"} at ${enquiry.location || "Bengaluru"}.\n\nView Details: ${window.location.origin}/quick-quote?enquiryCode=${enquiry.enquiryCode || ""}\n\nRegards,\nBuildMitra Infra & Construction Suite`;
    window.open(`https://wa.me/91${cleanNum}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareProgress = (project: any) => {
    const raw = String(project.clientMobile || project.buyerPhone || project.phone || "").replace(/\D/g, "");
    const cleanNum = raw.replace(/^91/, "");
    if (!cleanNum) {
      alert("No valid client phone number found for WhatsApp sharing.");
      return;
    }
    const message = `🏗️ BUILDMITRA INFRA — PROJECT UPDATE\nProject: ${project.name} (${project.projectUniqueId || project.id})\nProgress: ${project.progress}%\nStatus: ${project.status}\n\nView Dashboard: ${window.location.origin}/buyer-dashboard\n\nBuildMitra Infra | 📱 +91 76769 42386`;
    window.open(`https://wa.me/91${cleanNum}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const generateReport = () => {
    let data = [];
    const selectedProjectData = projects.find(p => String(p.id) === String(reportFilters.projectId || selectedProject));
    
    if (reportType === "milestones") {
      data = (selectedProjectData?.milestones || []).filter((m) =>
        (!reportFilters.milestone || String(m.name || "").toLowerCase().includes(reportFilters.milestone.toLowerCase())) &&
        (!reportFilters.startDate || m.endDate >= reportFilters.startDate) && (!reportFilters.endDate || m.endDate <= reportFilters.endDate)
      ).map(m => ({
        "Project ID": selectedProjectData?.projectUniqueId,
        "Milestone": m.name,
        "Category": m.category,
        "Start Date": m.startDate,
        "End Date": m.endDate,
        "Duration Days": m.durationDays,
        "Payment Percent": m.paymentPercent,
        "Amount": m.amount,
        "Status": m.status,
        "Approval": m.ownerApproved ? "Approved" : m.ownerRejected ? "Rejected" : "Pending",
        "Invoice": m.invoiceRaised ? "Raised" : "Not Raised",
        "Invoice Amount": m.invoiceAmount,
        "Payment Status": m.paymentStatus
      }));
    } else if (reportType === "payments") {
      data = (selectedProjectData?.milestones || [])
        .filter(m => m.invoiceRaised)
        .filter(m => {
          if (reportFilters.startDate && m.invoiceDate < reportFilters.startDate) return false;
          if (reportFilters.endDate && m.invoiceDate > reportFilters.endDate) return false;
          if (reportFilters.payment && !String(m.paymentStatus || "").toLowerCase().includes(reportFilters.payment.toLowerCase())) return false;
          return true;
        })
        .map(m => ({
          "Project ID": selectedProjectData?.projectUniqueId,
          "Project": selectedProjectData?.name,
          "Milestone": m.name,
          "Invoice Amount": m.invoiceAmount,
          "Invoice Date": m.invoiceDate,
          "Status": m.paymentStatus,
          "Paid Date": m.paidDate
        }));
    } else if (reportType === "pending") {
      const pendingMilestones = (selectedProjectData?.milestones || [])
        .filter(m => m.invoiceRaised && m.paymentStatus === "Due")
        .map(m => ({
          "Project ID": selectedProjectData?.projectUniqueId,
          "Project": selectedProjectData?.name,
          "Milestone": m.name,
          "Amount Pending": m.invoiceAmount,
          "Status": m.status,
          "Invoice Date": m.invoiceDate,
          "Payment Status": m.paymentStatus
        }));
      data = pendingMilestones;
    } else if (reportType === "inventory" || reportType === "supplier") {
      data = (selectedProjectData?.inventory || []).filter((item) =>
        (!reportFilters.material || String(item.material || "").toLowerCase().includes(reportFilters.material.toLowerCase())) &&
        (!reportFilters.supplier || String(item.supplier || "").toLowerCase().includes(reportFilters.supplier.toLowerCase()))
      ).map((item) => ({ Material: item.material, Supplier: item.supplier, InvoiceNo: item.invoiceNo, InvoiceDate: item.invoiceDate, Ordered: item.orderedQty, Received: item.receivedQty, Consumed: item.consumedQty ?? item.consumed, Balance: item.balanceQty ?? item.balance, Unit: item.unit, Rate: item.rate, Amount: item.amount }));
    } else if (reportType === "attendance") {
      data = (selectedProjectData?.labourAttendance || []).map((entry) => {
        const labour = (selectedProjectData?.labour || []).find((item) => String(item.id) === String(entry.labourId));
        return { Date: entry.date, Labour: labour?.name || entry.labourId, Category: labour?.role || "General", Status: entry.status };
      }).filter((entry) => !reportFilters.labour || String(entry.Labour || "").toLowerCase().includes(reportFilters.labour.toLowerCase()));
    } else if (reportType === "quotations") {
      data = (selectedProjectData?.quotations || []).filter((quote) => !reportFilters.quotation || String(quote.quoteNo || quote.description || "").toLowerCase().includes(reportFilters.quotation.toLowerCase())).map((quote) => ({ QuoteNo: quote.quoteNo, Project: quote.projectName, Date: quote.date, Description: quote.description, Amount: quote.amount, Status: quote.status, Remarks: quote.remarks }));
    } else if (reportType === "extrawork") {
      data = (selectedProjectData?.extraWorks || []).filter((work) => !reportFilters.extraWork || String(work.description || work.type || "").toLowerCase().includes(reportFilters.extraWork.toLowerCase())).map((work) => ({ Date: work.date, Description: work.description, Type: work.type, Quantity: work.quantity, Unit: work.unit, Amount: work.amount, Status: work.status }));
    } else if (reportType === "labour" || reportType === "labourpayment") {
      const labourData = (selectedProjectData?.labour || []).filter((l) => !reportFilters.labour || String(l.name || l.role || "").toLowerCase().includes(reportFilters.labour.toLowerCase())).map(l => {
        const { daysPresent, totalPayment } = calculateWeeklyPayment(l);
        return {
          "Project ID": selectedProjectData?.projectUniqueId,
          "Project": selectedProjectData?.name,
          "Labour Name": l.name,
          "Role": l.role,
          "Daily Wage": l.dailyWage,
          "Days Present (Week)": daysPresent,
          "Weekly Payment": totalPayment,
          "Join Date": l.joinDate
        };
      });
      data = labourData;
    }
    exportProjectReport(reportType, selectedProjectData, data);
    alert("Report downloaded!");
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const totalOngoing = projects.filter(p => p.status !== "Completed").length;
  const totalEnquiries = enquiries.length;
  const totalPaymentsReceived = selectedProjectData?.milestones
    ?.filter((milestone) => milestone.paymentStatus === "Paid")
    .reduce((sum, milestone) => sum + Number(milestone.invoiceAmount || milestone.amount || 0), 0) || 0;
  const totalPendingAmount = selectedProjectData?.milestones
    ?.filter((milestone) => milestone.paymentStatus === "Due")
    .reduce((sum, milestone) => sum + Number(milestone.invoiceAmount || 0), 0) || 0;

  const weeklyDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    weeklyDates.push(d.toISOString().split("T")[0]);
  }

  // Site Progress Render (Media upload with category)
  const renderSiteProgress = () => {
    const siteMedia = selectedProjectData?.siteMedia || [];
    const progressMedia = siteMedia.filter(m => m.category === "progress");
    const documentMedia = siteMedia.filter(m => m.category === "document");
    const invoiceMedia = siteMedia.filter(m => m.category === "invoice");
    
    return React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setShowMediaModal(true), style: styles.button }, "+ Upload Photo/Video"),
        React.createElement("button", { onClick: () => { setMediaCategory("document"); setShowMediaModal(true); }, style: styles.buttonInfo }, "+ Upload Document"),
        React.createElement("button", { onClick: () => { setMediaCategory("invoice"); setShowMediaModal(true); }, style: styles.buttonWarning }, "+ Upload Invoice")
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "📸 Progress Photos & Videos - ", selectedProjectData?.name),
        React.createElement("div", { style: styles.mediaGrid },
          progressMedia.map(m => {
            const imgSrc = m.fileDataUrl || m.url || m.previewUrl || m.fileUrl;
            return React.createElement("div", { key: m.id, style: { ...styles.mediaCard, padding: "0", overflow: "hidden" } },
              imgSrc ? React.createElement("img", {
                src: imgSrc,
                alt: m.title || m.description || "Progress photo",
                style: { width: "100%", height: "140px", objectFit: "cover", cursor: "pointer" },
                onClick: () => window.open(imgSrc, "_blank")
              }) : React.createElement("div", { style: styles.mediaIcon }, m.type === "photo" ? "📷" : m.type === "video" ? "🎥" : "📄"),
              React.createElement("div", { style: { padding: "10px" } },
                React.createElement("div", { style: { fontWeight: "bold" } }, m.title || m.description),
                React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, m.date),
                React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, m.fileName || "Photo Record", m.fileSize ? ` (${Math.ceil(m.fileSize / 1024)} KB)` : ""),
                React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "space-between", alignItems: "center", marginTop: "8px" } },
                  imgSrc ? React.createElement("button", { onClick: () => window.open(imgSrc, "_blank"), style: { ...styles.buttonInfo, fontSize: "11px", padding: "4px 8px" } }, "👁️ Open Photo")
                         : React.createElement("span", { style: { fontSize: "11px", color: "#666" } }, "Cloud file pending"),
                  React.createElement("button", { onClick: () => deleteSiteMedia(m.id), style: { ...styles.buttonDanger, fontSize: "11px", padding: "4px 8px" } }, "Delete")
                )
              )
            );
          })
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "📄 Documents & Reports"),
        React.createElement("div", { style: styles.mediaGrid },
          documentMedia.map(m =>
            React.createElement("div", { key: m.id, style: styles.mediaCard },
              React.createElement("div", { style: styles.mediaIcon }, "📄"),
              React.createElement("div", { style: { fontWeight: "bold" } }, m.title),
              React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, m.date),
              React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, m.fileName || "Metadata record", " — cloud upload pending")
            )
          )
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "💰 Invoices"),
        React.createElement("div", { style: styles.mediaGrid },
          invoiceMedia.map(m =>
            React.createElement("div", { key: m.id, style: styles.mediaCard },
              React.createElement("div", { style: styles.mediaIcon }, "💰"),
              React.createElement("div", { style: { fontWeight: "bold" } }, m.title),
              React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, m.date),
              React.createElement("div", { style: { fontSize: "12px", color: "#2d6a4f" } }, "Amount: ₹", m.amount?.toLocaleString()),
              React.createElement("div", { style: { fontSize: "11px", color: "#666", marginTop: "8px" } }, m.fileName ? "Cloud file pending" : "Invoice metadata")
            )
          )
        )
      ),
      React.createElement("div", { style: { ...styles.card, backgroundColor: "#e8f5e9", textAlign: "center" } },
        React.createElement("strong", null, "🔗 Project Unique ID: ", selectedProjectData?.projectUniqueId),
        React.createElement("p", { style: { fontSize: "12px", marginTop: "8px" } }, "Share this ID with buyer. They can view all uploaded media in their dashboard.")
      )
    );
  };

  // Portfolio Render with Edit/Delete
  const renderPortfolio = () => {
    return React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px" } },
        React.createElement("button", { onClick: () => { setEditPortfolioId(null); setPortfolioData({ name: "", clientName: "", location: "", completionDate: "", totalValue: "", testimonial: "" }); setShowPortfolioModal(true); }, style: styles.button }, "+ Add Portfolio")
      ),
      React.createElement("div", { style: styles.grid3 },
        completedProjects.map(p =>
          React.createElement("div", { key: p.id, style: { border: "1px solid #ddd", borderRadius: "12px", padding: "16px", position: "relative" } },
            React.createElement("div", { style: { position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px" } },
              React.createElement("button", { onClick: () => editPortfolio(p), style: { backgroundColor: "#ffc107", color: "#333", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" } }, "✏️"),
              React.createElement("button", { onClick: () => deletePortfolio(p.id), style: { backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" } }, "🗑️")
            ),
            React.createElement("div", { style: { width: "100%", height: "150px", backgroundColor: "#e9ecef", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" } }, "🏗️"),
            React.createElement("h4", { style: { margin: "12px 0 4px" } }, p.name),
            React.createElement("p", { style: { margin: "4px 0", fontSize: "12px", color: "#666" } }, "Client: ", p.clientName, " | ", p.location),
            React.createElement("p", { style: { margin: "4px 0", fontSize: "12px" } }, "Value: ₹", (p.totalValue/100000).toFixed(2), "L | Completed: ", p.completionDate),
            React.createElement("p", { style: { margin: "8px 0 0", fontSize: "11px", fontStyle: "italic" } }, "\"", p.testimonial, "\"")
          )
        )
      )
    );
  };

  const renderMilestones = () => {
    const milestones = selectedProjectData?.milestones || [];
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: styles.cardTitle }, "🎯 Civil Milestone Timeline - ", selectedProjectData?.name),
        React.createElement("div", { style: { color: "#666", fontSize: "12px" } }, "Total payment weight: ", milestones.reduce((sum, item) => sum + Number(item.paymentPercent || 0), 0), "%")
      ),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "#"),
              React.createElement("th", { style: styles.th }, "Milestone"),
              React.createElement("th", { style: styles.th }, "Schedule"),
              React.createElement("th", { style: styles.th }, "Weight"),
              React.createElement("th", { style: styles.th }, "Amount"),
              React.createElement("th", { style: styles.th }, "Status"),
              React.createElement("th", { style: styles.th }, "Invoice"),
              React.createElement("th", { style: styles.th }, "Payment"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            milestones.map((m, index) =>
              React.createElement("tr", { key: m.id },
                React.createElement("td", { style: styles.td }, index + 1),
                React.createElement("td", { style: styles.td }, React.createElement("strong", null, m.name), React.createElement("br", null), React.createElement("small", { style: { color: "#666" } }, m.category)),
                React.createElement("td", { style: styles.td }, m.startDate, " to ", m.endDate, React.createElement("br", null), m.durationDays, " days"),
                React.createElement("td", { style: styles.td }, m.paymentPercent, "%"),
                React.createElement("td", { style: styles.td }, "₹", (m.amount/1000).toFixed(0), "K"),
                React.createElement("td", { style: styles.td }, m.ownerApproved || m.invoiceRaised || m.paymentStatus === "Paid"
                  ? React.createElement("span", null, m.status)
                  : React.createElement("select", { value: m.status || "Pending", onChange: (e) => updateMilestoneStatus(m.id, e.target.value), style: styles.select },
                    React.createElement("option", { value: "Pending" }, "Pending"),
                    React.createElement("option", { value: "In Progress" }, "In Progress"),
                    React.createElement("option", { value: "Completed" }, "Completed")
                  )),
                React.createElement("td", { style: styles.td }, m.invoiceRaised ? `✅ Raised ₹${Number(m.invoiceAmount).toLocaleString()}` : m.ownerApproved ? "Ready to raise" : "Awaiting approval"),
                React.createElement("td", { style: styles.td }, m.paymentStatus || "Not Due"),
                React.createElement("td", { style: styles.td },
                  m.ownerRejected && React.createElement("div", { style: { color: "#dc3545", marginBottom: "4px" } }, "Rejected: ", m.remarks || "No reason supplied"),
                  m.ownerApproved && !m.invoiceRaised && React.createElement("button", { onClick: () => { setSelectedMilestone(m); setInvoiceAmount(String(m.amount)); setShowInvoiceModal(true); }, style: styles.buttonWarning }, "Raise Invoice")
                )
              )
            )
          )
        )
      )
    );
  };

  const renderPayments = () => {
    const payments = (selectedProjectData?.milestones || []).filter(m => m.invoiceRaised);
    return React.createElement("div", null,
      React.createElement("div", { style: { ...styles.card, borderLeft: "4px solid #8b5cf6", backgroundColor: "#f5f3ff" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("div", { style: { fontWeight: "bold", color: "#6d28d9", fontSize: "14px" } }, "🔒 READ-ONLY ACCESS (Buyer Permitted Payment View)"),
          React.createElement("span", { style: { fontSize: "12px", backgroundColor: "#ddd6fe", color: "#5b21b6", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" } }, "No Edit Privileges")
        ),
        React.createElement("p", { style: { margin: "6px 0 0", fontSize: "12px", color: "#4c1d95" } }, "Contractor has read-only visibility into buyer payment records upon explicit buyer permission. Buyer: ", selectedProjectData?.buyerName || "Buyer", " (", selectedProjectData?.buyerCode || "BUY-Code", ")")
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("div", { style: styles.cardTitle }, "💰 Payment Summary - ", selectedProjectData?.name),
          React.createElement("div", { style: { color: "#666", fontSize: "12px" } }, "Payments are released by the buyer")
        ),
        React.createElement("div", { style: styles.grid3 },
          React.createElement("div", { style: { textAlign: "center", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px" } },
            React.createElement("strong", null, "Total Contract"), React.createElement("br", null), "₹", (selectedProjectData?.totalAmount/100000).toFixed(2), "L"
          ),
          React.createElement("div", { style: { textAlign: "center", padding: "12px", backgroundColor: "#d1fae5", borderRadius: "8px" } },
            React.createElement("strong", null, "Received"), React.createElement("br", null), "₹", (totalPaymentsReceived/100000).toFixed(2), "L"
          ),
          React.createElement("div", { style: { textAlign: "center", padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px" } },
            React.createElement("strong", null, "Pending"), React.createElement("br", null), "₹", (totalPendingAmount/100000).toFixed(2), "L"
          )
        ),
        selectedProjectData?.agreementUrl && React.createElement("div", { style: { marginTop: "16px", padding: "12px", backgroundColor: "#e8f5e9", borderRadius: "8px", textAlign: "center" } },
          React.createElement("a", { href: selectedProjectData.agreementUrl, target: "_blank", style: { color: "#2d6a4f", fontSize: "14px" } }, "📄 View Agreement Document")
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "💰 Payment History"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Date"),
                React.createElement("th", { style: styles.th }, "Milestone"),
                React.createElement("th", { style: styles.th }, "Amount"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Mode / Reference"),
                React.createElement("th", { style: styles.th }, "Remarks")
              )
            ),
            React.createElement("tbody", null,
              payments.map(p =>
                React.createElement("tr", { key: p.id },
                  React.createElement("td", { style: styles.td }, p.invoiceDate),
                  React.createElement("td", { style: styles.td }, p.name),
                  React.createElement("td", { style: styles.td }, "₹", (Number(p.invoiceAmount)/1000).toFixed(0), "K"),
                  React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: p.paymentStatus === "Paid" ? "#d1fae5" : "#fff3cd", color: p.paymentStatus === "Paid" ? "#065f46" : "#856404" } }, p.paymentStatus), p.paidDate ? ` (${p.paidDate})` : ""),
                  React.createElement("td", { style: styles.td }, p.paymentMode || "-", p.paymentReference ? ` / ${p.paymentReference}` : ""),
                  React.createElement("td", { style: styles.td }, p.paymentRemarks || "-")
                )
              )
            )
          )
        )
      )
    );
  };

  const renderReports = () => {
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "📊 Generate Reports"),
      React.createElement("div", { style: styles.row2 },
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Report Type"),
          React.createElement("select", { value: reportType, onChange: (e) => setReportType(e.target.value), style: styles.select },
            React.createElement("option", { value: "milestones" }, "Milestone Progress Report"),
            React.createElement("option", { value: "payments" }, "Payments Received Report"),
            React.createElement("option", { value: "pending" }, "Pending Payments Report"),
            React.createElement("option", { value: "inventory" }, "Inventory Report"),
            React.createElement("option", { value: "supplier" }, "Supplier Report"),
            React.createElement("option", { value: "attendance" }, "Labour Attendance Report"),
            React.createElement("option", { value: "labourpayment" }, "Labour Payment Report"),
            React.createElement("option", { value: "extrawork" }, "Extra / Correction Works Report"),
            React.createElement("option", { value: "quotations" }, "Quotation Report")
          )
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Select Project"),
          React.createElement("select", { value: reportFilters.projectId, onChange: (e) => setReportFilters({...reportFilters, projectId: e.target.value}), style: styles.select },
            React.createElement("option", { value: "" }, "-- All Projects --"),
            projects.map(p => React.createElement("option", { key: p.id, value: p.id }, p.name, " (", p.projectUniqueId, ")"))
          )
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Start Date"),
          React.createElement("input", { type: "date", value: reportFilters.startDate, onChange: (e) => setReportFilters({...reportFilters, startDate: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "End Date"),
          React.createElement("input", { type: "date", value: reportFilters.endDate, onChange: (e) => setReportFilters({...reportFilters, endDate: e.target.value}), style: styles.input })
        )
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" } },
        React.createElement("input", { placeholder: "Material", value: reportFilters.material, onChange: (e) => setReportFilters({...reportFilters, material: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Supplier", value: reportFilters.supplier, onChange: (e) => setReportFilters({...reportFilters, supplier: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Labour", value: reportFilters.labour, onChange: (e) => setReportFilters({...reportFilters, labour: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Payment status", value: reportFilters.payment, onChange: (e) => setReportFilters({...reportFilters, payment: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Milestone", value: reportFilters.milestone, onChange: (e) => setReportFilters({...reportFilters, milestone: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Quotation", value: reportFilters.quotation, onChange: (e) => setReportFilters({...reportFilters, quotation: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Extra / correction work", value: reportFilters.extraWork, onChange: (e) => setReportFilters({...reportFilters, extraWork: e.target.value}), style: styles.input })
      ),
      React.createElement("div", { style: { display: "flex", gap: "12px", marginTop: "16px" } },
        React.createElement("button", { onClick: generateReport, style: { ...styles.buttonSuccess, flex: 1 } }, "📥 Download Excel Report"),
        React.createElement("button", { onClick: () => {
          const selectedProjectData = projects.find(p => String(p.id) === String(reportFilters.projectId || selectedProject));
          const milestones = selectedProjectData?.milestones || [];
          downloadBuildMitraPDF({
            documentTitle: `PROJECT REPORT - ${reportType.toUpperCase()}`,
            documentNo: selectedProjectData?.projectUniqueId || `BM-REP-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString().split("T")[0],
            projectName: selectedProjectData?.name || "Civil Project",
            buyerName: selectedProjectData?.clientName || "Buyer",
            contractorName: selectedProjectData?.contractorName || "Contractor",
            items: milestones.map((m: any, idx: number) => ({
              sno: idx + 1,
              description: `${m.name} (${m.category || "Civil Work"})`,
              quantity: 1,
              unit: "Job",
              rate: m.amount || 0,
              amount: m.amount || 0,
              notes: `Status: ${m.status || "Pending"}`
            }))
          });
        }, style: { ...styles.buttonInfo, flex: 1 } }, "🖨️ Download PDF Letterhead Report")
      )
    );
  };

  const renderLabour = () => {
    const projectLabour = selectedProjectData?.labour || [];
    const totalWeeklyPayment = projectLabour.reduce((sum, labour) => {
      const { totalPayment } = calculateWeeklyPayment(labour);
      return sum + totalPayment;
    }, 0);
    
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const geofenceAttendance = [
      { id: "LAB-101", name: "Ramesh Kumar", role: "Civil Mason", checkIn: "08:30 AM", checkOut: "05:30 PM", distance: "8m", status: "GPS Verified ✅", wage: 950, approved: "Approved" },
      { id: "LAB-102", name: "Suresh Naik", role: "Barbender Steel", checkIn: "08:45 AM", checkOut: "05:30 PM", distance: "12m", status: "GPS Verified ✅", wage: 900, approved: "Approved" },
      { id: "LAB-103", name: "Manjunath B", role: "Helper", checkIn: "09:00 AM", checkOut: "05:30 PM", distance: "15m", status: "GPS Verified ✅", wage: 650, approved: "Approved" },
      { id: "LAB-104", name: "Ganesh Gouda", role: "Tile Laying Mason", checkIn: "08:30 AM", checkOut: "05:45 PM", distance: "6m", status: "GPS Verified ✅", wage: 1000, approved: "Approved" },
      { id: "LAB-105", name: "Shiva R", role: "Helper", checkIn: "09:10 AM", checkOut: "05:30 PM", distance: "185m", status: "Out of Fence ⚠️", wage: 650, approved: "Flagged" }
    ];

    return React.createElement("div", null,
      React.createElement("div", { style: { ...styles.card, borderLeft: "4px solid #14b8a6", backgroundColor: "#f0fdf4" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" } },
          React.createElement("div", null,
            React.createElement("h3", { style: { margin: 0, color: "#0f766e", fontSize: "16px" } }, "📍 Yesterday's Labour Geofence Attendance Report"),
            React.createElement("div", { style: { fontSize: "12px", color: "#115e59", marginTop: "4px" } }, "Date: ", React.createElement("strong", null, yesterdayDate), " • Site Geofence Boundary: ", React.createElement("strong", null, "150m Radius Active (12.9716° N, 77.5946° E)"))
          ),
          React.createElement("div", { style: { display: "flex", gap: "8px" } },
            React.createElement("span", { style: { backgroundColor: "#ccfbf1", color: "#0f766e", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" } }, "92.8% Verified"),
            React.createElement("button", { onClick: () => alert("Exported Yesterday's Geofence Audit CSV"), style: styles.buttonSuccess }, "📥 Export CSV")
          )
        ),
        React.createElement("div", { style: styles.grid4 },
          React.createElement("div", { style: { backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #b2f5ea" } }, React.createElement("div", { style: { fontSize: "11px", color: "#555" } }, "Total Logged Labours"), React.createElement("div", { style: { fontSize: "20px", fontWeight: "bold", color: "#0f766e" } }, "28 Workers")),
          React.createElement("div", { style: { backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #b2f5ea" } }, React.createElement("div", { style: { fontSize: "11px", color: "#555" } }, "Geofence Verified (GPS)"), React.createElement("div", { style: { fontSize: "20px", fontWeight: "bold", color: "#28a745" } }, "26 Verified")),
          React.createElement("div", { style: { backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #b2f5ea" } }, React.createElement("div", { style: { fontSize: "11px", color: "#555" } }, "Yesterday Wage Bill"), React.createElement("div", { style: { fontSize: "20px", fontWeight: "bold", color: "#2563eb" } }, "₹14,850")),
          React.createElement("div", { style: { backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #b2f5ea" } }, React.createElement("div", { style: { fontSize: "11px", color: "#555" } }, "Supervisor Approval"), React.createElement("div", { style: { fontSize: "13px", fontWeight: "bold", color: "#d97706", marginTop: "4px" } }, "Approved ✅ (Eng. Rajesh)"))
        ),
        React.createElement("div", { style: { marginTop: "14px", overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null, React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Worker ID & Name"),
              React.createElement("th", { style: styles.th }, "Trade / Role"),
              React.createElement("th", { style: styles.th }, "Check-In"),
              React.createElement("th", { style: styles.th }, "Check-Out"),
              React.createElement("th", { style: styles.th }, "Geofence Dist"),
              React.createElement("th", { style: styles.th }, "GPS Verification"),
              React.createElement("th", { style: styles.th }, "Daily Wage"),
              React.createElement("th", { style: styles.th }, "Status")
            )),
            React.createElement("tbody", null, geofenceAttendance.map(item => React.createElement("tr", { key: item.id },
              React.createElement("td", { style: styles.td }, React.createElement("strong", null, item.name), React.createElement("div", { style: { fontSize: "10px", color: "#666" } }, item.id)),
              React.createElement("td", { style: styles.td }, item.role),
              React.createElement("td", { style: styles.td }, item.checkIn),
              React.createElement("td", { style: styles.td }, item.checkOut),
              React.createElement("td", { style: styles.td }, item.distance),
              React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: item.status.includes("Verified") ? "#d1fae5" : "#fee2e2", color: item.status.includes("Verified") ? "#065f46" : "#991b1b" } }, item.status)),
              React.createElement("td", { style: styles.td }, "₹", item.wage),
              React.createElement("td", { style: styles.td }, item.approved)
            )))
          )
        )
      ),
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setShowLabourModal(true), style: styles.button }, "+ Add Labour"),
        React.createElement("input", { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), style: { ...styles.input, width: "auto" } })
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "👷 Labour Management - ", selectedProjectData?.name),
        React.createElement("div", { style: styles.grid2 },
          React.createElement("div", null, React.createElement("strong", null, "Total Labours: "), projectLabour.length),
          React.createElement("div", null, React.createElement("strong", null, "Weekly Labour Cost: "), "₹", (totalWeeklyPayment/1000).toFixed(2), "K")
        ),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Name"),
                React.createElement("th", { style: styles.th }, "Role"),
                React.createElement("th", { style: styles.th }, "Daily Wage"),
                React.createElement("th", { style: styles.th }, "Mon"),
                React.createElement("th", { style: styles.th }, "Tue"),
                React.createElement("th", { style: styles.th }, "Wed"),
                React.createElement("th", { style: styles.th }, "Thu"),
                React.createElement("th", { style: styles.th }, "Fri"),
                React.createElement("th", { style: styles.th }, "Sat"),
                React.createElement("th", { style: styles.th }, "Sun"),
                React.createElement("th", { style: styles.th }, "Days"),
                React.createElement("th", { style: styles.th }, "Payment")
              )
            ),
            React.createElement("tbody", null,
              projectLabour.map(labour => {
                const { daysPresent, totalPayment } = calculateWeeklyPayment(labour);
                return React.createElement("tr", { key: labour.id },
                  React.createElement("td", { style: styles.td }, labour.name),
                  React.createElement("td", { style: styles.td }, labour.role),
                  React.createElement("td", { style: styles.td }, "₹", labour.dailyWage),
                  weeklyDates.map((date, idx) => {
                    const status = getAttendanceStatus(labour.id, date);
                    return React.createElement("td", { key: idx, style: styles.td },
                      React.createElement("button", { onClick: () => toggleAttendance(labour.id, date), style: status === "Present" ? styles.presentBtn : styles.absentBtn },
                        status === "Present" ? "✓" : "✗"
                      )
                    );
                  }),
                  React.createElement("td", { style: styles.td }, daysPresent),
                  React.createElement("td", { style: styles.td }, "₹", totalPayment.toLocaleString())
                );
              })
            )
          )
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "💰 Labour Payment Summary"),
        React.createElement("div", { style: styles.grid3 },
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } },
            React.createElement("strong", null, "This Week"), React.createElement("br", null), "₹", (totalWeeklyPayment/1000).toFixed(2), "K"
          ),
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } },
            React.createElement("strong", null, "This Month"), React.createElement("br", null), "₹", (totalWeeklyPayment * 4 / 1000).toFixed(2), "K"
          ),
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } },
            React.createElement("button", { style: styles.buttonSuccess }, "Process Payments")
          )
        )
      )
    );
  };

  const renderOverview = () => {
    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" } },
          React.createElement("div", { style: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#2d6a4f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" } }, "🏗️"),
          React.createElement("div", null,
            React.createElement("h2", { style: { margin: 0 } }, contractorInfo.companyName),
            React.createElement("p", { style: { margin: "4px 0" } }, "👤 Owner: ", contractorInfo.ownerName, " | 📅 Since ", contractorInfo.since),
            React.createElement("p", { style: { margin: "4px 0" } }, "📞 ", contractorInfo.phone, " | 📧 ", contractorInfo.email),
            React.createElement("p", { style: { margin: "4px 0" } }, "📍 ", contractorInfo.address),
            React.createElement("div", { style: { marginTop: "8px" } }, "⭐ ", contractorInfo.rating, " ★ (Based on ", contractorInfo.completedProjects, " projects)")
          )
        )
      ),
      React.createElement("div", { style: styles.grid4 },
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, totalOngoing),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Ongoing Projects")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, contractorInfo.completedProjects),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Completed Projects")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #52b788 0%, #74c69d 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, "₹", (contractorInfo.totalRevenue/10000000).toFixed(1), "Cr"),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Total Revenue")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #ffb703 0%, #fb8500 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, totalEnquiries),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Enquiries")
        )
      ),
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "🏗️ Ongoing Projects"),
          projects.filter(p => p.status !== "Completed").map(p =>
            React.createElement("div", { key: p.id, style: { marginBottom: "16px", cursor: "pointer" }, onClick: () => { setSelectedProject(p.id); setActiveTab("projects"); } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
                React.createElement("div", null, React.createElement("strong", null, p.name), React.createElement("br", null), p.clientName),
                React.createElement("div", null, p.progress, "%")
              ),
              React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: p.progress + "%" } }))
            )
          )
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "💬 Recent Enquiries"),
          enquiries.slice(0, 3).map(e =>
            React.createElement("div", { key: e.id, style: { padding: "10px 0", borderBottom: "1px solid #eee" } },
              React.createElement("div", null, React.createElement("strong", null, e.projectType), " - ", e.location),
              React.createElement("div", { style: { fontSize: "12px", color: "#666" } }, e.customerName, " | Budget: ", e.budget),
              React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: e.status === "Pending" ? "#ffe8cc" : "#d1fae5", color: e.status === "Pending" ? "#cc7b00" : "#065f46" } }, e.status)
            )
          )
        )
      )
    );
  };

  const renderProjects = () => {
    return React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowProjectModal(true), style: styles.button }, "+ New Project"),
      React.createElement("div", { style: { marginTop: "16px" } },
        projects.map(p =>
          React.createElement("div", { key: p.id, style: { ...styles.card, cursor: "pointer" }, onClick: () => setSelectedProject(p.id) },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", flexWrap: "wrap" } },
              React.createElement("div", null,
                React.createElement("h3", { style: { margin: 0 } }, p.name),
                React.createElement("p", { style: { margin: "4px 0", fontSize: "13px", color: "#666" } }, p.sharedWithBuyer ? `Linked Buyer: ${p.buyerName || "Buyer"} (${p.buyerCode}) | ID: ${p.projectUniqueId}` : `Status: Private Project | ID: ${p.projectUniqueId}`)
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold", color: "#2d6a4f" } }, p.progress, "%"),
                React.createElement("div", null, p.status)
              )
            ),
            React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: p.progress + "%" } })),
            React.createElement("div", { style: { marginTop: "14px", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px" }, onClick: (e) => e.stopPropagation() },
              React.createElement("strong", null, "Buyer permissions"),
              React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px" } },
                Object.entries({ projectSummary: "Project summary", milestones: "Milestones", inventory: "Inventory", labour: "Labour", siteMedia: "Site progress/media", payments: "Payments", quotations: "Quotations", reports: "Reports" }).map(([key, label]) =>
                  React.createElement("label", { key, style: { display: "flex", gap: "6px", alignItems: "center" } },
                    React.createElement("input", { type: "checkbox", checked: p.permissions?.[key] !== false, onChange: (e) => { setSelectedProject(p.id); updatePermission(key, e.target.checked, p.id); } }), label
                  )
                )
              )
            ),
            React.createElement("div", { style: { marginTop: "12px", display: "flex", gap: "12px", flexWrap: "wrap" } },
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("milestones"); }, style: styles.buttonInfo }, "🎯 Milestones"),
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("siteprogress"); }, style: styles.buttonInfo }, "📷 Media"),
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("labour"); }, style: styles.buttonInfo }, "👷 Labour"),
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("inventory"); }, style: styles.buttonInfo }, "📦 Inventory"),
              React.createElement("button", { onClick: () => {
                const code = prompt("Enter Buyer Unique Code (BUY-xxxx)");
                if (!code) return;
                const buyer = findBuyerByCode(code);
                if (!buyer) {
                  alert("Buyer Unique Code not found. Ask buyer to register and share correct BUY code.");
                  return;
                }
                const updatedProjects = projects.map(project => project.id === p.id ? {
                  ...project,
                  buyerCode: buyer?.uniqueCode || "",
                  buyerName: buyer?.name || "",
                  sharedWithBuyer: true,
                  permissions: { ...DEFAULT_PROJECT_PERMISSIONS }
                } : project);
                setProjects(updatedProjects);
                const contractorId = loggedInUser?.userId ?? loggedInUser?.id;
                if (contractorId) saveProjectsForContractor(contractorId, updatedProjects);
                try {
                  const allProjects = JSON.parse(localStorage.getItem("buildmitraProjects") || "[]");
                  const mergedProjects = allProjects.filter((x) => String(x.id) !== String(p.id) && String(x.projectUniqueId || "") !== String(p.projectUniqueId || ""));
                  const linkedProject = updatedProjects.find((x) => String(x.id) === String(p.id));
                  localStorage.setItem("buildmitraProjects", JSON.stringify([...mergedProjects, linkedProject]));
                  window.dispatchEvent(new Event("buildmitraProjectsUpdated"));
                } catch (err) {
                  console.error("Project sync failed", err);
                }
                alert(`Project linked successfully to ${buyer.name} (${buyer.uniqueCode})`);
              }, style: styles.buttonSuccess }, p.sharedWithBuyer ? "🔁 Change Buyer" : "🔗 Share Project")
            )
          )
        )
      )
    );
  };

  const renderInventory = () => {
    const inventory = selectedProjectData?.inventory || [];
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: styles.cardTitle }, "📦 Inventory - ", selectedProjectData?.name || "Select a project"),
        selectedProjectData && React.createElement("button", { onClick: () => setShowInventoryModal(true), style: styles.button }, "+ Add Material")
      ),
      inventory.length === 0
        ? React.createElement("p", { style: { color: "#666" } }, "No inventory entries yet.")
        : React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null, React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Material"),
              React.createElement("th", { style: styles.th }, "Invoice Date"),
              React.createElement("th", { style: styles.th }, "Ordered"),
              React.createElement("th", { style: styles.th }, "Received"),
              React.createElement("th", { style: styles.th }, "Consumed"),
              React.createElement("th", { style: styles.th }, "Balance"),
              React.createElement("th", { style: styles.th }, "Rate / Amount"),
              React.createElement("th", { style: styles.th }, "Supplier / Invoice")
            )),
            React.createElement("tbody", null, inventory.map((item) => React.createElement("tr", { key: item.id },
              React.createElement("td", { style: styles.td }, item.material),
              React.createElement("td", { style: styles.td }, item.invoiceDate || item.receivedDate || "-"),
              React.createElement("td", { style: styles.td }, item.orderedQty ?? item.receivedQty, " ", item.unit),
              React.createElement("td", { style: styles.td }, item.receivedQty, " ", item.unit),
              React.createElement("td", { style: styles.td }, React.createElement("input", { type: "number", min: 0, max: item.receivedQty, value: item.consumedQty ?? item.consumed ?? 0, onChange: (e) => updateInventoryConsumed(item.id, e.target.value), style: { ...styles.input, margin: 0, width: "100px" } })),
              React.createElement("td", { style: styles.td }, item.balanceQty ?? item.balance, " ", item.unit),
              React.createElement("td", { style: styles.td }, "₹", Number(item.rate || 0).toLocaleString(), " / ₹", Number(item.amount || 0).toLocaleString()),
              React.createElement("td", { style: styles.td }, item.supplier || "-", item.invoiceNo ? ` / ${item.invoiceNo}` : "")
            )))
          )
        )
    );
  };

  const renderEnquiries = () => {
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "💬 Enquiries from Marketplace"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Date"),
              React.createElement("th", { style: styles.th }, "Enquiry Code"),
              React.createElement("th", { style: styles.th }, "Item / Requirement"),
              React.createElement("th", { style: styles.th }, "Location"),
              React.createElement("th", { style: styles.th }, "Customer Name"),
              React.createElement("th", { style: styles.th }, "Customer Phone"),
              React.createElement("th", { style: styles.th }, "Quantity + Unit"),
              React.createElement("th", { style: styles.th }, "Status"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            enquiriesLoading ? React.createElement("tr", null,
              React.createElement("td", { colSpan: 8, style: { ...styles.td, textAlign: "center", color: "#666" } }, "Loading enquiries...")
            ) : enquiries.length === 0 ? React.createElement("tr", null,
              React.createElement("td", { colSpan: 8, style: { ...styles.td, textAlign: "center", color: "#666" } }, "No enquiries received yet.")
            ) : enquiries.map(e =>
              React.createElement("tr", { key: e.id },
                React.createElement("td", { style: styles.td }, e.date),
                React.createElement("td", { style: styles.td }, e.enquiryCode || "-"),
                React.createElement("td", { style: styles.td }, e.projectType, React.createElement("br", null), React.createElement("span", { style: { fontSize: "10px", color: "#666" } }, e.requirement || "")),
                React.createElement("td", { style: styles.td }, e.location),
                React.createElement("td", { style: styles.td }, e.customerName),
                React.createElement("td", { style: styles.td }, e.customerMobile),
                React.createElement("td", { style: styles.td }, e.quantity || e.budget, e.unit ? " " + e.unit : ""),
                React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: String(e.status).toLowerCase() === "new" || e.status === "Pending" ? "#ffe8cc" : "#d1fae5", color: String(e.status).toLowerCase() === "new" || e.status === "Pending" ? "#cc7b00" : "#065f46" } }, e.status)),
                React.createElement("td", { style: styles.td },
                  (String(e.status).toLowerCase() === "new" || e.status === "Pending") && React.createElement("button", { onClick: () => { setSelectedEnquiry(e); setShowQuoteModal(true); }, style: styles.buttonSuccess }, "Send Quote"),
                  React.createElement("button", { onClick: () => whatsAppResponse(e), style: { ...styles.buttonInfo, marginLeft: "8px" } }, "📱 WhatsApp")
                )
              )
            )
          )
        )
      )
    );
  };

  const renderQuotes = () => {
    const projectQuotes = selectedProjectData?.quotations || [];
    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: styles.cardTitle }, "📋 Project Quotations - ", selectedProjectData?.name || "Select a project"),
        selectedProjectData && React.createElement("button", { onClick: () => setShowProjectQuoteModal(true), style: styles.button }, "+ Add Quotation")
      ),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null, React.createElement("tr", null,
            ["Quote No", "Project", "Date", "Description", "Amount", "Status", "Remarks"].map((label) => React.createElement("th", { key: label, style: styles.th }, label))
          )),
          React.createElement("tbody", null,
            projectQuotes.map((q) => React.createElement("tr", { key: q.id },
              React.createElement("td", { style: styles.td }, q.quoteNo), React.createElement("td", { style: styles.td }, q.projectName), React.createElement("td", { style: styles.td }, q.date),
              React.createElement("td", { style: styles.td }, q.description), React.createElement("td", { style: styles.td }, "₹", Number(q.amount).toLocaleString()), React.createElement("td", { style: styles.td }, q.status), React.createElement("td", { style: styles.td }, q.remarks || "-")
            )),
            projectQuotes.length === 0 && React.createElement("tr", null, React.createElement("td", { colSpan: 7, style: { ...styles.td, textAlign: "center" } }, "No project quotations yet."))
          )
        )
      )),
      React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Marketplace Quotes"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Date"),
              React.createElement("th", { style: styles.th }, "Project Type"),
              React.createElement("th", { style: styles.th }, "Quote Amount"),
              React.createElement("th", { style: styles.th }, "Valid Till"),
              React.createElement("th", { style: styles.th }, "Status")
            )
          ),
          React.createElement("tbody", null,
            myQuotes.map(q =>
              React.createElement("tr", { key: q.id },
                React.createElement("td", { style: styles.td }, q.createdAt),
                React.createElement("td", { style: styles.td }, q.projectType),
                React.createElement("td", { style: styles.td }, "₹", (q.quoteAmount/100000).toFixed(2), "L"),
                React.createElement("td", { style: styles.td }, q.validity),
                React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: q.status === "Active" ? "#d1fae5" : "#cfe2ff", color: q.status === "Active" ? "#065f46" : "#084298" } }, q.status))
              )
            )
          )
        )
      ))
    );
  };

  const addCompanyDoc = (e, docType) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const visibility = "Public";
    const doc = {
      id: "DOC-" + Date.now(),
      type: docType,
      title: file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: URL.createObjectURL(file),
      visibility,
      uploadedAt: new Date().toISOString().split("T")[0]
    };
    const updated = [...companyDocs, doc];
    setCompanyDocs(updated);
    localStorage.setItem("contractorCompanyDocs", JSON.stringify(updated));
    alert(docType + " uploaded successfully.");
  };

  const addCompanyQuote = () => {
    const title = prompt("Quotation title:", "Civil Construction Quotation");
    if (!title) return;
    const quoteType = prompt("Quote Type: Company Letterhead / BuildMitra Format", "BuildMitra Format") || "BuildMitra Format";
    const visibility = prompt("Visibility: Public / Private / Enquiry Only", "Public") || "Public";
    const quote = {
      id: "QTN-" + Date.now(),
      title,
      quoteType,
      fileName: title + ".pdf",
      visibility,
      uploadedAt: new Date().toISOString().split("T")[0]
    };
    const updated = [...companyQuotes, quote];
    setCompanyQuotes(updated);
    localStorage.setItem("contractorCompanyQuotes", JSON.stringify(updated));
    downloadBuildMitraPDF({
      documentTitle: title,
      documentNo: quote.id,
      date: quote.uploadedAt,
      contractorName: contractorInfo.companyName || "BuildMitra Contractor",
      contractorCode: contractorInfo.uniqueCode || "CON-000001",
      items: [
        { sno: 1, description: title, quantity: 1, unit: "Job", rate: 0, amount: 0 }
      ]
    });
    alert("Quotation created in BuildMitra Letterhead format.");
  };

  const saveCompanyProfile = () => {
    localStorage.setItem("contractorCompanyProfile", JSON.stringify(companyProfile));
    alert("Company Profile saved successfully.");
  };

  const renderCompanyProfile = () => {
    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "🏢 Company Profile"),
        React.createElement("p", { style: { color: "#666" } }, "This information will be used for your BuildMitra company profile. Confidential dashboard data like payments, revenue and internal projects will not be public."),

        React.createElement("h3", null, "Company Information"),
        React.createElement("input", { placeholder: "Company Name", value: companyProfile.companyName || "", onChange: e => setCompanyProfile({...companyProfile, companyName: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Owner / Managing Director", value: companyProfile.ownerName || "", onChange: e => setCompanyProfile({...companyProfile, ownerName: e.target.value}), style: styles.input }),
        React.createElement("select", { value: companyProfile.companyType || "Proprietorship", onChange: e => setCompanyProfile({...companyProfile, companyType: e.target.value}), style: styles.input },
          React.createElement("option", null, "Proprietorship"),
          React.createElement("option", null, "Partnership"),
          React.createElement("option", null, "Pvt Ltd"),
          React.createElement("option", null, "LLP")
        ),
        React.createElement("input", { placeholder: "Year of Establishment", value: companyProfile.establishedYear || "", onChange: e => setCompanyProfile({...companyProfile, establishedYear: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Experience / Years", value: companyProfile.experience || "", onChange: e => setCompanyProfile({...companyProfile, experience: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "No. of Employees", value: companyProfile.employees || "", onChange: e => setCompanyProfile({...companyProfile, employees: e.target.value}), style: styles.input }),
        React.createElement("textarea", { placeholder: "About Company", value: companyProfile.about || "", onChange: e => setCompanyProfile({...companyProfile, about: e.target.value}), style: { ...styles.input, minHeight: "80px" } }),

        React.createElement("h3", null, "Contact Details"),
        React.createElement("textarea", { placeholder: "Office Address", value: companyProfile.officeAddress || "", onChange: e => setCompanyProfile({...companyProfile, officeAddress: e.target.value}), style: styles.input }),
        React.createElement("textarea", { placeholder: "Branch Address", value: companyProfile.branchAddress || "", onChange: e => setCompanyProfile({...companyProfile, branchAddress: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Office Phone", value: companyProfile.officePhone || "", onChange: e => setCompanyProfile({...companyProfile, officePhone: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Mobile No. 1", value: companyProfile.mobile1 || "", onChange: e => setCompanyProfile({...companyProfile, mobile1: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Mobile No. 2", value: companyProfile.mobile2 || "", onChange: e => setCompanyProfile({...companyProfile, mobile2: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Email", value: companyProfile.email || "", onChange: e => setCompanyProfile({...companyProfile, email: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Website", value: companyProfile.website || "", onChange: e => setCompanyProfile({...companyProfile, website: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Google Map Link", value: companyProfile.googleMap || "", onChange: e => setCompanyProfile({...companyProfile, googleMap: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "Working Hours", value: companyProfile.workingHours || "", onChange: e => setCompanyProfile({...companyProfile, workingHours: e.target.value}), style: styles.input }),

        React.createElement("h3", null, "Legal / Verification"),
        React.createElement("input", { placeholder: "GST No.", value: companyProfile.gstNo || "", onChange: e => setCompanyProfile({...companyProfile, gstNo: e.target.value}), style: styles.input }),
        React.createElement("input", { placeholder: "PAN No.", value: companyProfile.panNo || "", onChange: e => setCompanyProfile({...companyProfile, panNo: e.target.value}), style: styles.input }),

        React.createElement("h3", null, "Visibility"),
        React.createElement("select", { value: companyProfile.visibility || "Public", onChange: e => setCompanyProfile({...companyProfile, visibility: e.target.value}), style: styles.input },
          React.createElement("option", null, "Public"),
          React.createElement("option", null, "Private"),
          React.createElement("option", null, "Enquiry Only")
        ),

        React.createElement("h3", null, "Documents Upload"),
        React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" } },
          React.createElement("label", { style: styles.buttonInfo }, "+ Company Profile PDF", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx", onChange: (e) => addCompanyDoc(e, "Company Profile PDF"), style: { display: "none" } })),
          React.createElement("label", { style: styles.buttonInfo }, "+ Brochure", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx", onChange: (e) => addCompanyDoc(e, "Brochure"), style: { display: "none" } })),
          React.createElement("label", { style: styles.buttonInfo }, "+ GST", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => addCompanyDoc(e, "GST Certificate"), style: { display: "none" } })),
          React.createElement("label", { style: styles.buttonInfo }, "+ PAN", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => addCompanyDoc(e, "PAN Card"), style: { display: "none" } })),
          React.createElement("label", { style: styles.buttonInfo }, "+ Trade Licence", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => addCompanyDoc(e, "Trade Licence"), style: { display: "none" } })),
          React.createElement("label", { style: styles.buttonInfo }, "+ MSME", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => addCompanyDoc(e, "MSME Certificate"), style: { display: "none" } })),
          React.createElement("label", { style: styles.buttonInfo }, "+ ISO", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => addCompanyDoc(e, "ISO Certificate"), style: { display: "none" } })),
          React.createElement("label", { style: styles.buttonInfo }, "+ Awards", React.createElement("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => addCompanyDoc(e, "Awards / Certificates"), style: { display: "none" } }))
        ),
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Type"),
              React.createElement("th", { style: styles.th }, "Title"),
              React.createElement("th", { style: styles.th }, "File"),
              React.createElement("th", { style: styles.th }, "Visibility"),
              React.createElement("th", { style: styles.th }, "Date")
            )
          ),
          React.createElement("tbody", null,
            companyDocs.map(d => React.createElement("tr", { key: d.id },
              React.createElement("td", { style: styles.td }, d.type),
              React.createElement("td", { style: styles.td }, d.title),
              React.createElement("td", { style: styles.td }, d.fileName),
              React.createElement("td", { style: styles.td }, d.visibility),
              React.createElement("td", { style: styles.td }, d.uploadedAt)
            ))
          )
        ),

        React.createElement("h3", null, "Quotation Upload"),
        React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" } },
          React.createElement("button", { onClick: addCompanyQuote, style: styles.buttonSuccess }, "+ Upload Own Letterhead Quote"),
          React.createElement("button", { onClick: addCompanyQuote, style: styles.button }, "+ BuildMitra Format Quote")
        ),
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Quotation"),
              React.createElement("th", { style: styles.th }, "Type"),
              React.createElement("th", { style: styles.th }, "File"),
              React.createElement("th", { style: styles.th }, "Visibility"),
              React.createElement("th", { style: styles.th }, "Date")
            )
          ),
          React.createElement("tbody", null,
            companyQuotes.map(q => React.createElement("tr", { key: q.id },
              React.createElement("td", { style: styles.td }, q.title),
              React.createElement("td", { style: styles.td }, q.quoteType),
              React.createElement("td", { style: styles.td }, q.fileName),
              React.createElement("td", { style: styles.td }, q.visibility),
              React.createElement("td", { style: styles.td }, q.uploadedAt)
            ))
          )
        ),

        React.createElement("button", { onClick: saveCompanyProfile, style: { ...styles.buttonSuccess, width: "100%", marginTop: "12px" } }, "Save Company Profile")
      )
    );
  };

  const renderLabourAttendance = () => {
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    // Sample Geofence & Punch Attendance Data
    const geofenceAttendanceLog = [
      { id: "LAB-1001", name: "Ramesh Kumar", mobile: "9876543210", category: "Civil Mason", prjId: "1", prjName: "Green Valley Villa", prjCode: "PRJ-101", checkIn: "08:30 AM", checkOut: "05:30 PM", distance: "8m", status: "GPS Verified ✅", wage: 950, otHours: 1.5, approved: "Approved" },
      { id: "LAB-1002", name: "Suresh Naik", mobile: "9123456789", category: "Barbender Steel", prjId: "1", prjName: "Green Valley Villa", prjCode: "PRJ-101", checkIn: "08:45 AM", checkOut: "05:30 PM", distance: "12m", status: "GPS Verified ✅", wage: 900, otHours: 0, approved: "Approved" },
      { id: "LAB-1003", name: "Manjunath B", mobile: "9900112233", category: "Helper", prjId: "2", prjName: "Skyline Towers", prjCode: "PRJ-102", checkIn: "09:00 AM", checkOut: "05:30 PM", distance: "15m", status: "GPS Verified ✅", wage: 650, otHours: 2, approved: "Approved" },
      { id: "LAB-1004", name: "Ganesh Gouda", mobile: "9811223344", category: "Tile Laying Mason", prjId: "1", prjName: "Green Valley Villa", prjCode: "PRJ-101", checkIn: "08:30 AM", checkOut: "05:45 PM", distance: "6m", status: "GPS Verified ✅", wage: 1000, otHours: 1, approved: "Approved" },
      { id: "LAB-1005", name: "Venkatesh P", mobile: "9766554433", category: "Plastering Mason", prjId: "2", prjName: "Skyline Towers", prjCode: "PRJ-102", checkIn: "08:15 AM", checkOut: "05:30 PM", distance: "14m", status: "GPS Verified ✅", wage: 950, otHours: 0, approved: "Approved" },
      { id: "LAB-1006", name: "Shiva R", mobile: "9988776655", category: "Helper", prjId: "1", prjName: "Green Valley Villa", prjCode: "PRJ-101", checkIn: "09:10 AM", checkOut: "05:30 PM", distance: "185m", status: "Out of Boundary ⚠️", wage: 650, otHours: 0, approved: "Flagged" }
    ];

    // Apply Filters
    const filteredAttendanceLog = geofenceAttendanceLog.filter(item => {
      if (labourFilterProject && String(item.prjId) !== String(labourFilterProject) && !item.prjCode.toLowerCase().includes(labourFilterProject.toLowerCase()) && !item.prjName.toLowerCase().includes(labourFilterProject.toLowerCase())) return false;
      if (labourFilterWorker && !item.name.toLowerCase().includes(labourFilterWorker.toLowerCase()) && !item.id.toLowerCase().includes(labourFilterWorker.toLowerCase())) return false;
      return true;
    });

    return React.createElement("div", null,
      // SUB-TAB BAR
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", backgroundColor: "#fff", padding: "8px 16px", borderRadius: "10px", border: "1px solid #ddd" } },
        React.createElement("button", {
          onClick: () => setLabourSubTab("master"),
          style: {
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: labourSubTab === "master" ? "#2d6a4f" : "transparent",
            color: labourSubTab === "master" ? "#fff" : "#666"
          }
        }, "📋 Sub-Tab 1: Labour Master (16 Fields & Punch Links)"),
        React.createElement("button", {
          onClick: () => setLabourSubTab("attendance"),
          style: {
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: labourSubTab === "attendance" ? "#0d9488" : "transparent",
            color: labourSubTab === "attendance" ? "#fff" : "#666"
          }
        }, "📍 Sub-Tab 2: Attendance & Geofence Reports")
      ),

      labourSubTab === "master" ? (
        // SUB-TAB 1: LABOUR MASTER LIST WITH INLINE UNIFORM FORM
        React.createElement("div", null,
          React.createElement("div", { style: { ...styles.card, borderLeft: "5px solid #2d6a4f", backgroundColor: "#f8faf9", marginBottom: "16px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" } },
              React.createElement("div", null,
                React.createElement("h2", { style: { margin: 0, color: "#2d6a4f", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" } },
                  "👷 Labour Master Registration & Mobile Attendance Link Center"
                ),
                React.createElement("div", { style: { fontSize: "13px", color: "#555", marginTop: "4px" } },
                  "One-time labour master registration with salary mode, PF, ESI, perks, and mapped attendance punch links."
                )
              ),
              React.createElement("button", { onClick: () => setShowLabourModal(true), style: { ...styles.buttonSuccess, fontWeight: "bold", fontSize: "14px" } }, "+ Open Registration Popup Modal")
            ),

            React.createElement("div", { style: styles.grid4 },
              React.createElement("div", { style: { backgroundColor: "white", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #e9ecef" } },
                React.createElement("div", { style: { fontSize: "12px", color: "#666" } }, "Registered Labours"),
                React.createElement("div", { style: { fontSize: "26px", fontWeight: "bold", color: "#2d6a4f", marginTop: "4px" } }, labourMasterList.length)
              ),
              React.createElement("div", { style: { backgroundColor: "white", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #e9ecef" } },
                React.createElement("div", { style: { fontSize: "12px", color: "#666" } }, "Active Attendance Links Mapped"),
                React.createElement("div", { style: { fontSize: "26px", fontWeight: "bold", color: "#2563eb", marginTop: "4px" } }, labourMasterList.length)
              ),
              React.createElement("div", { style: { backgroundColor: "white", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #e9ecef" } },
                React.createElement("div", { style: { fontSize: "12px", color: "#666" } }, "Monthly Payroll Estimate"),
                React.createElement("div", { style: { fontSize: "26px", fontWeight: "bold", color: "#28a745", marginTop: "4px" } }, "₹", (labourMasterList.reduce((s, l) => s + (Number(l.dailyWage || 0) * 26), 0) / 1000).toFixed(1), "K")
              ),
              React.createElement("div", { style: { backgroundColor: "white", padding: "16px", borderRadius: "10px", textAlign: "center", border: "1px solid #e9ecef" } },
                React.createElement("div", { style: { fontSize: "12px", color: "#666" } }, "Attendance Punch Mode"),
                React.createElement("div", { style: { fontSize: "14px", fontWeight: "bold", color: "#0d9488", marginTop: "8px" } }, "GPS Mapped Mobile Punch 📱")
              )
            )
          ),

          // INLINE UNIFORM ONE-TIME REGISTRATION FORM CARD
          React.createElement("div", { style: { ...styles.card, border: "2px solid #2d6a4f", backgroundColor: "#fff", marginBottom: "20px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "8px" } },
              React.createElement("h3", { style: { margin: 0, color: "#2d6a4f", fontSize: "16px", fontWeight: "bold" } },
                "📝 Uniform One-Time Labour Master Registration Form (All 16 Fields)"
              ),
              React.createElement("span", { style: { fontSize: "12px", color: "#2d6a4f", backgroundColor: "#e8f5e9", padding: "4px 12px", borderRadius: "12px", fontWeight: "bold" } },
                "Fill Once → Mapped to Location/Project"
              )
            ),

            React.createElement("div", { style: styles.row2 },
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "1. Labour Name *"),
                React.createElement("input", { placeholder: "Full Name e.g. Ramesh Kumar", value: newLabourMaster.name, onChange: (e) => setNewLabourMaster({...newLabourMaster, name: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "2. Age (Years)"),
                React.createElement("input", { type: "number", placeholder: "e.g. 32", value: newLabourMaster.age, onChange: (e) => setNewLabourMaster({...newLabourMaster, age: e.target.value}), style: styles.input })
              )
            ),

            React.createElement("div", { style: styles.row2 },
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "3. Mobile No (WhatsApp) *"),
                React.createElement("input", { type: "tel", placeholder: "10-digit Mobile No e.g. 9876543210", value: newLabourMaster.mobile, onChange: (e) => setNewLabourMaster({...newLabourMaster, mobile: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "5. Category / Skill Trade *"),
                React.createElement("select", { value: newLabourMaster.category, onChange: (e) => setNewLabourMaster({...newLabourMaster, category: e.target.value}), style: styles.select },
                  React.createElement("option", null, "Civil Mason"),
                  React.createElement("option", null, "Barbender Steel"),
                  React.createElement("option", null, "Carpenter Shuttering"),
                  React.createElement("option", null, "Electrician"),
                  React.createElement("option", null, "Plumber"),
                  React.createElement("option", null, "Painter"),
                  React.createElement("option", null, "Tile Laying Mason"),
                  React.createElement("option", null, "Helper"),
                  React.createElement("option", null, "Welder")
                )
              )
            ),

            React.createElement("div", { style: styles.row2 },
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "6. Job Allotted / Work Description"),
                React.createElement("input", { placeholder: "e.g. Column Rebar & Brickwork Masonry", value: newLabourMaster.jobAllotted, onChange: (e) => setNewLabourMaster({...newLabourMaster, jobAllotted: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "7. Location / Project Allotted *"),
                React.createElement("select", {
                  value: isManualLocationInput ? "__CUSTOM__" : (newLabourMaster.projectId || (projects[0]?.id || "")),
                  onChange: (e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsManualLocationInput(true);
                    } else {
                      setIsManualLocationInput(false);
                      setNewLabourMaster({ ...newLabourMaster, projectId: e.target.value });
                    }
                  },
                  style: styles.select
                },
                  React.createElement("optgroup", { label: "Standard Contractor Projects" },
                    projects.map(p => React.createElement("option", { key: p.id, value: p.id }, `${p.name} (Code: ${p.projectUniqueId || "PRJ-" + p.id})`))
                  ),
                  customLocations.length > 0 && React.createElement("optgroup", { label: "Saved Custom Locations" },
                    customLocations.map((loc, idx) => React.createElement("option", { key: idx, value: `LOC_${idx}` }, loc))
                  ),
                  React.createElement("option", { value: "__CUSTOM__" }, "✏️ + Enter Custom Location / Site Address Manually...")
                ),
                isManualLocationInput && React.createElement("input", {
                  type: "text",
                  placeholder: "Type Custom Location / Site Address (e.g. Site #4, Hosur Road)",
                  value: manualLocationText,
                  onChange: (e) => setManualLocationText(e.target.value),
                  style: { ...styles.input, marginTop: "6px", border: "2px solid #0d9488", backgroundColor: "#f0fdf4" }
                })
              )
            ),

            React.createElement("div", { style: styles.row3 },
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "8. Wages Rate (₹) *"),
                React.createElement("input", { type: "number", placeholder: "Daily/Monthly Rate e.g. 950", value: newLabourMaster.dailyWage, onChange: (e) => setNewLabourMaster({...newLabourMaster, dailyWage: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "9. Salary Payment Mode"),
                React.createElement("select", { value: newLabourMaster.salaryMode, onChange: (e) => setNewLabourMaster({...newLabourMaster, salaryMode: e.target.value}), style: styles.select },
                  React.createElement("option", null, "Daily"),
                  React.createElement("option", null, "Weekly"),
                  React.createElement("option", null, "Monthly")
                )
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "16. Date of Joining"),
                React.createElement("input", { type: "date", value: newLabourMaster.joinDate, onChange: (e) => setNewLabourMaster({...newLabourMaster, joinDate: e.target.value}), style: styles.input })
              )
            ),

            React.createElement("div", { style: styles.row3 },
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "10. PF Amount (₹ / month)"),
                React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.pfAmount, onChange: (e) => setNewLabourMaster({...newLabourMaster, pfAmount: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "11. ESI Amount (₹ / month)"),
                React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.esiAmount, onChange: (e) => setNewLabourMaster({...newLabourMaster, esiAmount: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "12. Conveyance (₹ / day)"),
                React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.conveyance, onChange: (e) => setNewLabourMaster({...newLabourMaster, conveyance: e.target.value}), style: styles.input })
              )
            ),

            React.createElement("div", { style: styles.row3 },
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "13. OT Rate (₹ / hr)"),
                React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.otRate, onChange: (e) => setNewLabourMaster({...newLabourMaster, otRate: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "14. Accommodation Perks"),
                React.createElement("input", { placeholder: "Site Shed / Allowance", value: newLabourMaster.accommodation, onChange: (e) => setNewLabourMaster({...newLabourMaster, accommodation: e.target.value}), style: styles.input })
              ),
              React.createElement("div", null,
                React.createElement("label", { style: styles.label }, "15. Other Perks"),
                React.createElement("input", { placeholder: "Medical / Safety Gear", value: newLabourMaster.otherPerks, onChange: (e) => setNewLabourMaster({...newLabourMaster, otherPerks: e.target.value}), style: styles.input })
              )
            ),

            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "4. Permanent Address"),
              React.createElement("textarea", { placeholder: "Enter permanent home address", value: newLabourMaster.address, onChange: (e) => setNewLabourMaster({...newLabourMaster, address: e.target.value}), style: { ...styles.input, minHeight: "45px" } })
            ),

            React.createElement("button", {
              onClick: () => {
                if (!newLabourMaster.name.trim() || !newLabourMaster.mobile.trim() || !newLabourMaster.dailyWage) {
                  alert("Labour Name, Mobile No, and Daily Wage are required.");
                  return;
                }
                
                let targetProjName = "";
                let targetProjCode = "PRJ-101";

                if (isManualLocationInput && manualLocationText.trim()) {
                  targetProjName = manualLocationText.trim();
                  targetProjCode = `LOC-${100 + customLocations.length + 1}`;
                  if (!customLocations.includes(manualLocationText.trim())) {
                    const updatedCustomLocs = [...customLocations, manualLocationText.trim()];
                    setCustomLocations(updatedCustomLocs);
                    localStorage.setItem("contractorCustomLocations", JSON.stringify(updatedCustomLocs));
                  }
                } else if (String(newLabourMaster.projectId).startsWith("LOC_")) {
                  const idx = parseInt(newLabourMaster.projectId.replace("LOC_", ""));
                  targetProjName = customLocations[idx] || "Custom Location Site";
                  targetProjCode = `LOC-${101 + idx}`;
                } else {
                  const selectedProj = projects.find(p => String(p.id) === String(newLabourMaster.projectId || selectedProject)) || projects[0];
                  targetProjName = selectedProj?.name || "Project";
                  targetProjCode = selectedProj?.projectUniqueId || selectedProj?.code || "PRJ-101";
                }

                const labId = `LAB-${1000 + labourMasterList.length + 1}`;
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                const punchLink = `/labour-attendance?workerCode=${labId}&code=${targetProjCode}&mode=restricted`;
                
                const newEntry = {
                  id: labId,
                  name: newLabourMaster.name.trim(),
                  age: newLabourMaster.age.trim(),
                  mobile: newLabourMaster.mobile.trim(),
                  address: newLabourMaster.address.trim(),
                  category: newLabourMaster.category,
                  jobAllotted: newLabourMaster.jobAllotted,
                  projectId: newLabourMaster.projectId || 1,
                  projectName: targetProjName,
                  projectCode: targetProjCode,
                  dailyWage: Number(newLabourMaster.dailyWage),
                  salaryMode: newLabourMaster.salaryMode,
                  pfAmount: Number(newLabourMaster.pfAmount || 0),
                  esiAmount: Number(newLabourMaster.esiAmount || 0),
                  conveyance: Number(newLabourMaster.conveyance || 0),
                  otRate: Number(newLabourMaster.otRate || 0),
                  accommodation: newLabourMaster.accommodation,
                  otherPerks: newLabourMaster.otherPerks,
                  joinDate: newLabourMaster.joinDate,
                  status: "Active",
                  punchLink
                };

                const updatedList = [...labourMasterList, newEntry];
                setLabourMasterList(updatedList);
                localStorage.setItem("contractorLabourMasterList", JSON.stringify(updatedList));

                // Sync to contractor projects array so Buyer Dashboard can view it live in real-time
                const updatedProjects = projects.map(p =>
                  String(p.id) === String(newEntry.projectId) || String(p.projectUniqueId || "").toUpperCase() === String(newEntry.projectCode || "").toUpperCase()
                    ? { ...p, labour: [...(p.labour || []), newEntry] }
                    : p
                );
                setProjects(updatedProjects);

                setNewLabourMaster({ name: "", age: "", mobile: "", address: "", category: "Civil Mason", jobAllotted: "Foundation & Brickwork Masonry", projectId: "", dailyWage: "", salaryMode: "Weekly", pfAmount: "0", esiAmount: "0", conveyance: "0", otRate: "0", accommodation: "Site Shed Provided", otherPerks: "Medical & Safety Gear", joinDate: new Date().toISOString().split("T")[0] });
                setIsManualLocationInput(false);
                setManualLocationText("");

                const fullShareLink = `${origin}${newEntry.punchLink}`;
                const msg = `Hello ${newEntry.name},\nYour BuildMitra Attendance Punch Link for Location ${targetProjName} (${targetProjCode}):\n${fullShareLink}\n\nPlease click to activate and punch your daily attendance.`;
                if (window.confirm(`Labour ${newEntry.name} registered for ${targetProjName}! Would you like to share the attendance punch link via WhatsApp to ${newEntry.mobile}?`)) {
                  window.open(`https://wa.me/91${newEntry.mobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
                }
              },
              style: { ...styles.buttonSuccess, width: "100%", marginTop: "12px", padding: "12px", fontSize: "15px", fontWeight: "bold" }
            }, "💾 Save Labour Master & Generate Attendance Punch Link")
          ),

          React.createElement("div", { style: styles.card },
            React.createElement("div", { style: styles.cardTitle }, "📋 Master Labour List & Mapped Projects"),
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: styles.table },
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    React.createElement("th", { style: styles.th }, "Labour ID & Name"),
                    React.createElement("th", { style: styles.th }, "Age & Mobile"),
                    React.createElement("th", { style: styles.th }, "Category / Trade"),
                    React.createElement("th", { style: styles.th }, "Job Allotted"),
                    React.createElement("th", { style: styles.th }, "Location / Project Allotted"),
                    React.createElement("th", { style: styles.th }, "Wages & Mode"),
                    React.createElement("th", { style: styles.th }, "PF / ESI / Conveyance"),
                    React.createElement("th", { style: styles.th }, "Perks / OT"),
                    React.createElement("th", { style: styles.th }, "Join Date"),
                    React.createElement("th", { style: styles.th }, "Attendance Link & Share")
                  )
                ),
                React.createElement("tbody", null,
                  labourMasterList.map(lab =>
                    React.createElement("tr", { key: lab.id },
                      React.createElement("td", { style: styles.td },
                        React.createElement("strong", null, lab.name),
                        React.createElement("div", { style: { fontSize: "11px", color: "#666", fontFamily: "monospace" } }, lab.id)
                      ),
                      React.createElement("td", { style: styles.td },
                        React.createElement("div", null, lab.age ? lab.age + " yrs" : "-"),
                        React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, lab.mobile)
                      ),
                      React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: "#e0e7ff", color: "#3730a3" } }, lab.category)),
                      React.createElement("td", { style: styles.td }, React.createElement("strong", null, lab.jobAllotted)),
                      React.createElement("td", { style: styles.td },
                        React.createElement("strong", { style: { color: "#2d6a4f" } }, lab.projectName || "Project"),
                        React.createElement("div", { style: { fontSize: "11px", color: "#2563eb", fontWeight: "bold" } }, "Code: ", lab.projectCode || "PRJ-101")
                      ),
                      React.createElement("td", { style: styles.td },
                        React.createElement("strong", null, "₹", lab.dailyWage, " / day"),
                        React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, lab.salaryMode || "Weekly")
                      ),
                      React.createElement("td", { style: styles.td },
                        React.createElement("div", { style: { fontSize: "11px" } }, "PF: ₹", lab.pfAmount || 0),
                        React.createElement("div", { style: { fontSize: "11px" } }, "ESI: ₹", lab.esiAmount || 0),
                        React.createElement("div", { style: { fontSize: "11px" } }, "Conv: ₹", lab.conveyance || 0)
                      ),
                      React.createElement("td", { style: styles.td },
                        React.createElement("div", { style: { fontSize: "11px" } }, "OT: ₹", lab.otRate || 0, "/hr"),
                        React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, lab.accommodation)
                      ),
                      React.createElement("td", { style: styles.td }, lab.joinDate || "-"),
                      React.createElement("td", { style: styles.td },
                        React.createElement("button", {
                          onClick: () => {
                            const origin = typeof window !== "undefined" ? window.location.origin : "";
                            const rawLink = lab.punchLink || `/labour-attendance?workerCode=${lab.id}&code=${lab.projectCode || "PRJ-101"}&mode=restricted`;
                            const fullLink = rawLink.startsWith("http") ? rawLink : `${origin}${rawLink}`;
                            const msg = `Hello ${lab.name},\nYour BuildMitra Attendance Punch Link for Project ${lab.projectCode || "PRJ-101"}:\n${fullLink}\n\nPlease click to punch your daily attendance.`;
                            window.open(`https://wa.me/91${lab.mobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
                          },
                          style: styles.buttonSuccess
                        }, "📱 WhatsApp Punch Link")
                      )
                    )
                  )
                )
              )
            )
          )
        )
      ) : (
        // SUB-TAB 2: ATTENDANCE & GEOFENCE REPORTS WITH FILTERS
        React.createElement("div", null,
          React.createElement("div", { style: { ...styles.card, borderLeft: "5px solid #0d9488", backgroundColor: "#f0fdf4" } },
            React.createElement("div", { style: { fontSize: "16px", fontWeight: "bold", color: "#0f766e", marginBottom: "12px" } },
              "📊 Filter Attendance Reports (Project-wise, Labour-wise, Period-wise)"
            ),

            // FILTER CONTROLS BAR
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" } },
              React.createElement("div", null,
                React.createElement("label", { style: { ...styles.label, color: "#115e59", fontWeight: "bold" } }, "1. Project-wise Filter"),
                React.createElement("select", {
                  value: labourFilterProject,
                  onChange: (e) => setLabourFilterProject(e.target.value),
                  style: styles.select
                },
                  React.createElement("option", { value: "" }, "-- All Projects --"),
                  projects.map(p => React.createElement("option", { key: p.id, value: p.id }, `${p.name} (${p.projectUniqueId || "PRJ-" + p.id})`))
                )
              ),
              React.createElement("div", null,
                React.createElement("label", { style: { ...styles.label, color: "#115e59", fontWeight: "bold" } }, "2. Labour-wise Filter"),
                React.createElement("select", {
                  value: labourFilterWorker,
                  onChange: (e) => setLabourFilterWorker(e.target.value),
                  style: styles.select
                },
                  React.createElement("option", { value: "" }, "-- All Labours --"),
                  labourMasterList.map(l => React.createElement("option", { key: l.id, value: l.name }, `${l.name} (${l.id})`))
                )
              ),
              React.createElement("div", null,
                React.createElement("label", { style: { ...styles.label, color: "#115e59", fontWeight: "bold" } }, "3. Period Filter"),
                React.createElement("select", {
                  value: labourFilterPeriod,
                  onChange: (e) => setLabourFilterPeriod(e.target.value),
                  style: styles.select
                },
                  React.createElement("option", { value: "today" }, "Today"),
                  React.createElement("option", { value: "yesterday" }, "Yesterday"),
                  React.createElement("option", { value: "weekly" }, "Weekly (This Week)"),
                  React.createElement("option", { value: "monthly" }, "Monthly (This Month)")
                )
              )
            ),

            React.createElement("div", { style: styles.grid4 },
              React.createElement("div", { style: { backgroundColor: "white", padding: "14px", borderRadius: "8px", border: "1px solid #b2f5ea", textAlign: "center" } },
                React.createElement("div", { style: { fontSize: "11px", color: "#555" } }, "Filtered Attendance Records"),
                React.createElement("div", { style: { fontSize: "22px", fontWeight: "bold", color: "#0f766e", marginTop: "4px" } }, filteredAttendanceLog.length)
              ),
              React.createElement("div", { style: { backgroundColor: "white", padding: "14px", borderRadius: "8px", border: "1px solid #b2f5ea", textAlign: "center" } },
                React.createElement("div", { style: { fontSize: "11px", color: "#555" } }, "GPS Verified Rate"),
                React.createElement("div", { style: { fontSize: "22px", fontWeight: "bold", color: "#28a745", marginTop: "4px" } }, "92.8%")
              ),
              React.createElement("div", { style: { backgroundColor: "white", padding: "14px", borderRadius: "8px", border: "1px solid #b2f5ea", textAlign: "center" } },
                React.createElement("div", { style: { fontSize: "11px", color: "#555" } }, "Total Wages Calculated"),
                React.createElement("div", { style: { fontSize: "22px", fontWeight: "bold", color: "#2563eb", marginTop: "4px" } }, "₹", filteredAttendanceLog.reduce((s, i) => s + i.wage, 0).toLocaleString())
              ),
              React.createElement("div", { style: { backgroundColor: "white", padding: "14px", borderRadius: "8px", border: "1px solid #b2f5ea", textAlign: "center" } },
                React.createElement("button", { onClick: () => alert("Exported Filtered Labour Attendance Report CSV"), style: { ...styles.buttonSuccess, width: "100%", marginTop: "8px" } }, "📥 Export Report CSV")
              )
            )
          ),

          React.createElement("div", { style: styles.card },
            React.createElement("div", { style: styles.cardTitle }, "📍 Attendance Audit Log (Project & Labour Mapped)"),
            React.createElement("div", { style: { overflowX: "auto" } },
              React.createElement("table", { style: styles.table },
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    React.createElement("th", { style: styles.th }, "Worker ID & Name"),
                    React.createElement("th", { style: styles.th }, "Project & Code"),
                    React.createElement("th", { style: styles.th }, "Category / Role"),
                    React.createElement("th", { style: styles.th }, "Check-In"),
                    React.createElement("th", { style: styles.th }, "Check-Out"),
                    React.createElement("th", { style: styles.th }, "Geofence Dist"),
                    React.createElement("th", { style: styles.th }, "GPS Verification"),
                    React.createElement("th", { style: styles.th }, "Daily Wage + OT"),
                    React.createElement("th", { style: styles.th }, "Approval Signoff")
                  )
                ),
                React.createElement("tbody", null,
                  filteredAttendanceLog.map(item =>
                    React.createElement("tr", { key: item.id },
                      React.createElement("td", { style: styles.td }, React.createElement("strong", null, item.name), React.createElement("div", { style: { fontSize: "10px", color: "#666", fontFamily: "monospace" } }, item.id)),
                      React.createElement("td", { style: styles.td }, React.createElement("strong", null, item.prjName), React.createElement("div", { style: { fontSize: "11px", color: "#2563eb" } }, item.prjCode)),
                      React.createElement("td", { style: styles.td }, item.category),
                      React.createElement("td", { style: styles.td }, item.checkIn),
                      React.createElement("td", { style: styles.td }, item.checkOut),
                      React.createElement("td", { style: styles.td }, item.distance),
                      React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: item.status.includes("Verified") ? "#d1fae5" : "#fee2e2", color: item.status.includes("Verified") ? "#065f46" : "#991b1b" } }, item.status)),
                      React.createElement("td", { style: styles.td }, "₹", item.wage, item.otHours ? ` (+${item.otHours}h OT)` : ""),
                      React.createElement("td", { style: styles.td }, item.approved)
                    )
                  )
                )
              )
            )
          )
        )
      )
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case "companyprofile": return renderCompanyProfile();
      case "overview": return renderOverview();
      case "projects": return renderProjects();
      case "labour": return renderLabourAttendance();
      case "labourmaster": return renderLabourAttendance();
      case "geofence": return renderLabourAttendance();
      case "milestones": return renderMilestones();
      case "portfolio": return renderPortfolio();
      case "siteprogress": return renderSiteProgress();
      case "enquiries": return renderEnquiries();
      case "quotes": return renderQuotes();
      case "inventory": return renderInventory();
      case "payments": return renderPayments();
      case "reports": return renderReports();
      default: return renderOverview();
    }
  };

  return React.createElement("div", { style: styles.container },
    React.createElement(BuildMitraHeader, {
      moduleTitle: "Contractor Module",
      pageTitle: "Contractor Dashboard",
      subtitle: `Contractor Code: ${(loggedInUser?.uniqueCode || loggedInUser?.userCode) || contractorInfo.uniqueCode || "Not assigned"} | ${loggedInUser?.name || contractorInfo.ownerName || contractorInfo.companyName}`,
      showBackToDashboard: false
    }),
    React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" } },
      React.createElement("button", { onClick: () => setActiveTab("overview"), style: styles.buttonInfo }, "Dashboard"),
      React.createElement("button", { onClick: () => setShowSharePermissionModal(true), style: { ...styles.buttonSuccess, backgroundColor: "#8b5cf6", color: "#fff", fontWeight: "bold" } }, "🔑 Share Permission (Buyer & Project Code)"),
      React.createElement("button", { onClick: () => setActiveTab("labour"), style: { ...styles.buttonInfo, backgroundColor: "#0d9488", color: "#fff", fontWeight: "bold" } }, "👷 Labour Attendance"),
      React.createElement("button", { onClick: () => window.location.href = "/provider-select-items", style: styles.buttonSuccess }, "Select Items & Rates"),
      React.createElement("button", { onClick: () => window.location.href = "/marketplace", style: styles.buttonInfo }, "Marketplace"),
      React.createElement("button", { onClick: () => setActiveTab("enquiries"), style: styles.buttonSuccess }, "Enquiries"),
      React.createElement("button", { onClick: () => setActiveTab("quotes"), style: styles.buttonWarning }, "Quotes"),
      React.createElement("button", { onClick: () => window.open("https://wa.me/919876543210", "_blank"), style: styles.buttonSuccess }, "📱 Share"),
      React.createElement("button", { onClick: logoutToLogin, style: styles.buttonDanger }, "🚪 Logout")
    ),
    React.createElement(MarketRateTrend, null),
    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.icon, " ", tab.name))
    ),
    renderContent(),
    
    // Add Project Modal
    showProjectModal && React.createElement("div", { style: styles.modal, onClick: () => setShowProjectModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Add New Project"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Project Name", value: newProject.name, onChange: (e) => setNewProject({...newProject, name: e.target.value}), style: styles.input }),
          React.createElement("div", null,
            React.createElement("input", { type: "text", placeholder: "Buyer Unique Code (e.g. BUY-1234)", value: newProject.buyerCode, onChange: (e) => setNewProject({...newProject, buyerCode: e.target.value.toUpperCase()}), style: styles.input }),
            React.createElement("div", { style: { fontSize: "11px", color: "#666", marginTop: "-8px", marginBottom: "4px" } }, "Ask the buyer to copy their Buyer Code from the buyer dashboard."),
            newProject.buyerCode && React.createElement("div", { style: { fontSize: "11px", color: matchedBuyer ? "#15803d" : "#dc2626", marginBottom: "12px" } }, matchedBuyer ? `Buyer verified: ${matchedBuyer.name}` : "Buyer code not found or is not registered as a buyer.")
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "tel", placeholder: "Client Mobile", value: newProject.clientMobile, onChange: (e) => setNewProject({...newProject, clientMobile: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "email", placeholder: "Client Email", value: newProject.clientEmail, onChange: (e) => setNewProject({...newProject, clientEmail: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { type: "number", placeholder: "Plot Length (ft)", value: newProject.plotLength, onChange: (e) => setNewProject({...newProject, plotLength: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Plot Width (ft)", value: newProject.plotWidth, onChange: (e) => setNewProject({...newProject, plotWidth: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "No of Floors", value: newProject.floors, onChange: (e) => setNewProject({...newProject, floors: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 1, placeholder: "Rate per sqft (₹)", value: newProject.ratePerSft, onChange: (e) => setNewProject({...newProject, ratePerSft: e.target.value}), style: styles.input }),
          React.createElement("div", { style: { backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "8px", marginBottom: "12px" } },
            React.createElement("div", null, "Plot Area: ", plotArea.toLocaleString(), " sq.ft"),
            React.createElement("div", null, "BUA (90% × floors): ", calculatedBua.toLocaleString(), " sq.ft"),
            React.createElement("strong", null, "Total Amount: ₹", calculatedTotalAmount.toLocaleString())
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "date", placeholder: "Start Date", value: newProject.startDate, onChange: (e) => setNewProject({...newProject, startDate: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", placeholder: "End Date", value: newProject.endDate, onChange: (e) => setNewProject({...newProject, endDate: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Agreement Document"),
          React.createElement("input", { type: "file", onChange: (e) => {
            const file = e.target.files[0];
            if(file) setNewProject({...newProject, agreementUrl: URL.createObjectURL(file)});
          }, style: styles.input })
        ),
        React.createElement("button", { onClick: addProject, style: { ...styles.buttonSuccess, width: "100%" } }, "Create Project")
      )
    ),

    showInventoryModal && React.createElement("div", { style: styles.modal, onClick: () => setShowInventoryModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Record Inventory - ", selectedProjectData?.name),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { placeholder: "Material", value: newInventoryItem.material, onChange: (e) => setNewInventoryItem({...newInventoryItem, material: e.target.value}), style: styles.input }),
          React.createElement("select", { value: newInventoryItem.unit, onChange: (e) => setNewInventoryItem({...newInventoryItem, unit: e.target.value}), style: styles.select },
            React.createElement("option", { value: "bags" }, "Bags"),
            React.createElement("option", { value: "kg" }, "Kg"),
            React.createElement("option", { value: "nos" }, "Nos"),
            React.createElement("option", { value: "cft" }, "Cft"),
            React.createElement("option", { value: "litres" }, "Litres")
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Ordered Quantity", value: newInventoryItem.orderedQty, onChange: (e) => setNewInventoryItem({...newInventoryItem, orderedQty: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 0, placeholder: "Received Quantity", value: newInventoryItem.receivedQty, onChange: (e) => setNewInventoryItem({...newInventoryItem, receivedQty: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Consumed Quantity", value: newInventoryItem.consumedQty, onChange: (e) => setNewInventoryItem({...newInventoryItem, consumedQty: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 0, placeholder: "Rate", value: newInventoryItem.rate, onChange: (e) => setNewInventoryItem({...newInventoryItem, rate: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { placeholder: "Supplier", value: newInventoryItem.supplier, onChange: (e) => setNewInventoryItem({...newInventoryItem, supplier: e.target.value}), style: styles.input }),
          React.createElement("input", { placeholder: "Invoice Number", value: newInventoryItem.invoiceNo, onChange: (e) => setNewInventoryItem({...newInventoryItem, invoiceNo: e.target.value}), style: styles.input })
        ),
        React.createElement("input", { type: "date", value: newInventoryItem.invoiceDate, onChange: (e) => setNewInventoryItem({...newInventoryItem, invoiceDate: e.target.value}), style: styles.input }),
        React.createElement("div", { style: { marginBottom: "12px" } }, "Balance: ", Math.max(0, Number(newInventoryItem.receivedQty || 0) - Number(newInventoryItem.consumedQty || 0)), " ", newInventoryItem.unit, " | Amount: ₹", (Number(newInventoryItem.receivedQty || 0) * Number(newInventoryItem.rate || 0)).toLocaleString()),
        React.createElement("button", { onClick: addInventoryItem, style: { ...styles.buttonSuccess, width: "100%" } }, "Save Inventory")
      )
    ),

    showProjectQuoteModal && React.createElement("div", { style: styles.modal, onClick: () => setShowProjectQuoteModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Add Quotation - ", selectedProjectData?.name),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { placeholder: "Quote No", value: newProjectQuote.quoteNo, onChange: (e) => setNewProjectQuote({...newProjectQuote, quoteNo: e.target.value}), style: styles.input }),
          React.createElement("input", { value: selectedProjectData?.name || "", readOnly: true, style: styles.input })
        ),
        React.createElement("input", { type: "date", value: newProjectQuote.date, onChange: (e) => setNewProjectQuote({...newProjectQuote, date: e.target.value}), style: styles.input }),
        React.createElement("textarea", { placeholder: "Description", value: newProjectQuote.description, onChange: (e) => setNewProjectQuote({...newProjectQuote, description: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Amount", value: newProjectQuote.amount, onChange: (e) => setNewProjectQuote({...newProjectQuote, amount: e.target.value}), style: styles.input }),
          React.createElement("select", { value: newProjectQuote.status, onChange: (e) => setNewProjectQuote({...newProjectQuote, status: e.target.value}), style: styles.select },
            React.createElement("option", { value: "Draft" }, "Draft"), React.createElement("option", { value: "Sent" }, "Sent"), React.createElement("option", { value: "Accepted" }, "Accepted"), React.createElement("option", { value: "Rejected" }, "Rejected")
          )
        ),
        React.createElement("textarea", { placeholder: "Remarks", value: newProjectQuote.remarks, onChange: (e) => setNewProjectQuote({...newProjectQuote, remarks: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addProjectQuotation, style: { ...styles.buttonSuccess, width: "100%" } }, "Save Quotation")
      )
    ),

    showPaymentEntryModal && React.createElement("div", { style: styles.modal, onClick: () => setShowPaymentEntryModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Record Payment - ", selectedProjectData?.name),
        React.createElement("input", { placeholder: "Milestone / Description", value: newPayment.milestoneName, onChange: (e) => setNewPayment({...newPayment, milestoneName: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Amount", value: newPayment.amount, onChange: (e) => setNewPayment({...newPayment, amount: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", value: newPayment.date, onChange: (e) => setNewPayment({...newPayment, date: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("select", { value: newPayment.status, onChange: (e) => setNewPayment({...newPayment, status: e.target.value}), style: styles.select },
            React.createElement("option", { value: "Received" }, "Received"),
            React.createElement("option", { value: "Pending" }, "Pending"),
            React.createElement("option", { value: "Partially Paid" }, "Partially Paid")
          ),
          React.createElement("input", { placeholder: "Cheque / UTR / Reference", value: newPayment.reference, onChange: (e) => setNewPayment({...newPayment, reference: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addPayment, style: { ...styles.buttonSuccess, width: "100%" } }, "Save Payment")
      )
    ),

    showMilestoneModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMilestoneModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Add Milestone - ", selectedProjectData?.name),
        React.createElement("input", { placeholder: "Milestone Name", value: newMilestone.name, onChange: (e) => setNewMilestone({...newMilestone, name: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Amount", value: newMilestone.amount, onChange: (e) => setNewMilestone({...newMilestone, amount: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", value: newMilestone.plannedEndDate, onChange: (e) => setNewMilestone({...newMilestone, plannedEndDate: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addMilestone, style: { ...styles.buttonSuccess, width: "100%" } }, "Save Milestone")
      )
    ),
    
    // Media Upload Modal
    showMediaModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMediaModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Upload Media for ", selectedProjectData?.name),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Media Type"),
          React.createElement("select", { value: mediaType, onChange: (e) => setMediaType(e.target.value), style: styles.select },
            React.createElement("option", { value: "photo" }, "Photo"),
            React.createElement("option", { value: "video" }, "Video"),
            React.createElement("option", { value: "document" }, "Document")
          )
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Category"),
          React.createElement("select", { value: mediaCategory, onChange: (e) => setMediaCategory(e.target.value), style: styles.select },
            React.createElement("option", { value: "progress" }, "Progress Photo/Video"),
            React.createElement("option", { value: "document" }, "Document/Report"),
            React.createElement("option", { value: "invoice" }, "Invoice")
          )
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Title"),
          React.createElement("input", { type: "text", placeholder: "Enter title", value: mediaTitle, onChange: (e) => setMediaTitle(e.target.value), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "File"),
          React.createElement("input", { type: "file", accept: "image/*,video/*,.pdf", onChange: (e) => {
            const file = e.target.files?.[0] || null;
            setMediaFile(file);
            if (file) {
              const reader = new FileReader();
              reader.onload = (evt) => {
                setMediaDataUrl(evt.target?.result as string);
              };
              reader.readAsDataURL(file);
              setMediaSelectionMessage(`File "${file.name}" loaded for instant live image preview!`);
            } else {
              setMediaDataUrl(null);
              setMediaSelectionMessage("");
            }
          }, style: styles.input }),
          mediaSelectionMessage && React.createElement("div", { style: { padding: "10px", marginBottom: "12px", backgroundColor: "#e8f5e9", color: "#1b4332", borderRadius: "8px", fontSize: "12px" } }, mediaSelectionMessage)
        ),
        React.createElement("button", { onClick: addSiteMedia, style: { ...styles.buttonSuccess, width: "100%" } }, "📷 Save & Display Progress Photo")
      )
    ),
    
    // Portfolio Modal (Add/Edit)
    showPortfolioModal && React.createElement("div", { style: styles.modal, onClick: () => setShowPortfolioModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, editPortfolioId ? "Edit Portfolio" : "Add Portfolio"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Project Name", value: portfolioData.name, onChange: (e) => setPortfolioData({...portfolioData, name: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "Client Name", value: portfolioData.clientName, onChange: (e) => setPortfolioData({...portfolioData, clientName: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Location", value: portfolioData.location, onChange: (e) => setPortfolioData({...portfolioData, location: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", placeholder: "Completion Date", value: portfolioData.completionDate, onChange: (e) => setPortfolioData({...portfolioData, completionDate: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Total Value (₹)", value: portfolioData.totalValue, onChange: (e) => setPortfolioData({...portfolioData, totalValue: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "file", onChange: (e) => setPortfolioImage(e.target.files[0]), style: styles.input })
        ),
        React.createElement("textarea", { placeholder: "Testimonial", value: portfolioData.testimonial, onChange: (e) => setPortfolioData({...portfolioData, testimonial: e.target.value}), style: { ...styles.input, minHeight: "60px" } }),
        React.createElement("button", { onClick: editPortfolioId ? updatePortfolio : addPortfolio, style: { ...styles.buttonSuccess, width: "100%" } }, editPortfolioId ? "Update" : "Add")
      )
    ),
    
    // Raise Invoice Modal
    showInvoiceModal && selectedMilestone && React.createElement("div", { style: styles.modal, onClick: () => setShowInvoiceModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Raise Invoice for ", selectedMilestone.name),
        React.createElement("p", null, React.createElement("strong", null, "Milestone Amount: "), "₹", (selectedMilestone.amount/1000).toFixed(0), "K"),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Invoice Amount (₹)"),
          React.createElement("input", { type: "number", placeholder: "Enter invoice amount", value: invoiceAmount, onChange: (e) => setInvoiceAmount(e.target.value), style: styles.input })
        ),
        React.createElement("button", { onClick: () => raiseInvoice(selectedMilestone), style: { ...styles.buttonSuccess, width: "100%" } }, "Generate & Send Invoice")
      )
    ),
    
    // Add / Register Labour Master Modal (Full 16 Fields)
    showLabourModal && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourModal(false) },
      React.createElement("div", { style: { ...styles.modalContent, maxWidth: "750px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f", margin: "0 0 8px" } }, "👷 Register New Labour Master"),
        React.createElement("p", { style: { fontSize: "12px", color: "#666", marginBottom: "16px" } },
          "One-time registration of labour details. An individual GPS Attendance Punch Link will be generated & mapped to their allotted project location."
        ),

        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "1. Labour Name *"),
            React.createElement("input", { placeholder: "Full Name", value: newLabourMaster.name, onChange: (e) => setNewLabourMaster({...newLabourMaster, name: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "2. Age (Years)"),
            React.createElement("input", { type: "number", placeholder: "e.g. 32", value: newLabourMaster.age, onChange: (e) => setNewLabourMaster({...newLabourMaster, age: e.target.value}), style: styles.input })
          )
        ),

        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "3. Mobile No (WhatsApp) *"),
            React.createElement("input", { type: "tel", placeholder: "10-digit Mobile No", value: newLabourMaster.mobile, onChange: (e) => setNewLabourMaster({...newLabourMaster, mobile: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "5. Category / Skill Trade *"),
            React.createElement("select", { value: newLabourMaster.category, onChange: (e) => setNewLabourMaster({...newLabourMaster, category: e.target.value}), style: styles.select },
              React.createElement("option", null, "Civil Mason"),
              React.createElement("option", null, "Barbender Steel"),
              React.createElement("option", null, "Carpenter Shuttering"),
              React.createElement("option", null, "Electrician"),
              React.createElement("option", null, "Plumber"),
              React.createElement("option", null, "Painter"),
              React.createElement("option", null, "Tile Laying Mason"),
              React.createElement("option", null, "Helper"),
              React.createElement("option", null, "Welder")
            )
          )
        ),

        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "6. Job Allotted / Work Description"),
            React.createElement("input", { placeholder: "e.g. Column Rebar & Slab Concrete", value: newLabourMaster.jobAllotted, onChange: (e) => setNewLabourMaster({...newLabourMaster, jobAllotted: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "7. Location / Project Allotted *"),
            React.createElement("select", {
              value: isManualLocationInput ? "__CUSTOM__" : (newLabourMaster.projectId || (projects[0]?.id || "")),
              onChange: (e) => {
                if (e.target.value === "__CUSTOM__") {
                  setIsManualLocationInput(true);
                } else {
                  setIsManualLocationInput(false);
                  setNewLabourMaster({ ...newLabourMaster, projectId: e.target.value });
                }
              },
              style: styles.select
            },
              React.createElement("optgroup", { label: "Standard Contractor Projects" },
                projects.map(p => React.createElement("option", { key: p.id, value: p.id }, `${p.name} (Code: ${p.projectUniqueId || "PRJ-" + p.id})`))
              ),
              customLocations.length > 0 && React.createElement("optgroup", { label: "Saved Custom Locations" },
                customLocations.map((loc, idx) => React.createElement("option", { key: idx, value: `LOC_${idx}` }, loc))
              ),
              React.createElement("option", { value: "__CUSTOM__" }, "✏️ + Enter Custom Location / Site Address Manually...")
            ),
            isManualLocationInput && React.createElement("input", {
              type: "text",
              placeholder: "Type Custom Location / Site Address (e.g. Site #4, Hosur Road)",
              value: manualLocationText,
              onChange: (e) => setManualLocationText(e.target.value),
              style: { ...styles.input, marginTop: "6px", border: "2px solid #0d9488", backgroundColor: "#f0fdf4" }
            })
          )
        ),

        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "8. Wages Rate (₹) *"),
            React.createElement("input", { type: "number", placeholder: "e.g. 950", value: newLabourMaster.dailyWage, onChange: (e) => setNewLabourMaster({...newLabourMaster, dailyWage: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "9. Salary Payment Mode"),
            React.createElement("select", { value: newLabourMaster.salaryMode, onChange: (e) => setNewLabourMaster({...newLabourMaster, salaryMode: e.target.value}), style: styles.select },
              React.createElement("option", null, "Daily"),
              React.createElement("option", null, "Weekly"),
              React.createElement("option", null, "Monthly")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "16. Date of Joining"),
            React.createElement("input", { type: "date", value: newLabourMaster.joinDate, onChange: (e) => setNewLabourMaster({...newLabourMaster, joinDate: e.target.value}), style: styles.input })
          )
        ),

        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "10. PF Amount (₹ / month)"),
            React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.pfAmount, onChange: (e) => setNewLabourMaster({...newLabourMaster, pfAmount: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "11. ESI Amount (₹ / month)"),
            React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.esiAmount, onChange: (e) => setNewLabourMaster({...newLabourMaster, esiAmount: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "12. Conveyance (₹ / day)"),
            React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.conveyance, onChange: (e) => setNewLabourMaster({...newLabourMaster, conveyance: e.target.value}), style: styles.input })
          )
        ),

        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "13. OT Rate (₹ / hr)"),
            React.createElement("input", { type: "number", placeholder: "0", value: newLabourMaster.otRate, onChange: (e) => setNewLabourMaster({...newLabourMaster, otRate: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "14. Accommodation Perks"),
            React.createElement("input", { placeholder: "Site Shed / Allowance", value: newLabourMaster.accommodation, onChange: (e) => setNewLabourMaster({...newLabourMaster, accommodation: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "15. Other Perks"),
            React.createElement("input", { placeholder: "Medical / Insurance", value: newLabourMaster.otherPerks, onChange: (e) => setNewLabourMaster({...newLabourMaster, otherPerks: e.target.value}), style: styles.input })
          )
        ),

        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "4. Permanent Address"),
          React.createElement("textarea", { placeholder: "Enter permanent address", value: newLabourMaster.address, onChange: (e) => setNewLabourMaster({...newLabourMaster, address: e.target.value}), style: { ...styles.input, minHeight: "50px" } })
        ),

        React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" } },
          React.createElement("button", { onClick: () => setShowLabourModal(false), style: styles.buttonDanger }, "Cancel"),
          React.createElement("button", { onClick: () => {
            if (!newLabourMaster.name.trim() || !newLabourMaster.mobile.trim() || !newLabourMaster.dailyWage) {
              alert("Labour Name, Mobile No, and Daily Wage are required.");
              return;
            }

            let targetProjName = "";
            let targetProjCode = "PRJ-101";

            if (isManualLocationInput && manualLocationText.trim()) {
              targetProjName = manualLocationText.trim();
              targetProjCode = `LOC-${100 + customLocations.length + 1}`;
              if (!customLocations.includes(manualLocationText.trim())) {
                const updatedCustomLocs = [...customLocations, manualLocationText.trim()];
                setCustomLocations(updatedCustomLocs);
                localStorage.setItem("contractorCustomLocations", JSON.stringify(updatedCustomLocs));
              }
            } else if (String(newLabourMaster.projectId).startsWith("LOC_")) {
              const idx = parseInt(newLabourMaster.projectId.replace("LOC_", ""));
              targetProjName = customLocations[idx] || "Custom Location Site";
              targetProjCode = `LOC-${101 + idx}`;
            } else {
              const selectedProj = projects.find(p => String(p.id) === String(newLabourMaster.projectId || selectedProject)) || projects[0];
              targetProjName = selectedProj?.name || "Project";
              targetProjCode = selectedProj?.projectUniqueId || selectedProj?.code || "PRJ-101";
            }

            const labId = `LAB-${1000 + labourMasterList.length + 1}`;
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const punchLink = `/labour-attendance?workerCode=${labId}&code=${targetProjCode}&mode=restricted`;
            
            const newEntry = {
              id: labId,
              name: newLabourMaster.name.trim(),
              age: newLabourMaster.age.trim(),
              mobile: newLabourMaster.mobile.trim(),
              address: newLabourMaster.address.trim(),
              category: newLabourMaster.category,
              jobAllotted: newLabourMaster.jobAllotted,
              projectId: newLabourMaster.projectId || 1,
              projectName: targetProjName,
              projectCode: targetProjCode,
              dailyWage: Number(newLabourMaster.dailyWage),
              salaryMode: newLabourMaster.salaryMode,
              pfAmount: Number(newLabourMaster.pfAmount || 0),
              esiAmount: Number(newLabourMaster.esiAmount || 0),
              conveyance: Number(newLabourMaster.conveyance || 0),
              otRate: Number(newLabourMaster.otRate || 0),
              accommodation: newLabourMaster.accommodation,
              otherPerks: newLabourMaster.otherPerks,
              joinDate: newLabourMaster.joinDate,
              status: "Active",
              punchLink
            };

            const updatedList = [...labourMasterList, newEntry];
            setLabourMasterList(updatedList);
            localStorage.setItem("contractorLabourMasterList", JSON.stringify(updatedList));

            // Sync to contractor projects array so Buyer Dashboard can view it live in real-time
            const updatedProjects = projects.map(p =>
              String(p.id) === String(newEntry.projectId) || String(p.projectUniqueId || "").toUpperCase() === String(newEntry.projectCode || "").toUpperCase()
                ? { ...p, labour: [...(p.labour || []), newEntry] }
                : p
            );
            setProjects(updatedProjects);

            setShowLabourModal(false);
            setNewLabourMaster({ name: "", age: "", mobile: "", address: "", category: "Civil Mason", jobAllotted: "Foundation & Brickwork Masonry", projectId: "", dailyWage: "", salaryMode: "Weekly", pfAmount: "0", esiAmount: "0", conveyance: "0", otRate: "0", accommodation: "Site Shed Provided", otherPerks: "Medical & Safety Gear", joinDate: new Date().toISOString().split("T")[0] });
            setIsManualLocationInput(false);
            setManualLocationText("");

            const fullShareLink = `${origin}${newEntry.punchLink}`;
            const msg = `Hello ${newEntry.name},\nYour BuildMitra Attendance Punch Link for Location ${targetProjName} (${targetProjCode}):\n${fullShareLink}\n\nPlease click to activate and punch your daily attendance.`;
            if (window.confirm(`Labour ${newEntry.name} registered successfully for ${targetProjName}! Would you like to share the attendance punch link via WhatsApp to ${newEntry.mobile}?`)) {
              window.open(`https://wa.me/91${newEntry.mobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
            }
          }, style: styles.buttonSuccess }, "Save Labour Master & Generate Link")
        )
      )
    ),
    
    // Quote Modal
    showQuoteModal && selectedEnquiry && React.createElement("div", { style: styles.modal, onClick: () => setShowQuoteModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Send Quote to ", selectedEnquiry.customerName),
        React.createElement("p", null, React.createElement("strong", null, "Project: "), selectedEnquiry.projectType, " at ", selectedEnquiry.location),
        React.createElement("p", null, React.createElement("strong", null, "Customer Budget: "), selectedEnquiry.budget),
        React.createElement("input", { type: "number", placeholder: "Your Quote Amount (₹)", value: quoteResponse.amount, onChange: (e) => setQuoteResponse({...quoteResponse, amount: e.target.value}), style: styles.input }),
        React.createElement("input", { type: "date", placeholder: "Quote Validity", value: quoteResponse.deliveryDate, onChange: (e) => setQuoteResponse({...quoteResponse, deliveryDate: e.target.value}), style: styles.input }),
        React.createElement("textarea", { placeholder: "Additional Message", value: quoteResponse.message, onChange: (e) => setQuoteResponse({...quoteResponse, message: e.target.value}), style: { ...styles.input, minHeight: "60px" } }),
        React.createElement("button", { onClick: () => sendQuote(selectedEnquiry.id), style: { ...styles.buttonSuccess, width: "100%" } }, "Send Quote")
      )
    ),

    // Share Permission Modal (Buyer & Project Code Access Control)
    showSharePermissionModal && React.createElement("div", { style: styles.modal, onClick: () => setShowSharePermissionModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f", margin: 0 } }, "🔑 Project Sharing & Access Control Permission"),
        React.createElement("p", { style: { color: "#666", fontSize: "13px", marginTop: "4px", marginBottom: "16px" } },
          "Contractor Code: ", React.createElement("strong", { style: { color: "#2d6a4f" } }, (loggedInUser?.uniqueCode || loggedInUser?.userCode) || contractorInfo.uniqueCode || "CON-000004"),
          " — Grant specific Owner/Buyer code access to a particular Project code."
        ),
        
        React.createElement("div", { style: { backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "10px", marginBottom: "16px", border: "1px solid #ddd" } },
          React.createElement("div", { style: { marginBottom: "12px" } },
            React.createElement("label", { style: { ...styles.label, fontWeight: "bold", display: "block", marginBottom: "4px" } }, "1. Select Project (Project Code)"),
            React.createElement("select", {
              value: shareSelectedProjectId || selectedProject,
              onChange: (e) => setShareSelectedProjectId(e.target.value),
              style: styles.select
            },
              projects.map(p => React.createElement("option", { key: p.id, value: p.id }, `${p.name} (Project Code: ${p.projectUniqueId || p.code || "PRJ-" + p.id})`))
            )
          ),

          React.createElement("div", { style: { marginBottom: "8px" } },
            React.createElement("label", { style: { ...styles.label, fontWeight: "bold", display: "block", marginBottom: "4px" } }, "2. Enter Owner / Buyer Code (BUY-xxxx)"),
            React.createElement("input", {
              type: "text",
              placeholder: "Enter Buyer Code (e.g. BUY-000001)",
              value: shareBuyerCodeInput,
              onChange: (e) => setShareBuyerCodeInput(e.target.value.toUpperCase()),
              style: styles.input
            }),
            shareBuyerCodeInput && React.createElement("div", { style: { fontSize: "12px", color: findBuyerByCode(shareBuyerCodeInput) ? "#28a745" : "#dc3545" } },
              findBuyerByCode(shareBuyerCodeInput) ? `✓ Verified Buyer: ${findBuyerByCode(shareBuyerCodeInput).name}` : "⚠️ Buyer Code not found. Ask buyer to register."
            )
          )
        ),

        React.createElement("div", { style: { marginBottom: "16px" } },
          React.createElement("strong", { style: { display: "block", marginBottom: "10px" } }, "3. Permission Toggles for Selected Buyer & Project:"),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" } },
            Object.entries({
              projectSummary: "Project Summary & Progress",
              milestones: "Civil Milestones Progress",
              siteMedia: "Progress Photos & Videos",
              geofence: "Yesterday Geofence Attendance",
              payments: "Buyer Payments (Read-Only Enforced)",
              inventory: "Inventory & Material Log",
              quotations: "Quotations & Enquiries",
              reports: "Audit Reports"
            }).map(([key, label]) =>
              React.createElement("label", { key, style: { display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" } },
                React.createElement("input", {
                  type: "checkbox",
                  checked: (sharePermissionsState as any)[key] !== false,
                  onChange: (e) => setSharePermissionsState({ ...sharePermissionsState, [key]: e.target.checked })
                }),
                label
              )
            )
          )
        ),

        React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "flex-end" } },
          React.createElement("button", { onClick: () => setShowSharePermissionModal(false), style: styles.buttonDanger }, "Cancel"),
          React.createElement("button", { onClick: () => {
            const targetProjId = shareSelectedProjectId || selectedProject;
            const targetProj = projects.find(p => String(p.id) === String(targetProjId));
            const buyer = findBuyerByCode(shareBuyerCodeInput);
            if (!shareBuyerCodeInput.trim()) {
              alert("Please enter a valid Buyer Code (e.g., BUY-000001)");
              return;
            }
            const updatedProjects = projects.map(p => String(p.id) === String(targetProjId) ? {
              ...p,
              buyerCode: shareBuyerCodeInput.trim(),
              buyerName: buyer?.name || "Buyer (" + shareBuyerCodeInput.trim() + ")",
              sharedWithBuyer: true,
              permissions: { ...sharePermissionsState }
            } : p);
            setProjects(updatedProjects);
            const contractorId = loggedInUser?.userId ?? loggedInUser?.id;
            if (contractorId) saveProjectsForContractor(contractorId, updatedProjects);
            setShowSharePermissionModal(false);
            alert(`Permission Granted! Buyer (${shareBuyerCodeInput.trim()}) can now access Project (${targetProj?.projectUniqueId || targetProj?.name}) remotely.`);
          }, style: styles.buttonSuccess }, "Save & Grant Permission")
        )
      )
    )
  );
}



