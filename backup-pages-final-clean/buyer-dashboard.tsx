import React, { useState, useEffect } from "react";
import { exportProjectReport } from "../utils/reporting";
import { DEFAULT_PROJECT_PERMISSIONS, getLoggedInUser, migrateLegacyProjects, saveProjectsForBuyer } from "../utils/projectStorage";
import { logoutToLogin } from "../utils/session";

export default function BuyerDashboard() {
const isReadOnly = false;
  const denyContractorEdit = () => {
    alert("Buyer access is read-only. Project records can only be updated by the assigned contractor.");
  };
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
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
    if (!user || user.role !== "buyer" || !user.uniqueCode) return;

    setProjects(updatedProjects);

    const allProjects = JSON.parse(localStorage.getItem("buildmitraProjects") || "[]");
    const updatedKeys = new Set(updatedProjects.map((p: any) => String(p.projectUniqueId || p.projectId || p.id)));
    const mergedProjects = [
      ...allProjects.filter((p: any) => !updatedKeys.has(String(p.projectUniqueId || p.projectId || p.id))),
      ...updatedProjects
    ];

    localStorage.setItem("buildmitraProjects", JSON.stringify(mergedProjects));
    localStorage.setItem("sharedProjects", JSON.stringify(mergedProjects.filter((p: any) => p.buyerCode)));
    localStorage.setItem("buyerProjects", JSON.stringify(updatedProjects));

    window.dispatchEvent(new Event("buildmitraProjectsUpdated"));
  };

  // Buyers only receive projects explicitly assigned to their unique code.
  useEffect(() => {
    const loadAssignedProjects = () => {
      const user = getLoggedInUser();
      if (!user || user.role !== "buyer") {
        setProjects([]);
        setSelectedProject(null);
        return;
      }
      const assigned = migrateLegacyProjects(user).filter(
        (project) => String(project.buyerCode || "").toUpperCase() === String(user.uniqueCode || "").toUpperCase()
      );
      setProjects(assigned);
      setSelectedProject((current) => assigned.some((project) => project.id === current) ? current : assigned[0]?.id ?? null);
    };

    loadAssignedProjects();
    window.addEventListener("storage", loadAssignedProjects);
    window.addEventListener("buildmitraProjectsUpdated", loadAssignedProjects);
    return () => {
      window.removeEventListener("storage", loadAssignedProjects);
      window.removeEventListener("buildmitraProjectsUpdated", loadAssignedProjects);
    };
  }, []);

  const [newProject, setNewProject] = useState({ 
    name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, 
    bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", 
    contractorAddress: "", startDate: "", endDate: "", agreementFile: null 
  });
  
  const [inventory, setInventory] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: "", unit: "bags", supplier: "", orderedQty: "", receivedQty: "", consumedQty: "", rate: "", invoiceDate: new Date().toISOString().split("T")[0], invoiceNo: "" });
  const [siteMedia, setSiteMedia] = useState([]);
  

  const selectedProjectData =
  projects.find(p => String(p.id) === String(selectedProject)) || projects[0];
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
  const projectInventory = selectedProjectData?.inventory || [];
  const projectMedia = selectedProjectData?.siteMedia || selectedProjectData?.media || [];
  const projectExtraWorks = selectedProjectData?.extraWorks || [];
  const projectLabour = selectedProjectData?.labour || [];
  const projectQuotations = selectedProjectData?.quotations || [];
  const projectPermissions = { ...DEFAULT_PROJECT_PERMISSIONS, ...(selectedProjectData?.permissions || {}) };
  const isOwnerManagedProject = selectedProjectData && !selectedProjectData.contractorId;
  console.log("Selected Project", selectedProjectData);
  console.log("Labour Data", projectLabour);
  
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
    
    setProjects([...projects, { 
      id: `BUY-PROJ-${Date.now()}`, 
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
    }]);
    
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
    const message = `*PAYMENT DETAILS - ${selectedProjectData?.name}*%0A%0AMilestone: ${payment.milestoneName}%0AAmount: ₹${(payment.amount/1000).toFixed(0)}K%0ADate: ${payment.date}%0AReference: ${payment.chequeNo || payment.utrNo}`;
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
    if (selectedProjectData?.contractorId) return denyContractorEdit();
    if (!mediaTitle) return alert("Enter title.");

    const saveMedia = (fileDataUrl = "") => {
      const mediaEntry = {
        id: Date.now(),
        projectId: selectedProject,
        fileName: mediaFile?.name || "",
        fileSize: mediaFile?.size || 0,
        fileType: mediaFile?.type || "",
        uploadDate: new Date().toISOString(),
        description: mediaTitle,
        title: mediaTitle,
        mediaType,
        type: mediaType,
        category: mediaCategory,
        url: fileDataUrl,
        previewUrl: fileDataUrl,
        fileDataUrl
      };

      const existingMedia = selectedProjectData?.siteMedia || selectedProjectData?.media || [];
      const updatedProjects = projects.map(p => String(p.id) === String(selectedProject) ? {
        ...p,
        siteMedia: [...existingMedia, mediaEntry],
        media: [...existingMedia, mediaEntry]
      } : p);

      persistBuyerUpdates(updatedProjects);
      setMediaTitle("");
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType("photo");
      setMediaCategory("progress");
      setShowMediaModal(false);
      alert("Progress/media saved.");
    };

    if (mediaFile) {
      const reader = new FileReader();
      reader.onload = () => saveMedia(String(reader.result || ""));
      reader.readAsDataURL(mediaFile);
    } else {
      saveMedia("");
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
    alert(`Payment of ₹${paymentAmount} released to ${selectedLabour.name}`);
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
    const message = `🏗️ PROJECT UPDATE - ${selectedProjectData?.name}%0A%0A📊 Progress: ${progressPercent.toFixed(0)}%%0A💰 Paid: ₹${(totalPaid/100000).toFixed(1)}L%0A📉 Balance: ₹${(balanceAmount/100000).toFixed(1)}L%0A✅ Milestones: ${completedMilestones}/${projectMilestones.length}`;
    window.open(`https://wa.me/${mobile}?text=${message}`, "_blank");
  };

  const styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#800020", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    tabContainer: { display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #ddd", flexWrap: "wrap", backgroundColor: "white", padding: "0 16px", borderRadius: "12px 12px 0 0" },
    tab: { padding: "12px 20px", cursor: "pointer", borderBottom: "3px solid transparent", fontSize: "14px", fontWeight: "500" },
    activeTab: { borderBottomColor: "#800020", color: "#800020" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    cardTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #800020", paddingBottom: "10px" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "20px" },
    button: { backgroundColor: "#800020", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonDanger: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", overflowX: "auto" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #ddd", backgroundColor: "#f8f9fa" },
    td: { padding: "12px", borderBottom: "1px solid #eee" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px", color: "#333" },
    select: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" },
    progressBar: { height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginTop: "8px" },
    progressFill: { height: "100%", backgroundColor: "#10b981", borderRadius: "4px", transition: "width 0.3s" },
    statValue: { fontSize: "28px", fontWeight: "bold", color: "#800020" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "600px", maxHeight: "85vh", overflow: "auto" },
    statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", display: "inline-block" }
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
    { id: "quotations", name: "Quotations" },
    { id: "reports", name: "Reports" }
  ];

  const visibleTabs = tabs.filter((tab) => {
    const permissionByTab = { dashboard: "projectSummary", projects: "projectSummary", milestones: "milestones", payments: "payments", inventory: "inventory", progress: "siteMedia", labour: "labour", quotations: "quotations", reports: "reports" };
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
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, progressPercent.toFixed(0), "%"),
          React.createElement("div", { style: styles.statLabel }, "Progress"),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${progressPercent}%`, backgroundColor: "#ffd700" } }))
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, completedMilestones, "/", projectMilestones.length),
          React.createElement("div", { style: styles.statLabel }, "Milestones Done")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, "₹", (totalPaid/100000).toFixed(2), "L"),
          React.createElement("div", { style: styles.statLabel }, "Total Paid")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, "₹", (balanceAmount/100000).toFixed(2), "L"),
          React.createElement("div", { style: styles.statLabel }, "Balance Amount")
        )
      ),
      React.createElement("div", { style: { ...styles.card, backgroundColor: isOverdue ? "#dc3545" : (isUrgent ? "#ffc107" : "#10b981"), color: "white", textAlign: "center" } },
        React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold" } },
          isOverdue ? "⚠️ PROJECT OVERDUE" : (isUrgent ? `🔔 ${Math.abs(daysLeft)} DAYS LEFT - URGENT` : `📅 ${daysLeft} DAYS LEFT FOR COMPLETION`)
        ),
        React.createElement("div", { style: { fontSize: "14px", marginTop: "8px" } }, "Target Completion: ", selectedProjectData.endDate)
      ),
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" } },
          React.createElement("div", { style: styles.cardTitle }, "🏢 Project Details"),
          React.createElement("div", { style: styles.row2 },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold", color: "#800020" } }, selectedProjectData.name),
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
          selectedProjectData.agreementUrl && React.createElement("div", { style: { marginTop: "12px", padding: "10px", backgroundColor: "rgba(255,255,255,0.7)", borderRadius: "8px" } },
            React.createElement("strong", null, "📄 Agreement Copy:"),
            React.createElement("a", { href: selectedProjectData.agreementUrl, target: "_blank", style: { color: "#800020", marginLeft: "10px", textDecoration: "underline" } }, "View Agreement"),
            React.createElement("button", { onClick: () => window.open(selectedProjectData.agreementUrl, "_blank"), style: { ...styles.buttonInfo, marginLeft: "10px", padding: "4px 12px", fontSize: "12px" } }, "Download")
          ),
          React.createElement("div", { style: { marginTop: "12px", padding: "10px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "8px" } },
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
    React.createElement("div", { style: { marginTop: "20px" } },
      projects.map((p: any) =>
        React.createElement("div", { key: p.id, style: { ...styles.card, cursor: "pointer" }, onClick: () => { setSelectedProject(p.id); setActiveTab("dashboard"); } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" } },
            React.createElement("div", null,
              React.createElement("h3", { style: { margin: 0 } }, p.name),
              React.createElement("p", { style: { margin: "8px 0 0", fontSize: "13px", color: "#666" } }, p.contractorName, " | Project ID: ", p.projectId || p.projectUniqueId),
              React.createElement("p", { style: { margin: "4px 0", fontSize: "12px", color: "#666" } },
                "Plot Area: ", Number(p.plotArea || (Number(p.plotLength || 0) * Number(p.plotWidth || 0))).toLocaleString(), " sq.ft | BUA: ", Number(p.bua || 0).toLocaleString(), " sq.ft | Floors: ", p.floors || 0
              ),
              React.createElement("p", { style: { margin: "4px 0", fontSize: "12px", color: "#666" } }, "Rate: ₹", Number(p.ratePerSft || 0).toLocaleString(), "/sq.ft | Total: ₹", Number(p.totalAmount || 0).toLocaleString())
            ),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold", color: "#800020" } }, p.progress, "%"),
              React.createElement("div", null, p.status)
            )
          ),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${p.progress}%` } }))
        )
      )
    )
  );

  const renderMilestones = () => React.createElement("div", { style: styles.card },
    React.createElement("div", { style: styles.cardTitle }, "🎯 Civil Milestone Timeline & Payment Linkage"),
    React.createElement("div", { style: { marginBottom: "12px", color: "#666" } }, "Total payment weight: ", projectMilestones.reduce((sum: number, milestone: any) => sum + Number(milestone.paymentPercent || 0), 0), "%"),
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
                m.remarks && React.createElement("div", { style: { fontSize: "11px", color: "#666" } }, m.remarks)
              ),
              React.createElement("td", { style: styles.td },
                React.createElement("span", null, m.invoiceRaised ? `📄 ₹${Number(m.invoiceAmount).toLocaleString()}` : "Not raised")
              ),
              React.createElement("td", { style: styles.td }, m.paymentStatus || "Not Due", m.paidDate && React.createElement("div", { style: { fontSize: "11px" } }, m.paidDate)),
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
    let cumulative = 0;
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "💰 Payment Register"),
        selectedProjectData && !selectedProjectData?.contractorId && React.createElement("button", { onClick: () => setShowPaymentEntryModal(true), style: styles.buttonSuccess }, "+ Add Payment")
      ),
      React.createElement("div", { style: styles.grid3 },
        React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Total Contract"), React.createElement("br", null), "₹", (totalContractAmount/100000).toFixed(2), "L"),
        React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Total Paid"), React.createElement("br", null), "₹", (totalPaid/100000).toFixed(2), "L"),
        React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Balance"), React.createElement("br", null), "₹", (balanceAmount/100000).toFixed(2), "L")
      ),
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
            if (p.status === "Paid") cumulative += p.amount;
            const remaining = grandTotalAmount - cumulative;
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
          projectPayments.length === 0 && React.createElement("tr", null, React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: "40px" } }, "No payments recorded yet"))
        )
      )
    );
  };

  const renderInventory = () => React.createElement("div", null,
    React.createElement("div", { style: { marginBottom: "12px", color: "#666" } }, "Inventory recorded by the contractor"),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "📦 Material Inventory"),
        isOwnerManagedProject && React.createElement("button", { onClick: () => setShowMaterialModal(true), style: styles.buttonSuccess }, "+ Add Material")
      ),
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
              React.createElement("td", { style: styles.td }, i.supplier || "-", i.invoiceNo ? ` / ${i.invoiceNo}` : "")
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
    React.createElement("div", { style: { marginBottom: "12px", color: "#666" } }, "Site photos, videos, and documents uploaded by the contractor"),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "📸 Site Progress Gallery"),
        isOwnerManagedProject && React.createElement("button", { onClick: () => setShowMediaModal(true), style: styles.buttonSuccess }, "+ Upload Progress")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" } },
        projectMedia.map((m: any) =>
          React.createElement("div", { key: m.id, style: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", cursor: "pointer" }, onClick: () => { if (m.fileDataUrl || m.url || m.previewUrl) { window.open(m.fileDataUrl || m.url || m.previewUrl, "_blank"); } else { setSelectedMedia(m); setShowMediaViewer(true); } } },
            React.createElement("div", { style: { height: "140px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f4f4", fontSize: "44px" } }, (m.mediaType || m.type) === "photo" ? "📷" : (m.mediaType || m.type) === "video" ? "🎥" : "📄"),
            React.createElement("div", { style: { padding: "10px", fontSize: "12px", fontWeight: "500" } }, m.description || m.title || m.fileName),
            React.createElement("div", { style: { padding: "0 10px 4px", fontSize: "10px", color: "#666" } }, m.fileName || "Metadata record"),
            React.createElement("div", { style: { padding: "0 10px 10px", fontSize: "10px", color: "#666" } }, (m.uploadDate || m.date || "").split("T")[0], m.fileSize ? ` • ${Math.ceil(m.fileSize / 1024)} KB` : "", " • Cloud file pending")
          )
        )
      )
    )
  );

  const renderExtraWorks = () => React.createElement("div", null,
    React.createElement("div", { style: { marginBottom: "12px", color: "#666" } }, "Extra work details supplied by the contractor"),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { ...styles.cardTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", null, "🔧 Extra Works / Alterations"),
        isOwnerManagedProject && React.createElement("button", { onClick: () => setShowExtraWorkModal(true), style: styles.buttonSuccess }, "+ Add Extra Work")
      ),
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
    const monthlyCost = weeklyCost * 4;

    return React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" } },
        React.createElement("div", { style: { color: "#666" } }, today),
        selectedProjectData && !selectedProjectData?.contractorId && React.createElement("button", { onClick: () => setShowLabourModal(true), style: styles.buttonSuccess }, "+ Add Labour")
      ),
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
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "💰 Labour Payment Summary"),
        React.createElement("div", { style: styles.grid2 },
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } },
            React.createElement("strong", null, "This Week"), React.createElement("br", null), "₹", (weeklyCost/1000).toFixed(2), "K"
          ),
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } },
            React.createElement("strong", null, "This Month"), React.createElement("br", null), "₹", (monthlyCost/1000).toFixed(2), "K"
          )
        ),
        React.createElement("button", { onClick: () => alert("Payment processing will connect to backend/payment module next."), style: styles.buttonInfo }, "Process Payments")
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
    React.createElement("div", { style: styles.row3 },
      (reportType === "inventory" || reportType === "supplier") && React.createElement(React.Fragment, null,
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Material Wise"),
          React.createElement("input", { type: "text", placeholder: "Filter by material", value: reportFilters.material, onChange: (e) => setReportFilters({...reportFilters, material: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Supplier Wise"),
          React.createElement("input", { type: "text", placeholder: "Filter by supplier", value: reportFilters.supplier, onChange: (e) => setReportFilters({...reportFilters, supplier: e.target.value}), style: styles.input })
        )
      ),
      (reportType === "labour" || reportType === "labourpayment" || reportType === "attendance") && React.createElement(React.Fragment, null,
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Labour Name"),
          React.createElement("input", { type: "text", placeholder: "Filter by labour", value: reportFilters.labourName, onChange: (e) => setReportFilters({...reportFilters, labourName: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Role"),
          React.createElement("input", { type: "text", placeholder: "Filter by role", value: reportFilters.role, onChange: (e) => setReportFilters({...reportFilters, role: e.target.value}), style: styles.input })
        )
      ),
      (reportType === "payments") && React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Contractor Wise"),
        React.createElement("input", { type: "text", placeholder: "Filter by contractor", value: reportFilters.contractor, onChange: (e) => setReportFilters({...reportFilters, contractor: e.target.value}), style: styles.input })
      )
    ),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" } },
      React.createElement("input", { placeholder: "Payment status", value: reportFilters.payment, onChange: (e) => setReportFilters({...reportFilters, payment: e.target.value}), style: styles.input }),
      React.createElement("input", { placeholder: "Milestone", value: reportFilters.milestone, onChange: (e) => setReportFilters({...reportFilters, milestone: e.target.value}), style: styles.input }),
      React.createElement("input", { placeholder: "Quotation", value: reportFilters.quotation, onChange: (e) => setReportFilters({...reportFilters, quotation: e.target.value}), style: styles.input }),
      React.createElement("input", { placeholder: "Extra / correction work", value: reportFilters.extraWork, onChange: (e) => setReportFilters({...reportFilters, extraWork: e.target.value}), style: styles.input })
    ),
    React.createElement("button", { onClick: () => setShowReportModal(true), style: { ...styles.button, marginTop: "16px" } }, "Generate Report")
  );

  const renderContent = () => {
    const permissionByTab = { dashboard: "projectSummary", projects: "projectSummary", milestones: "milestones", payments: "payments", inventory: "inventory", progress: "siteMedia", labour: "labour", quotations: "quotations", reports: "reports" };
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
      case "reports": return renderReports();
      default: return renderDashboard();
    }
  };

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "Buyer Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Buyer Code: ", getLoggedInUser()?.uniqueCode || "Not assigned", " | ", getLoggedInUser()?.name || "Buyer", " ",
          getLoggedInUser()?.uniqueCode && React.createElement("button", { onClick: () => navigator.clipboard?.writeText(getLoggedInUser()?.uniqueCode || ""), style: { marginLeft: "8px", padding: "3px 8px", border: 0, borderRadius: "4px", cursor: "pointer" } }, "Copy Code")
        )
      ),
      React.createElement("div", null,
        React.createElement("button", { onClick: () => checkAndRun('calculator_export', 'buyer-dashboard', shareWhatsApp), style: styles.buttonSuccess }, "📱 Share Update"),
        React.createElement("button", { onClick: logoutToLogin, style: { ...styles.button, backgroundColor: "#dc3545", marginLeft: "8px" } }, "🚪 Logout")
      )
    ),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: styles.label }, "Select Project"),
          React.createElement("select", { value: selectedProject || "", onChange: (e) => setSelectedProject(e.target.value), style: styles.select },
            React.createElement("option", { value: "" }, "-- Select Project --"),
            projects.map((p: any) => React.createElement("option", { key: p.id, value: p.id }, p.name, " - ", p.status, " (", p.progress, "%)"))
          )
        ),
        React.createElement("div", { style: { marginTop: "24px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" } },
          React.createElement("span", { style: { color: selectedProjectData?.contractorId ? "#800020" : "#2d6a4f", fontWeight: "bold" } },
            selectedProjectData?.contractorId ? "Shared Contractor Project - Live View" : "My Own Project - Editable"
          ),
          React.createElement("button", { onClick: () => setShowAddProject(true), style: styles.buttonSuccess }, "+ Create Own Project")
        )
      )
    ),
    React.createElement("div", { style: styles.tabContainer },
      visibleTabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),
    renderContent(),
    
    // Modals
    showAddProject && React.createElement("div", { style: styles.modal, onClick: () => setShowAddProject(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#800020" } }, "Create New Project"),
        React.createElement("label", { style: styles.label }, "Project Name *"),
        React.createElement("input", { type: "text", value: newProject.name, onChange: (e) => setNewProject({...newProject, name: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", null, "Length (ft) *"),
            React.createElement("input", { type: "number", value: newProject.plotLength, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, plotLength: val}); const bua = calculateBUA(val, newProject.plotWidth, newProject.floors); setNewProject(prev => ({...prev, bua, totalAmount: bua * prev.ratePerSft})); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "Width (ft) *"),
            React.createElement("input", { type: "number", value: newProject.plotWidth, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, plotWidth: val}); const bua = calculateBUA(newProject.plotLength, val, newProject.floors); setNewProject(prev => ({...prev, bua, totalAmount: bua * prev.ratePerSft})); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "No. of Floors"),
            React.createElement("input", { type: "number", value: newProject.floors, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, floors: val}); const bua = calculateBUA(newProject.plotLength, newProject.plotWidth, val); setNewProject(prev => ({...prev, bua, totalAmount: bua * prev.ratePerSft})); }, style: styles.input })
          )
        ),
        React.createElement("div", { style: { backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "8px", marginBottom: "16px" } },
          React.createElement("div", null, "📐 Calculated BUA: ", newProject.bua, " sq.ft"),
          React.createElement("div", null, "💰 Total Contract Value: ₹", (newProject.totalAmount/100000).toFixed(2), "L")
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", null, "Rate per sq.ft (₹)"),
            React.createElement("input", { type: "number", value: newProject.ratePerSft, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, ratePerSft: val, totalAmount: newProject.bua * val}); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "Contractor Name"),
            React.createElement("input", { type: "text", value: newProject.contractorName, onChange: (e) => setNewProject({...newProject, contractorName: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", null, "Contractor Mobile"),
            React.createElement("input", { type: "tel", value: newProject.contractorMobile, onChange: (e) => setNewProject({...newProject, contractorMobile: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "Contractor Address"),
            React.createElement("input", { type: "text", value: newProject.contractorAddress, onChange: (e) => setNewProject({...newProject, contractorAddress: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", null, "Start Date *"),
            React.createElement("input", { type: "date", value: newProject.startDate, onChange: (e) => setNewProject({...newProject, startDate: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "End Date *"),
            React.createElement("input", { type: "date", value: newProject.endDate, onChange: (e) => setNewProject({...newProject, endDate: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", null,
          React.createElement("label", null, "Agreement Upload"),
          React.createElement("input", { type: "file", onChange: (e) => setAgreementFile(e.target.files?.[0] || null), style: styles.input })
        ),
        React.createElement("button", { onClick: addProject, style: { ...styles.buttonSuccess, width: "100%", marginTop: "16px" } }, "Create Project")
      )
    ),
    
    showPaymentModal && selectedMilestone && React.createElement("div", { style: styles.modal, onClick: () => setShowPaymentModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Mark Invoice Paid - ", selectedMilestone.name),
        React.createElement("p", null, React.createElement("strong", null, "Invoice Amount:"), " ₹", (Number(selectedMilestone.invoiceAmount)/1000).toFixed(0), "K"),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Payment Amount (₹)"),
          React.createElement("input", { type: "number", value: actualPaymentAmount, onChange: (e) => setActualPaymentAmount(e.target.value), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "date", value: paymentDate, onChange: (e) => setPaymentDate(e.target.value), style: styles.input }),
          React.createElement("select", { value: paymentMode, onChange: (e) => setPaymentMode(e.target.value), style: styles.select },
            React.createElement("option", { value: "" }, "Payment Mode *"), React.createElement("option", { value: "UPI" }, "UPI"), React.createElement("option", { value: "NEFT/RTGS" }, "NEFT/RTGS"), React.createElement("option", { value: "Cheque" }, "Cheque"), React.createElement("option", { value: "Cash" }, "Cash")
          )
        ),
        React.createElement("input", { type: "text", placeholder: "Reference / UTR *", value: paymentReference, onChange: (e) => setPaymentReference(e.target.value), style: styles.input }),
        React.createElement("textarea", { placeholder: "Payment remarks *", value: paymentRemarks, onChange: (e) => setPaymentRemarks(e.target.value), style: styles.input }),
        React.createElement("button", { onClick: releasePayment, style: styles.buttonSuccess }, "Confirm Paid")
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
            React.createElement("option", { value: "Paid" }, "Paid"),
            React.createElement("option", { value: "Pending" }, "Pending"),
            React.createElement("option", { value: "Partially Paid" }, "Partially Paid")
          ),
          React.createElement("input", { placeholder: "Cheque / UTR / Reference", value: newPayment.reference, onChange: (e) => setNewPayment({...newPayment, reference: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: saveManualPayment, style: { ...styles.buttonSuccess, width: "100%" } }, "Save Payment")
      )
    ),

    showMaterialModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMaterialModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Record Inventory - ", selectedProjectData?.name),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { placeholder: "Material", value: newMaterial.material, onChange: (e) => setNewMaterial({...newMaterial, material: e.target.value}), style: styles.input }),
          React.createElement("select", { value: newMaterial.unit, onChange: (e) => setNewMaterial({...newMaterial, unit: e.target.value}), style: styles.select },
            React.createElement("option", { value: "bags" }, "Bags"),
            React.createElement("option", { value: "kg" }, "Kg"),
            React.createElement("option", { value: "nos" }, "Nos"),
            React.createElement("option", { value: "cft" }, "Cft"),
            React.createElement("option", { value: "litres" }, "Litres")
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Ordered Quantity", value: newMaterial.orderedQty, onChange: (e) => setNewMaterial({...newMaterial, orderedQty: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 0, placeholder: "Received Quantity", value: newMaterial.receivedQty, onChange: (e) => setNewMaterial({...newMaterial, receivedQty: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", min: 0, placeholder: "Consumed Quantity", value: newMaterial.consumedQty, onChange: (e) => setNewMaterial({...newMaterial, consumedQty: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", min: 0, placeholder: "Rate", value: newMaterial.rate, onChange: (e) => setNewMaterial({...newMaterial, rate: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { placeholder: "Supplier", value: newMaterial.supplier, onChange: (e) => setNewMaterial({...newMaterial, supplier: e.target.value}), style: styles.input }),
          React.createElement("input", { placeholder: "Invoice Number", value: newMaterial.invoiceNo, onChange: (e) => setNewMaterial({...newMaterial, invoiceNo: e.target.value}), style: styles.input })
        ),
        React.createElement("input", { type: "date", value: newMaterial.invoiceDate, onChange: (e) => setNewMaterial({...newMaterial, invoiceDate: e.target.value}), style: styles.input }),
        React.createElement("div", { style: { marginBottom: "12px" } }, "Balance: ", Math.max(0, Number(newMaterial.receivedQty || 0) - Number(newMaterial.consumedQty || 0)), " ", newMaterial.unit, " | Amount: ₹", (Number(newMaterial.receivedQty || 0) * Number(newMaterial.rate || 0)).toLocaleString()),
        React.createElement("button", { onClick: addMaterial, style: { ...styles.buttonSuccess, width: "100%" } }, "Save Inventory")
      )
    ),

    showMediaModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMediaModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Upload Media for ", selectedProjectData?.name),
        React.createElement("label", { style: styles.label }, "Media Type"),
        React.createElement("select", { value: mediaType, onChange: (e) => setMediaType(e.target.value), style: styles.select },
          React.createElement("option", { value: "photo" }, "Photo"),
          React.createElement("option", { value: "video" }, "Video"),
          React.createElement("option", { value: "document" }, "Document")
        ),
        React.createElement("label", { style: styles.label }, "Category"),
        React.createElement("select", { value: mediaCategory, onChange: (e) => setMediaCategory(e.target.value), style: styles.select },
          React.createElement("option", { value: "progress" }, "Progress Photo/Video"),
          React.createElement("option", { value: "document" }, "Document/Report"),
          React.createElement("option", { value: "invoice" }, "Invoice")
        ),
        React.createElement("label", { style: styles.label }, "Title"),
        React.createElement("input", { type: "text", placeholder: "Enter title", value: mediaTitle, onChange: (e) => setMediaTitle(e.target.value), style: styles.input }),
        React.createElement("label", { style: styles.label }, "File"),
        React.createElement("input", { type: "file", onChange: (e) => setMediaFile(e.target.files?.[0] || null), style: styles.input }),
        React.createElement("button", { onClick: uploadMedia, style: { ...styles.buttonSuccess, width: "100%" } }, "Save File Metadata")
      )
    ),

    showExtraWorkModal && React.createElement("div", { style: styles.modal, onClick: () => setShowExtraWorkModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Extra Work / Alteration"),
        React.createElement("input", { type: "text", placeholder: "Description", value: extraWork.description, onChange: (e) => setExtraWork({...extraWork, description: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { type: "number", placeholder: "Quantity", value: extraWork.quantity, onChange: (e) => setExtraWork({...extraWork, quantity: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "Unit (sqft/m/kg/Nos)", value: extraWork.unit, onChange: (e) => setExtraWork({...extraWork, unit: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Rate (₹)", value: extraWork.rate, onChange: (e) => setExtraWork({...extraWork, rate: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addExtraWork, style: styles.buttonSuccess }, "Submit Extra Work")
      )
    ),
    
    showLabourModal && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#2d6a4f" } }, "Add Labour"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Labour Name", value: newLabour.name, onChange: (e) => setNewLabour({...newLabour, name: e.target.value}), style: styles.input }),
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
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Daily Wage (₹)", value: newLabour.dailyWage, onChange: (e) => setNewLabour({...newLabour, dailyWage: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Days Present", value: newLabour.daysPresent, onChange: (e) => setNewLabour({...newLabour, daysPresent: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addLabour, style: { ...styles.buttonSuccess, width: "100%" } }, "Add Labour")
      )
    ),

    showLabourPaymentModal && selectedLabour && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourPaymentModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Release Labour Payment"),
        React.createElement("p", null, React.createElement("strong", null, "Labour:"), " ", selectedLabour.name),
        React.createElement("p", null, React.createElement("strong", null, "Total Due:"), " ₹", selectedLabour.totalPayment?.toLocaleString()),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Cheque Number", value: chequeNo, onChange: (e) => setChequeNo(e.target.value), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "UTR Number", value: utrNo, onChange: (e) => setUtrNo(e.target.value), style: styles.input })
        ),
        React.createElement("button", { onClick: makeLabourPayment, style: styles.buttonSuccess }, "Release Payment")
      )
    ),
    
    showReportModal && React.createElement("div", { style: styles.modal, onClick: () => setShowReportModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Generate Report"),
        React.createElement("button", { onClick: generateReport, style: styles.buttonSuccess }, "Download Excel Report")
      )
    ),
    
    showMediaViewer && selectedMedia && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }, onClick: () => setShowMediaViewer(false) },
      React.createElement("div", { style: { color: "white", textAlign: "center" } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: "72px" } }, (selectedMedia.mediaType || selectedMedia.type) === "photo" ? "📷" : (selectedMedia.mediaType || selectedMedia.type) === "video" ? "🎥" : "📄"),
          React.createElement("h3", null, selectedMedia.description || selectedMedia.title || selectedMedia.fileName),
          React.createElement("p", null, selectedMedia.fileName || "Metadata record"),
          React.createElement("p", null, selectedMedia.fileType || "File type unavailable", selectedMedia.fileSize ? ` • ${Math.ceil(selectedMedia.fileSize / 1024)} KB` : ""),
          React.createElement("p", null, "Full cloud upload will be enabled after backend storage integration.")
        ),
        React.createElement("button", { onClick: () => setShowMediaViewer(false), style: { position: "absolute", top: 20, right: 30, color: "white", fontSize: 30, background: "none", border: "none", cursor: "pointer" } }, "×")
      )
    )
  );
}














