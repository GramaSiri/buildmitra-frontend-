const fs = require("fs");
const filePath = "pages/buyer-dashboard.tsx";

const cleanBuyerCode = `// @ts-nocheck
import React, { useState, useEffect } from "react";
import { exportProjectReport } from "../utils/reporting";
import { DEFAULT_PROJECT_PERMISSIONS, getLoggedInUser, migrateLegacyProjects, saveProjectsForBuyer } from "../utils/projectStorage";
import { logoutToLogin } from "../utils/session";
import { themeTokens, PrimaryButton, SecondaryButton, Card, Badge, LoadingSpinner, EmptyState, BuildMitraHeader } from "../components/ui/DesignSystem";
import MarketRateTrend from "../components/ui/MarketRateTrend";
import { authFetch } from "../utils/authFetch";

export default function BuyerDashboard() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "https://buildmitra-backend-beta.onrender.com";
  const isReadOnly = false;
  const denyContractorEdit = () => {
    alert("Buyer access is read-only. Project records can only be updated by the assigned contractor.");
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentEntryModal, setShowPaymentEntryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExtraWorkModal, setShowExtraWorkModal] = useState(false);
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [showLabourPaymentModal, setShowLabourPaymentModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [chequeNo, setChequeNo] = useState("");
  const [utrNo, setUtrNo] = useState("");
  const [actualPaymentAmount, setActualPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [newPayment, setNewPayment] = useState({ milestoneName: "", amount: "", date: new Date().toISOString().split("T")[0], status: "Paid", reference: "" });
  const [reportType, setReportType] = useState("milestones");
  const [reportFilters, setReportFilters] = useState({ startDate: "", endDate: "", projectId: "", supplier: "", contractor: "", material: "", labourName: "", role: "", payment: "", milestone: "", quotation: "", extraWork: "" });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState("photo");
  const [mediaCategory, setMediaCategory] = useState("progress");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [agreementFile, setAgreementFile] = useState(null);
  const [extraWork, setExtraWork] = useState({ description: "", quantity: "", rate: "", amount: "", unit: "Nos", status: "Pending" });
  const [newLabour, setNewLabour] = useState({ name: "", role: "", dailyWage: "", daysPresent: "", paymentAmount: "", status: "Present" });
  const [labourPaymentHistory, setLabourPaymentHistory] = useState([]);
  const [sentEnquiries, setSentEnquiries] = useState<any[]>([]);

  const calculateBUA = (length: number, width: number, floors: number) => {
    const setback = (length + width) / 2 * 0.1;
    const effectiveLength = length - setback;
    const effectiveWidth = width - setback;
    return Math.round(effectiveLength * effectiveWidth * floors);
  };

  const getStandardMilestones = () => {
    return [
      { id: 1, name: "Site Clearance & Demolition", percentage: 0.5, phase: "Site Prep", standardDays: 5 },
      { id: 2, name: "Soil Investigation & Geotechnical Report", percentage: 0.3, phase: "Design", standardDays: 7 },
      { id: 3, name: "Topographic Survey & Marking", percentage: 0.2, phase: "Design", standardDays: 3 },
      { id: 4, name: "Excavation for Foundation", percentage: 2.0, phase: "Foundation", standardDays: 7 },
      { id: 5, name: "PCC Bed for Foundation", percentage: 1.0, phase: "Foundation", standardDays: 3 },
      { id: 6, name: "Foundation Reinforcement (Steel)", percentage: 2.5, phase: "Foundation", standardDays: 5 },
      { id: 7, name: "Foundation Shuttering", percentage: 1.5, phase: "Foundation", standardDays: 4 },
      { id: 8, name: "Foundation Concreting", percentage: 3.0, phase: "Foundation", standardDays: 3 },
      { id: 9, name: "Backfilling & Compaction", percentage: 1.0, phase: "Foundation", standardDays: 5 },
      { id: 10, name: "Plinth Beam Work", percentage: 3.5, phase: "Structure", standardDays: 8 },
      { id: 11, name: "Ground Floor Column Casting", percentage: 2.5, phase: "Structure", standardDays: 5 },
      { id: 12, name: "Ground Floor Slab Shuttering", percentage: 2.0, phase: "Structure", standardDays: 6 },
      { id: 13, name: "Ground Floor Reinforcement", percentage: 3.0, phase: "Structure", standardDays: 5 },
      { id: 14, name: "Ground Floor Concreting", percentage: 4.0, phase: "Structure", standardDays: 3 },
      { id: 15, name: "First Floor Column Casting", percentage: 2.5, phase: "Structure", standardDays: 5 },
      { id: 16, name: "First Floor Slab Work", percentage: 6.0, phase: "Structure", standardDays: 12 },
      { id: 17, name: "Second Floor Column Casting", percentage: 2.5, phase: "Structure", standardDays: 5 },
      { id: 18, name: "Second Floor Slab Work", percentage: 6.0, phase: "Structure", standardDays: 12 },
      { id: 19, name: "Brick Masonry Work", percentage: 6.0, phase: "Masonry", standardDays: 15 },
      { id: 20, name: "Plastering - Internal", percentage: 3.0, phase: "Plastering", standardDays: 8 },
      { id: 21, name: "Plastering - External", percentage: 3.0, phase: "Plastering", standardDays: 8 },
      { id: 22, name: "Flooring & Tiling", percentage: 5.0, phase: "Finishing", standardDays: 12 },
      { id: 23, name: "Plumbing - Rough-in", percentage: 2.0, phase: "MEP", standardDays: 7 },
      { id: 24, name: "Electrical Conduiting & Wiring", percentage: 2.5, phase: "MEP", standardDays: 10 },
      { id: 25, name: "False Ceiling Work", percentage: 2.0, phase: "Finishing", standardDays: 7 },
      { id: 26, name: "Woodwork & Joinery", percentage: 4.0, phase: "Finishing", standardDays: 12 },
      { id: 27, name: "Painting - Primer & Putty", percentage: 2.5, phase: "Finishing", standardDays: 8 },
      { id: 28, name: "Painting - Final Coat", percentage: 3.0, phase: "Finishing", standardDays: 8 },
      { id: 29, name: "Fittings & Fixtures Installation", percentage: 3.0, phase: "Finishing", standardDays: 10 },
      { id: 30, name: "Cleaning & Handover", percentage: 2.0, phase: "Completion", standardDays: 5 }
    ];
  };

  const generateMilestones = (startDate: string, endDate: string, totalAmount: number, projectFloors: number) => {
    const standards = getStandardMilestones();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let filteredMilestones = [...standards];
    if (projectFloors === 1) {
      filteredMilestones = filteredMilestones.filter(m => 
        !m.name.includes("First Floor") && !m.name.includes("Second Floor")
      );
    } else if (projectFloors === 2) {
      filteredMilestones = filteredMilestones.filter(m => 
        !m.name.includes("Second Floor")
      );
    }
    
    let cumulativeDays = 0;
    const totalPercentage = filteredMilestones.reduce((sum, m) => sum + m.percentage, 0);
    
    return filteredMilestones.map((milestone, idx) => {
      const daysAllocated = Math.round((milestone.percentage / totalPercentage) * totalDays);
      const plannedStart = new Date(start);
      plannedStart.setDate(start.getDate() + cumulativeDays);
      const plannedEnd = new Date(plannedStart);
      plannedEnd.setDate(plannedEnd.getDate() + daysAllocated);
      cumulativeDays += daysAllocated;
      
      return {
        id: idx + 1,
        name: milestone.name,
        phase: milestone.phase,
        percentage: milestone.percentage,
        amount: (totalAmount * milestone.percentage) / 100,
        plannedStartDate: plannedStart.toISOString().split("T")[0],
        plannedEndDate: plannedEnd.toISOString().split("T")[0],
        status: "Pending",
        contractorStatus: "Pending",
        ownerApproved: false,
        invoiceRaised: false,
        paymentReleased: false,
        actualPaymentAmount: 0,
        paymentDate: null,
        chequeNo: "",
        utrNo: ""
      };
    });
  };

  const [projects, setProjects] = useState<any[]>([]);

  const persistBuyerUpdates = (updatedProjects: any[]) => {
    const user = getLoggedInUser();
    const buyerCode = user?.uniqueCode || user?.userCode || "";
    if (!buyerCode) return;

    setProjects(updatedProjects);

    const allProjects = JSON.parse(localStorage.getItem("buildmitraProjects") || "[]");
    const updatedKeys = new Set(updatedProjects.map((p: any) => String(p.projectUniqueId || p.projectId || p.id || p.projectCode)));
    const mergedProjects = [
      ...allProjects.filter((p: any) => !updatedKeys.has(String(p.projectUniqueId || p.projectId || p.id || p.projectCode))),
      ...updatedProjects
    ];

    localStorage.setItem("buildmitraProjects", JSON.stringify(mergedProjects));
    localStorage.setItem("sharedProjects", JSON.stringify(mergedProjects.filter((p: any) => p.buyerCode)));
    localStorage.setItem("buyerProjects", JSON.stringify(updatedProjects));

    authFetch(`${API_BASE}/api/project-permission/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-code": buyerCode },
      body: JSON.stringify({ projects: updatedProjects, userCode: buyerCode })
    }).catch((err) => console.log("Failed to sync buyer projects to DB:", err));

    window.dispatchEvent(new Event("buildmitraProjectsUpdated"));
  };

  useEffect(() => {
    const loadAssignedProjects = async () => {
      const user = getLoggedInUser();
      const currentUser = getCurrentAppUser();
      const buyerCode = String(user?.uniqueCode || user?.userCode || currentUser.userCode || currentUser.uniqueCode || "").trim();

      if (!buyerCode) {
        setProjects([]);
        setSelectedProject(null);
        return;
      }

      const localAssigned = migrateLegacyProjects(user).filter(
        (project) => String(project.buyerCode || project.ownerUserCode || "").toUpperCase() === buyerCode.toUpperCase()
      );
      if (localAssigned.length > 0) {
        setProjects(localAssigned);
        setSelectedProject((current: any) => localAssigned.some((p: any) => (p.id === current || p.projectCode === current)) ? current : localAssigned[0]?.id ?? localAssigned[0]?.projectCode ?? null);
      }

      try {
        const res = await authFetch(`${API_BASE}/api/project-permission/my-projects/${encodeURIComponent(buyerCode)}`, {
          headers: { "x-user-code": buyerCode }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          const cloudProjects = data.projects;
          setProjects(cloudProjects);
          setSelectedProject((current: any) => cloudProjects.some((p: any) => (p.id === current || p.projectCode === current)) ? current : cloudProjects[0]?.id ?? cloudProjects[0]?.projectCode ?? null);

          const allProjects = JSON.parse(localStorage.getItem("buildmitraProjects") || "[]");
          const cloudKeys = new Set(cloudProjects.map((p: any) => String(p.projectUniqueId || p.projectId || p.id || p.projectCode)));
          const merged = [
            ...allProjects.filter((p: any) => !cloudKeys.has(String(p.projectUniqueId || p.projectId || p.id || p.projectCode))),
            ...cloudProjects
          ];
          localStorage.setItem("buildmitraProjects", JSON.stringify(merged));
        }
      } catch (err) {
        console.log("Error loading buyer projects from DB:", err);
      }
    };

    loadAssignedProjects();
    window.addEventListener("storage", loadAssignedProjects);
    window.addEventListener("buildmitraProjectsUpdated", loadAssignedProjects);
    return () => {
      window.removeEventListener("storage", loadAssignedProjects);
      window.removeEventListener("buildmitraProjectsUpdated", loadAssignedProjects);
    };
  }, []);

  const getCurrentAppUser = () => {
    try {
      return JSON.parse((sessionStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")) || (sessionStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser")) || (sessionStorage.getItem("user") || sessionStorage.getItem("user")) || "{}");
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const loadSentEnquiries = async () => {
      try {
        const user = getLoggedInUser();
        const currentUser = getCurrentAppUser();
        const buyerUserCode = user?.uniqueCode || user?.userCode || currentUser.userCode || currentUser.uniqueCode || "";
        if (!buyerUserCode) {
          setSentEnquiries([]);
          return;
        }
        let res = await authFetch(
          API_BASE + "/api/enquiry/buyer/my?buyerUserCode=" + encodeURIComponent(buyerUserCode),
          { headers: { "x-user-code": buyerUserCode } }
        );
        let data = await res.json().catch(() => ({}));
        if (!data.success) {
          res = await authFetch(
            API_BASE + "/api/enquiry?buyerUserCode=" + encodeURIComponent(buyerUserCode),
            { headers: { "x-user-code": buyerUserCode } }
          );
          data = await res.json().catch(() => ({}));
        }

        if (data.success) {
          setSentEnquiries((data.enquiries || []).map((e: any) => ({
            id: e._id,
            enquiryCode: e.enquiryCode,
            date: e.createdAt ? e.createdAt.split("T")[0] : "",
            providerName: e.providerName || "",
            providerRole: e.providerRole || "",
            itemName: e.itemName || e.itemType || "",
            quantity: e.quantity || "",
            status: e.status || "Pending",
            quotedAmount: e.quotedAmount || "",
            quoteMessage: e.quoteMessage || "",
            quotedDate: e.quotedDate || ""
          })));
        }
      } catch (err) {
        console.log("Buyer enquiries not loaded", err);
      }
    };
    loadSentEnquiries();
  }, []);

  const [newProject, setNewProject] = useState({ 
    name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, 
    bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", 
    contractorAddress: "", startDate: "", endDate: "", agreementFile: null 
  });
  
  const [inventory, setInventory] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: "", unit: "bags", supplier: "", orderedQty: "", receivedQty: "", consumedQty: "", rate: "", invoiceDate: new Date().toISOString().split("T")[0], invoiceNo: "" });
  const [siteMedia, setSiteMedia] = useState([]);

  const selectedProjectData = projects.find(p => String(p.id) === String(selectedProject)) || projects[0];
  const projectMilestones = selectedProjectData?.milestones || [];
  const projectPayments = [
    ...(selectedProjectData?.payments || []),
    ...projectMilestones
      .filter((milestone: any) => milestone.invoiceRaised)
      .map((milestone: any) => ({
        id: milestone.id,
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        amount: Number(milestone.invoiceAmount || milestone.amount || 0),
        date: milestone.invoiceDate,
        status: milestone.paymentStatus,
        paidDate: milestone.paidDate,
        chequeNo: milestone.chequeNo,
        utrNo: milestone.utrNo,
        paymentMode: milestone.paymentMode,
        paymentReference: milestone.paymentReference,
        paymentRemarks: milestone.paymentRemarks
      }))
  ];

  const getContractorLabourForProject = (project: any) => {
    try {
      if (project && Array.isArray(project.labour) && project.labour.length > 0) {
        return project.labour;
      }
      const masterList = JSON.parse(localStorage.getItem("contractorLabourMasterList") || "[]");
      if (!masterList.length) {
        return [
          { id: "LAB-1001", name: "Ramesh Kumar", role: "Civil Mason", dailyWage: 950, daysPresent: 6, status: "Active", joinDate: "2026-01-15" },
          { id: "LAB-1002", name: "Suresh Naik", role: "Barbender Steel", dailyWage: 900, daysPresent: 5, status: "Active", joinDate: "2026-02-01" }
        ];
      }
      
      const projIdStr = String(project?.id || project?.projectId || project?.projectUniqueId || "").toUpperCase();
      const projCodeStr = String(project?.projectUniqueId || project?.code || "").toUpperCase();

      const filtered = masterList.filter((item: any) => {
        const itemProjId = String(item.projectId || "").toUpperCase();
        const itemProjCode = String(item.projectCode || "").toUpperCase();
        return (itemProjId && itemProjId === projIdStr) || (itemProjCode && itemProjCode === projCodeStr) || itemProjId === "1" || !item.projectId;
      });

      const listToMap = filtered.length > 0 ? filtered : masterList;

      return listToMap.map((l: any) => ({
        id: l.id,
        name: l.name,
        role: l.category || l.jobAllotted || "General Labour",
        dailyWage: l.dailyWage,
        daysPresent: 6,
        status: l.status || "Active",
        joinDate: l.joinDate || "2026-01-15",
        pfAmount: l.pfAmount,
        esiAmount: l.esiAmount,
        conveyance: l.conveyance
      }));
    } catch {
      return [];
    }
  };

  const projectInventory = selectedProjectData?.inventory || [];
  const projectExtraWorks = selectedProjectData?.extraWorks || [];
  const projectMedia = (selectedProjectData?.siteMedia && selectedProjectData.siteMedia.length > 0)
    ? selectedProjectData.siteMedia
    : (selectedProjectData?.media || []);
  const projectLabour = (selectedProjectData?.labour && selectedProjectData.labour.length > 0)
    ? selectedProjectData.labour
    : getContractorLabourForProject(selectedProjectData);
  const projectQuotations = selectedProjectData?.quotations || [];
  const projectPermissions = { ...DEFAULT_PROJECT_PERMISSIONS, ...(selectedProjectData?.permissions || {}) };
  const isOwnerManagedProject = selectedProjectData && !selectedProjectData.contractorId;
      
  const completedMilestones = projectMilestones.filter((m: any) => m.contractorCompleted || m.ownerApproved).length;
  const progressPercent = projectMilestones.length ? (completedMilestones / projectMilestones.length) * 100 : 0;
  const totalPaid = projectPayments.filter((p: any) => p.status === "Paid").reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalContractAmount = selectedProjectData?.totalAmount || 0;
  const totalExtraWorkAmount = projectExtraWorks.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);
  const grandTotalAmount = totalContractAmount + totalExtraWorkAmount;
  const balanceAmount = grandTotalAmount - totalPaid;

  const addProject = () => {
    if (isReadOnly) return denyContractorEdit();
    if (!newProject.name || !newProject.plotLength || !newProject.plotWidth) { 
      alert("Please fill all required fields"); 
      return; 
    }
    if (!newProject.startDate || !newProject.endDate) { 
      alert("Please select start date and end date"); 
      return; 
    }
    
    const bua = calculateBUA(newProject.plotLength, newProject.plotWidth, newProject.floors);
    const totalAmount = bua * newProject.ratePerSft;
    const milestones = generateMilestones(newProject.startDate, newProject.endDate, totalAmount, newProject.floors);
    
    let agreementUrl = null;
    if (agreementFile) {
      agreementUrl = URL.createObjectURL(agreementFile);
    }
    
    const user = getLoggedInUser();
    const currentUser = getCurrentAppUser();
    const buyerCode = String(user?.uniqueCode || user?.userCode || currentUser.userCode || currentUser.uniqueCode || "").trim();

    const newProjRecord = { 
      id: `BUY-PROJ-${Date.now()}`,
      projectUniqueId: `BUY-PROJ-${Date.now()}`,
      projectCode: `PRJ-${Date.now().toString().slice(-6)}`,
      buyerCode: buyerCode,
      ownerUserCode: buyerCode,
      buyerName: user?.name || currentUser.name || "Buyer",
      ...newProject, 
      bua, 
      totalAmount, 
      progress: 0, 
      status: "Planning", 
      milestones, 
      payments: [], 
      inventory: [], 
      siteMedia: [], media: [],
      extraWorks: [],
      labour: [],
      agreementUrl: agreementUrl
    };

    const nextProjects = [...projects, newProjRecord];
    persistBuyerUpdates(nextProjects);
    setSelectedProject(newProjRecord.id);
    
    setNewProject({ 
      name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, 
      bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", 
      contractorAddress: "", startDate: "", endDate: "", agreementFile: null 
    });
    setAgreementFile(null);
    setShowAddProject(false);
    alert("Project created with " + milestones.length + " milestones!");
  };

  const updateMilestoneStatus = (milestoneId: number, newStatus: string) => {
    if (isReadOnly) return denyContractorEdit();
    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      milestones: p.milestones.map((m: any) =>
        m.id === milestoneId ? {
          ...m,
          status: newStatus,
          contractorStatus: newStatus,
          contractorCompleted: newStatus === "Completed",
          ownerApproved: newStatus === "Completed",
          paymentStatus: newStatus === "Completed" ? "Due" : m.paymentStatus
        } : m
      )
    } : p);
    persistBuyerUpdates(updatedProjects);
    alert("Milestone status updated by contractor. Awaiting owner approval.");
  };

  const approveMilestone = (milestone: any) => {
    if (!milestone.contractorCompleted || milestone.status !== "Completed") {
      alert("Only contractor-completed milestones can be approved.");
      return;
    }
    if (!milestone.ownerApproved) {
      const today = new Date().toISOString().split("T")[0];
      const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
        ...p,
        milestones: p.milestones.map((m: any) => 
          m.id === milestone.id ? { 
            ...m, 
            ownerApproved: true, 
            ownerRejected: false, 
            ownerApprovalDate: today, 
            ownerRejectionDate: null, 
            status: "Approved", 
            remarks: "" 
          } : m
        )
      } : p);
      persistBuyerUpdates(updatedProjects);
      alert("Milestone approved! Contractor can now raise invoice.");
    }
  };

  const rejectMilestone = (milestone: any) => {
    if (!milestone.contractorCompleted || milestone.invoiceRaised) return;
    const remarks = window.prompt("Enter rejection reason:", milestone.remarks || "") || "Rejected by buyer";
    const today = new Date().toISOString().split("T")[0];
    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      milestones: p.milestones.map((m: any) => m.id === milestone.id ? { 
        ...m, 
        ownerApproved: false, 
        ownerRejected: true, 
        ownerApprovalDate: null, 
        ownerRejectionDate: today, 
        status: "Completed", 
        remarks 
      } : m)
    } : p);
    persistBuyerUpdates(updatedProjects);
  };

  const raiseInvoice = (milestone: any) => {
    if (isReadOnly) return denyContractorEdit();
    if (milestone.ownerApproved && !milestone.invoiceRaised) {
      setProjects(projects.map(p => p.id === selectedProject ? {
        ...p,
        milestones: p.milestones.map((m: any) => 
          m.id === milestone.id ? { ...m, invoiceRaised: true } : m
        )
      } : p));
      setShowInvoiceModal(true);
      setSelectedMilestone(milestone);
    }
  };

  const releasePayment = () => {
    if (!selectedMilestone?.ownerApproved || !selectedMilestone?.invoiceRaised || selectedMilestone?.paymentStatus !== "Due") {
      alert("Only an approved invoice with payment Due can be marked Paid.");
      return;
    }
    if (!paymentDate || !paymentMode || !paymentReference.trim() || !actualPaymentAmount || !paymentRemarks.trim()) {
      alert("Payment date, mode, reference / UTR, paid amount, and remarks are required.");
      return; 
    }
    
    const paymentAmountValue = actualPaymentAmount ? parseFloat(actualPaymentAmount) : Number(selectedMilestone?.invoiceAmount || 0);
    
    if (paymentAmountValue !== Number(selectedMilestone?.invoiceAmount || 0)) {
      alert("Paid amount must equal the approved invoice amount.");
      return;
    }
    
    const payment = { 
      id: projectPayments.length + 1, 
      milestoneId: selectedMilestone?.id, 
      milestoneName: selectedMilestone?.name, 
      amount: paymentAmountValue, 
      originalAmount: selectedMilestone?.invoiceAmount, 
      date: paymentDate, 
      status: "Paid", 
      paymentMode, 
      reference: paymentReference.trim(), 
      remarks: paymentRemarks.trim(), 
      chequeNo: paymentMode === "Cheque" ? paymentReference.trim() : "", 
      utrNo: paymentMode !== "Cheque" ? paymentReference.trim() : "" 
    };
    
    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      milestones: p.milestones.map((m: any) => 
        m.id === selectedMilestone?.id ? { 
          ...m, 
          paymentReleased: true, 
          paidDate: paymentDate, 
          paymentMode, 
          paymentReference: paymentReference.trim(), 
          paymentRemarks: paymentRemarks.trim(), 
          chequeNo: paymentMode === "Cheque" ? paymentReference.trim() : "", 
          utrNo: paymentMode !== "Cheque" ? paymentReference.trim() : "", 
          actualPaymentAmount: paymentAmountValue, 
          remainingAmount: 0, 
          paymentStatus: "Paid" 
        } : m
      ),
      payments: [...(p.payments || []), payment]
    } : p);
    persistBuyerUpdates(updatedProjects);
    
    setChequeNo(""); 
    setUtrNo(""); 
    setActualPaymentAmount(""); 
    setPaymentDate(new Date().toISOString().split("T")[0]); 
    setPaymentMode(""); 
    setPaymentReference(""); 
    setPaymentRemarks(""); 
    setShowPaymentModal(false); 
    setShowInvoiceModal(false); 
    alert(`Payment released for ${selectedMilestone?.name}`);
  };

  const addManualPayment = () => {
    if (!selectedProjectData) return alert("Select project first.");
    const milestoneName = prompt("Payment for which milestone/work?", projectMilestones[0]?.name || "General Payment");
    if (!milestoneName) return;
    const amountText = prompt("Paid Amount:", "0");
    const amount = Number(amountText || 0);
    if (amount <= 0) return alert("Enter valid amount.");
    const mode = prompt("Payment Mode: Cash / UPI / Cheque / Bank Transfer", "UPI") || "UPI";
    const reference = prompt("Reference / UTR / Cheque No:", "") || "";
    const remarks = prompt("Remarks:", "Owner recorded payment") || "";

    const payment = {
      id: Date.now(),
      milestoneName,
      amount,
      date: new Date().toISOString().split("T")[0],
      paidDate: new Date().toISOString().split("T")[0],
      status: "Paid",
      paymentMode: mode,
      paymentReference: reference,
      paymentRemarks: remarks,
      chequeNo: mode.toLowerCase().includes("cheque") ? reference : "",
      utrNo: !mode.toLowerCase().includes("cheque") ? reference : ""
    };

    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      payments: [...(p.payments || []), payment]
    } : p);

    persistBuyerUpdates(updatedProjects);
    alert("Payment saved.");
  };

  const saveManualPayment = () => {
    if (!selectedProjectData) return alert("Select project first.");
    if (selectedProjectData?.contractorId) return alert("For contractor projects, pay against raised invoice/milestone.");
    const amount = Number(newPayment.amount || 0);
    if (!newPayment.milestoneName || amount <= 0 || !newPayment.date) return alert("Fill payment description, amount and date.");

    const payment = {
      id: Date.now(),
      milestoneName: newPayment.milestoneName,
      amount,
      date: newPayment.date,
      paidDate: newPayment.date,
      status: newPayment.status || "Paid",
      paymentMode: "Owner Entry",
      paymentReference: newPayment.reference,
      paymentRemarks: "Owner recorded payment",
      chequeNo: "",
      utrNo: newPayment.reference
    };

    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      payments: [...(p.payments || []), payment]
    } : p);

    persistBuyerUpdates(updatedProjects);
    setNewPayment({ milestoneName: "", amount: "", date: new Date().toISOString().split("T")[0], status: "Paid", reference: "" });
    setShowPaymentEntryModal(false);
    alert("Payment saved.");
  };

  const sharePayment = (payment: any) => {
    const mobile = selectedProjectData?.contractorMobile;
    if (!mobile) return;
    const message = `*PAYMENT DETAILS - ${selectedProjectData?.name}*%0A%0AMilestone: ${payment.milestoneName}\%0AAmount: ₹${(payment.amount/1000).toFixed(0)}K%0ADate: ${payment.date}\%0AReference:${payment.chequeNo || payment.utrNo}`;
    window.open(`https://wa.me/${mobile}?text=${message}`, "_blank");
  };

  const addMaterial = () => {
    if (!selectedProjectData) return alert("Select project first.");
    if (selectedProjectData?.contractorId) return denyContractorEdit();
    if (!newMaterial.material || !newMaterial.receivedQty) return alert("Enter material and received quantity.");

    const orderedQty = Number(newMaterial.orderedQty || newMaterial.receivedQty || 0);
    const receivedQty = Number(newMaterial.receivedQty || 0);
    const consumedQty = Number(newMaterial.consumedQty || 0);
    const rate = Number(newMaterial.rate || 0);
    const balanceQty = Math.max(0, receivedQty - consumedQty);
    const amount = receivedQty * rate;

    const materialEntry = {
      id: Date.now(),
      projectId: selectedProject,
      materialCode: "MAT-" + Date.now(),
      material: newMaterial.material,
      unit: newMaterial.unit,
      orderedQty,
      receivedQty,
      consumedQty,
      consumed: consumedQty,
      balanceQty,
      balance: balanceQty,
      rate,
      amount,
      supplier: newMaterial.supplier,
      invoiceNo: newMaterial.invoiceNo,
      invoiceDate: newMaterial.invoiceDate || new Date().toISOString().split("T")[0],
      receivedDate: new Date().toISOString().split("T")[0]
    };

    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      inventory: [...(p.inventory || []), materialEntry]
    } : p);

    persistBuyerUpdates(updatedProjects);
    setNewMaterial({ material: "", unit: "bags", supplier: "", orderedQty: "", receivedQty: "", consumedQty: "", rate: "", invoiceDate: new Date().toISOString().split("T")[0], invoiceNo: "" });
    setShowMaterialModal(false);
    alert("Inventory saved.");
  };

  const updateConsumed = (id: number, consumed: string) => {
    if (isReadOnly) return denyContractorEdit();
    const item = inventory.find(i => i.id === id);
    const consumedQty = parseFloat(consumed);
    if (item && !isNaN(consumedQty) && consumedQty >= 0 && consumedQty <= item.receivedQty) {
      setInventory(inventory.map(i => i.id === id ? { 
        ...i, 
        consumed: consumedQty, 
        balance: item.receivedQty - consumedQty 
      } : i));
    }
  };

  const uploadMedia = () => {
    if (!selectedProjectData) return alert("Select project first.");
    const title = mediaTitle || (mediaFile ? mediaFile.name.replace(/\\.[^/.]+$/, "") : "Site Progress Photo");

    const completeSave = (dataUrl = "") => {
      const mediaEntry = {
        id: Date.now(),
        projectId: selectedProject,
        fileName: mediaFile ? mediaFile.name : "photo.jpg",
        fileSize: mediaFile ? mediaFile.size : 0,
        fileType: mediaFile ? mediaFile.type : "image/jpeg",
        uploadDate: new Date().toISOString(),
        description: title,
        title: title,
        mediaType: mediaType || "photo",
        type: mediaType || "photo",
        category: mediaCategory || "progress",
        url: dataUrl,
        previewUrl: dataUrl,
        fileDataUrl: dataUrl
      };

      const existing = selectedProjectData?.siteMedia || selectedProjectData?.media || [];
      const updatedProjects = projects.map((p: any) => String(p.id) === String(selectedProject) ? {
        ...p,
        siteMedia: [mediaEntry, ...existing],
        media: [mediaEntry, ...existing]
      } : p);

      persistBuyerUpdates(updatedProjects);
      setMediaTitle("");
      setMediaFile(null);
      setMediaPreview(null);
      setShowMediaModal(false);
      alert("Site progress photo saved successfully!");
    };

    if (mediaFile) {
      const reader = new FileReader();
      reader.onload = () => completeSave(String(reader.result || ""));
      reader.onerror = () => completeSave("");
      reader.readAsDataURL(mediaFile);
    } else {
      completeSave("");
    }
  };

  const addExtraWork = () => {
    if (isReadOnly) return denyContractorEdit();
    if (!extraWork.description || !extraWork.quantity || !extraWork.rate) {
      alert("Please fill all extra work details");
      return;
    }
    const amount = parseFloat(extraWork.quantity) * parseFloat(extraWork.rate);
    const newExtraWork = {
      id: projectExtraWorks.length + 1,
      description: extraWork.description,
      quantity: parseFloat(extraWork.quantity),
      unit: extraWork.unit,
      rate: parseFloat(extraWork.rate),
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      status: "Pending Owner Approval"
    };
    
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      extraWorks: [...(p.extraWorks || []), newExtraWork]
    } : p));
    
    setExtraWork({ description: "", quantity: "", rate: "", amount: "", unit: "Nos", status: "Pending" });
    setShowExtraWorkModal(false);
    alert("Extra work request submitted. Awaiting owner approval.");
  };

  const approveExtraWork = (workId: number) => {
    if (isReadOnly) return denyContractorEdit();
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      extraWorks: p.extraWorks?.map((w: any) => 
        w.id === workId ? { ...w, status: "Approved by Owner" } : w
      )
    } : p));
    alert("Extra work approved!");
  };

  const addLabour = (labourData = null) => {
    if (!selectedProjectData) return alert("Select project first.");
    if (selectedProjectData?.contractorId) return denyContractorEdit();

    const source = labourData && labourData.name ? labourData : newLabour;
    if (!source.name || !source.role || !source.dailyWage) return alert("Please fill labour name, role and daily wage.");

    const daysPresent = Number(source.daysPresent || 0);
    const dailyWage = Number(source.dailyWage || 0);
    const labourId = Date.now();

    const newLabourEntry = {
      id: labourId,
      name: source.name,
      role: source.role,
      category: source.role,
      dailyWage,
      wage: dailyWage,
      daysPresent,
      totalPayment: dailyWage * daysPresent,
      paidAmount: 0,
      status: source.status || "Present",
      joinDate: new Date().toISOString().split("T")[0]
    };

    const attendanceEntry = {
      id: Date.now() + 1,
      labourId,
      date: new Date().toISOString().split("T")[0],
      status: "Present",
      daysPresent
    };

    const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
      ...p,
      labour: [...(p.labour || []), newLabourEntry],
      labourAttendance: daysPresent > 0 ? [...(p.labourAttendance || []), attendanceEntry] : (p.labourAttendance || [])
    } : p);

    persistBuyerUpdates(updatedProjects);
    setNewLabour({ name: "", role: "", dailyWage: "", daysPresent: "", paymentAmount: "", status: "Present" });
    setShowLabourModal(false);
    alert("Labour saved.");
  };

  const updateLabourAttendance = (labourId: number, daysPresent: string) => {
    if (isReadOnly) return denyContractorEdit();
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      labour: p.labour?.map((l: any) => l.id === labourId ? {
        ...l,
        daysPresent: parseInt(daysPresent),
        totalPayment: l.dailyWage * parseInt(daysPresent)
      } : l)
    } : p));
  };

  const makeLabourPayment = () => {
    if (isReadOnly) return denyContractorEdit();
    if (!selectedLabour) return;
    if (!chequeNo && !utrNo) {
      alert("Please enter Cheque or UTR number");
      return;
    }
    
    const paymentAmount = parseFloat(selectedLabour.totalPayment);
    const payment = {
      id: (labourPaymentHistory.length + 1),
      labourId: selectedLabour.id,
      labourName: selectedLabour.name,
      amount: paymentAmount,
      date: new Date().toISOString().split("T")[0],
      chequeNo: chequeNo,
      utrNo: utrNo,
      month: new Date().toLocaleString('default', { month: 'long' })
    };
    
    setLabourPaymentHistory([...labourPaymentHistory, payment]);
    setChequeNo("");
    setUtrNo("");
    setShowLabourPaymentModal(false);
    alert(`Payment of ₹${paymentAmount} released to${selectedLabour.name}`);
  };

  const generateReport = () => {
    let data: any[] = [];
    if (reportType === "milestones") {
      data = projectMilestones.filter((m: any) => {
        if (reportFilters.startDate && m.endDate < reportFilters.startDate) return false;
        if (reportFilters.endDate && m.endDate > reportFilters.endDate) return false;
        if (reportFilters.milestone && !String(m.name || "").toLowerCase().includes(reportFilters.milestone.toLowerCase())) return false;
        return true;
      }).map((m: any) => ({ 
        Milestone: m.name,
        Category: m.category,
        StartDate: m.startDate,
        EndDate: m.endDate,
        DurationDays: m.durationDays,
        PaymentPercent: m.paymentPercent,
        Amount: m.amount,
        Status: m.status,
        Approval: m.ownerApproved ? "Approved" : m.ownerRejected ? "Rejected" : "Pending",
        InvoiceRaised: m.invoiceRaised ? "Yes" : "No",
        InvoiceAmount: m.invoiceAmount,
        PaymentStatus: m.paymentStatus
      }));
    } else if (reportType === "payments" || reportType === "pendingpayments") {
      data = projectPayments.map((p: any) => ({ 
        Milestone: p.milestoneName, 
        Amount: p.amount, 
        InvoiceDate: p.date,
        PaymentStatus: p.status,
        PaidDate: p.paidDate,
        Reference: p.chequeNo || p.utrNo 
      })).filter((p: any) => (reportType !== "pendingpayments" || p.PaymentStatus === "Due") && (!reportFilters.payment || String(p.PaymentStatus || "").toLowerCase().includes(reportFilters.payment.toLowerCase())));
    } else if (reportType === "inventory" || reportType === "supplier") {
      data = projectInventory.filter((i: any) => {
        if (reportFilters.supplier && i.supplier !== reportFilters.supplier) return false;
        if (reportFilters.material && i.material !== reportFilters.material) return false;
        return true;
      }).map((i: any) => ({ 
        Code: i.materialCode, 
        Material: i.material, 
        Received: i.receivedQty, 
        Consumed: i.consumed, 
        Balance: i.balance, 
        Supplier: i.supplier 
      }));
    } else if (reportType === "quotations") {
      data = projectQuotations.filter((q: any) => !reportFilters.quotation || String(q.quoteNo || q.description || "").toLowerCase().includes(reportFilters.quotation.toLowerCase())).map((q: any) => ({ QuoteNo: q.quoteNo, Project: q.projectName, Date: q.date, Description: q.description, Amount: q.amount, Status: q.status, Remarks: q.remarks }));
    } else if (reportType === "attendance") {
      data = (selectedProjectData?.labourAttendance || []).map((entry: any) => {
        const labour = projectLabour.find((item: any) => String(item.id) === String(entry.labourId));
        return { Date: entry.date, Labour: labour?.name || entry.labourId, Category: labour?.role || "General", Status: entry.status };
      });
    } else if (reportType === "extrawork") {
      data = projectExtraWorks.filter((w: any) => !reportFilters.extraWork || String(w.description || w.type || "").toLowerCase().includes(reportFilters.extraWork.toLowerCase())).map((w: any) => ({
        Description: w.description,
        Quantity: w.quantity,
        Unit: w.unit,
        Rate: w.rate,
        Amount: w.amount,
        Status: w.status,
        Date: w.date
      }));
    } else if (reportType === "labour" || reportType === "labourpayment") {
      data = projectLabour.filter((l: any) => {
        if (reportFilters.labourName && !l.name.toLowerCase().includes(reportFilters.labourName.toLowerCase())) return false;
        if (reportFilters.role && !l.role.toLowerCase().includes(reportFilters.role.toLowerCase())) return false;
        return true;
      }).map((l: any) => ({
        Name: l.name,
        Role: l.role,
        DailyWage: l.dailyWage,
        DaysPresent: l.daysPresent,
        TotalPayment: l.totalPayment,
        Status: l.status,
        JoinDate: l.joinDate
      }));
    }
    
    exportProjectReport(reportType, selectedProjectData, data);
    setShowReportModal(false);
    alert("Report downloaded!");
  };

  const shareWhatsApp = () => {
    const mobile = selectedProjectData?.contractorMobile;
    if (!mobile) return;
    const message = \`🏗️ PROJECT UPDATE - \${selectedProjectData?.name}%0A%0A📊 Progress: \${progressPercent.toFixed(0)}%%0A💰 Paid: ₹\${(totalPaid/100000).toFixed(1)}L%0A📉 Balance: ₹\${(balanceAmount/100000).toFixed(1)}L%0A✅ Milestones: \${completedMilestones}/\${projectMilestones.length}\`;
    window.open(\`https://wa.me/\${mobile}?text=\${message}\`, "_blank");
  };

  const styles = {
    container: { padding: "10px 14px", backgroundColor: "#f0f2f5", minHeight: "100dvh", width: "100%", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box", overflowX: "hidden" },
    header: { backgroundColor: "#800020", color: "white", padding: "10px 14px", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "16px", fontWeight: "700" },
    headerSub: { margin: "2px 0 0", fontSize: "11px", opacity: 0.9 },
    tabContainer: { display: "flex", gap: "4px", marginBottom: "10px", borderBottom: "1px solid #ddd", flexWrap: "wrap", backgroundColor: "white", padding: "0 10px", borderRadius: "8px 8px 0 0" },
    tab: { padding: "8px 14px", cursor: "pointer", borderBottom: "2px solid transparent", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" },
    activeTab: { borderBottomColor: "#800020", color: "#800020" },
    card: { backgroundColor: "white", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", width: "100%", maxWidth: "100%", boxSizing: "border-box" },
    cardTitle: { fontSize: "12px", fontWeight: "700", marginBottom: "6px", borderBottom: "1.5px solid #800020", paddingBottom: "4px", color: "#0f172a" },
    grid2: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
      gap: "8px",
      marginBottom: "8px",
      width: "100%"
    },
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))", gap: "8px", marginBottom: "8px", width: "100%", boxSizing: "border-box" },
    grid4: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "8px",
      marginBottom: "10px",
      width: "100%",
      boxSizing: "border-box"
    },
    button: { backgroundColor: "#800020", color: "white", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px", fontWeight: "600" },
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px" },
    buttonDanger: { backgroundColor: "#dc3545", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "11px" },
    table: {
      width: "100%",
      minWidth: "680px",
      borderCollapse: "collapse",
      fontSize: "11px"
    },
    th: {
      padding: "5px 8px",
      fontSize: "11px",
      fontWeight: "700",
      textAlign: "left",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #cbd5e1",
      whiteSpace: "nowrap"
    },
    td: {
      padding: "5px 8px",
      fontSize: "11px",
      borderBottom: "1px solid #f1f5f9",
      whiteSpace: "nowrap"
    },
    input: { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "8px", boxSizing: "border-box", fontSize: "12px" },
    label: { display: "block", marginBottom: "3px", fontWeight: "600", fontSize: "11px", color: "#475569", whiteSpace: "normal" },
    select: { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "8px", boxSizing: "border-box", fontSize: "12px" },
    textarea: { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "8px", boxSizing: "border-box", fontFamily: "inherit", fontSize: "12px" },
    row2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "8px", marginBottom: "6px", width: "100%", boxSizing: "border-box", fontSize: "12px" },
    row3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: "8px", marginBottom: "6px", width: "100%", boxSizing: "border-box", fontSize: "12px" },
    progressBar: { height: "5px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "3px", overflow: "hidden", marginTop: "4px" },
    progressFill: { height: "100%", backgroundColor: "#ffd700", borderRadius: "3px", transition: "width 0.3s" },
    statBox: {
      padding: "8px 12px",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      boxSizing: "border-box",
      minHeight: "56px"
    },
    statValue: {
      fontSize: "17px",
      fontWeight: "800",
      lineHeight: "1.2",
      margin: "0 0 2px 0"
    },
    statLabel: {
      fontSize: "10px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      opacity: 0.95,
      margin: 0
    },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "10px", padding: "16px 20px", width: "min(600px, 94vw)", maxWidth: "600px", maxHeight: "88vh", overflowY: "auto", boxSizing: "border-box" },
    statusBadge: { padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "600", display: "inline-block" }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "projects", name: "Projects" },
    { id: "milestones", name: "Milestones" },
    { id: "payments", name: "Payments" },
    { id: "inventory", name: "Inventory" },
    { id: "progress", name: "Progress" },
    { id: "extrawork", name: "Extra Works" },
    { id: "labour", name: "Labour" },
    { id: "quotations", name: "Project Quotations" },
    { id: "enquiries", name: "Marketplace Enquiries & Quotes" },
    { id: "reports", name: "Reports" }
  ];

  const visibleTabs = tabs.filter((tab) => {
    const permissionByTab = { dashboard: "projectSummary", projects: "projectSummary", milestones: "milestones", payments: "payments", inventory: "inventory", progress: "siteMedia", labour: "labour", quotations: "quotations", enquiries: "projectSummary", reports: "reports" };
    const permission = permissionByTab[tab.id];
    return !permission || projectPermissions[permission] !== false;
  });

  const renderDashboard = () => {
    const today = new Date();
    const endDate = new Date(selectedProjectData?.endDate || "");
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isUrgent = daysLeft < 30 && daysLeft > 0;
    const isOverdue = daysLeft < 0;
    
    return selectedProjectData ? React.createElement("div", null,
      React.createElement("div", { style: styles.grid4 },
        React.createElement("div", { style: { ...styles.statBox, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, progressPercent.toFixed(0), "%"),
          React.createElement("div", { style: styles.statLabel }, "Progress"),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${progressPercent}%`, backgroundColor: "#ffd700" } }))
        ),
        React.createElement("div", { style: { ...styles.statBox, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, completedMilestones, "/", projectMilestones.length),
          React.createElement("div", { style: styles.statLabel }, "Milestones Done")
        ),
        React.createElement("div", { style: { ...styles.statBox, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, "₹", (totalPaid/100000).toFixed(2), "L"),
          React.createElement("div", { style: styles.statLabel }, "Total Paid")
        ),
        React.createElement("div", { style: { ...styles.statBox, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, "₹", (balanceAmount/100000).toFixed(2), "L"),
          React.createElement("div", { style: styles.statLabel }, "Balance Amount")
        )
      ),
      React.createElement("div", { style: { ...styles.card, backgroundColor: isOverdue ? "#dc3545" : (isUrgent ? "#ffc107" : "#10b981"), color: "white", textAlign: "center", padding: "8px 12px" } },
        React.createElement("div", { style: { fontSize: "14px", fontWeight: "800" } },
          isOverdue ? "⚠️ PROJECT OVERDUE" : (isUrgent ? `🔔 ${Math.abs(daysLeft)} DAYS LEFT - URGENT` : `📅 ${daysLeft} DAYS LEFT FOR COMPLETION`)
        ),
        React.createElement("div", { style: { fontSize: "12px", marginTop: "4px" } }, "Target Completion: ", selectedProjectData.endDate)
      ),
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" } },
          React.createElement("div", { style: styles.cardTitle }, "🏢 Project Details"),
          React.createElement("div", { style: styles.row2 },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "15px", fontWeight: "800", color: "#800020" } }, selectedProjectData.name),
              React.createElement("div", null, React.createElement("strong", null, "Plot:"), " ", selectedProjectData.plotLength, "' x ", selectedProjectData.plotWidth, "'"),
              React.createElement("div", null, React.createElement("strong", null, "Plot Area:"), " ", Number(selectedProjectData.plotArea || (Number(selectedProjectData.plotLength || 0) * Number(selectedProjectData.plotWidth || 0))).toLocaleString(), " sq.ft"),
              React.createElement("div", null, React.createElement("strong", null, "Floors:"), " ", selectedProjectData.floors),
              React.createElement("div", null, React.createElement("strong", null, "BUA:"), " ", selectedProjectData.bua?.toLocaleString(), " sq.ft")
            ),
            React.createElement("div", null,
              React.createElement("div", null, React.createElement("strong", null, "Contractor:"), " ", selectedProjectData.contractorName),
              React.createElement("div", null, React.createElement("strong", null, "Mobile:"), " ", selectedProjectData.contractorMobile),
              React.createElement("div", null, React.createElement("strong", null, "Rate:"), " ₹", selectedProjectData.ratePerSft, "/sq.ft"),
              React.createElement("div", null, React.createElement("strong", null, "Total:"), " ₹", (selectedProjectData.totalAmount/100000).toFixed(2), "L")
            )
          ),
          selectedProjectData.agreementUrl && React.createElement("div", { style: { marginTop: "8px", padding: "8px", backgroundColor: "rgba(255,255,255,0.7)", borderRadius: "6px" } },
            React.createElement("strong", null, "📄 Agreement Copy:"),
            React.createElement("a", { href: selectedProjectData.agreementUrl, target: "_blank", style: { color: "#800020", marginLeft: "10px", textDecoration: "underline" } }, "View Agreement"),
            React.createElement("button", { onClick: () => window.open(selectedProjectData.agreementUrl, "_blank"), style: { ...styles.buttonInfo, marginLeft: "10px", padding: "3px 8px", fontSize: "11px" } }, "Download")
          ),
          React.createElement("div", { style: { marginTop: "8px", padding: "8px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "6px" } },
            React.createElement("strong", null, "📅 Timeline:"), " ", selectedProjectData.startDate, " to ", selectedProjectData.endDate
          )
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" } },
          React.createElement("div", { style: styles.cardTitle }, "💰 Financial Summary"),
          React.createElement("div", { style: styles.row2 },
            React.createElement("div", null, React.createElement("strong", null, "Contract Amount:"), React.createElement("br", null), "₹", (totalContractAmount/100000).toFixed(2), "L"),
            React.createElement("div", null, React.createElement("strong", null, "Extra Works:"), React.createElement("br", null), "₹", (totalExtraWorkAmount/100000).toFixed(2), "L"),
            React.createElement("div", null, React.createElement("strong", null, "Grand Total:"), React.createElement("br", null), "₹", (grandTotalAmount/100000).toFixed(2), "L"),
            React.createElement("div", null, React.createElement("strong", null, "Balance:"), React.createElement("br", null), "₹", (balanceAmount/100000).toFixed(2), "L")
          )
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "📋 Recent Milestones"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Milestone"),
                React.createElement("th", { style: styles.th }, "Phase"),
                React.createElement("th", { style: styles.th }, "Amount"),
                React.createElement("th", { style: styles.th }, "Contractor Status"),
                React.createElement("th", { style: styles.th }, "Owner Approved"),
                React.createElement("th", { style: styles.th }, "Payment")
              )
            ),
            React.createElement("tbody", null,
              projectMilestones.slice(0, 8).map((m: any) =>
                React.createElement("tr", { key: m.id },
                  React.createElement("td", { style: styles.td }, m.name),
                  React.createElement("td", { style: styles.td }, m.phase),
                  React.createElement("td", { style: styles.td }, "₹", (m.amount/1000).toFixed(0), "K"),
                  React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: m.contractorStatus === "Completed" ? "#d1fae5" : "#fed7aa", color: m.contractorStatus === "Completed" ? "#065f46" : "#92400e" } }, m.contractorStatus)),
                  React.createElement("td", { style: styles.td }, m.ownerApproved ? "✅ Approved" : "⏳ Pending"),
                  React.createElement("td", { style: styles.td }, m.paymentReleased ? (m.actualPaymentAmount ? `₹${(m.actualPaymentAmount/1000).toFixed(0)}K Paid` : "✅ Paid") : "⏳ Pending")
                )
              )
            )
          )
        )
      )
    ) : React.createElement("div", { style: styles.card }, 
      React.createElement("p", null, "No projects are assigned to your Buyer Unique Code yet. Ask your contractor to create and assign one.")
    );
  };

  const renderProjects = () => React.createElement("div", null,
    React.createElement("div", { style: { ...styles.card, backgroundColor: "#eef7f2", color: "#2d6a4f" } }, "Assigned projects are view-only. Updates are managed by the contractor."),
    React.createElement("div", { style: { marginTop: "12px" } },
      projects.map((p: any) =>
        React.createElement("div", { key: p.id, style: { ...styles.card, cursor: "pointer" }, onClick: () => { setSelectedProject(p.id); setActiveTab("dashboard"); } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" } },
            React.createElement("div", null,
              React.createElement("h3", { style: { margin: 0, fontSize: "14px" } }, p.name),
              React.createElement("p", { style: { margin: "4px 0 0", fontSize: "12px", color: "#666" } }, p.contractorName, " | Project ID: ", p.projectId || p.projectUniqueId),
              React.createElement("p", { style: { margin: "2px 0", fontSize: "11px", color: "#666" } },
                "Plot Area: ", Number(p.plotArea || (Number(p.plotLength || 0) * Number(p.plotWidth || 0))).toLocaleString(), " sq.ft | BUA: ", Number(p.bua || 0).toLocaleString(), " sq.ft | Floors: ", p.floors || 0
              ),
              React.createElement("p", { style: { margin: "2px 0", fontSize: "11px", color: "#666" } }, "Rate: ₹", Number(p.ratePerSft || 0).toLocaleString(), "/sq.ft | Total: ₹", Number(p.totalAmount || 0).toLocaleString())
            ),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "18px", fontWeight: "bold", color: "#800020" } }, p.progress, "%"),
              React.createElement("div", { style: { fontSize: "11px" } }, p.status)
            )
          ),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${p.progress}%` } }))
        )
      )
    )
  );

  const renderMilestones = () => React.createElement("div", { style: styles.card },
    React.createElement("div", { style: styles.cardTitle }, "🎯 Civil Milestone Timeline & Payment Linkage"),
    React.createElement("div", { style: { marginBottom: "8px", fontSize: "12px", color: "#666" } }, "Total payment weight: ", projectMilestones.reduce((sum: number, milestone: any) => sum + Number(milestone.paymentPercent || 0), 0), "%"),
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "#"), React.createElement("th", { style: styles.th }, "Milestone"), React.createElement("th", { style: styles.th }, "Timeline"),
            React.createElement("th", { style: styles.th }, "Weight / Amount"), React.createElement("th", { style: styles.th }, "Contractor Status"),
            React.createElement("th", { style: styles.th }, "Owner Decision"), React.createElement("th", { style: styles.th }, "Invoice"),
            React.createElement("th", { style: styles.th }, "Payment"), React.createElement("th", { style: styles.th }, "Action")
          )
        ),
        React.createElement("tbody", null,
          projectMilestones.map((m: any, index: number) =>
            React.createElement("tr", { key: m.id },
              React.createElement("td", { style: styles.td }, index + 1),
              React.createElement("td", { style: styles.td }, React.createElement("strong", null, m.name), React.createElement("br", null), React.createElement("small", { style: { color: "#666" } }, m.category), React.createElement("br", null), React.createElement("small", null, m.description)),
              React.createElement("td", { style: styles.td }, m.startDate, " to ", m.endDate, React.createElement("br", null), m.durationDays, " days"),
              React.createElement("td", { style: styles.td }, m.paymentPercent, "%", React.createElement("br", null), "₹", Number(m.amount).toLocaleString()),
              React.createElement("td", { style: styles.td }, m.status || "Pending"),
              React.createElement("td", { style: styles.td },
                React.createElement("span", null, m.ownerApproved ? "✅ Approved" : m.ownerRejected ? "❌ Rejected" : "⏳ Pending"),
                m.remarks && React.createElement("div", { style: { fontSize: "10px", color: "#666" } }, m.remarks)
              ),
              React.createElement("td", { style: styles.td },
                React.createElement("span", null, m.invoiceRaised ? `📄 ₹${Number(m.invoiceAmount).toLocaleString()}` : "Not raised")
              ),
              React.createElement("td", { style: styles.td }, m.paymentStatus || "Not Due", m.paidDate && React.createElement("div", { style: { fontSize: "10px" } }, m.paidDate)),
              React.createElement("td", { style: styles.td },
                m.contractorCompleted && !m.ownerApproved && !m.invoiceRaised && React.createElement(React.Fragment, null,
                  React.createElement("button", { onClick: () => approveMilestone(m), style: styles.buttonSuccess }, "Approve"),
                  React.createElement("button", { onClick: () => rejectMilestone(m), style: { ...styles.buttonDanger, marginLeft: "6px" } }, "Reject")
                ),
                m.ownerApproved && m.invoiceRaised && m.paymentStatus === "Due" && React.createElement("button", { onClick: () => { setSelectedMilestone(m); setActualPaymentAmount(String(m.invoiceAmount)); setShowPaymentModal(true); }, style: styles.buttonInfo }, "Mark Paid"),
                selectedProjectData && !selectedProjectData?.contractorId && m.status !== "Completed" && React.createElement("button", { onClick: () => updateMilestoneStatus(m.id, "Completed"), style: { ...styles.buttonSuccess, marginLeft: "6px" } }, "Mark Complete")
              )
            )
          )
        )
      )
    )
  );

  const renderPayments = () => {
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "💰 Payment Register"),
        selectedProjectData && !selectedProjectData?.contractorId && React.createElement("button", { onClick: () => setShowPaymentEntryModal(true), style: styles.buttonSuccess }, "+ Add Payment")
      ),
      React.createElement("div", { style: styles.grid3 },
        React.createElement("div", { style: { padding: "8px", backgroundColor: "#f8f9fa", borderRadius: "6px", textAlign: "center" } }, React.createElement("strong", null, "Total Contract"), React.createElement("br", null), "₹", (totalContractAmount/100000).toFixed(2), "L"),
        React.createElement("div", { style: { padding: "8px", backgroundColor: "#f8f9fa", borderRadius: "6px", textAlign: "center" } }, React.createElement("strong", null, "Total Paid"), React.createElement("br", null), "₹", (totalPaid/100000).toFixed(2), "L"),
        React.createElement("div", { style: { padding: "8px", backgroundColor: "#f8f9fa", borderRadius: "6px", textAlign: "center" } }, React.createElement("strong", null, "Balance"), React.createElement("br", null), "₹", (balanceAmount/100000).toFixed(2), "L")
      ),
      React.createElement("div", { style: { overflowX: "auto", width: "100%" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Date"), React.createElement("th", { style: styles.th }, "Milestone"),
              React.createElement("th", { style: styles.th }, "Paid Amount"), React.createElement("th", { style: styles.th }, "Mode"),
              React.createElement("th", { style: styles.th }, "Reference"), React.createElement("th", { style: styles.th }, "Remarks"), React.createElement("th", { style: styles.th }, "Status")
            )
          ),
          React.createElement("tbody", null,
            projectPayments.map((p: any) => {
              return React.createElement("tr", { key: p.id },
                React.createElement("td", { style: styles.td }, p.paidDate || p.date),
                React.createElement("td", { style: styles.td }, p.milestoneName),
                React.createElement("td", { style: styles.td }, "₹", (p.amount/1000).toFixed(0), "K"),
                React.createElement("td", { style: styles.td }, p.paymentMode || (p.status === "Paid" ? "Recorded" : "Not paid")),
                React.createElement("td", { style: styles.td }, p.paymentReference || p.chequeNo || p.utrNo || "Not available"),
                React.createElement("td", { style: styles.td }, p.paymentRemarks || (p.status === "Paid" ? "Payment recorded" : "Awaiting payment")),
                React.createElement("td", { style: styles.td }, p.status || "Not Due")
              );
            }),
            projectPayments.length === 0 && React.createElement("tr", null, React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: "20px" } }, "No payments recorded yet"))
          )
        )
      )
    );
  };

  const renderInventory = () => React.createElement("div", null,
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "📦 Material Inventory"),
        isOwnerManagedProject && React.createElement("button", { onClick: () => setShowMaterialModal(true), style: styles.buttonSuccess }, "+ Add Material")
      ),
      React.createElement("div", { style: { overflowX: "auto", width: "100%" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Material"), React.createElement("th", { style: styles.th }, "Invoice Date"), React.createElement("th", { style: styles.th }, "Ordered"),
              React.createElement("th", { style: styles.th }, "Received"), React.createElement("th", { style: styles.th }, "Consumed"), React.createElement("th", { style: styles.th }, "Balance"),
              React.createElement("th", { style: styles.th }, "Unit"), React.createElement("th", { style: styles.th }, "Rate"), React.createElement("th", { style: styles.th }, "Amount"), React.createElement("th", { style: styles.th }, "Supplier / Invoice")
            )
          ),
          React.createElement("tbody", null,
            projectInventory.map((i: any) =>
              React.createElement("tr", { key: i.id },
                React.createElement("td", { style: styles.td }, i.material),
                React.createElement("td", { style: styles.td }, i.invoiceDate || i.receivedDate || "-"),
                React.createElement("td", { style: styles.td }, i.orderedQty ?? i.receivedQty),
                React.createElement("td", { style: styles.td }, i.receivedQty, " ", i.unit),
                React.createElement("td", { style: styles.td }, i.consumedQty ?? i.consumed ?? 0),
                React.createElement("td", { style: styles.td }, i.balanceQty ?? i.balance ?? 0),
                React.createElement("td", { style: styles.td }, i.unit || "-"),
                React.createElement("td", { style: styles.td }, "₹", Number(i.rate || 0).toLocaleString()),
                React.createElement("td", { style: styles.td }, "₹", Number(i.amount || 0).toLocaleString()),
                React.createElement("td", { style: styles.td }, i.supplier || "-", i.invoiceNo ? \` / \${i.invoiceNo}\` : "")
              )
            )
          )
        )
      )
    )
  );

  const renderQuotations = () => React.createElement("div", { style: styles.card },
    React.createElement("div", { style: styles.cardTitle }, "📋 Project Quotations (View only)"),
    React.createElement("div", { style: { overflowX: "auto" } }, React.createElement("table", { style: styles.table },
      React.createElement("thead", null, React.createElement("tr", null, ["Quote No", "Project", "Date", "Description", "Amount", "Status", "Remarks"].map((label) => React.createElement("th", { key: label, style: styles.th }, label)))),
      React.createElement("tbody", null,
        projectQuotations.map((q: any) => React.createElement("tr", { key: q.id },
          React.createElement("td", { style: styles.td }, q.quoteNo), React.createElement("td", { style: styles.td }, q.projectName), React.createElement("td", { style: styles.td }, q.date), React.createElement("td", { style: styles.td }, q.description), React.createElement("td", { style: styles.td }, "₹", Number(q.amount || 0).toLocaleString()), React.createElement("td", { style: styles.td }, q.status), React.createElement("td", { style: styles.td }, q.remarks || "-")
        )),
        projectQuotations.length === 0 && React.createElement("tr", null, React.createElement("td", { colSpan: 7, style: { ...styles.td, textAlign: "center" } }, "No quotations linked to this project."))
      )
    ))
  );

  const renderProgress = () => React.createElement("div", null,
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "📸 Site Progress Gallery"),
        React.createElement("button", { onClick: () => setShowMediaModal(true), style: styles.buttonSuccess }, "+ Upload Progress")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" } },
        projectMedia.map((m: any) => {
          const titleText = m.description || m.title || m.fileName || "Site Progress";
          const fallbackSvg = \`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e3a8a"/><rect x="40" y="60" width="520" height="280" fill="%230f766e" rx="16"/><text x="300" y="180" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23ffffff" text-anchor="middle">🏗️ Site Photo</text><text x="300" y="230" font-family="sans-serif" font-size="18" fill="%23fef08a" text-anchor="middle">\${encodeURIComponent(titleText)}</text></svg>\`;
          const imgSrc = m.fileDataUrl || m.url || m.previewUrl || m.fileUrl || fallbackSvg;
          return React.createElement("div", { key: m.id, style: { border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", cursor: "pointer", backgroundColor: "#fff" }, onClick: () => window.open(imgSrc, "_blank") },
            React.createElement("img", {
              src: imgSrc,
              alt: titleText,
              style: { width: "100%", height: "110px", objectFit: "cover" }
            }),
            React.createElement("div", { style: { padding: "6px", fontSize: "11px", fontWeight: "bold", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, titleText),
            React.createElement("div", { style: { padding: "0 6px 6px", fontSize: "10px", color: "#2563eb", fontWeight: "bold" } }, (m.uploadDate || m.date || "").split("T")[0])
          );
        })
      )
    )
  );

  const renderEnquiries = () => React.createElement("div", { style: styles.card },
    React.createElement("div", { style: styles.cardTitle }, "Marketplace Enquiries"),
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Date"),
            React.createElement("th", { style: styles.th }, "Provider"),
            React.createElement("th", { style: styles.th }, "Item"),
            React.createElement("th", { style: styles.th }, "Quantity"),
            React.createElement("th", { style: styles.th }, "Status"),
            React.createElement("th", { style: styles.th }, "Quote")
          )
        ),
        React.createElement("tbody", null,
          sentEnquiries.length === 0 ? React.createElement("tr", null,
            React.createElement("td", { colSpan: 6, style: { ...styles.td, textAlign: "center" } }, "No marketplace enquiries sent yet.")
          ) : sentEnquiries.map((e) =>
            React.createElement("tr", { key: e.id },
              React.createElement("td", { style: styles.td }, e.date),
              React.createElement("td", { style: styles.td }, e.providerName, React.createElement("br", null), React.createElement("span", { style: { fontSize: "10px" } }, e.providerRole)),
              React.createElement("td", { style: styles.td }, e.itemName),
              React.createElement("td", { style: styles.td }, e.quantity),
              React.createElement("td", { style: styles.td }, e.status),
              React.createElement("td", { style: styles.td }, e.quotedAmount ? React.createElement("span", null, "₹", Number(e.quotedAmount).toLocaleString(), e.quoteMessage ? " - " + e.quoteMessage : "") : "-")
            )
          )
        )
      )
    )
  );

  const renderExtraWorks = () => React.createElement("div", null,
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "🔧 Extra Works / Alterations"),
        isOwnerManagedProject && React.createElement("button", { onClick: () => setShowExtraWorkModal(true), style: styles.buttonSuccess }, "+ Add Extra Work")
      ),
      React.createElement("div", { style: { overflowX: "auto", width: "100%" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Date"), React.createElement("th", { style: styles.th }, "Description"),
              React.createElement("th", { style: styles.th }, "Qty"), React.createElement("th", { style: styles.th }, "Unit"),
              React.createElement("th", { style: styles.th }, "Rate"), React.createElement("th", { style: styles.th }, "Amount"),
              React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            projectExtraWorks.map((w: any) =>
              React.createElement("tr", { key: w.id },
                React.createElement("td", { style: styles.td }, w.date),
                React.createElement("td", { style: styles.td }, w.description),
                React.createElement("td", { style: styles.td }, w.quantity),
                React.createElement("td", { style: styles.td }, w.unit || "Nos"),
                React.createElement("td", { style: styles.td }, "₹", w.rate),
                React.createElement("td", { style: styles.td }, "₹", w.amount.toLocaleString()),
                React.createElement("td", { style: styles.td }, w.status),
                React.createElement("td", { style: styles.td },
                  React.createElement("span", { style: { color: "#666" } }, "View only")
                )
              )
            )
          )
        )
      )
    )
  );

  const renderLabour = () => {
    const today = new Date().toISOString().split("T")[0];
    const rows = projectLabour.map((labour: any) => {
      const daysPresent = Number(labour.daysPresent || 0);
      const wage = Number(labour.dailyWage || labour.wage || 0);
      const amount = wage * daysPresent;
      return {
        ...labour,
        role: labour.role || labour.category || "General",
        wage,
        daysPresent,
        amount,
        week: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, idx) => idx < daysPresent)
      };
    });
    const weeklyCost = rows.reduce((sum: number, row: any) => sum + row.amount, 0);

    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "👷 Labour Management - ", selectedProjectData?.name || "Select Project"),
        React.createElement("div", { style: styles.grid2 },
          React.createElement("div", null, React.createElement("strong", null, "Total Labours: "), rows.length),
          React.createElement("div", null, React.createElement("strong", null, "Weekly Labour Cost: ₹"), (weeklyCost/1000).toFixed(2), "K")
        ),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                ["Name","Role","Daily Wage","Mon","Tue","Wed","Thu","Fri","Sat","Sun","Days","Payment"].map((h) =>
                  React.createElement("th", { key: h, style: styles.th }, h)
                )
              )
            ),
            React.createElement("tbody", null,
              rows.map((l: any) => React.createElement("tr", { key: l.id },
                React.createElement("td", { style: styles.td }, l.name),
                React.createElement("td", { style: styles.td }, l.role),
                React.createElement("td", { style: styles.td }, "₹", l.wage.toLocaleString()),
                ...l.week.map((present: boolean, idx: number) =>
                  React.createElement("td", { key: idx, style: styles.td }, present ? "✓" : "✗")
                ),
                React.createElement("td", { style: styles.td }, l.daysPresent),
                React.createElement("td", { style: styles.td }, "₹", l.amount.toLocaleString())
              )),
              rows.length === 0 && React.createElement("tr", null,
                React.createElement("td", { colSpan: 12, style: { ...styles.td, textAlign: "center" } }, "No labour entries yet.")
              )
            )
          )
        )
      )
    );
  };

  const renderReports = () => React.createElement("div", { style: styles.card },
    React.createElement("div", { style: styles.cardTitle }, "📊 Reports & Analytics"),
    React.createElement("div", { style: styles.row2 },
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Report Type"),
        React.createElement("select", { value: reportType, onChange: (e) => setReportType(e.target.value), style: styles.select },
          React.createElement("option", { value: "milestones" }, "Milestones Report"),
          React.createElement("option", { value: "payments" }, "Payments Report"),
          React.createElement("option", { value: "pendingpayments" }, "Pending Invoice Payments"),
          React.createElement("option", { value: "inventory" }, "Inventory Report"),
          React.createElement("option", { value: "supplier" }, "Supplier Report"),
          React.createElement("option", { value: "attendance" }, "Labour Attendance Report"),
          React.createElement("option", { value: "labourpayment" }, "Labour Payment Report"),
          React.createElement("option", { value: "extrawork" }, "Extra / Correction Works Report"),
          React.createElement("option", { value: "quotations" }, "Quotation Report")
        )
      ),
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Project"),
        React.createElement("select", { value: selectedProject || "", onChange: (e) => setSelectedProject(e.target.value), style: styles.select }, projects.map((project: any) => React.createElement("option", { key: project.id, value: project.id }, project.name)))
      )
    ),
    React.createElement("button", { onClick: () => setShowReportModal(true), style: { ...styles.button, marginTop: "12px" } }, "Generate Report")
  );

  const renderContent = () => {
    const permissionByTab = { dashboard: "projectSummary", projects: "projectSummary", milestones: "milestones", payments: "payments", inventory: "inventory", progress: "siteMedia", labour: "labour", quotations: "quotations", enquiries: "projectSummary", reports: "reports" };
    const requiredPermission = permissionByTab[activeTab];
    if (requiredPermission && projectPermissions[requiredPermission] === false) {
      return React.createElement("div", { style: styles.card }, "Contractor has not enabled this section for your view.");
    }
    switch(activeTab) {
      case "dashboard": return renderDashboard();
      case "projects": return renderProjects();
      case "milestones": return renderMilestones();
      case "payments": return renderPayments();
      case "inventory": return renderInventory();
      case "progress": return renderProgress();
      case "extrawork": return renderExtraWorks();
      case "labour": return renderLabour();
      case "quotations": return renderQuotations();
      case "enquiries": return renderEnquiries();
      case "reports": return renderReports();
      default: return renderDashboard();
    }
  };

  return React.createElement("div", { style: styles.container },
    React.createElement(BuildMitraHeader, {
      moduleTitle: "Buyer Module",
      pageTitle: "Buyer Dashboard",
      subtitle: \`Welcome, \${getLoggedInUser()?.name || "Buyer"} · Buyer Code: \${getLoggedInUser()?.uniqueCode || "Not assigned"}\`,
      showBackToDashboard: false
    }),
    React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      flexWrap: "nowrap",
      width: "100%",
      marginBottom: "10px",
      padding: "4px 6px",
      boxSizing: "border-box",
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "8px"
    }},
      React.createElement("button", {
        onClick: () => setActiveTab("dashboard"),
        style: {
          ...styles.button,
          flex: "1 1 0",
          minWidth: 0,
          padding: "6px 4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          fontWeight: 800,
          textAlign: "center",
          borderRadius: "6px",
          backgroundColor: activeTab === "dashboard" ? "#2563eb" : "#dbeafe",
          color: activeTab === "dashboard" ? "#ffffff" : "#1e40af",
        }
      }, "Overview"),

      React.createElement("button", {
        onClick: () => setActiveTab("quotations"),
        style: {
          ...styles.button,
          flex: "1 1 0",
          minWidth: 0,
          padding: "6px 4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          fontWeight: 800,
          textAlign: "center",
          borderRadius: "6px",
          backgroundColor: activeTab === "quotations" ? "#7c3aed" : "#ede9fe",
          color: activeTab === "quotations" ? "#ffffff" : "#5b21b6",
        }
      }, "Quotes"),

      React.createElement("button", {
        onClick: () => setActiveTab("enquiries"),
        style: {
          ...styles.button,
          flex: "1 1 0",
          minWidth: 0,
          padding: "6px 4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          fontWeight: 800,
          textAlign: "center",
          borderRadius: "6px",
          backgroundColor: activeTab === "enquiries" ? "#059669" : "#d1fae5",
          color: activeTab === "enquiries" ? "#ffffff" : "#065f46",
        }
      }, "Enquiries"),

      React.createElement("select", {
        value: !["dashboard","quotations","enquiries"].includes(activeTab) ? activeTab : "",
        onChange: (e) => {
          const value = e.target.value;
          if (!value) return;
          if (value === "__marketplace") { window.location.href = "/marketplace"; return; }
          if (value === "__share") { checkAndRun("calculator_export", "buyer-dashboard", shareWhatsApp); return; }
          if (value === "__logout") { logoutToLogin(); return; }
          setActiveTab(value);
        },
        style: {
          flex: "1 1 0",
          minWidth: 0,
          height: "32px",
          padding: "0 4px",
          border: "1px solid #7dd3fc",
          borderRadius: "6px",
          backgroundColor: "#e0f2fe",
          color: "#075985",
          fontWeight: 800,
          fontSize: "12px"
        },
        "aria-label": "More buyer dashboard sections"
      },
        React.createElement("option", { value: "" }, "☰ More"),
        visibleTabs
          .filter(tab => !["dashboard","quotations","enquiries"].includes(tab.id))
          .map(tab => React.createElement("option", { key: tab.id, value: tab.id }, tab.name)),
        React.createElement("option", { value: "__marketplace" }, "Marketplace"),
        React.createElement("option", { value: "__share" }, "Share Update"),
        React.createElement("option", { value: "__logout" }, "Logout")
      )
    ),

    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: styles.label }, "Select Project"),
          React.createElement("select", { value: selectedProject || "", onChange: (e) => setSelectedProject(e.target.value), style: styles.select },
            React.createElement("option", { value: "" }, "-- Select Project --"),
            projects.map((p: any) => React.createElement("option", { key: p.id, value: p.id }, p.name, " - ", p.status, " (", p.progress, "%)"))
          )
        ),
        React.createElement("div", { style: { marginTop: "18px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" } },
          React.createElement("span", { style: { color: selectedProjectData?.contractorId ? "#800020" : "#2d6a4f", fontWeight: "bold", fontSize: "12px" } },
            selectedProjectData?.contractorId ? "Shared Contractor Project - Live View" : "My Own Project - Editable"
          ),
          React.createElement("button", { onClick: () => setShowAddProject(true), style: styles.buttonSuccess }, "+ Create Own Project")
        )
      )
    ),

    React.createElement(MarketRateTrend, null),
    renderContent(),

    // Add Project Modal
    showAddProject && React.createElement("div", { style: styles.modal, onClick: () => setShowAddProject(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#800020", margin: "0 0 10px 0", fontSize: "15px", borderBottom: "1.5px solid #800020", paddingBottom: "4px" } }, "🏗️ Create New Project"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Project Name *"),
            React.createElement("input", { placeholder: "Project Name", value: newProject.name, onChange: (e) => setNewProject({...newProject, name: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Length (ft) *"),
            React.createElement("input", { type: "number", placeholder: "Length", value: newProject.plotLength, onChange: (e) => { const val = parseFloat(e.target.value) || 0; setNewProject(prev => { const bua = calculateBUA(val, prev.plotWidth, prev.floors); return {...prev, plotLength: val, bua, totalAmount: bua * prev.ratePerSft}; }); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Width (ft) *"),
            React.createElement("input", { type: "number", placeholder: "Width", value: newProject.plotWidth, onChange: (e) => { const val = parseFloat(e.target.value) || 0; setNewProject(prev => { const bua = calculateBUA(prev.plotLength, val, prev.floors); return {...prev, plotWidth: val, bua, totalAmount: bua * prev.ratePerSft}; }); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "No. of Floors"),
            React.createElement("input", { type: "number", placeholder: "1", value: newProject.floors, onChange: (e) => { const val = parseFloat(e.target.value) || 1; setNewProject(prev => { const bua = calculateBUA(prev.plotLength, prev.plotWidth, val); return {...prev, floors: val, bua, totalAmount: bua * prev.ratePerSft}; }); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Rate per sq.ft (₹)"),
            React.createElement("input", { type: "number", placeholder: "1800", value: newProject.ratePerSft, onChange: (e) => { const val = parseFloat(e.target.value) || 0; setNewProject(prev => ({...prev, ratePerSft: val, totalAmount: prev.bua * val})); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Start Date *"),
            React.createElement("input", { type: "date", value: newProject.startDate, onChange: (e) => setNewProject({...newProject, startDate: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "End Date *"),
            React.createElement("input", { type: "date", value: newProject.endDate, onChange: (e) => setNewProject({...newProject, endDate: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" } },
          React.createElement("button", { onClick: () => setShowAddProject(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: addProject, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Create Project")
        )
      )
    ),

    // Payment Release Modal
    showPaymentModal && selectedMilestone && React.createElement("div", { style: styles.modal, onClick: () => setShowPaymentModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { marginTop: 0, marginBottom: "10px", fontSize: "15px", borderBottom: "1.5px solid #800020", paddingBottom: "4px" } }, "Mark Invoice Paid - ", selectedMilestone.name),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Amount (₹) *"),
            React.createElement("input", { type: "number", value: actualPaymentAmount, onChange: (e) => setActualPaymentAmount(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Date *"),
            React.createElement("input", { type: "date", value: paymentDate, onChange: (e) => setPaymentDate(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Mode *"),
            React.createElement("select", { value: paymentMode, onChange: (e) => setPaymentMode(e.target.value), style: styles.select },
              React.createElement("option", { value: "" }, "Select Mode"),
              React.createElement("option", { value: "UPI" }, "UPI"),
              React.createElement("option", { value: "NEFT/RTGS" }, "NEFT/RTGS"),
              React.createElement("option", { value: "Cheque" }, "Cheque"),
              React.createElement("option", { value: "Cash" }, "Cash")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Reference / UTR *"),
            React.createElement("input", { placeholder: "Reference / UTR", value: paymentReference, onChange: (e) => setPaymentReference(e.target.value), style: styles.input })
          ),
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Payment Remarks *"),
            React.createElement("input", { placeholder: "Remarks", value: paymentRemarks, onChange: (e) => setPaymentRemarks(e.target.value), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" } },
          React.createElement("button", { onClick: () => setShowPaymentModal(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: releasePayment, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Confirm Paid")
        )
      )
    ),

    // Payment Entry Modal
    showPaymentEntryModal && React.createElement("div", { style: styles.modal, onClick: () => setShowPaymentEntryModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#2d6a4f", margin: "0 0 10px 0", fontSize: "15px", borderBottom: "1.5px solid #2d6a4f", paddingBottom: "4px" } }, "💰 Record Payment - ", selectedProjectData?.name),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Milestone / Work Description *"),
            React.createElement("input", { placeholder: "e.g. Foundation, Advance, Plinth", value: newPayment.milestoneName, onChange: (e) => setNewPayment({...newPayment, milestoneName: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Amount (₹) *"),
            React.createElement("input", { type: "number", min: 0, placeholder: "Amount in ₹", value: newPayment.amount, onChange: (e) => setNewPayment({...newPayment, amount: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Date *"),
            React.createElement("input", { type: "date", value: newPayment.date, onChange: (e) => setNewPayment({...newPayment, date: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Payment Status *"),
            React.createElement("select", { value: newPayment.status, onChange: (e) => setNewPayment({...newPayment, status: e.target.value}), style: styles.select },
              React.createElement("option", { value: "Paid" }, "Paid"),
              React.createElement("option", { value: "Pending" }, "Pending"),
              React.createElement("option", { value: "Partially Paid" }, "Partially Paid")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Cheque / UTR / Reference"),
            React.createElement("input", { placeholder: "UTR or Cheque No", value: newPayment.reference, onChange: (e) => setNewPayment({...newPayment, reference: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" } },
          React.createElement("button", { onClick: () => setShowPaymentEntryModal(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: saveManualPayment, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Save Payment")
        )
      )
    ),

    // Material Modal
    showMaterialModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMaterialModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#2d6a4f", margin: "0 0 10px 0", fontSize: "15px", borderBottom: "1.5px solid #2d6a4f", paddingBottom: "4px" } }, "📦 Material Inventory Entry"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Material Name *"),
            React.createElement("input", { placeholder: "e.g. Cement, Steel", value: newMaterial.material, onChange: (e) => setNewMaterial({...newMaterial, material: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Unit *"),
            React.createElement("select", { value: newMaterial.unit, onChange: (e) => setNewMaterial({...newMaterial, unit: e.target.value}), style: styles.select },
              React.createElement("option", { value: "bags" }, "Bags"),
              React.createElement("option", { value: "kg" }, "Kg"),
              React.createElement("option", { value: "nos" }, "Nos"),
              React.createElement("option", { value: "cft" }, "Cft"),
              React.createElement("option", { value: "litres" }, "Litres")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Ordered Quantity"),
            React.createElement("input", { type: "number", min: 0, placeholder: "0", value: newMaterial.orderedQty, onChange: (e) => setNewMaterial({...newMaterial, orderedQty: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Received Quantity *"),
            React.createElement("input", { type: "number", min: 0, placeholder: "0", value: newMaterial.receivedQty, onChange: (e) => setNewMaterial({...newMaterial, receivedQty: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Consumed Quantity"),
            React.createElement("input", { type: "number", min: 0, placeholder: "0", value: newMaterial.consumedQty, onChange: (e) => setNewMaterial({...newMaterial, consumedQty: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Rate per Unit (₹)"),
            React.createElement("input", { type: "number", min: 0, placeholder: "0.00", value: newMaterial.rate, onChange: (e) => setNewMaterial({...newMaterial, rate: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Supplier Name"),
            React.createElement("input", { placeholder: "Supplier Name", value: newMaterial.supplier, onChange: (e) => setNewMaterial({...newMaterial, supplier: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Invoice Number"),
            React.createElement("input", { placeholder: "INV-1001", value: newMaterial.invoiceNo, onChange: (e) => setNewMaterial({...newMaterial, invoiceNo: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" } },
          React.createElement("button", { onClick: () => setShowMaterialModal(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: addMaterial, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Save Material")
        )
      )
    ),

    // Extra Work Modal
    showExtraWorkModal && React.createElement("div", { style: styles.modal, onClick: () => setShowExtraWorkModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { marginTop: 0, marginBottom: "10px", fontSize: "15px", borderBottom: "1.5px solid #800020", paddingBottom: "4px" } }, "Add Extra Work / Alteration"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Description *"),
            React.createElement("input", { placeholder: "Description", value: extraWork.description, onChange: (e) => setExtraWork({...extraWork, description: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Quantity *"),
            React.createElement("input", { type: "number", placeholder: "0", value: extraWork.quantity, onChange: (e) => setExtraWork({...extraWork, quantity: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Unit *"),
            React.createElement("input", { placeholder: "Nos/sqft", value: extraWork.unit, onChange: (e) => setExtraWork({...extraWork, unit: e.target.value}), style: styles.input })
          ),
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Rate (₹) *"),
            React.createElement("input", { type: "number", placeholder: "0.00", value: extraWork.rate, onChange: (e) => setExtraWork({...extraWork, rate: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" } },
          React.createElement("button", { onClick: () => setShowExtraWorkModal(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: addExtraWork, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Submit Extra Work")
        )
      )
    ),

    // Labour Modal
    showLabourModal && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#2d6a4f", margin: "0 0 10px 0", fontSize: "15px", borderBottom: "1.5px solid #2d6a4f", paddingBottom: "4px" } }, "👷 Add Labour"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Labour Name *"),
            React.createElement("input", { placeholder: "Full Name", value: newLabour.name, onChange: (e) => setNewLabour({...newLabour, name: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Role *"),
            React.createElement("select", { value: newLabour.role, onChange: (e) => setNewLabour({...newLabour, role: e.target.value}), style: styles.select },
              React.createElement("option", { value: "" }, "Select Role"),
              React.createElement("option", { value: "Mason" }, "Mason"),
              React.createElement("option", { value: "Carpenter" }, "Carpenter"),
              React.createElement("option", { value: "Helper" }, "Helper"),
              React.createElement("option", { value: "Electrician" }, "Electrician"),
              React.createElement("option", { value: "Plumber" }, "Plumber"),
              React.createElement("option", { value: "Painter" }, "Painter")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Daily Wage (₹) *"),
            React.createElement("input", { type: "number", placeholder: "0", value: newLabour.dailyWage, onChange: (e) => setNewLabour({...newLabour, dailyWage: e.target.value}), style: styles.input })
          ),
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Days Present *"),
            React.createElement("input", { type: "number", placeholder: "0", value: newLabour.daysPresent, onChange: (e) => setNewLabour({...newLabour, daysPresent: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" } },
          React.createElement("button", { onClick: () => setShowLabourModal(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: addLabour, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Add Labour")
        )
      )
    ),

    // Labour Payment Modal
    showLabourPaymentModal && selectedLabour && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourPaymentModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { marginTop: 0, marginBottom: "10px", fontSize: "15px", borderBottom: "1.5px solid #800020", paddingBottom: "4px" } }, "Release Labour Payment"),
        React.createElement("p", { style: { margin: "0 0 8px 0", fontSize: "12px" } }, "Labour: ", React.createElement("strong", null, selectedLabour.name), " | Total Due: ", React.createElement("strong", null, "₹", selectedLabour.totalPayment?.toLocaleString())),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Cheque Number"),
            React.createElement("input", { placeholder: "Cheque No", value: chequeNo, onChange: (e) => setChequeNo(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "UTR Number"),
            React.createElement("input", { placeholder: "UTR No", value: utrNo, onChange: (e) => setUtrNo(e.target.value), style: styles.input })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" } },
          React.createElement("button", { onClick: () => setShowLabourPaymentModal(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: makeLabourPayment, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Release Payment")
        )
      )
    ),

    // Progress Media Upload Modal
    showMediaModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMediaModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { color: "#1e3a8a", margin: "0 0 10px 0", fontSize: "15px", borderBottom: "1.5px solid #1e3a8a", paddingBottom: "4px" } }, "📸 Upload Site Progress Photo"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 10px", marginBottom: "10px" } },
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Photo Title / Work Description *"),
            React.createElement("input", { placeholder: "e.g. Ground Floor Slab Concreting", value: mediaTitle, onChange: (e) => setMediaTitle(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Category"),
            React.createElement("select", { value: mediaCategory, onChange: (e) => setMediaCategory(e.target.value), style: styles.select },
              React.createElement("option", { value: "progress" }, "Work Progress"),
              React.createElement("option", { value: "quality" }, "Quality Inspection"),
              React.createElement("option", { value: "material" }, "Material Delivery"),
              React.createElement("option", { value: "snag" }, "Issue / Snag")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Media Type"),
            React.createElement("select", { value: mediaType, onChange: (e) => setMediaType(e.target.value), style: styles.select },
              React.createElement("option", { value: "photo" }, "Photo"),
              React.createElement("option", { value: "drawing" }, "Drawing / Plan"),
              React.createElement("option", { value: "document" }, "Test Certificate")
            )
          ),
          React.createElement("div", { style: { gridColumn: "1 / -1" } },
            React.createElement("label", { style: styles.label }, "Select Image from Device *"),
            React.createElement("input", {
              type: "file",
              accept: "image/*,application/pdf",
              onChange: (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  setMediaFile(file);
                  if (!mediaTitle) setMediaTitle(file.name.replace(/\\.[^/.]+$/, ""));
                }
              },
              style: { ...styles.input, height: "auto", padding: "5px" }
            })
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" } },
          React.createElement("button", { onClick: () => setShowMediaModal(false), style: { ...styles.buttonDanger, padding: "5px 12px" } }, "Cancel"),
          React.createElement("button", { onClick: uploadMedia, style: { ...styles.buttonSuccess, padding: "5px 16px", fontWeight: "bold" } }, "Upload Photo")
        )
      )
    ),

    // Report Modal
    showReportModal && React.createElement("div", { style: styles.modal, onClick: () => setShowReportModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { marginTop: 0, marginBottom: "10px", fontSize: "15px" } }, "Generate Report"),
        React.createElement("button", { onClick: generateReport, style: styles.buttonSuccess }, "Download Excel Report")
      )
    ),

    // Media Viewer Lightbox
    showMediaViewer && selectedMedia && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }, onClick: () => setShowMediaViewer(false) },
      React.createElement("div", { style: { color: "white", textAlign: "center" } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: "64px" } }, (selectedMedia.mediaType || selectedMedia.type) === "photo" ? "📷" : (selectedMedia.mediaType || selectedMedia.type) === "video" ? "🎥" : "📄"),
          React.createElement("h3", null, selectedMedia.description || selectedMedia.title || selectedMedia.fileName),
          React.createElement("p", null, selectedMedia.fileName || "Metadata record")
        ),
        React.createElement("button", { onClick: () => setShowMediaViewer(false), style: { position: "absolute", top: 20, right: 30, color: "white", fontSize: 30, background: "none", border: "none", cursor: "pointer" } }, "×")
      )
    )
  );
}
`;

fs.writeFileSync(filePath, cleanBuyerCode, "utf8");
console.log("SYNTAX_AND_COMPONENT_STRUCTURE_FULLY_RESTORED");
