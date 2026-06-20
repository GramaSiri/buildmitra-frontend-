import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  findBuyerByCode,
  getLoggedInUser,
  migrateLegacyProjects,
  saveProjectsForContractor
} from "../utils/projectStorage";
import { logoutToLogin } from "../utils/session";
import { generateCivilMilestones } from "../utils/milestoneEngine";
import { exportBuildMitraReport } from "../utils/reportExport";
export default function ContractorDashboard() {

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showPaymentEntryModal, setShowPaymentEntryModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showExtraWorkModal, setShowExtraWorkModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quoteResponse, setQuoteResponse] = useState({ amount: "", message: "", deliveryDate: "" });
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [reportType, setReportType] = useState("payments");
  const [reportFilters, setReportFilters] = useState({ startDate: "", endDate: "", projectId: "", material: "", supplier: "", labour: "", payment: "", milestone: "", extraWorks: "" });
  
  // Media upload states
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState("photo");
  const [mediaCategory, setMediaCategory] = useState("progress"); // progress, document, invoice
  
  // Portfolio states
  const [portfolioImage, setPortfolioImage] = useState(null);
  const [portfolioData, setPortfolioData] = useState({ name: "", clientName: "", location: "", completionDate: "", totalValue: "", testimonial: "" });
  const [editPortfolioId, setEditPortfolioId] = useState(null);
  const [storageReady, setStorageReady] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [newInventoryItem, setNewInventoryItem] = useState({ material: "", unit: "bags", supplier: "", supplierCode: "", invoiceNo: "", invoiceDate: "", deliveryDate: "", orderedQty: "", receivedQty: "", consumed: "", rate: "" });
  const [newPayment, setNewPayment] = useState({ milestoneName: "", amount: "", date: new Date().toISOString().split("T")[0], status: "Received", reference: "" });
  const [newMilestone, setNewMilestone] = useState({ name: "", amount: "", plannedEndDate: "", status: "Pending" });
  const [newExtraWork, setNewExtraWork] = useState({ type: "Variation Work", date: new Date().toISOString().split("T")[0], description: "", quantity: "", unit: "Nos", amount: "", reason: "" });

  const [newProject, setNewProject] = useState({
    name: "", buyerCode: "", clientName: "", clientMobile: "", clientEmail: "",
    plotLength: "", plotWidth: "", floors: "", bua: "", totalAmount: "", startDate: "", endDate: "", agreementUrl: null
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
    const ownedProjects = allProjects.filter(
      (project) => String(project.contractorId) === String(user.userId ?? user.id)
    );
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
  // Keep legacy mirrors for existing modules while buildmitraProjects remains canonical.
  localStorage.setItem("contractorProjects", JSON.stringify(projects));
  localStorage.setItem("sharedProjects", JSON.stringify(projects));
}, [projects, storageReady, loggedInUser]);

  const [completedProjects, setCompletedProjects] = useState<any[]>([]);

  const [enquiries, setEnquiries] = useState<any[]>([]);

  const [myQuotes, setMyQuotes] = useState<any[]>([]);

  // Load saved contractor data
  useEffect(() => {
  try {
    const savedCompletedProjects = localStorage.getItem("contractorCompletedProjects");
    if (savedCompletedProjects) {
      setCompletedProjects(JSON.parse(savedCompletedProjects));
    }

    const savedEnquiries = localStorage.getItem("contractorEnquiries");
    if (savedEnquiries) {
      setEnquiries(JSON.parse(savedEnquiries));
    }

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

useEffect(() => {
  localStorage.setItem(
    "contractorEnquiries",
    JSON.stringify(enquiries)
  );
}, [enquiries]);

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
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "projects", name: "Projects", icon: "🏗️" },
    { id: "milestones", name: "Milestones", icon: "🎯" },
    { id: "portfolio", name: "Portfolio", icon: "📸" },
    { id: "siteprogress", name: "Site Progress", icon: "📷" },
    { id: "enquiries", name: "Enquiries", icon: "💬" },
    { id: "quotes", name: "My Quotes", icon: "📋" },
    { id: "labour", name: "Labour", icon: "👷" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "extraworks", name: "Extra Works", icon: "🔧" },
    { id: "payments", name: "Payments", icon: "💰" },
    { id: "reports", name: "Reports", icon: "📈" }
  ];

  // Add Site Media (Photos/Documents/Invoices) - Links to Buyer Dashboard via projectUniqueId
  const addSiteMedia = async () => {
    if (!mediaTitle) {
      alert("Please enter title");
      return;
    }
    const mediaUrl = mediaFile ? await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(mediaFile);
    }) : null;
    const newMedia = {
      id: (selectedProjectData?.siteMedia?.length || 0) + 1,
      type: mediaType,
      title: mediaTitle,
      url: mediaUrl,
      category: mediaCategory,
      date: new Date().toISOString().split("T")[0],
      uploadedBy: "Contractor",
      fileName: mediaFile?.name,
      fileSize: mediaFile?.size
    };
    
    const updatedProjects = projects.map(p => 
      p.id === selectedProject ? { ...p, siteMedia: [...(p.siteMedia || []), newMedia] } : p
    );
    setProjects(updatedProjects);
    setMediaTitle("");
    setMediaFile(null);
    setMediaType("photo");
    setMediaCategory("progress");
    setShowMediaModal(false);
    alert(`Media uploaded! Buyer can now view this in their dashboard under Project ID: ${selectedProjectData?.projectUniqueId}`);
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

  const addProject = () => {
    if (!newProject.name.trim() || !newProject.buyerCode.trim() || !newProject.startDate || !newProject.endDate) {
      alert("Project name, Buyer Unique Code, start date, and end date are required.");
      return;
    }
    if (new Date(newProject.endDate).getTime() < new Date(newProject.startDate).getTime()) {
      alert("End date cannot be before start date.");
      return;
    }
    const bua = Number(newProject.bua);
    const floors = Math.max(1, Number(newProject.floors) || 1);
    const totalAmount = Number(newProject.totalAmount);
    if (!bua || bua <= 0 || !totalAmount || totalAmount <= 0) {
      alert("Built-up area and total project amount must be greater than zero.");
      return;
    }
    const buyer = findBuyerByCode(newProject.buyerCode);
    if (!buyer) {
      alert("Buyer Unique Code was not found. Ask the buyer to register first and verify the code.");
      return;
    }
    if (!loggedInUser || loggedInUser.role !== "contractor") {
      alert("Please log in with a contractor account to create a project.");
      return;
    }
    const projectId = `PROJ-${Date.now()}`;
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
      buyerCode: buyer.uniqueCode,
      buyerName: buyer.name,
      contractorId: loggedInUser.userId ?? loggedInUser.id,
      contractorName: loggedInUser.name || contractorInfo.companyName,
      contractorCode: loggedInUser.uniqueCode || contractorInfo.uniqueCode,
      plotLength: parseFloat(newProject.plotLength) || 0,
      plotWidth: parseFloat(newProject.plotWidth) || 0,
      floors,
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
      extraWorks: []
    };
    setProjects([...projects, newProjectObj]);
    setSelectedProject(projectId);
    setNewProject({ name: "", buyerCode: "", clientName: "", clientMobile: "", clientEmail: "", plotLength: "", plotWidth: "", floors: "", bua: "", totalAmount: "", startDate: "", endDate: "", agreementUrl: null });
    setShowProjectModal(false);
    alert(`Project created with ${milestones.length} civil milestones and assigned to ${buyer.name} (${buyer.uniqueCode}).`);
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
    if (!newInventoryItem.material || !newInventoryItem.supplier || !newInventoryItem.orderedQty) {
      alert("Enter material, supplier and ordered quantity");
      return;
    }
    const orderedQty = Number(newInventoryItem.orderedQty);
    const receivedQty = Number(newInventoryItem.receivedQty);
    const consumed = Number(newInventoryItem.consumed || 0);
    const rate = Number(newInventoryItem.rate || 0);
    if (orderedQty < 0 || receivedQty < 0 || receivedQty > orderedQty || consumed < 0 || consumed > receivedQty) {
      alert("Ordered, received and consumed quantities are inconsistent");
      return;
    }
    setProjects(projects.map((project) => project.id === selectedProject ? {
      ...project,
      inventory: [...(project.inventory || []), {
        id: `INV-${Date.now()}`,
        ...newInventoryItem,
        materialName: newInventoryItem.material,
        supplierName: newInventoryItem.supplier,
        invoiceReference: newInventoryItem.invoiceNo,
        quantityOrdered: orderedQty,
        quantityReceived: receivedQty,
        quantityConsumed: consumed,
        balanceQuantity: receivedQty - consumed,
        rate,
        amount: orderedQty * rate,
        orderedQty,
        receivedQty,
        consumed,
        balance: receivedQty - consumed,
        receivedDate: new Date().toISOString().split("T")[0]
      }]
    } : project));
    setNewInventoryItem({ material: "", unit: "bags", supplier: "", supplierCode: "", invoiceNo: "", invoiceDate: "", deliveryDate: "", orderedQty: "", receivedQty: "", consumed: "", rate: "" });
    setShowInventoryModal(false);
  };

  const addExtraWork = () => {
    const quantity = Number(newExtraWork.quantity);
    const amount = Number(newExtraWork.amount);
    if (!selectedProjectData || !newExtraWork.description || !newExtraWork.reason || quantity <= 0 || amount <= 0) {
      alert("Complete all extra-work fields with valid quantity and amount");
      return;
    }
    setProjects(projects.map(project => project.id === selectedProject ? {
      ...project,
      extraWorks: [...(project.extraWorks || []), {
        id: `EW-${Date.now()}`,
        ...newExtraWork,
        quantity,
        amount,
        status: "Pending Buyer Approval",
        ownerApproved: false,
        ownerRejected: false,
        approvalDate: null
      }]
    } : project));
    setNewExtraWork({ type: "Variation Work", date: new Date().toISOString().split("T")[0], description: "", quantity: "", unit: "Nos", amount: "", reason: "" });
    setShowExtraWorkModal(false);
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
          ? { ...item, consumed, quantityConsumed: consumed, balance: Number(item.receivedQty) - consumed, balanceQuantity: Number(item.receivedQty) - consumed }
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
      workerName: labourData.name,
      role: labourData.role,
      labourCategory: labourData.role,
      dailyWage: parseFloat(labourData.dailyWage),
      paidAmount: 0,
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

  const sendQuote = (enquiryId) => {
    if (!quoteResponse.amount) {
      alert("Please enter quote amount");
      return;
    }
    setEnquiries(enquiries.map(e => 
      e.id === enquiryId ? { 
        ...e, 
        status: "Quoted", 
        quotedAmount: parseFloat(quoteResponse.amount),
        quotedDate: new Date().toISOString().split("T")[0]
      } : e
    ));
    setMyQuotes([...myQuotes, {
      id: myQuotes.length + 1,
      projectType: enquiries.find(e => e.id === enquiryId)?.projectType,
      quoteAmount: parseFloat(quoteResponse.amount),
      validity: quoteResponse.deliveryDate,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0]
    }]);
    setShowQuoteModal(false);
    setQuoteResponse({ amount: "", message: "", deliveryDate: "" });
    alert("Quote sent successfully!");
  };

  const whatsAppResponse = (enquiry) => {
    const message = `Hello ${enquiry.customerName},%0A%0AThank you for your enquiry about ${enquiry.projectType} at ${enquiry.location}.%0A%0APlease contact us for more details:%0A📞 ${contractorInfo.phone}%0A%0ARegards,%0A${contractorInfo.companyName}`;
    window.open(`https://wa.me/${enquiry.customerMobile}?text=${message}`, "_blank");
  };

  const shareProgress = (project) => {
    const message = `🏗️ PROJECT UPDATE - ${project.name}%0A%0A📊 Progress: ${project.progress}%%0A✅ Status: ${project.status}%0A🆔 Project ID: ${project.projectUniqueId}`;
    window.open(`https://wa.me/${project.clientMobile}?text=${message}`, "_blank");
  };

  const generateReport = () => {
    let data = [];
    const selectedProjectData = projects.find(p => String(p.id) === String(reportFilters.projectId));
    
    if (reportType === "milestones") {
      data = (selectedProjectData?.milestones || []).filter(m => !reportFilters.milestone || m.name.toLowerCase().includes(reportFilters.milestone.toLowerCase())).map(m => ({
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
        .filter(m => !reportFilters.payment || m.paymentStatus === reportFilters.payment)
        .filter(m => !reportFilters.milestone || m.name.toLowerCase().includes(reportFilters.milestone.toLowerCase()))
        .filter(m => {
          if (reportFilters.startDate && m.invoiceDate < reportFilters.startDate) return false;
          if (reportFilters.endDate && m.invoiceDate > reportFilters.endDate) return false;
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
    } else if (reportType === "labour") {
      const labourData = (selectedProjectData?.labour || []).filter(l => !reportFilters.labour || (l.name || "").toLowerCase().includes(reportFilters.labour.toLowerCase())).map(l => {
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
    } else if (reportType === "labourpayment") {
      data = (selectedProjectData?.labour || []).filter(l => !reportFilters.labour || (l.name || "").toLowerCase().includes(reportFilters.labour.toLowerCase())).map(l => {
        const summary = calculateLabourPaymentSummary(l);
        return { Category: l.labourCategory || l.role, Worker: l.workerName || l.name, "Daily Wage": l.dailyWage, "Weekly Payment": summary.weekly, "Monthly Payment": summary.monthly, "Pending Payment": summary.pending };
      });
    } else if (reportType === "inventory" || reportType === "supplier") {
      data = (selectedProjectData?.inventory || []).filter(item => {
        if (reportFilters.material && !(item.material || "").toLowerCase().includes(reportFilters.material.toLowerCase())) return false;
        if (reportFilters.supplier && !(item.supplier || "").toLowerCase().includes(reportFilters.supplier.toLowerCase())) return false;
        if (reportFilters.startDate && item.invoiceDate < reportFilters.startDate) return false;
        if (reportFilters.endDate && item.invoiceDate > reportFilters.endDate) return false;
        return true;
      }).map(item => ({ Material: item.material, Supplier: item.supplier, "Supplier Code": item.supplierCode, "Invoice No": item.invoiceNo, "Invoice Date": item.invoiceDate, "Delivery Date": item.deliveryDate, Ordered: item.orderedQty, Received: item.receivedQty, Consumed: item.consumed, Balance: item.balance, Rate: item.rate, Amount: item.amount }));
    } else if (reportType === "extraworks") {
      data = (selectedProjectData?.extraWorks || []).filter(work => {
        if (reportFilters.extraWorks && work.type !== reportFilters.extraWorks) return false;
        if (reportFilters.startDate && work.date < reportFilters.startDate) return false;
        if (reportFilters.endDate && work.date > reportFilters.endDate) return false;
        return true;
      }).map(work => ({ Date: work.date, Type: work.type, Description: work.description, Quantity: work.quantity, Unit: work.unit, Amount: work.amount, Reason: work.reason, Status: work.status, "Approved Amount": work.status === "Approved" ? work.amount : 0 }));
    }
    exportBuildMitraReport({ project: selectedProjectData, reportType, rows: data });
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
  const approvedExtraWorksValue = selectedProjectData?.extraWorks
    ?.filter(work => work.status === "Approved")
    .reduce((sum, work) => sum + Number(work.amount || 0), 0) || 0;
  const crmSummary = {
    projectValue: Number(selectedProjectData?.totalAmount || 0) + approvedExtraWorksValue,
    paid: totalPaymentsReceived,
    pending: totalPendingAmount,
    completedMilestones: selectedProjectData?.milestones?.filter(m => m.contractorCompleted || m.ownerApproved).length || 0,
    pendingMilestones: selectedProjectData?.milestones?.filter(m => !m.contractorCompleted && !m.ownerApproved).length || 0,
    labourCount: selectedProjectData?.labour?.length || 0,
    inventoryItems: selectedProjectData?.inventory?.length || 0,
    extraWorksValue: approvedExtraWorksValue
  };

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
          progressMedia.map(m =>
            React.createElement("div", { key: m.id, style: styles.mediaCard },
              React.createElement("div", { style: styles.mediaIcon }, m.type === "photo" ? "📷" : m.type === "video" ? "🎥" : "📄"),
              React.createElement("div", { style: { fontWeight: "bold" } }, m.title),
              React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, m.date),
              React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" } },
                React.createElement("button", { onClick: () => window.open(m.url, "_blank"), style: styles.buttonInfo, style: { fontSize: "11px", padding: "4px 8px" } }, "View"),
                React.createElement("button", { onClick: () => deleteSiteMedia(m.id), style: styles.buttonDanger, style: { fontSize: "11px", padding: "4px 8px" } }, "Delete")
              )
            )
          )
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
              React.createElement("button", { onClick: () => window.open(m.url, "_blank"), style: styles.buttonInfo, style: { fontSize: "11px", padding: "4px 8px", marginTop: "8px" } }, "Download")
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
              React.createElement("button", { onClick: () => window.open(m.url, "_blank"), style: styles.buttonSuccess, style: { fontSize: "11px", padding: "4px 8px", marginTop: "8px" } }, "View Invoice")
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
                React.createElement("th", { style: styles.th }, "Status")
              )
            ),
            React.createElement("tbody", null,
              payments.map(p =>
                React.createElement("tr", { key: p.id },
                  React.createElement("td", { style: styles.td }, p.invoiceDate),
                  React.createElement("td", { style: styles.td }, p.name),
                  React.createElement("td", { style: styles.td }, "₹", (Number(p.invoiceAmount)/1000).toFixed(0), "K"),
                  React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: p.paymentStatus === "Paid" ? "#d1fae5" : "#fff3cd", color: p.paymentStatus === "Paid" ? "#065f46" : "#856404" } }, p.paymentStatus))
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
            React.createElement("option", { value: "labour" }, "Labour Payment Report")
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
      React.createElement("button", { onClick: generateReport, style: { ...styles.buttonSuccess, marginTop: "16px", width: "100%" } }, "📥 Download Excel Report")
    );
  };

  const renderLabour = () => {
    const projectLabour = selectedProjectData?.labour || [];
    const totalWeeklyPayment = projectLabour.reduce((sum, labour) => {
      const { totalPayment } = calculateWeeklyPayment(labour);
      return sum + totalPayment;
    }, 0);
    
    return React.createElement("div", null,
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
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null, React.createElement("tr", null,
            ["Category", "Worker", "Weekly Payment", "Monthly Payment", "Pending Payment"].map(label => React.createElement("th", { key: label, style: styles.th }, label))
          )),
          React.createElement("tbody", null, projectLabour.map(labour => {
            const summary = calculateLabourPaymentSummary(labour);
            return React.createElement("tr", { key: labour.id },
              React.createElement("td", { style: styles.td }, labour.labourCategory || labour.role),
              React.createElement("td", { style: styles.td }, labour.workerName || labour.name),
              React.createElement("td", { style: styles.td }, "₹", summary.weekly.toLocaleString()),
              React.createElement("td", { style: styles.td }, "₹", summary.monthly.toLocaleString()),
              React.createElement("td", { style: styles.td }, "₹", summary.pending.toLocaleString())
            );
          }))
        )
      )
    );
  };

  const renderOverview = () => {
    return React.createElement("div", null,
      React.createElement("div", { style: { ...styles.grid4, gridTemplateColumns: "repeat(4, minmax(160px, 1fr))" } },
        Object.entries({ "Total Project Value": `₹${(crmSummary.projectValue/100000).toFixed(2)}L`, "Paid Amount": `₹${(crmSummary.paid/100000).toFixed(2)}L`, "Pending Amount": `₹${(crmSummary.pending/100000).toFixed(2)}L`, "Extra Works Value": `₹${(crmSummary.extraWorksValue/100000).toFixed(2)}L`, "Milestones Completed": crmSummary.completedMilestones, "Milestones Pending": crmSummary.pendingMilestones, "Labour Count": crmSummary.labourCount, "Inventory Items": crmSummary.inventoryItems }).map(([label, value]) =>
          React.createElement("div", { key: label, style: styles.card }, React.createElement("div", { style: styles.statValue }, value), React.createElement("div", { style: styles.statLabel }, label))
        )
      ),
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
                React.createElement("p", { style: { margin: "4px 0", fontSize: "13px", color: "#666" } }, "Buyer: ", p.buyerName || p.clientName, " (", p.buyerCode || "Legacy unassigned", ") | ID: ", p.projectUniqueId)
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold", color: "#2d6a4f" } }, p.progress, "%"),
                React.createElement("div", null, p.status)
              )
            ),
            React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: p.progress + "%" } })),
            React.createElement("div", { style: { marginTop: "12px", display: "flex", gap: "12px", flexWrap: "wrap" } },
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("milestones"); }, style: styles.buttonInfo }, "🎯 Milestones"),
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("siteprogress"); }, style: styles.buttonInfo }, "📷 Media"),
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("labour"); }, style: styles.buttonInfo }, "👷 Labour"),
              React.createElement("button", { onClick: () => { setSelectedProject(p.id); setActiveTab("inventory"); }, style: styles.buttonInfo }, "📦 Inventory"),
              React.createElement("button", { onClick: () => shareProgress(p), style: styles.buttonSuccess }, "📱 Share")
            )
          )
        )
      )
    );
  };

  const calculateLabourPaymentSummary = (labour) => {
    const attendance = selectedProjectData?.labourAttendance || [];
    const presentRecords = attendance.filter(record => record.labourId === labour.id && record.status === "Present");
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthlyDays = presentRecords.filter(record => String(record.date).startsWith(monthPrefix)).length;
    const weekly = calculateWeeklyPayment(labour).totalPayment;
    const monthly = monthlyDays * Number(labour.dailyWage || 0);
    const pending = Math.max(0, monthly - Number(labour.paidAmount || 0));
    return { weekly, monthly, pending, monthlyDays };
  };

  const renderInventory = () => {
    const inventory = selectedProjectData?.inventory || [];
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: styles.cardTitle }, "📦 Inventory - ", selectedProjectData?.name || "Select a project"),
        selectedProjectData && React.createElement("button", { onClick: () => setShowInventoryModal(true), style: styles.button }, "+ Record Material")
      ),
      inventory.length === 0
        ? React.createElement("p", { style: { color: "#666" } }, "No inventory entries yet.")
        : React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null, React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Material"),
              React.createElement("th", { style: styles.th }, "Supplier"),
              React.createElement("th", { style: styles.th }, "Invoice / Delivery"),
              React.createElement("th", { style: styles.th }, "Ordered"),
              React.createElement("th", { style: styles.th }, "Received"),
              React.createElement("th", { style: styles.th }, "Consumed"),
              React.createElement("th", { style: styles.th }, "Balance"),
              React.createElement("th", { style: styles.th }, "Rate / Amount")
            )),
            React.createElement("tbody", null, inventory.map((item) => React.createElement("tr", { key: item.id },
              React.createElement("td", { style: styles.td }, item.material),
              React.createElement("td", { style: styles.td }, item.supplier, React.createElement("br", null), item.supplierCode),
              React.createElement("td", { style: styles.td }, item.invoiceNo, React.createElement("br", null), item.invoiceDate, " / ", item.deliveryDate),
              React.createElement("td", { style: styles.td }, item.orderedQty || item.quantityOrdered, " ", item.unit),
              React.createElement("td", { style: styles.td }, item.receivedQty, " ", item.unit),
              React.createElement("td", { style: styles.td }, React.createElement("input", { type: "number", min: 0, max: item.receivedQty, value: item.consumed, onChange: (e) => updateInventoryConsumed(item.id, e.target.value), style: { ...styles.input, margin: 0, width: "100px" } })),
              React.createElement("td", { style: styles.td }, item.balance, " ", item.unit),
              React.createElement("td", { style: styles.td }, "₹", Number(item.rate || 0).toLocaleString(), " / ₹", Number(item.amount || 0).toLocaleString())
            )))
          )
        )
    );
  };

  const renderExtraWorks = () => {
    const works = selectedProjectData?.extraWorks || [];
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: styles.cardTitle }, "🔧 Variations / Extra Works"),
        selectedProjectData && React.createElement("button", { onClick: () => setShowExtraWorkModal(true), style: styles.button }, "+ Add Work")
      ),
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null, React.createElement("tr", null,
          ["Date", "Type", "Description", "Quantity", "Amount", "Reason", "Status"].map(label => React.createElement("th", { key: label, style: styles.th }, label))
        )),
        React.createElement("tbody", null, works.map(work => React.createElement("tr", { key: work.id },
          React.createElement("td", { style: styles.td }, work.date),
          React.createElement("td", { style: styles.td }, work.type),
          React.createElement("td", { style: styles.td }, work.description),
          React.createElement("td", { style: styles.td }, work.quantity, " ", work.unit),
          React.createElement("td", { style: styles.td }, "₹", Number(work.amount).toLocaleString()),
          React.createElement("td", { style: styles.td }, work.reason),
          React.createElement("td", { style: styles.td }, work.status)
        )))
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
              React.createElement("th", { style: styles.th }, "Project"),
              React.createElement("th", { style: styles.th }, "Location"),
              React.createElement("th", { style: styles.th }, "Customer"),
              React.createElement("th", { style: styles.th }, "Budget"),
              React.createElement("th", { style: styles.th }, "Status"),
              React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            enquiries.map(e =>
              React.createElement("tr", { key: e.id },
                React.createElement("td", { style: styles.td }, e.createdAt),
                React.createElement("td", { style: styles.td }, e.projectType),
                React.createElement("td", { style: styles.td }, e.location),
                React.createElement("td", { style: styles.td }, e.customerName, React.createElement("br", null), React.createElement("span", { style: { fontSize: "10px" } }, e.customerMobile)),
                React.createElement("td", { style: styles.td }, e.budget),
                React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: e.status === "Pending" ? "#ffe8cc" : "#d1fae5", color: e.status === "Pending" ? "#cc7b00" : "#065f46" } }, e.status)),
                React.createElement("td", { style: styles.td },
                  e.status === "Pending" && React.createElement("button", { onClick: () => { setSelectedEnquiry(e); setShowQuoteModal(true); }, style: styles.buttonSuccess }, "Send Quote"),
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
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "📋 My Quotes (Displayed in Marketplace)"),
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
      )
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case "overview": return renderOverview();
      case "projects": return renderProjects();
      case "milestones": return renderMilestones();
      case "portfolio": return renderPortfolio();
      case "siteprogress": return renderSiteProgress();
      case "enquiries": return renderEnquiries();
      case "quotes": return renderQuotes();
      case "labour": return renderLabour();
      case "inventory": return renderInventory();
      case "extraworks": return renderExtraWorks();
      case "payments": return renderPayments();
      case "reports": return renderReports();
      default: return renderOverview();
    }
  };

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "🏗️ Contractor Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Manage projects, upload media, track labour, and share with buyers")
      ),
      React.createElement("div", null,
        React.createElement("button", { onClick: () => window.open("https://wa.me/919876543210", "_blank"), style: styles.buttonSuccess }, "📱 Share"),
        React.createElement("button", { onClick: logoutToLogin, style: { ...styles.buttonDanger, marginLeft: "8px" } }, "🚪 Logout")
      )
    ),
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
          React.createElement("input", { type: "text", placeholder: "Buyer Unique Code (e.g. BUY-1234)", value: newProject.buyerCode, onChange: (e) => setNewProject({...newProject, buyerCode: e.target.value.toUpperCase()}), style: styles.input })
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
          React.createElement("input", { type: "number", min: 1, placeholder: "Built-up Area / BUA (sq.ft)", value: newProject.bua, onChange: (e) => setNewProject({...newProject, bua: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 1, placeholder: "Total Project Amount (₹)", value: newProject.totalAmount, onChange: (e) => setNewProject({...newProject, totalAmount: e.target.value}), style: styles.input })
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
          React.createElement("input", { type: "number", min: 0, placeholder: "Received Quantity", value: newInventoryItem.receivedQty, onChange: (e) => setNewInventoryItem({...newInventoryItem, receivedQty: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 0, placeholder: "Consumed Quantity", value: newInventoryItem.consumed, onChange: (e) => setNewInventoryItem({...newInventoryItem, consumed: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { placeholder: "Supplier", value: newInventoryItem.supplier, onChange: (e) => setNewInventoryItem({...newInventoryItem, supplier: e.target.value}), style: styles.input }),
          React.createElement("input", { placeholder: "Supplier Code", value: newInventoryItem.supplierCode, onChange: (e) => setNewInventoryItem({...newInventoryItem, supplierCode: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { placeholder: "Invoice Number", value: newInventoryItem.invoiceNo, onChange: (e) => setNewInventoryItem({...newInventoryItem, invoiceNo: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", value: newInventoryItem.invoiceDate, onChange: (e) => setNewInventoryItem({...newInventoryItem, invoiceDate: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "date", value: newInventoryItem.deliveryDate, onChange: (e) => setNewInventoryItem({...newInventoryItem, deliveryDate: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Ordered Quantity", value: newInventoryItem.orderedQty, onChange: (e) => setNewInventoryItem({...newInventoryItem, orderedQty: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 0, placeholder: "Received Quantity", value: newInventoryItem.receivedQty, onChange: (e) => setNewInventoryItem({...newInventoryItem, receivedQty: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 0, placeholder: "Rate", value: newInventoryItem.rate, onChange: (e) => setNewInventoryItem({...newInventoryItem, rate: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addInventoryItem, style: { ...styles.buttonSuccess, width: "100%" } }, "Save Inventory")
      )
    ),

    showExtraWorkModal && React.createElement("div", { style: styles.modal, onClick: () => setShowExtraWorkModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: e => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Add Variation / Extra Work"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("select", { value: newExtraWork.type, onChange: e => setNewExtraWork({...newExtraWork, type: e.target.value}), style: styles.select },
            React.createElement("option", null, "Variation Work"), React.createElement("option", null, "Extra Work"), React.createElement("option", null, "Correction Work")
          ),
          React.createElement("input", { type: "date", value: newExtraWork.date, onChange: e => setNewExtraWork({...newExtraWork, date: e.target.value}), style: styles.input })
        ),
        React.createElement("input", { placeholder: "Description", value: newExtraWork.description, onChange: e => setNewExtraWork({...newExtraWork, description: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { type: "number", placeholder: "Quantity", value: newExtraWork.quantity, onChange: e => setNewExtraWork({...newExtraWork, quantity: e.target.value}), style: styles.input }),
          React.createElement("input", { placeholder: "Unit", value: newExtraWork.unit, onChange: e => setNewExtraWork({...newExtraWork, unit: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Amount", value: newExtraWork.amount, onChange: e => setNewExtraWork({...newExtraWork, amount: e.target.value}), style: styles.input })
        ),
        React.createElement("textarea", { placeholder: "Reason", value: newExtraWork.reason, onChange: e => setNewExtraWork({...newExtraWork, reason: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addExtraWork, style: { ...styles.buttonSuccess, width: "100%" } }, "Submit for Buyer Approval")
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
          React.createElement("input", { type: "file", onChange: (e) => setMediaFile(e.target.files[0]), style: styles.input })
        ),
        React.createElement("button", { onClick: addSiteMedia, style: { ...styles.buttonSuccess, width: "100%" } }, "Upload - Buyer can view instantly")
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
    
    // Add Labour Modal
    showLabourModal && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Add Labour"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { id: "labourName", placeholder: "Labour Name", style: styles.input }),
          React.createElement("select", { id: "labourRole", style: styles.select },
            React.createElement("option", null, "Mason"),
            React.createElement("option", null, "Carpenter"),
            React.createElement("option", null, "Helper"),
            React.createElement("option", null, "Electrician"),
            React.createElement("option", null, "Plumber"),
            React.createElement("option", null, "Painter")
          )
        ),
        React.createElement("input", { id: "labourWage", type: "number", placeholder: "Daily Wage (₹)", style: styles.input }),
        React.createElement("button", { onClick: () => {
          const name = document.getElementById("labourName").value;
          const role = document.getElementById("labourRole").value;
          const dailyWage = document.getElementById("labourWage").value;
          if(name && dailyWage) addLabour({ name, role, dailyWage });
          else alert("Please fill all fields");
        }, style: { ...styles.buttonSuccess, width: "100%" } }, "Add Labour")
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
    )
  );
}
